const DEFAULT_INSTAGRAM = "https://www.instagram.com/by33films/";
const DEFAULT_WHATSAPP_NUMBER = "59894664129";
const DEFAULT_WHATSAPP_MESSAGE = "Hola 33 Films, quiero hablar sobre un proyecto...";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getInstagramUrl() {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL || DEFAULT_INSTAGRAM;
}

export function getWhatsAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (explicit) return explicit;

<<<<<<< HEAD
  const number = digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "59894664129");
=======
  const number = digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER);
>>>>>>> 65c901c (Descripción de los cambios)
  const text = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);
  if (!number) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${number}?text=${text}`;
}

export const SOCIAL_LINKS = {
  instagram: getInstagramUrl(),
  whatsapp: getWhatsAppUrl(),
} as const;
