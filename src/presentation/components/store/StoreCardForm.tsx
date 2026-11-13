"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { formatMXN } from "@/src/domain/sales/sale.entity";
import { computeStoreTotals } from "@/src/domain/store/store-pricing";
import type { StoreCheckoutDraft } from "@/src/infrastructure/sales/store-checkout.storage";
import type { StoreShippingAddress } from "@/src/infrastructure/sales/store-shipping.storage";
import {
  brandLabel,
  cardTypeLabel,
  getMercadoPago,
  type MpField,
  type MpFieldType,
  type MpPayerCost,
  type MpPaymentMethod,
} from "./mercadopago-js";

// Formulario de tarjeta con "campos seguros" de Mercado Pago:
// número, vencimiento y CVV viven en iframes de Mercado Pago, así que Marin nunca ve ni guarda
// esos datos. Al pagar, MercadoPago.js genera un token de un solo uso que mandamos al servidor.

export type CardPaymentOutcome = {
  orderId: string;
  status: "approved" | "pending";
  paymentId: string | null;
};

type Props = {
  draft: StoreCheckoutDraft;
  shipping: StoreShippingAddress;
  onPaid: (outcome: CardPaymentOutcome) => void;
};

const FIELD_IDS: Record<MpFieldType, string> = {
  cardNumber: "mp-card-number",
  expirationDate: "mp-expiration-date",
  securityCode: "mp-security-code",
};

