"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
import { computeStoreTotals } from "@/src/domain/store/store-pricing";
import {
  loadStoreCheckout,
  clearStoreCheckout,
  clearStoreCart,
  type StoreCheckoutDraft,
} from "@/src/infrastructure/sales/store-checkout.storage";
import {
  loadStoreShipping,
  clearStoreShipping,
  type StoreShippingAddress,
} from "@/src/infrastructure/sales/store-shipping.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import {
  MP_CHANNEL,
  type MpReturnMessage,
} from "@/src/presentation/components/store/useMercadoPagoPopup";

// Mercado Pago regresa a esta página con parámetros en la URL:
//   ?status=approved|pending|in_process|rejected|null&payment_id=...&external_reference=...
// OJO: estos parámetros los puede alterar cualquiera. Por eso, al cargar, se verifica el estado
// real con nuestro servidor (/api/pagos/mercadopago/estado), que además actualiza el pedido en Supabase.
type MercadoPagoReturn = {
  status: "approved" | "pending" | "rejected";
  paymentId: string | null;
  orderId: string | null;
};

function readMercadoPagoReturn(): MercadoPagoReturn | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("status") ?? params.get("collection_status");
  if (!raw) return null;

  const status =
    raw === "approved" ? "approved" : raw === "pending" || raw === "in_process" ? "pending" : "rejected";

  return {
    status,
    paymentId: params.get("payment_id") ?? params.get("collection_id"),
    orderId: params.get("external_reference"),
  };
}

