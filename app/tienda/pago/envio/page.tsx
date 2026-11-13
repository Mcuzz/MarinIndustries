
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
  saveStoreShipping,
  type StoreShippingAddress,
} from "@/src/infrastructure/sales/store-shipping.storage";
import { ModuleHero } from "@/src/presentation/components/ModuleHero";
import { PageShell } from "@/src/presentation/components/layout/PageShell";
import { ShippingForm } from "@/src/presentation/components/store/ShippingForm";
import { MercadoPagoWaiting } from "@/src/presentation/components/store/MercadoPagoWaiting";
import {
  useMercadoPagoPopup,
  type MpResult,
} from "@/src/presentation/components/store/useMercadoPagoPopup";

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

  const [method, setMethod] = useState<"tarjeta" | "mercadopago">("mercadopago");

  const mercadoPago = useMercadoPagoPopup((result: MpResult) => {
    const params = new URLSearchParams({
      status: result.status,
      external_reference: result.orderId,
    });
    if (result.paymentId) params.set("payment_id", result.paymentId);
    router.push(`/tienda/pago/confirmacion?${params.toString()}`);
  });

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setAddress(loadStoreShipping() ?? initialAddress);
    // Se lee aquí (y no con useSearchParams) para no requerir un <Suspense> en la página.
    const metodo = new URLSearchParams(window.location.search).get("metodo");
    if (metodo === "tarjeta") setMethod("tarjeta");
    setLoaded(true);
  }, []);

  // Mismo cálculo que cobra el servidor (al centavo).
  const { subtotal, iva, envio, total } = computeStoreTotals(draft?.items ?? []);

  function handleShippingSubmit(nextAddress: StoreShippingAddress) {
    if (!draft) return;

    saveStoreShipping(nextAddress);
    setAddress(nextAddress);

    if (method === "tarjeta") {
      router.push("/tienda/pago/tarjeta");
      return;
    }

    // Mercado Pago Checkout Pro en ventana emergente; esta página se queda esperando.
    // Se llama sin await antes de cualquier otra espera para que el navegador no bloquee la ventana.
    void mercadoPago.start({
      items: draft.items.map(({ id, cantidad }) => ({ id, cantidad })),
      shipping: nextAddress,
    });
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
                {mercadoPago.waiting ? (
                  <MercadoPagoWaiting
                    lastStatus={mercadoPago.lastStatus}
                    onReopen={mercadoPago.reopen}
                    onCancel={mercadoPago.cancel}
                    onContinuePending={mercadoPago.continuePending}
                  />
                ) : (
                  <ShippingForm
                    initialAddress={address}
                    onBack={() => router.push("/tienda/pago")}
                    onSubmit={handleShippingSubmit}
                    busy={mercadoPago.starting}
                    error={mercadoPago.error}
                    submitLabel={
                      method === "tarjeta"
                        ? "Continuar al pago con tarjeta →"
                        : "Pagar con Mercado Pago →"
                    }
                  />
                )}

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
                      <span>Total a pagar</span>
                      <span>{formatMXN(total)}</span>
                    </div>
                  </div>

                  <p className="vt-hint">
                    El costo de envío corresponde al 8% del subtotal de los
                    productos.
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
