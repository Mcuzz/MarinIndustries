export type CardBrand = "visa" | "mastercard" | "amex" | "unknown";
export type CardType = "debito" | "credito";

export type CardPaymentForm = {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  cardType: CardType | "";
  installments: string;
  email: string;
  phone: string;
  street: string;
  neighborhood: string;
  zip: string;
  city: string;
  state: string;
  acceptTerms: boolean;
};

export type CardPaymentField = keyof CardPaymentForm;
export type CardPaymentErrors = Partial<Record<CardPaymentField, string>>;

export const INSTALLMENT_OPTIONS = [
  { value: "1", label: "Pago de contado" },
  { value: "3", label: "3 meses sin intereses" },
  { value: "6", label: "6 meses sin intereses" },
  { value: "12", label: "12 meses sin intereses" },
] as const;

/** Monto mínimo para diferir a meses sin intereses (regla del mock). */
export const MIN_AMOUNT_FOR_INSTALLMENTS = 1500;

export const MX_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
] as const;

export const emptyCardPaymentForm: CardPaymentForm = {
  holder: "",
  number: "",
  expiry: "",
  cvv: "",
  cardType: "",
  installments: "1",
  email: "",
  phone: "",
  street: "",
  neighborhood: "",
  zip: "",
  city: "",
  state: "",
  acceptTerms: false,
};

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function detectCardBrand(value: string): CardBrand {
  const d = onlyDigits(value);
  if (/^4/.test(d)) return "visa";
  if (/^3[47]/.test(d)) return "amex";
  if (/^5[1-5]/.test(d) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(d)) return "mastercard";
  return "unknown";
}

export const cardBrandLabel: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  unknown: "Tarjeta",
};

export const cardNumberLength = (brand: CardBrand) => (brand === "amex" ? 15 : 16);
export const cvvLength = (brand: CardBrand) => (brand === "amex" ? 4 : 3);

export function luhnCheck(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Agrupa como 4-4-4-4 (o 4-6-5 para American Express). */
export function formatCardNumber(value: string): string {
  const brand = detectCardBrand(value);
  const d = onlyDigits(value).slice(0, cardNumberLength(brand));
  if (brand === "amex") {
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(" ");
  }
  return d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string): string {
  const d = onlyDigits(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationContext = {
  now?: Date;
  total?: number;
};

export function validateCardField(
  field: CardPaymentField,
  form: CardPaymentForm,
  ctx: ValidationContext = {},
): string | undefined {
  const now = ctx.now ?? new Date();

  switch (field) {
    case "holder": {
      const v = form.holder.trim().replace(/\s+/g, " ");
      if (!v) return "Escribe el nombre como aparece en la tarjeta.";
      if (!NAME_RE.test(v)) return "El nombre solo puede contener letras y espacios.";
      if (v.length < 5 || v.split(" ").length < 2) return "Incluye nombre y apellido.";
      if (v.length > 60) return "Máximo 60 caracteres.";
      return;
    }
    case "number": {
      const d = onlyDigits(form.number);
      const brand = detectCardBrand(d);
      if (!d) return "Ingresa el número de la tarjeta.";
      if (brand === "unknown") return "Solo se aceptan Visa, Mastercard o American Express.";
      if (d.length !== cardNumberLength(brand))
        return `El número debe tener ${cardNumberLength(brand)} dígitos.`;
      if (!luhnCheck(d)) return "El número de tarjeta no es válido.";
      return;
    }
    case "expiry": {
      const v = form.expiry.trim();
      if (!v) return "Ingresa la fecha de vencimiento.";
      const m = /^(\d{2})\/(\d{2})$/.exec(v);
      if (!m) return "Usa el formato MM/AA.";
      const month = Number(m[1]);
      const year = 2000 + Number(m[2]);
      if (month < 1 || month > 12) return "El mes debe estar entre 01 y 12.";
      // La tarjeta es válida hasta el último día del mes indicado.
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      if (endOfMonth < now) return "La tarjeta está vencida.";
      if (year > now.getFullYear() + 20) return "La fecha de vencimiento no es válida.";
      return;
    }
    case "cvv": {
      const brand = detectCardBrand(form.number);
      const len = cvvLength(brand);
      if (!form.cvv) return "Ingresa el código de seguridad.";
      if (!/^\d+$/.test(form.cvv)) return "El código solo lleva números.";
      if (form.cvv.length !== len)
        return brand === "amex"
          ? "American Express usa un código de 4 dígitos (frente de la tarjeta)."
          : "El código debe tener 3 dígitos (reverso de la tarjeta).";
      return;
    }
    case "cardType":
      if (!form.cardType) return "Indica si la tarjeta es de débito o crédito.";
      return;
    case "installments": {
      if (form.cardType !== "credito") return;
      if (!INSTALLMENT_OPTIONS.some((o) => o.value === form.installments))
        return "Selecciona una forma de pago.";
      if (
        form.installments !== "1" &&
        ctx.total !== undefined &&
        ctx.total < MIN_AMOUNT_FOR_INSTALLMENTS
      )
        return "Los meses sin intereses aplican en compras desde $1,500.00 MXN.";
      return;
    }
    case "email": {
      const v = form.email.trim();
      if (!v) return "Ingresa un correo para enviar el comprobante.";
      if (!EMAIL_RE.test(v)) return "El correo no tiene un formato válido.";
      return;
    }
    case "phone": {
      const d = onlyDigits(form.phone);
      if (!d) return "Ingresa un teléfono de contacto.";
      if (d.length !== 10) return "El teléfono debe tener 10 dígitos.";
      return;
    }
    case "street":
      if (form.street.trim().length < 5) return "Escribe calle y número.";
      return;
    case "neighborhood":
      if (form.neighborhood.trim().length < 3) return "Escribe la colonia.";
      return;
    case "zip":
      if (!form.zip) return "Ingresa el código postal.";
      if (!/^\d{5}$/.test(form.zip)) return "El código postal debe tener 5 dígitos.";
      return;
    case "city":
      if (form.city.trim().length < 3) return "Escribe la ciudad o municipio.";
      return;
    case "state":
      if (!form.state) return "Selecciona el estado.";
      return;
    case "acceptTerms":
      if (!form.acceptTerms) return "Debes aceptar los términos para continuar.";
      return;
  }
}

export const CARD_FIELDS_ORDER: CardPaymentField[] = [
  "holder", "number", "expiry", "cvv", "cardType", "installments",
  "email", "phone", "street", "neighborhood", "zip", "city", "state", "acceptTerms",
];

export function validateCardPayment(
  form: CardPaymentForm,
  ctx: ValidationContext = {},
): CardPaymentErrors {
  const errors: CardPaymentErrors = {};
  for (const field of CARD_FIELDS_ORDER) {
    const message = validateCardField(field, form, ctx);
    if (message) errors[field] = message;
  }
  return errors;
}
