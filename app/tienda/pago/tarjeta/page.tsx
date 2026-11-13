"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
import { computeStoreTotals } from "@/src/domain/store/store-pricing";
import {
  loadStoreCheckout,
  type StoreCheckoutDraft,
} from "@/src/infrastructure/sales/store-checkout.storage";
import {
  loadStoreShipping,
  type StoreShippingAddress,
} from "@/src/infrastructure/sales/store-shipping.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import {
  StoreCardForm,
  type CardPaymentOutcome,
} from "@/src/presentation/components/store/StoreCardForm";

export default function StoreCardPaymentPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [shipping, setShipping] = useState<StoreShippingAddress | null>(null);

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setShipping(loadStoreShipping());
    setLoaded(true);
  }, []);

  // Mismo cálculo que cobra el servidor (al centavo).
  const { subtotal, iva, envio, total } = computeStoreTotals(draft?.items ?? []);

  function handlePaid(outcome: CardPaymentOutcome) {
    const params = new URLSearchParams({
      status: outcome.status,
      external_reference: outcome.orderId,
    });
    if (outcome.paymentId) params.set("payment_id", outcome.paymentId);
    router.push(`/tienda/pago/confirmacion?${params.toString()}`);
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Tienda en línea · Checkout"
          title="Pago con tarjeta"
          description="Paga con tu tarjeta de débito o crédito sin salir de Marin Industries. El cobro lo procesa Mercado Pago de forma segura."
        />

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {!loaded ? (
              <div className="qf-card vt-loading">Cargando información del pedido...</div>
            ) : !draft || !shipping ? (
              <div className="qf-card vt-empty">
                <span className="eyebrow">Checkout incompleto</span>
                <h2 className="qa-title">Faltan datos de tu pedido</h2>
                <p className="qa-text">
                  Necesitamos un pedido y una dirección de envío antes de continuar al pago.
                </p>
                <Link href="/tienda" className="btn btn-primary">
                  Volver a la tienda →
                </Link>
              </div>
            ) : (
              <>
                <StoreCardForm draft={draft} shipping={shipping} onPaid={handlePaid} />

                <aside className="qa-card vt-summary">
                  <span className="eyebrow">Resumen del pedido</span>

                  <div className="vt-stack">
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
                      <span>IVA (16%)</span>
                      <span>{formatMXN(iva)}</span>
                    </div>
                    <div>
                      <span>Envío (8%)</span>
                      <span>{formatMXN(envio)}</span>
                    </div>
                    <div className="vt-breakdown-total">
                      <span>Total a pagar</span>
                      <span>{formatMXN(total)}</span>
                    </div>
                  </div>

                  <div className="vt-breakdown">
                    <span className="eyebrow">Dirección de entrega</span>
                    <p className="qa-text">
                      {shipping.recipient}
                      <br />
                      {shipping.street} {shipping.exteriorNumber}
                      {shipping.interiorNumber ? `, Int. ${shipping.interiorNumber}` : ""}
                      <br />
                      {shipping.neighborhood}, C. P. {shipping.zip}
                      <br />
                      {shipping.city}, {shipping.state}
                    </p>
                    <Link href="/tienda/pago/envio?metodo=tarjeta" className="btn btn-ghost">
                      Editar dirección
                    </Link>
                  </div>
                </aside>
              </>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
