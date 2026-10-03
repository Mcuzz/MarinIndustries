"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  CARD_FIELDS_ORDER,
  INSTALLMENT_OPTIONS,
  MIN_AMOUNT_FOR_INSTALLMENTS,
  MX_STATES,
  cardBrandLabel,
  cvvLength,
  detectCardBrand,
  emptyCardPaymentForm,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
  validateCardField,
  validateCardPayment,
  type CardPaymentErrors,
  type CardPaymentField,
  type CardPaymentForm,
} from "@/src/domain/payments/card-payment";
import { formatMXN, type SaleDraft } from "@/src/domain/sales/sale.entity";
import {
  TEST_CARD_APPROVED,
  TEST_CARD_DECLINED,
  processMockCardPayment,
  type CardPaymentReceipt,
} from "@/src/infrastructure/payments/mock-card-payment.gateway";
import {
  clearSaleDraft,
  saveCompletedOrder,
} from "@/src/infrastructure/sales/sale-session.storage";
import { ModuleHero } from "../components/ModuleHero";
import { PageShell } from "../components/layout/PageShell";
import {
  CheckoutSteps,
  LoadingBlock,
  NoSaleInProgress,
  SaleSummary,
  useSaleDraft,
} from "../components/sales/CheckoutParts";

const fieldId = (f: CardPaymentField) => `cp-${f}`;

