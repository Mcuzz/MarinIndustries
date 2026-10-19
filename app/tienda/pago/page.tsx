
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMXN } from "@/src/domain/sales/sale.entity";
import {
  loadStoreCheckout,
  saveStoreCheckout,
  type StoreCheckoutDraft,
} from "@/src/infrastructure/sales/store-checkout.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";

export default function StorePaymentPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("tarjeta");

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setLoaded(true);
  }, []);

  const subtotal = draft?.subtotal ?? 0;
  const iva = draft?.iva ?? 0;
  const envio = Math.round(subtotal * 0.08 * 100) / 100;
  const total = (draft?.total ?? 0) + envio;

  function continueToShipping() {
    if (!draft || selectedMethod !== "tarjeta") return;

    saveStoreCheckout({
      ...draft,
    });

    router.push("/tienda/pago/envio?metodo=tarjeta");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Tienda en línea · Checkout"
          title="Completa tu compra"
          description="Selecciona tu método de pago y revisa el importe de tu pedido antes de continuar."
        />

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {!loaded ? (
              <div className="qf-card vt-loading">
                Cargando pedido...
              </div>
            ) : !draft ? (
              <div className="qf-card vt-empty">
                <span className="eyebrow">Carrito vacío</span>
                <h2 className="qa-title">
                  No encontramos un pedido pendiente
                </h2>
                <p className="qa-text">
                  Regresa a la tienda y agrega productos antes de continuar.
                </p>
                <Link href="/tienda" className="btn btn-primary qa-btn">
                  Volver a la tienda →
                </Link>
              </div>
            ) : (
              <>
                <div className="qf-card">
                  <span className="qf-group-label">
                    01 / Método de pago
                  </span>

                  <div className="vt-methods" role="group" aria-label="Métodos de pago">
                    <button
                      type="button"
                      className="vt-method"
                      data-selected={selectedMethod === "tarjeta"}
                      onClick={() => setSelectedMethod("tarjeta")}
                    >
                      <span className="vt-method-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <rect x="3" y="5.5" width="18" height="13" />
                          <path d="M3 10h18" />
                          <path d="M7 15h4" />
                        </svg>
                      </span>
                      <span className="vt-method-body">
                        <span className="vt-method-name">
                          Tarjeta de débito / crédito
                        </span>
                        <span className="vt-method-desc">
                          Visa, Mastercard o American Express.
                        </span>
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>

                    <div className="vt-method" aria-disabled="true">
                      <span className="vt-method-icon" aria-hidden="true">
                        <span>P</span>
                      </span>
                      <span className="vt-method-body">
                        <span className="vt-method-name">
                          PayPal <span className="vt-soon">Próximamente</span>
                        </span>
                        <span className="vt-method-desc">
                          La integración estará disponible más adelante.
                        </span>
                      </span>
                    </div>

                    <div className="vt-method" aria-disabled="true">
                      <span className="vt-method-icon" aria-hidden="true">
                        <span>M</span>
                      </span>
                      <span className="vt-method-body">
                        <span className="vt-method-name">
                          Mercado Pago <span className="vt-soon">Próximamente</span>
                        </span>
                        <span className="vt-method-desc">
                          La integración estará disponible más adelante.
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="vt-notice">
                    El pago es una interfaz de demostración. No se realizará
                    ningún cargo real desde esta pantalla.
                  </div>

                  <div className="vt-pay-actions">
                    <Link href="/tienda" className="btn btn-ghost">
                      ← Regresar a la tienda
                    </Link>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={continueToShipping}
                      disabled={selectedMethod !== "tarjeta"}
                    >
                      Continuar con el envío →
                    </button>
                  </div>
                </div>

                <aside className="qa-card vt-summary">
                  <span className="eyebrow">Resumen del pedido</span>

                  <div className="vt-stack">
                    {draft.items.map((item) => (
                      <div className="vt-summary-item" key={item.id}>
                        <div>
                          <p className="vt-summary-item-name">
                            {item.nombre}
                          </p>
                          <p className="vt-summary-item-qty">
                            {item.cantidad} × {formatMXN(item.precio)}
                          </p>
                        </div>
                        <span>
                          {formatMXN(item.precio * item.cantidad)}
                        </span>
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
                      <span>Total estimado</span>
                      <span>{formatMXN(total)}</span>
                    </div>
                  </div>

                  <p className="vt-hint">
                    El envío se calcula como el 8% del subtotal de productos.
                    Confirmaremos la dirección antes de finalizar el pedido.
                  </p>
                </aside>
              </>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
