"use client";

import { FormEvent, useState } from "react";
import { createWhatsappContactLink } from "@/src/application/contact/use-cases/create-whatsapp-contact-link.use-case";

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
      setStatus(result.error);
      setStatusType("error");
      return;
    }

    window.open(result.value, "_blank", "noopener,noreferrer");
    setStatus("Gracias. Tu solicitud fue preparada para enviarse a nuestro equipo.");
    setStatusType("default");
    form.reset();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="nombre">
          Nombre completo
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Tu nombre"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="telefono">
          Telefono o WhatsApp
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Ej. 662 123 4567"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="negocio">
          Nombre de la empresa o negocio
        </label>
        <input
          id="negocio"
          name="negocio"
          type="text"
          placeholder="Nombre de tu negocio"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="servicio">
          Servicio de interes
        </label>
        <select
          id="servicio"
          name="servicio"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        >
          <option value="" disabled>
            Selecciona una opcion
          </option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="problema">
          Problema a resolver
        </label>
        <select
          id="problema"
          name="problema"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        >
          <option value="" disabled>
            Selecciona una opcion
          </option>
          {problems.map((problem) => (
            <option key={problem} value={problem}>
              {problem}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="mensaje">
          Descripcion breve
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="Cuentanos que necesita tu negocio"
          required
          className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandAccent"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brandAccent px-6 py-3 font-bold text-brandDark transition hover:bg-brandAccentHover"
      >
        Enviar solicitud
      </button>

      <div
        className={`text-sm ${statusType === "error" ? "text-red-600" : "text-slate-600"}`}
        aria-live="polite"
      >
        {status}
      </div>

      <p className="text-xs text-slate-500">
        Tu mensaje se enviara por WhatsApp para iniciar la conversacion.
      </p>
    </form>
  );
}
