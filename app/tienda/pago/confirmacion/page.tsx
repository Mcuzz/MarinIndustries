"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
import {
  loadStoreCheckout,
  clearStoreCheckout,
  type StoreCheckoutDraft,
} from "@/src/infrastructure/sales/store-checkout.storage";
import {
  loadStoreShipping,
  clearStoreShipping,
  type StoreShippingAddress,
} from "@/src/infrastructure/sales/store-shipping.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";

export default function StoreConfirmationPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [shipping, setShipping] = useState<StoreShippingAddress | null>(null);

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setShipping(loadStoreShipping());
    setLoaded(true);
  }, []);

  const subtotal = draft?.subtotal ?? 0;
  const envio = Math.round(subtotal * 0.08 * 100) / 100;
  const total = (draft?.total ?? 0) + envio;

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
                    ✓
                  </span>

                  <span className="eyebrow">Resumen de compra</span>

                  <h2 className="qa-title">
                    Gracias por elegir Marin Industries
                  </h2>

                  <p className="qa-text">
                    Aquí puedes consultar los productos y los datos de entrega
                    de tu compra.
                  </p>
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
                    <span>{formatMXN(draft.iva)}</span>
                  </div>

                  <div>
                    <span>Envío estimado (8%)</span>
                    <span>{formatMXN(envio)}</span>
                  </div>

                  <div className="vt-breakdown-total">
                    <span>Total estimado</span>
                    <span>{formatMXN(total)}</span>
                  </div>
                </div>

                <p className="vt-hint">
                  Este resumen es temporal y se almacena en la sesión del
                  navegador. No constituye un comprobante de compra.
                </p>

                <div className="vt-pay-actions">
                  <Link href="/tienda" className="btn btn-ghost">
                    Seguir explorando
                  </Link>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleFinish}
                  >
                     →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