export function CardPaymentPage() {
  const { loaded, draft } = useSaleDraft();
  const [receipt, setReceipt] = useState<{ draft: SaleDraft; data: CardPaymentReceipt } | null>(null);

  return (
    <PageShell>
      <main>
        <ModuleHero
          eyebrow="Ventas · Cobro con tarjeta"
          title={receipt ? "Pago aprobado" : "Datos de la tarjeta"}
          description={
            receipt
              ? "La venta quedó registrada como completada."
              : "Captura los datos del titular y de facturación. Formulario de demostración: no se realiza ningún cargo real."
          }
        >
          <CheckoutSteps current={2} />
        </ModuleHero>

        <section data-tone="alt" className="vt-section">
          <div className="section-shell qt-grid">
            {receipt ? (
              <PaymentSuccess draft={receipt.draft} receipt={receipt.data} />
            ) : !loaded ? (
              <LoadingBlock />
            ) : !draft ? (
              <NoSaleInProgress />
            ) : (
              <>
                <CardForm
                  draft={draft}
                  onPaid={(data) => {
                    saveCompletedOrder({
                      id: draft.folio,
                      clientName: draft.client.name,
                      rfc: draft.client.rfc,
                      kind: draft.item.type === "producto" ? "Producto" : "Servicio",
                      total: draft.total,
                      status: "Completado",
                      paymentMethod: `${cardBrandLabel[data.brand]} •••• ${data.last4}`,
                    });
                    clearSaleDraft();
                    setReceipt({ draft, data });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
                <SaleSummary draft={draft} />
              </>
            )}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function CardForm({
  draft,
  onPaid,
}: {
  draft: SaleDraft;
  onPaid: (receipt: CardPaymentReceipt) => void;
}) {
  const [form, setForm] = useState<CardPaymentForm>(emptyCardPaymentForm);
  const [errors, setErrors] = useState<CardPaymentErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CardPaymentField, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [gatewayError, setGatewayError] = useState("");

  const ctx = { total: draft.total };
  const brand = detectCardBrand(form.number);
  const installmentsAllowed = draft.total >= MIN_AMOUNT_FOR_INSTALLMENTS;

  function update<K extends CardPaymentField>(field: K, value: CardPaymentForm[K]) {
    const next = { ...form, [field]: value };
    // Si cambia a débito, se regresa a pago de contado.
    if (field === "cardType" && value === "debito") next.installments = "1";
    setForm(next);
    setGatewayError("");

    // Revalida en vivo solo los campos que el usuario ya tocó.
    setErrors((prev) => {
      const out = { ...prev };
      const related: CardPaymentField[] =
        field === "number" ? ["number", "cvv"] : field === "cardType" ? ["cardType", "installments"] : [field];
      for (const f of related) {
        if (touched[f] || f === field && prev[f]) out[f] = validateCardField(f, next, ctx);
      }
      return out;
    });
  }

  function blur(field: CardPaymentField) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateCardField(field, form, ctx) }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCardPayment(form, ctx);
    setErrors(found);
    setTouched(Object.fromEntries(CARD_FIELDS_ORDER.map((f) => [f, true])));

    const first = CARD_FIELDS_ORDER.find((f) => found[f]);
    if (first) {
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    setSubmitting(true);
    setGatewayError("");
    const result = await processMockCardPayment(draft, form);
    setSubmitting(false);

    if (!result.ok) {
      setGatewayError(result.error);
      return;
    }
    onPaid(result.value);
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  // Props comunes de accesibilidad / validación para cada control.
  const a11y = (f: CardPaymentField) => ({
    id: fieldId(f),
    name: f,
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${fieldId(f)}-error` : undefined,
    onBlur: () => blur(f),
  });

  return (
    <form className="qf-card" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <CardPreview form={form} />

      {errorCount > 0 && Object.keys(touched).length === CARD_FIELDS_ORDER.length ? (
        <div className="vt-alert" role="alert">
          Revisa {errorCount === 1 ? "1 campo marcado" : `${errorCount} campos marcados`} antes de pagar.
        </div>
      ) : null}

      {/* 01 Tarjeta */}
      <fieldset className="qf-group vt-fieldset" disabled={submitting}>
        <legend className="qf-group-label">01 / Datos de la tarjeta</legend>

        <div className="qf-stack">
          <Field label="Nombre del titular" field="holder" error={errors.holder}>
            <input
              {...a11y("holder")}
              className="qf-input"
              autoComplete="cc-name"
              placeholder="Como aparece en la tarjeta"
              maxLength={60}
              value={form.holder}
              onChange={(e) => update("holder", e.target.value.toUpperCase())}
            />
          </Field>

          <Field label="Número de tarjeta" field="number" error={errors.number}>
            <div className="vt-input-icon">
              <input
                {...a11y("number")}
                className="qf-input font-mono"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={form.number}
                onChange={(e) => update("number", formatCardNumber(e.target.value))}
              />
              <span className="vt-brand" data-brand={brand}>
                {brand === "unknown" ? "" : cardBrandLabel[brand]}
              </span>
            </div>
          </Field>

          <div className="qf-row">
            <Field label="Vencimiento (MM/AA)" field="expiry" error={errors.expiry}>
              <input
                {...a11y("expiry")}
                className="qf-input font-mono"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                maxLength={5}
                value={form.expiry}
                onChange={(e) => update("expiry", formatExpiry(e.target.value))}
              />
            </Field>

            <Field label={`Código de seguridad (CVV)`} field="cvv" error={errors.cvv}>
              <input
                {...a11y("cvv")}
                className="qf-input font-mono"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={brand === "amex" ? "4 dígitos" : "3 dígitos"}
                maxLength={cvvLength(brand)}
                value={form.cvv}
                onChange={(e) => update("cvv", onlyDigits(e.target.value).slice(0, cvvLength(brand)))}
              />
            </Field>
          </div>

          <div>
            <span className="qf-label" id="cp-cardType-label">Tipo de tarjeta</span>
            <div
              className="vt-toggle"
              role="radiogroup"
              aria-labelledby="cp-cardType-label"
              aria-describedby={errors.cardType ? "cp-cardType-error" : undefined}
            >
              {(
                [
                  ["debito", "Débito"],
                  ["credito", "Crédito"],
                ] as const
              ).map(([value, label], i) => (
                <button
                  key={value}
                  id={i === 0 ? fieldId("cardType") : undefined}
                  type="button"
                  role="radio"
                  aria-checked={form.cardType === value}
                  data-active={form.cardType === value}
                  data-invalid={!!errors.cardType}
                  onClick={() => {
                    update("cardType", value);
                    setTouched((t) => ({ ...t, cardType: true }));
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <FieldError id="cp-cardType-error" message={errors.cardType} />
          </div>

          {form.cardType === "credito" ? (
            <Field label="Forma de pago" field="installments" error={errors.installments}>
              <select
                {...a11y("installments")}
                className="qf-input"
                value={form.installments}
                onChange={(e) => update("installments", e.target.value)}
              >
                {INSTALLMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} disabled={o.value !== "1" && !installmentsAllowed}>
                    {o.label}
                    {o.value !== "1"
                      ? ` · ${formatMXN(Math.round((draft.total / Number(o.value)) * 100) / 100)} al mes`
                      : ""}
                  </option>
                ))}
              </select>
              {!installmentsAllowed ? (
                <p className="vt-hint">Meses sin intereses disponibles en compras desde {formatMXN(MIN_AMOUNT_FOR_INSTALLMENTS)}.</p>
              ) : null}
            </Field>
          ) : null}
        </div>
      </fieldset>

      {/* 02 Contacto */}
      <fieldset className="qf-group vt-fieldset" disabled={submitting}>
        <legend className="qf-group-label">02 / Contacto para el comprobante</legend>
        <div className="qf-row">
          <Field label="Correo electrónico" field="email" error={errors.email}>
            <input
              {...a11y("email")}
              className="qf-input"
              type="email"
              autoComplete="email"
              placeholder="correo@empresa.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value.trim())}
            />
          </Field>
          <Field label="Teléfono (10 dígitos)" field="phone" error={errors.phone}>
            <input
              {...a11y("phone")}
              className="qf-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="662 123 4567"
              value={form.phone}
              onChange={(e) => {
                const d = onlyDigits(e.target.value).slice(0, 10);
                update("phone", d.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")));
              }}
            />
          </Field>
        </div>
      </fieldset>

      {/* 03 Facturación */}
      <fieldset className="qf-group vt-fieldset" disabled={submitting}>
        <legend className="qf-group-label">03 / Dirección de facturación</legend>
        <div className="qf-stack">
          <Field label="Calle y número" field="street" error={errors.street}>
            <input
              {...a11y("street")}
              className="qf-input"
              autoComplete="address-line1"
              placeholder="Blvd. Kino 1234, Int. 5"
              value={form.street}
              onChange={(e) => update("street", e.target.value)}
            />
          </Field>
          <div className="qf-row">
            <Field label="Colonia" field="neighborhood" error={errors.neighborhood}>
              <input
                {...a11y("neighborhood")}
                className="qf-input"
                autoComplete="address-line2"
                placeholder="Colonia"
                value={form.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
              />
            </Field>
            <Field label="Código postal" field="zip" error={errors.zip}>
              <input
                {...a11y("zip")}
                className="qf-input font-mono"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="83000"
                maxLength={5}
                value={form.zip}
                onChange={(e) => update("zip", onlyDigits(e.target.value).slice(0, 5))}
              />
            </Field>
            <Field label="Ciudad / municipio" field="city" error={errors.city}>
              <input
                {...a11y("city")}
                className="qf-input"
                autoComplete="address-level2"
                placeholder="Hermosillo"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </Field>
            <Field label="Estado" field="state" error={errors.state}>
              <select
                {...a11y("state")}
                className="qf-input"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
              >
                <option value="">Selecciona un estado</option>
                {MX_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </fieldset>

      <div>
        <label className="vt-check">
          <input
            type="checkbox"
            id={fieldId("acceptTerms")}
            checked={form.acceptTerms}
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-describedby={errors.acceptTerms ? "cp-acceptTerms-error" : undefined}
            onChange={(e) => {
              update("acceptTerms", e.target.checked);
              setTouched((t) => ({ ...t, acceptTerms: true }));
            }}
            disabled={submitting}
          />
          <span>
            Autorizo el cargo de <strong>{formatMXN(draft.total)}</strong> y acepto los términos y
            el aviso de privacidad de Marin Industries.
          </span>
        </label>
        <FieldError id="cp-acceptTerms-error" message={errors.acceptTerms} />
      </div>

      {gatewayError ? (
        <div className="vt-alert" role="alert">{gatewayError}</div>
      ) : null}

      <div className="vt-pay-actions">
        <Link href="/ventas/pago" className="btn btn-ghost">
          <span aria-hidden="true">←</span> Cambiar método
        </Link>
        <button type="submit" className="btn btn-primary qf-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="vt-spinner" aria-hidden="true" /> Procesando pago…
            </>
          ) : (
            <>
              Pagar {formatMXN(draft.total)} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>

      <p className="vt-hint vt-test">
        <strong>Modo demostración.</strong> Tarjeta aprobada: <code>{TEST_CARD_APPROVED}</code> · rechazada:{" "}
        <code>{TEST_CARD_DECLINED}</code> · cualquier fecha futura y CVV de 3 dígitos.
      </p>
    </form>
  );
}

function CardPreview({ form }: { form: CardPaymentForm }) {
  const brand = detectCardBrand(form.number);
  const placeholder = brand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••";
  const shown = form.number
    ? form.number + placeholder.slice(form.number.length)
    : placeholder;

  return (
    <div className="vt-card-preview" aria-hidden="true">
      <div className="vt-card-top">
        <span className="vt-chip" />
        <span className="vt-card-brand">{brand === "unknown" ? "MARIN PAY" : cardBrandLabel[brand]}</span>
      </div>
      <p className="vt-card-number">{shown}</p>
      <div className="vt-card-bottom">
        <div>
          <span>Titular</span>
          <p>{form.holder || "NOMBRE APELLIDO"}</p>
        </div>
        <div>
          <span>Vence</span>
          <p>{form.expiry || "MM/AA"}</p>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccess({ draft, receipt }: { draft: SaleDraft; receipt: CardPaymentReceipt }) {
  return (
    <>
      <div className="qf-card vt-success">
        <span className="vt-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <span className="eyebrow">Pago simulado aprobado</span>
          <h2 className="qa-title">Venta #{draft.folio} completada</h2>
          <p className="qa-text">
            Se cobró {formatMXN(draft.total)} a {cardBrandLabel[receipt.brand]} terminación {receipt.last4}.
            El comprobante se enviaría al correo capturado.
          </p>
        </div>
        <dl className="vt-summary-meta">
          <div><dt>Autorización</dt><dd className="font-mono">{receipt.authorization}</dd></div>
          <div><dt>Fecha</dt><dd>{new Date(receipt.paidAt).toLocaleString("es-MX")}</dd></div>
          <div><dt>Cliente</dt><dd>{draft.client.name}</dd></div>
        </dl>
        <div className="vt-pay-actions">
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            Imprimir comprobante
          </button>
          <Link href="/ventas" className="btn btn-primary">
            Volver a ventas <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <SaleSummary draft={draft} />
    </>
  );
}

function Field({
  label,
  field,
  error,
  children,
}: {
  label: string;
  field: CardPaymentField;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={fieldId(field)} className="qf-label">{label}</label>
      {children}
      <FieldError id={`${fieldId(field)}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="vt-error">
      {message}
    </p>
  );
}
