import { fail, ok, type Result } from "../shared/result";

export type ContactPhone = {
  value: string;
  digits: string;
};

export function createContactPhone(value: string): Result<ContactPhone> {
  const trimmed = value.trim();
  const phoneFormatPattern = /^\+?[0-9\s().-]+$/;
  const digits = trimmed.replace(/\D/g, "");

  if (!trimmed) {
    return fail("El telefono o WhatsApp es obligatorio.");
  }

  if (!phoneFormatPattern.test(trimmed) || digits.length < 7 || digits.length > 15) {
    return fail("Ingresa un telefono o WhatsApp valido.");
  }

  return ok({ value: trimmed, digits });
}
