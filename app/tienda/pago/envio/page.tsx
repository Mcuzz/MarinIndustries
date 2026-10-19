
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
import {
  loadStoreCheckout,
  type StoreCheckoutDraft,
} from "@/src/infrastructure/sales/store-checkout.storage";
import {
  loadStoreShipping,
  saveStoreShipping,
  type StoreShippingAddress,
} from "@/src/infrastructure/sales/store-shipping.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import { ShippingForm } from "@/src/presentation/components/store/ShippingForm";

const initialAddress: StoreShippingAddress = {
  recipient: "",
  phone: "",
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  neighborhood: "",
  zip: "",
  city: "",
  state: "",
  references: "",
};

export default function StoreShippingPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [address, setAddress] =
    useState<StoreShippingAddress>(initialAddress);

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setAddress(loadStoreShipping() ?? initialAddress);
    setLoaded(true);
  }, []);

  const subtotal = draft?.subtotal ?? 0;
  const envio = Math.round(subtotal * 0.08 * 100) / 100;
  const total = (draft?.total ?? 0) + envio;

  function handleShippingSubmit(nextAddress: StoreShippingAddress) {
    if (!draft) return;

    saveStoreShipping(nextAddress);
    setAddress(nextAddress);
    router.push("/tienda/pago/tarjeta");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Tienda en línea · Checkout"
          title="Dirección de envío"
          description="Indica dónde debemos entregar tu pedido."
        />

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {!loaded ? (
              <div className="qf-card vt-loading">
                Cargando pedido...
              </div>
            ) : !draft ? (
              <div className="qf-card vt-empty">
                <span className="eyebrow">Sin pedido pendiente</span>

                <h2 className="qa-title">
                  No encontramos tu compra
                </h2>

                <p className="qa-text">
                  Regresa a la tienda y agrega productos al carrito.
                </p>

                <Link href="/tienda" className="btn btn-primary">
                  Volver a la tienda →
                </Link>
              </div>
            ) : (
              <>
                <ShippingForm
                  initialAddress={address}
                  onBack={() => router.push("/tienda/pago")}
                  onSubmit={handleShippingSubmit}
                />

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
                      <span>{formatMXN(draft.iva)}</span>
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
                    El costo de envío es estimado y corresponde al 8% del
                    subtotal de los productos.
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
