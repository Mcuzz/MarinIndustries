"use client";

import { FormEvent, useState } from "react";
import { createWhatsappContactLink } from "@/src/application/contact/use-cases/create-whatsapp-contact-link.use-case";
import { useLanguage } from "../../i18n/LanguageProvider";

const services = [
  "Proyectos de ingenieria",
  "Sistema de gestion",
  "Aplicacion movil",
  "Sitio web",
  "Automatizacion",
  "Servicios tecnicos",
  "Otro"
];

const problems = [
  "Administrativos",
  "Produccion",
  "Control",
  "Ventas e inventario",
  "Presencia digital",
  "Otro"
];

export function ContactForm() {
  const { translations } = useLanguage();
  const t = translations.home.contact.form;
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"default" | "error">("default");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const result = createWhatsappContactLink({
      nombre: String(data.get("nombre") || ""),
      telefono: String(data.get("telefono") || ""),
      negocio: String(data.get("negocio") || ""),
      servicio: String(data.get("servicio") || ""),
      problema: String(data.get("problema") || ""),
      mensaje: String(data.get("mensaje") || "")
    });

    if (!result.ok) {
      setStatus(translations.home.contact.form.validationError);
      setStatusType("error");
      return;
    }

    window.open(result.value, "_blank", "noopener,noreferrer");
    setStatus(t.success);
    setStatusType("default");
    form.reset();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="nombre">
          {t.fullName}
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder={t.fullNamePlaceholder}
          required
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="telefono">
          {t.phone}
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t.phonePlaceholder}
          required
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="negocio">
          {t.businessName}
        </label>
        <input
          id="negocio"
          name="negocio"
          type="text"
          placeholder={t.businessNamePlaceholder}
          required
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="servicio">
          {t.service}
        </label>
        <select
          id="servicio"
          name="servicio"
          required
          defaultValue=""
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        >
          <option value="" disabled>
            {t.selectOption}
          </option>
          {services.map((service) => (
            <option key={service} value={service}>
              {t.services[service as keyof typeof t.services]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="problema">
          {t.problem}
        </label>
        <select
          id="problema"
          name="problema"
          required
          defaultValue=""
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        >
          <option value="" disabled>
            {t.selectOption}
          </option>
          {problems.map((problem) => (
            <option key={problem} value={problem}>
              {t.problems[problem as keyof typeof t.problems]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="mensaje">
          {t.description}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder={t.descriptionPlaceholder}
          required
          className="w-full rounded-xl border border-brandLine px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brandAccent px-6 py-3 font-bold text-brandDark transition hover:bg-brandAccentHover"
      >
        {t.submit}
      </button>

      <div
        className={`text-sm ${statusType === "error" ? "text-danger" : "text-brandText"}`}
        aria-live="polite"
      >
        {status}
      </div>

      <p className="text-xs text-brandMuted">
        {t.note}
      </p>
    </form>
  );
}