export default function StoreConfirmationPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [shipping, setShipping] = useState<StoreShippingAddress | null>(null);
  const [mpReturn, setMpReturn] = useState<MercadoPagoReturn | null>(null);

  useEffect(() => {
    const mp = readMercadoPagoReturn();
    const inPopup = new URLSearchParams(window.location.search).get("ventana") === "1";

    // Dentro de la ventana emergente: avisar a la página de Marin que está esperando y cerrarse.
    if (inPopup && mp?.orderId && typeof BroadcastChannel !== "undefined") {
      const message: MpReturnMessage = {
        type: "mp-return",
        orderId: mp.orderId,
        status: mp.status,
        paymentId: mp.paymentId && mp.paymentId !== "null" ? mp.paymentId : null,
      };
      const channel = new BroadcastChannel(MP_CHANNEL);
      channel.postMessage(message);
      channel.close();
      if (mp.status === "approved") {
        window.setTimeout(() => window.close(), 300);
      }
    }

    // Compra terminada (aprobada o pendiente): vaciar el carrito.
    // Si se rechazó, se conserva para que el cliente pueda intentarlo de nuevo.
    const storedDraft = loadStoreCheckout();
    if (storedDraft && mp && mp.status !== "rejected") {
      clearStoreCart();
    }

    // Si la ventana no se pudo cerrar (o no era emergente), se muestra la confirmación normal.
    setDraft(storedDraft);
    setShipping(loadStoreShipping());
    setMpReturn(mp);
    setLoaded(true);

    // Verificar con el servidor (fuente confiable) y sincronizar el pedido en Supabase.
    if (mp?.orderId) {
      fetch(`/api/pagos/mercadopago/estado?pedido=${encodeURIComponent(mp.orderId)}`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { status?: string; paymentId?: string | null } | null) => {
          if (!data?.status || data.status === "none") return;
          const status: MercadoPagoReturn["status"] =
            data.status === "approved" ? "approved" : data.status === "pending" ? "pending" : "rejected";
          setMpReturn({ ...mp, status, paymentId: data.paymentId ?? mp.paymentId });
        })
        .catch(() => {
          // Sin conexión: se queda el estado que indicó Mercado Pago en la URL.
        });
    }
  }, []);

  const rejected = mpReturn?.status === "rejected";
  const pending = mpReturn?.status === "pending";

  // Mismo cálculo que cobró el servidor (al centavo).
  const { subtotal, iva, envio, total } = computeStoreTotals(draft?.items ?? []);

  function handleFinish() {
    clearStoreCheckout();
    clearStoreShipping();
    router.push("/tienda");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Tienda en línea · Checkout"
          title="Confirmación del pedido"
          description="Consulta el resumen de tu compra."
        />

        <section data-tone="alt" className="vt-section">
          <div className="section-shell">
            {!loaded ? (
              <div className="qf-card vt-loading">
                Cargando información del pedido...
              </div>
            ) : !draft || !shipping ? (
              <div className="qf-card vt-empty">
                <span className="eyebrow">Sin pedido pendiente</span>

                <h2 className="qa-title">
                  No encontramos los datos de tu pedido
                </h2>

                <p className="qa-text">
                  Puede que el checkout haya expirado o que ya hayas terminado
                  la compra.
                </p>

                <Link href="/tienda" className="btn btn-primary">
                  Volver a la tienda →
                </Link>
              </div>
            ) : (
              <div className="qf-card">
                <div className="vt-confirmation-header">
                  <span className="vt-confirmation-icon" aria-hidden="true">
                    {rejected ? "✕" : pending ? "…" : "✓"}
                  </span>

                  <span className="eyebrow">
                    {mpReturn ? "Pago con Mercado Pago" : "Resumen de compra"}
                  </span>

                  <h2 className="qa-title">
                    {rejected
                      ? "No se completó el pago"
                      : pending
                        ? "Tu pago está en proceso"
                        : "Gracias por elegir Marin Industries"}
                  </h2>

                  <p className="qa-text">
                    {rejected
                      ? "Mercado Pago no pudo procesar el cobro o cancelaste la operación. No se realizó ningún cargo; puedes intentarlo de nuevo."
                      : pending
                        ? "Mercado Pago está validando tu pago (por ejemplo, un pago en OXXO o SPEI). Te avisaremos cuando se acredite."
                        : "Aquí puedes consultar los productos y los datos de entrega de tu compra."}
                  </p>

                  {mpReturn?.paymentId && mpReturn.paymentId !== "null" ? (
                    <p className="vt-hint">
                      Folio de Mercado Pago: {mpReturn.paymentId}
                      {mpReturn.orderId ? ` · Pedido: ${mpReturn.orderId}` : ""}
                    </p>
                  ) : null}
                </div>

                <div className="vt-confirmation-details">
                  <div>
                    <span className="qf-label">Destinatario</span>
                    <p className="qa-text">{shipping.recipient}</p>
                  </div>

                  <div>
                    <span className="qf-label">Dirección de entrega</span>
                    <p className="qa-text">
                      {shipping.street} {shipping.exteriorNumber}
                      {shipping.interiorNumber
                        ? `, Int. ${shipping.interiorNumber}`
                        : ""}
                      <br />
                      {shipping.neighborhood}, C. P. {shipping.zip}
                      <br />
                      {shipping.city}, {shipping.state}
                    </p>
                  </div>
                </div>

                <div className="vt-stack">
                  <span className="eyebrow">Productos</span>

                  {draft.items.map((item) => (
                    <div className="vt-summary-item" key={item.id}>
                      <div>
                        <p className="vt-summary-item-name">{item.nombre}</p>
                        <p className="vt-summary-item-qty">
                          {item.cantidad} × {formatMXN(item.precio)}
                        </p>
                      </div>

                      <span>{formatMXN(item.precio * item.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <div className="vt-breakdown">
                  <div>
                    <span>Subtotal</span>
                    <span>{formatMXN(subtotal)}</span>
                  </div>

                  <div>
                    <span>IVA incluido</span>
                    <span>{formatMXN(iva)}</span>
                  </div>

                  <div>
                    <span>Envío (8%)</span>
                    <span>{formatMXN(envio)}</span>
                  </div>

                  <div className="vt-breakdown-total">
                    <span>Total</span>
                    <span>{formatMXN(total)}</span>
                  </div>
                </div>

                <p className="vt-hint">
                  Mercado Pago te envió el comprobante de pago a tu correo.
                  Conserva tu número de pedido para cualquier aclaración.
                </p>

                <div className="vt-pay-actions">
                  <Link href="/tienda" className="btn btn-ghost">
                    Seguir explorando
                  </Link>

                  {rejected ? (
                    <Link href="/tienda/pago" className="btn btn-primary">
                      Intentar de nuevo →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleFinish}
                    >
                      Finalizar →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
