"use client";

import type { MpPaymentStatus } from "./useMercadoPagoPopup";

type MercadoPagoWaitingProps = {
  lastStatus: MpPaymentStatus;
  onReopen: () => void;
  onCancel: () => void;
  onContinuePending: () => void;
};

export function MercadoPagoWaiting({
  lastStatus,
  onReopen,
  onCancel,
  onContinuePending,
}: MercadoPagoWaitingProps) {
  return (
    <div className="qf-card" aria-live="polite" aria-busy={lastStatus !== "pending"}>
      <span className="qf-group-label">03 / Pago con Mercado Pago</span>

      <div className="vt-confirmation-header">
        <span className="vt-confirmation-icon" aria-hidden="true">
          {lastStatus === "pending" ? "…" : "⏳"}
        </span>

        <h2 className="qa-title">
          {lastStatus === "pending"
            ? "Tu pago quedó pendiente"
            : "Esperando confirmación de tu pago"}
        </h2>

        <p className="qa-text">
          {lastStatus === "pending"
            ? "Mercado Pago está validando tu pago (por ejemplo, OXXO o SPEI). Guarda tu ficha de pago; te avisaremos cuando se acredite."
            : "Completa tu compra en la ventana de Mercado Pago. Esta página se actualizará sola en cuanto se confirme el pago."}
        </p>
      </div>

      {lastStatus === "rejected" ? (
        <div className="vt-alert" role="alert">
          El último intento fue rechazado. Puedes probar con otro método de pago en la ventana
          de Mercado Pago.
        </div>
      ) : null}

      <div className="vt-pay-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          ← Cancelar y regresar
        </button>

        {lastStatus === "pending" ? (
          <button type="button" className="btn btn-primary" onClick={onContinuePending}>
            Ver resumen →
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onReopen}>
            ¿No ves la ventana? Ábrela de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