const FIELD_ERRORS: Record<MpFieldType, string> = {
  cardNumber: "Revisa el número de la tarjeta.",
  expirationDate: "Revisa la fecha de vencimiento (MM/AA).",
  securityCode: "Revisa el código de seguridad.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_TEST = process.env.NODE_ENV !== "production";

export function StoreCardForm({ draft, shipping, onPaid }: Props) {
  const total = useMemo(() => computeStoreTotals(draft.items).total, [draft]);

  const styleRef = useRef<HTMLInputElement>(null);
  const fieldsRef = useRef<Partial<Record<MpFieldType, MpField>>>({});
  const lastBinRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [focused, setFocused] = useState<MpFieldType | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<MpFieldType, boolean>>>({});
  const [blurred, setBlurred] = useState<Partial<Record<MpFieldType, boolean>>>({});

  const [bin, setBin] = useState<string | null>(null);
  const [method, setMethod] = useState<MpPaymentMethod | null>(null);
  const [issuerId, setIssuerId] = useState<number | undefined>();
  const [payerCosts, setPayerCosts] = useState<MpPayerCost[]>([]);
  const [installments, setInstallments] = useState(1);

  const [holder, setHolder] = useState(shipping.recipient.toUpperCase());
  const [email, setEmail] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Montar los campos seguros.
  useEffect(() => {
    let cancelled = false;

    // Copiar el estilo de .qf-input para que los iframes se vean como el resto del formulario.
    const ref = styleRef.current;
    const computed = ref ? getComputedStyle(ref) : null;
    const placeholder = ref ? getComputedStyle(ref, "::placeholder") : null;
    const style = {
      height: "100%",
      fontSize: computed?.fontSize ?? "14px",
      color: computed?.color ?? "#111",
      placeholderColor: placeholder?.color ?? "#888",
    };

    getMercadoPago()
      .then((mp) => {
        if (cancelled) return;

        const make = (type: MpFieldType, placeholderText: string) => {
          const field = mp.fields
            .create(type, { placeholder: placeholderText, style })
            .mount(FIELD_IDS[type]);
          field.on("focus", () => setFocused(type));
          field.on("blur", () => {
            setFocused((current) => (current === type ? null : current));
            setBlurred((b) => ({ ...b, [type]: true }));
          });
          field.on("validityChange", ({ errorMessages }) =>
            setFieldErrors((e) => ({ ...e, [type]: errorMessages.length > 0 })),
          );
          fieldsRef.current[type] = field;
          return field;
        };

        const cardNumber = make("cardNumber", "0000 0000 0000 0000");
        make("expirationDate", "MM/AA");
        make("securityCode", "CVV");

        cardNumber.on("binChange", async ({ bin: newBin }) => {
          if (newBin === lastBinRef.current) return;
          lastBinRef.current = newBin;
          setBin(newBin);

          if (!newBin) {
            setMethod(null);
            setIssuerId(undefined);
            setPayerCosts([]);
            setInstallments(1);
            return;
          }

          try {
            const { results } = await mp.getPaymentMethods({ bin: newBin });
            const found = results[0] ?? null;
            if (lastBinRef.current !== newBin) return;
            setMethod(found);
            if (!found) return;

            // Ajustar longitud del número y del CVV (p. ej. American Express usa 4 dígitos).
            const settings = found.settings?.[0];
            if (settings?.card_number) cardNumber.update({ settings: settings.card_number });
            if (settings?.security_code) {
              fieldsRef.current.securityCode?.update({ settings: settings.security_code });
            }

            const issuers = await mp.getIssuers({ paymentMethodId: found.id, bin: newBin }).catch(() => []);
            setIssuerId(issuers[0]?.id ?? found.issuer?.id);

            if (found.payment_type_id === "credit_card") {
              const options = await mp
                .getInstallments({ amount: String(total), bin: newBin, paymentTypeId: "credit_card" })
                .catch(() => []);
              setPayerCosts(options[0]?.payer_costs ?? []);
            } else {
              setPayerCosts([]);
            }
            setInstallments(1);
          } catch {
            setMethod(null);
          }
        });

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError("No pudimos cargar el formulario seguro de Mercado Pago. Recarga la página.");
      });

    return () => {
      cancelled = true;
      for (const field of Object.values(fieldsRef.current)) {
        try {
          field?.unmount();
        } catch {
          // ya estaba desmontado
        }
      }
      fieldsRef.current = {};
      lastBinRef.current = null;
    };
  }, [total]);

  const holderError = submitted && !holder.trim() ? "Escribe el nombre como aparece en la tarjeta." : "";
  const emailError = submitted && !EMAIL_PATTERN.test(email.trim()) ? "Escribe un correo válido." : "";
  const termsError = submitted && !acceptTerms ? "Debes autorizar el cargo para continuar." : "";
  const showFieldError = (type: MpFieldType) => (blurred[type] || submitted) && fieldErrors[type];
  const brand = brandLabel(method);
  const cardType = cardTypeLabel(method);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setPaymentError("");

    if (!ready || !holder.trim() || !EMAIL_PATTERN.test(email.trim()) || !acceptTerms) return;
    if (!method) {
      setPaymentError("Escribe un número de tarjeta válido.");
      return;
    }

    setSubmitting(true);
    try {
      const mp = await getMercadoPago();
      let token: string;
      try {
        token = (await mp.fields.createCardToken({ cardholderName: holder.trim() })).id;
      } catch {
        throw new Error("Revisa los datos de la tarjeta: número, vencimiento y CVV.");
      }

      const response = await fetch("/api/pagos/mercadopago/tarjeta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: draft.items.map(({ id, cantidad }) => ({ id, cantidad })),
          shipping,
          card: {
            token,
            paymentMethodId: method.id,
            paymentTypeId: method.payment_type_id,
            installments: method.payment_type_id === "credit_card" ? installments : 1,
            email: email.trim(),
          },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        orderId?: string;
        status?: "approved" | "pending" | "rejected";
        paymentId?: string | null;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.orderId || !data.status) {
        throw new Error(data.error || "No pudimos procesar el pago. Intenta de nuevo.");
      }
      if (data.status === "rejected") {
        throw new Error(data.message || "Tu banco rechazó el pago. Intenta con otra tarjeta.");
      }

      onPaid({ orderId: data.orderId, status: data.status, paymentId: data.paymentId ?? null });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "No pudimos procesar el pago.");
      setSubmitting(false);
    }
  }

  const binPreview = (bin ?? "").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();

  return (
    <form className="qf-card" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      {/* Solo para copiar el estilo de .qf-input a los campos seguros */}
      <input ref={styleRef} className="qf-input" aria-hidden="true" tabIndex={-1} readOnly
        placeholder="x" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none", width: 0 }} />

      <div className="vt-card-preview" aria-hidden="true">
        <div className="vt-card-top">
          <span className="vt-chip" />
          <span className="vt-card-brand">{brand || "MARIN PAY"}</span>
        </div>
        <p className="vt-card-number">{binPreview}</p>
        <div className="vt-card-bottom">
          <div>
            <span>Titular</span>
            <p>{holder || "NOMBRE APELLIDO"}</p>
          </div>
          <div>
            <span>Tipo</span>
            <p>{cardType || "—"}</p>
          </div>
        </div>
      </div>

      {loadError ? <div className="vt-alert" role="alert">{loadError}</div> : null}

      <fieldset className="qf-group vt-fieldset" disabled={submitting}>
        <legend className="qf-group-label">03 / Datos de la tarjeta</legend>

        <div className="qf-stack">
          <div>
            <label htmlFor="cp-holder" className="qf-label">Nombre del titular</label>
            <input
              id="cp-holder"
              className="qf-input"
              autoComplete="cc-name"
              placeholder="Como aparece en la tarjeta"
              maxLength={60}
              value={holder}
              aria-invalid={holderError ? true : undefined}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
            />
            {holderError ? <p className="vt-error">{holderError}</p> : null}
          </div>

          <div>
            <span className="qf-label">Número de tarjeta</span>
            <div
              id={FIELD_IDS.cardNumber}
              className="qf-input vt-secure-field vt-secure-field--with-brand"
              data-focused={focused === "cardNumber"}
              data-invalid={showFieldError("cardNumber") ? true : undefined}
              data-loading={!ready}
            >
              {method ? (
                <span className="vt-brand-badge">
                  {method.secure_thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={method.secure_thumbnail} alt="" />
                  ) : null}
                  <span>{brand}</span>
                </span>
              ) : null}
            </div>
            {showFieldError("cardNumber") ? <p className="vt-error">{FIELD_ERRORS.cardNumber}</p> : null}
            {method ? (
              <p className="vt-card-type" aria-live="polite">
                Tarjeta {brand}{cardType ? ` de ${cardType.toLowerCase()}` : ""}
                {method.issuer?.name && method.issuer.name !== brand ? ` · ${method.issuer.name}` : ""}
              </p>
            ) : null}
          </div>

          <div className="qf-row">
            <div>
              <span className="qf-label">Vencimiento (MM/AA)</span>
              <div
                id={FIELD_IDS.expirationDate}
                className="qf-input vt-secure-field"
                data-focused={focused === "expirationDate"}
                data-invalid={showFieldError("expirationDate") ? true : undefined}
                data-loading={!ready}
              />
              {showFieldError("expirationDate") ? <p className="vt-error">{FIELD_ERRORS.expirationDate}</p> : null}
            </div>
            <div>
              <span className="qf-label">Código de seguridad (CVV)</span>
              <div
                id={FIELD_IDS.securityCode}
                className="qf-input vt-secure-field"
                data-focused={focused === "securityCode"}
                data-invalid={showFieldError("securityCode") ? true : undefined}
                data-loading={!ready}
              />
              {showFieldError("securityCode") ? <p className="vt-error">{FIELD_ERRORS.securityCode}</p> : null}
            </div>
          </div>

          {method?.payment_type_id === "credit_card" && payerCosts.length > 1 ? (
            <div>
              <label htmlFor="cp-installments" className="qf-label">Forma de pago</label>
              <select
                id="cp-installments"
                className="qf-input"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
              >
                {payerCosts.map((cost) => (
                  <option key={cost.installments} value={cost.installments}>
                    {cost.installments === 1 ? `Pago de contado · ${formatMXN(cost.total_amount)}` : cost.recommended_message}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="qf-group vt-fieldset" disabled={submitting}>
        <legend className="qf-group-label">04 / Contacto para el comprobante</legend>
        <div>
          <label htmlFor="cp-email" className="qf-label">Correo electrónico</label>
          <input
            id="cp-email"
            className="qf-input"
            type="email"
            autoComplete="email"
            placeholder="correo@empresa.com"
            maxLength={254}
            value={email}
            aria-invalid={emailError ? true : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailError ? <p className="vt-error">{emailError}</p> : null}
        </div>
      </fieldset>

      <div>
        <label className="vt-check">
          <input
            type="checkbox"
            checked={acceptTerms}
            aria-invalid={termsError ? true : undefined}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={submitting}
          />
          <span>
            Autorizo el cargo de <strong>{formatMXN(total)}</strong> y acepto los términos y el aviso de
            privacidad de Marin Industries.
          </span>
        </label>
        {termsError ? <p className="vt-error">{termsError}</p> : null}
      </div>

      {paymentError ? <div className="vt-alert" role="alert">{paymentError}</div> : null}

      <div className="vt-pay-actions">
        <Link href="/tienda/pago" className="btn btn-ghost">
          <span aria-hidden="true">←</span> Cambiar método
        </Link>
        <button type="submit" className="btn btn-primary qf-submit" disabled={submitting || !ready}>
          {submitting ? (
            <>
              <span className="vt-spinner" aria-hidden="true" /> Procesando pago…
            </>
          ) : (
            <>
              Pagar {formatMXN(total)} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>

      <p className="vt-hint">
        Pago procesado de forma segura por Mercado Pago. Marin Industries no ve ni guarda el número de
        tu tarjeta ni el CVV.
      </p>

      {IS_TEST ? (
        <p className="vt-hint vt-test">
          <strong>Modo prueba.</strong> Mastercard <code>5474 9254 3267 0366</code> · Visa{" "}
          <code>4075 5957 1648 3764</code> · CVV <code>123</code> · vence <code>11/30</code>. Titular{" "}
          <code>APRO</code> = aprobado, <code>OTHE</code> = rechazado, <code>CONT</code> = pendiente.
        </p>
      ) : null}
    </form>
  );
}
