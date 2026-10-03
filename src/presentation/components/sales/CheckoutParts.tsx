"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMXN, type SaleDraft } from "@/src/domain/sales/sale.entity";
import { loadSaleDraft } from "@/src/infrastructure/sales/sale-session.storage";

const steps = ["Venta", "Método de pago", "Datos de pago"];

export function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="vt-steps" aria-label="Progreso de la venta">
      {steps.map((label, i) => (
        <li
          key={label}
          className="vt-step"
          data-state={i < current ? "done" : i === current ? "current" : "todo"}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="vt-step-n">{String(i + 1).padStart(2, "0")}</span>
          <span className="vt-step-t">{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Carga la venta en curso guardada al confirmar en /ventas. */
export function useSaleDraft() {
  const [state, setState] = useState<{ loaded: boolean; draft: SaleDraft | null }>({
    loaded: false,
    draft: null,
  });

  useEffect(() => {
    setState({ loaded: true, draft: loadSaleDraft() });
  }, []);

  return state;
}

export function SaleSummary({ draft }: { draft: SaleDraft }) {
  return (
    <aside className="qa-card vt-summary" aria-label="Resumen de la venta">
      <span className="eyebrow">Resumen de la venta</span>
      <p className="vt-summary-folio">#{draft.folio}</p>

      <dl className="vt-summary-meta">
        <div><dt>Cliente</dt><dd>{draft.client.name}</dd></div>
        <div><dt>RFC</dt><dd className="font-mono">{draft.client.rfc}</dd></div>
        <div><dt>Sucursal</dt><dd>{draft.branch.name}</dd></div>
      </dl>

      <div className="vt-summary-item">
        <div>
          <p className="vt-summary-item-name">{draft.item.name}</p>
          <p className="vt-summary-item-qty">
            {draft.quantity} × {formatMXN(draft.item.unitPrice)}
          </p>
        </div>
        <span>{formatMXN(draft.subtotal)}</span>
      </div>

      <div className="vt-breakdown">
        <div><span>Subtotal</span><span>{formatMXN(draft.subtotal)}</span></div>
        <div><span>IVA (16%)</span><span>{formatMXN(draft.tax)}</span></div>
        <div className="vt-breakdown-total">
          <span>Total a cobrar</span>
          <span>{formatMXN(draft.total)}</span>
        </div>
      </div>
    </aside>
  );
}

export function NoSaleInProgress() {
  return (
    <div className="qf-card vt-empty">
      <span className="eyebrow">Sin venta en curso</span>
      <h2 className="qa-title">No hay una venta pendiente de pago</h2>
      <p className="qa-text">
        Registra una operación en el módulo de ventas y presiona “Confirmar venta” para
        continuar con el cobro.
      </p>
      <Link href="/ventas" className="btn btn-primary qa-btn">
        Ir a ventas <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export function LoadingBlock() {
  return <div className="qf-card vt-loading" aria-busy="true">Cargando venta…</div>;
}
