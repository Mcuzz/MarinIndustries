import Link from "next/link";
import { baseKpis, seedOrders } from "@/src/infrastructure/sales/static-sales.data";
import { formatMXN } from "@/src/domain/sales/sale.entity";

export default function SalesPreview() {
  return (
    <Link
      href="/ventas"
      className="case-visual sp-link"
      aria-label="Abrir la demostración del punto de venta de Terrazitas"
    >

      <div className="mock-window sp-window" aria-hidden="true">
        <div className="mock-dots"><span></span><span></span><span></span></div>

        <div className="sp-kpis">
          <div>
            <small>Ventas hoy</small>
            <p>{formatMXN(baseKpis.salesToday)}</p>
          </div>
          <div>
            <small>Órdenes</small>
            <p>{baseKpis.finishedOrders}</p>
          </div>
        </div>

        {seedOrders.map((o) => (
          <div className="mock-row" key={o.id}>
            <div className="flex-1 min-w-0">
              <p className="sp-order">{o.id}</p>
              <p className="sp-client">{o.clientName}</p>
            </div>
            <span className="sp-amount">{formatMXN(o.total)}</span>
          </div>
        ))}

        <div className="mock-pos-total">
          <span>Total del día</span>
          <span>{formatMXN(baseKpis.salesToday)}</span>
        </div>
      </div>

      <span className="btn btn-primary sp-cta">
        Inspeccionar <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}