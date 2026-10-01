import { validateContactRequest, type ContactRequest } from "@/src/domain/contact/contact-request.entity";
import { fail, ok, type Result } from "@/src/domain/shared/result";

const WHATSAPP_NUMBER = "526624059283";

export function createWhatsappContactLink(input: ContactRequest): Result<string> {
  const validation = validateContactRequest(input);

  if (!validation.ok) {
    return fail(validation.error);
  }

  const request = validation.value;
  const text = `Hola Marin Industries. Soy ${request.nombre}. Contacto: ${request.telefono}. Empresa: ${request.negocio}. Servicio de interes: ${request.servicio}. Problema a resolver: ${request.problema}. Detalles: ${request.mensaje}`;

  return ok(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`);
}
