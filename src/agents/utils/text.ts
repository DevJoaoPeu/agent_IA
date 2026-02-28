export const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const includesAny = (message: string, keywords: readonly string[]): boolean =>
  keywords.some((keyword) => message.includes(keyword));

export const normalizeDoctorName = (name: string): string =>
  normalizeText(name)
    .replace(/\b(dr|dra|doutor|doutora)\.?\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
