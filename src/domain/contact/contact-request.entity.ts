import { createContactPhone } from "./contact-phone";
import { fail, ok, type Result } from "../shared/result";

export type ContactRequest = {
  nombre: string;
  telefono: string;
  negocio: string;
  servicio: string;
  problema: string;
  mensaje: string;
};

export function validateContactRequest(input: ContactRequest): Result<ContactRequest> {
  const missingFields: string[] = [];

  if (!input.nombre.trim()) missingFields.push("nombre completo");
  if (!input.negocio.trim()) missingFields.push("nombre de la empresa o negocio");
  if (!input.servicio.trim()) missingFields.push("servicio de interes");
  if (!input.problema.trim()) missingFields.push("problema a resolver");
  if (!input.mensaje.trim()) missingFields.push("descripcion breve");

  const phoneResult = createContactPhone(input.telefono);
  if (!phoneResult.ok) {
    missingFields.push(input.telefono.trim() ? "un telefono o WhatsApp valido" : "telefono o WhatsApp");
  }

  if (missingFields.length > 0) {
    return fail(`Completa los siguientes campos antes de enviar: ${missingFields.join(", ")}.`);
  }

  return ok({
    nombre: input.nombre.trim(),
    telefono: input.telefono.trim(),
    negocio: input.negocio.trim(),
    servicio: input.servicio.trim(),
    problema: input.problema.trim(),
    mensaje: input.mensaje.trim()
  });
}
