"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StoreShippingAddress } from "@/src/infrastructure/sales/store-shipping.storage";

// Abre el checkout de Mercado Pago en una ventana emergente y espera el resultado.
//
// Marin se entera del resultado por dos vías (la que llegue primero):
//   1. BroadcastChannel: la página de regreso (/tienda/pago/confirmacion?ventana=1) avisa al instante.
//   2. Consulta periódica a /api/pagos/mercadopago/estado (respaldo; funciona aunque se pierda el aviso).

export const MP_CHANNEL = "marin-mercadopago";
const POPUP_NAME = "marin-mercadopago";
const POPUP_FEATURES = "popup,width=520,height=760";
const POLL_MS = 4000;

export type MpPaymentStatus = "approved" | "pending" | "rejected" | "none";

export type MpReturnMessage = {
  type: "mp-return";
  orderId: string;
  status: MpPaymentStatus;
  paymentId: string | null;
};

export type MpResult = { orderId: string; status: "approved" | "pending"; paymentId: string | null };

type Session = { orderId: string; initPoint: string };

type StartOptions = {
  items: { id: string; cantidad: number }[];
  shipping: StoreShippingAddress;
};

function openPopup(url = "") {
  const popup = window.open(url, POPUP_NAME, POPUP_FEATURES);
  if (popup && !url) {
    try {
      popup.document.title = "Mercado Pago";
      popup.document.body.innerHTML =
        '<p style="font-family:system-ui,sans-serif;padding:32px;text-align:center">Conectando con Mercado Pago…</p>';
    } catch {
      // Ignorar: solo es un mensaje de carga.
    }
  }
  return popup;
}

export function useMercadoPagoPopup(onFinished: (result: MpResult) => void) {
  const popupRef = useRef<Window | null>(null);
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [lastStatus, setLastStatus] = useState<MpPaymentStatus>("none");

  const closePopup = useCallback(() => {
    try {
      popupRef.current?.close();
    } catch {
      // La ventana puede estar en otro dominio; no pasa nada si no se cierra.
    }
    popupRef.current = null;
  }, []);

  const handleStatus = useCallback(
    (orderId: string, status: MpPaymentStatus, paymentId: string | null) => {
      if (finishedRef.current) return;
      setLastStatus(status);
      if (status === "approved") {
        finishedRef.current = true;
        closePopup();
        onFinishedRef.current({ orderId, status, paymentId });
      }
    },
    [closePopup],
  );

  /** Debe llamarse directamente desde el clic/submit para que el navegador no bloquee la ventana. */
  const start = useCallback(
    async ({ items, shipping }: StartOptions) => {
      setError("");
      setLastStatus("none");
      finishedRef.current = false;
      setStarting(true);

      const popup = openPopup();
      popupRef.current = popup;

      try {
        const response = await fetch("/api/pagos/mercadopago/preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, shipping, popup: Boolean(popup) }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          initPoint?: string;
          orderId?: string;
          error?: string;
        };

        if (!response.ok || !data.initPoint || !data.orderId) {
          throw new Error(data.error || "No pudimos iniciar el pago con Mercado Pago.");
        }

        if (!popup || popup.closed) {
          // Ventana bloqueada o cerrada: seguimos en la misma pestaña, como antes.
          window.location.href = data.initPoint;
          return;
        }

        popup.location.href = data.initPoint;
        setSession({ orderId: data.orderId, initPoint: data.initPoint });
      } catch (err) {
        closePopup();
        setError(err instanceof Error ? err.message : "No pudimos iniciar el pago con Mercado Pago.");
      } finally {
        setStarting(false);
      }
    },
    [closePopup],
  );

  const reopen = useCallback(() => {
    if (!session) return;
    const popup = openPopup(session.initPoint);
    if (popup) {
      popupRef.current = popup;
      popup.focus();
    } else {
      window.location.href = session.initPoint;
    }
  }, [session]);

  const cancel = useCallback(() => {
    closePopup();
    setSession(null);
    setLastStatus("none");
  }, [closePopup]);

  const continuePending = useCallback(() => {
    if (!session) return;
    finishedRef.current = true;
    closePopup();
    onFinishedRef.current({ orderId: session.orderId, status: "pending", paymentId: null });
  }, [closePopup, session]);

  // Aviso instantáneo desde la página de regreso.
  useEffect(() => {
    if (!session || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(MP_CHANNEL);
    channel.onmessage = (event: MessageEvent<MpReturnMessage>) => {
      const message = event.data;
      if (message?.type === "mp-return" && message.orderId === session.orderId) {
        handleStatus(message.orderId, message.status, message.paymentId);
      }
    };
    return () => channel.close();
  }, [session, handleStatus]);

  // Respaldo: preguntar al servidor cada pocos segundos.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    async function poll() {
      try {
        const response = await fetch(
          `/api/pagos/mercadopago/estado?pedido=${encodeURIComponent(session!.orderId)}`,
          { cache: "no-store" },
        );
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { status: MpPaymentStatus; paymentId: string | null };
        if (!cancelled) handleStatus(session!.orderId, data.status, data.paymentId);
      } catch {
        // Error de red momentáneo: se reintenta en la siguiente vuelta.
      }
    }

    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session, handleStatus]);

  return {
    waiting: session !== null,
    starting,
    error,
    lastStatus,
    start,
    reopen,
    cancel,
    continuePending,
  };
}
