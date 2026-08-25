/**
 * GIF-ovi za ekran nakon treninga. Datoteke se samo ubace u src/assets/hype/ —
 * Vite ih pokupi globom pri buildu, bez ikakvog popisa koji treba održavati.
 * Ako je mapa prazna, aplikacija radi normalno (prikaže se samo emoji).
 */
const modules = import.meta.glob(
  "../assets/hype/*.{gif,webp,png,jpg,jpeg,mp4,webm}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

export interface HypeMedia {
  url: string;
  kind: "image" | "video";
}

const MEDIA: HypeMedia[] = Object.entries(modules).map(([path, url]) => ({
  url,
  kind: /\.(mp4|webm)$/i.test(path) ? "video" : "image",
}));

export const hasHypeMedia = MEDIA.length > 0;

export function randomHypeMedia(): HypeMedia | null {
  if (MEDIA.length === 0) return null;
  return MEDIA[Math.floor(Math.random() * MEDIA.length)];
}
