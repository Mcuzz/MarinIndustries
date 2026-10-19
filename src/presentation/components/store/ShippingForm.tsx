
"use client";

import { useState, type FormEvent } from "react";
import type { StoreShippingAddress } from "@/src/infrastructure/sales/store-shipping.storage";

type ShippingFormProps = {
  initialAddress: StoreShippingAddress;
  onSubmit: (address: StoreShippingAddress) => void;
  onBack: () => void;
};

export function ShippingForm({
  initialAddress,
  onSubmit,
  onBack,
}: ShippingFormProps) {
  const [address, setAddress] =
    useState<StoreShippingAddress>(initialAddress);

  function update<K extends keyof StoreShippingAddress>(
    field: K,
    value: StoreShippingAddress[K],
  ) {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(address);
  }

  return (
    <form className="qf-card" onSubmit={handleSubmit}>
      <span className="qf-group-label">02 / Datos de entrega</span>

      <div className="qf-stack">
        <label className="qf-field">
          <span className="qf-label">Nombre del destinatario *</span>
          <input
            className="qf-input"
            autoComplete="name"
            maxLength={100}
            required
            value={address.recipient}
            onChange={(e) => update("recipient", e.target.value)}
          />
        </label>

        <label className="qf-field">
          <span className="qf-label">Teléfono de contacto *</span>
          <input
            className="qf-input"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            title="Introduce un teléfono de 10 dígitos."
            maxLength={10}
            required
            value={address.phone}
            onChange={(e) =>
              update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="6621234567"
          />
        </label>

        <label className="qf-field">
          <span className="qf-label">Calle *</span>
          <input
            className="qf-input"
            autoComplete="address-line1"
            maxLength={120}
            required
            value={address.street}
            onChange={(e) => update("street", e.target.value)}
          />
        </label>

        <div className="qf-row">
          <label className="qf-field">
            <span className="qf-label">Número exterior *</span>
            <input
              className="qf-input"
              maxLength={15}
              required
              value={address.exteriorNumber}
              onChange={(e) => update("exteriorNumber", e.target.value)}
            />
          </label>

          <label className="qf-field">
            <span className="qf-label">Número interior</span>
            <input
              className="qf-input"
              maxLength={15}
              value={address.interiorNumber}
              onChange={(e) => update("interiorNumber", e.target.value)}
            />
          </label>
        </div>

        <label className="qf-field">
          <span className="qf-label">Colonia *</span>
          <input
            className="qf-input"
            autoComplete="address-line2"
            maxLength={100}
            required
            value={address.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
          />
        </label>

        <div className="qf-row">
          <label className="qf-field">
            <span className="qf-label">Código postal *</span>
            <input
              className="qf-input"
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
              required
              value={address.zip}
              onChange={(e) =>
                update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
            />
          </label>

          <label className="qf-field">
            <span className="qf-label">Ciudad o municipio *</span>
            <input
              className="qf-input"
              autoComplete="address-level2"
              maxLength={100}
              required
              value={address.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </label>
        </div>

        <label className="qf-field">
          <span className="qf-label">Estado *</span>
          <input
            className="qf-input"
            autoComplete="address-level1"
            maxLength={100}
            required
            value={address.state}
            onChange={(e) => update("state", e.target.value)}
          />
        </label>

        <label className="qf-field">
          <span className="qf-label">Referencias para la entrega</span>
          <textarea
            className="qf-input"
            rows={3}
            maxLength={300}
            value={address.references}
            onChange={(e) => update("references", e.target.value)}
            placeholder="Entre calles, color de fachada, indicaciones..."
          />
        </label>
      </div>

      <div className="vt-pay-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Regresar
        </button>

        <button type="submit" className="btn btn-primary">
          Continuar al pago →
        </button>
      </div>
    </form>
  );
}
