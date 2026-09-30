const DEFAULT_INSTAGRAM = "https://www.instagram.com/33films/";
const DEFAULT_WHATSAPP_MESSAGE = "Hola 33 Films, quiero hablar de un proyecto.";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function getInstagramUrl() {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL || DEFAULT_INSTAGRAM;
}

export function getWhatsAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (explicit) return explicit;

  const number = digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "");
  const text = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);
  if (!number) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${number}?text=${text}`;
}

export const SOCIAL_LINKS = {
  instagram: getInstagramUrl(),
  whatsapp: getWhatsAppUrl(),
} as const;
