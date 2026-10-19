
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
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

type CardForm = {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
};

const initialCard: CardForm = {
  holder: "",
  number: "",
  expiry: "",
  cvv: "",
};

export default function StoreCardPaymentPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<StoreCheckoutDraft | null>(null);
  const [shipping, setShipping] = useState<StoreShippingAddress | null>(null);
  const [card, setCard] = useState<CardForm>(initialCard);

  useEffect(() => {
    setDraft(loadStoreCheckout());
    setShipping(loadStoreShipping());
    setLoaded(true);
  }, []);

  const subtotal = draft?.subtotal ?? 0;
  const envio = Math.round(subtotal * 0.08 * 100) / 100;
  const total = (draft?.total ?? 0) + envio;

  function updateCard<K extends keyof CardForm>(
    field: K,
    value: CardForm[K],
  ) {
    setCard((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft || !shipping) return;

    // Esta pantalla es una demostración: no procesa ni registra pagos.
    // No guardar los datos de tarjeta en el navegador.
    setCard(initialCard);
    router.push("/tienda/pago/confirmacion");
  }

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Tienda en línea · Checkout"
          title="Pago con tarjeta"
          description="Ingresa los datos de tu tarjeta para completar tu compra."        />

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {!loaded ? (
              <div className="qf-card vt-loading">
                Cargando información del pedido...
              </div>
            ) : !draft || !shipping ? (
              <div className="qf-card vt-empty">
                <span className="eyebrow">Checkout incompleto</span>
                <h2 className="qa-title">Faltan datos de tu pedido</h2>
                <p className="qa-text">
                  Necesitamos un pedido y una dirección de envío antes de
                  continuar al pago.
                </p>
                <Link href="/tienda" className="btn btn-primary">
                  Volver a la tienda →
                </Link>
              </div>
            ) : (
              <>
                <form className="qf-card" onSubmit={handleSubmit}>
                  <span className="qf-group-label">
                    03 / Información de pago
                  </span>

                

                  <div className="qf-stack">
                    <label className="qf-field">
                      <span className="qf-label">Titular de la tarjeta *</span>
                      <input
                        className="qf-input"
                        autoComplete="off"
                        maxLength={100}
                        required
                        value={card.holder}
                        onChange={(event) =>
                          updateCard("holder", event.target.value)
                        }
                        placeholder="NOMBRE DEL TITULAR"
                      />
                    </label>

                    <label className="qf-field">
                      <span className="qf-label">Número de tarjeta *</span>
                      <input
                        className="qf-input"
                        inputMode="numeric"
                        autoComplete="off"
                        required
                        minLength={13}
                        maxLength={19}
                        pattern="[0-9 ]{13,19}"
                        title="Introduce entre 13 y 19 dígitos."
                        value={card.number}
                        onChange={(event) =>
                          updateCard(
                            "number",
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          )
                        }
                        placeholder="0000 0000 0000 0000"
                      />
                    </label>

                    <div className="qf-row">
                      <label className="qf-field">
                        <span className="qf-label">
                          Vencimiento (MM/AA) *
                        </span>
                        <input
                          className="qf-input"
                          inputMode="numeric"
                          autoComplete="off"
                          required
                          pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                          title="Usa el formato MM/AA."
                          maxLength={5}
                          value={card.expiry}
                          onChange={(event) => {
                            const digits = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                            const value =
                              digits.length > 2
                                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                                : digits;

                            updateCard("expiry", value);
                          }}
                          placeholder="MM/AA"
                        />
                      </label>

                      <label className="qf-field">
                        <span className="qf-label">CVV *</span>
                        <input
                          className="qf-input"
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          required
                          pattern="[0-9]{3,4}"
                          title="Introduce 3 o 4 dígitos."
                          maxLength={4}
                          value={card.cvv}
                          onChange={(event) =>
                            updateCard(
                              "cvv",
                              event.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                          placeholder="•••"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="vt-pay-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => router.push("/tienda/pago/envio")}
                    >
                      ← Regresar
                    </button>

                    <button type="submit" className="btn btn-primary">
                      Continuar →
                    </button>
                  </div>
                </form>

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

                  <div className="vt-breakdown">
                    <span className="eyebrow">Dirección de entrega</span>
                    <p className="qa-text">
                      {shipping.recipient}
                      <br />
                      {shipping.street} {shipping.exteriorNumber}
                      {shipping.interiorNumber
                        ? `, Int. ${shipping.interiorNumber}`
                        : ""}
                      <br />
                      {shipping.neighborhood}, C. P. {shipping.zip}
                      <br />
                      {shipping.city}, {shipping.state}
                    </p>
                    <Link
                      href="/tienda/pago/envio"
                      className="btn btn-ghost"
                    >
                      Editar dirección
                    </Link>
                  </div>

                  <p className="vt-hint">
                    Demostración de frontend. El total es estimado; no se
                    valida el pago ni se realiza ningún cargo.
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
