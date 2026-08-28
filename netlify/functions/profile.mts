import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

/* ---------------------------------------------------------------------------
   Profil korisnika živi u Netlify Blobs, ključ je normalizirano korisničko ime.
   Autentikacija je namjerno minimalna: ime + 4-znamenkasti PIN. PIN se nikad ne
   sprema u čistom obliku — čuvamo SHA-256 hash sa salt-om po korisniku.
--------------------------------------------------------------------------- */

const TRAINING_TYPES = [
  "ruke",
  "noge",
  "leda",
  "prsa",
  "ramena",
  "core",
  "kardio",
  "fullbody",
] as const;

type TrainingType = (typeof TRAINING_TYPES)[number];

interface Profile {
  username: string;
  pinHash: string;
  pinSalt: string;
  createdAt: string;
  entries: Record<string, TrainingType[] | TrainingType>;
  failedAttempts?: number;
  lockedUntil?: number;
}

const MAX_FAILED = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

const store = () => getStore({ name: "profiles", consistency: "strong" });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function fail(error: string, message: string, status = 400) {
  return json({ ok: false, error, message }, status);
}

/** Ime bez dijakritike, mala slova — ključ mora biti stabilan i URL-safe. */
function normalizeUsername(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9._-]{3,20}$/.test(cleaned)) return null;
  return cleaned;
}

function isValidPin(raw: unknown): raw is string {
  return typeof raw === "string" && /^\d{4}$/.test(raw);
}

/** Datum mora biti YYYY-MM-DD i stvarno postojati u kalendaru. */
function isValidDate(raw: unknown): raw is string {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(`${raw}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === raw;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Usporedba u konstantnom vremenu — spriječava timing napad na PIN. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Profili spremljeni prije uvođenja višestrukog odabira imaju string umjesto
 * liste. Normaliziramo pri svakom čitanju da klijent nikad ne vidi oba oblika.
 */
function normalizeEntries(
  entries: Record<string, TrainingType[] | TrainingType>,
): Record<string, TrainingType[]> {
  const out: Record<string, TrainingType[]> = {};
  for (const [date, value] of Object.entries(entries)) {
    out[date] = Array.isArray(value) ? value : [value];
  }
  return out;
}

/** Ono što smije van — nikad hash ni salt. */
function publicProfile(p: Profile) {
  return {
    username: p.username,
    createdAt: p.createdAt,
    entries: normalizeEntries(p.entries),
  };
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return fail("method", "Samo POST.", 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("body", "Neispravan zahtjev.", 400);
  }

  const username = normalizeUsername(body.username);
  if (!username) {
    return fail(
      "username",
      "Korisničko ime: 3-20 znakova, samo slova, brojke, točka, crtica ili donja crta.",
    );
  }
  const blobsEarly = store();

  // "check" javlja postoji li ime, prije nego se PIN uopće traži. Time novi
  // korisnik dobije korak potvrde PIN-a, a tipfeler ga ne zaključa zauvijek.
  if (body.action === "check") {
    const found = await blobsEarly.get(username, { type: "json" });
    return json({ ok: true, exists: found !== null, profile: null });
  }

  if (!isValidPin(body.pin)) return fail("pin", "PIN mora imati točno 4 brojke.");

  const blobs = blobsEarly;
  const existing = (await blobs.get(username, { type: "json" })) as Profile | null;
  const now = Date.now();

  /* --- Prvi ulazak: ime je slobodno, PIN koji upišeš postaje tvoj PIN. --- */
  if (!existing) {
    if (body.action !== "auth") {
      return fail("notfound", "Profil ne postoji.", 404);
    }
    const pinSalt = crypto.randomUUID();
    const profile: Profile = {
      username,
      pinSalt,
      pinHash: await hashPin(body.pin, pinSalt),
      createdAt: new Date().toISOString().slice(0, 10),
      entries: {},
    };
    await blobs.setJSON(username, profile);
    return json({ ok: true, created: true, profile: publicProfile(profile) });
  }

  /* --- Postojeći profil: provjeri PIN, uz lockout na uzastopne promašaje. --- */
  if (existing.lockedUntil && existing.lockedUntil > now) {
    const minutes = Math.ceil((existing.lockedUntil - now) / 60000);
    return fail(
      "locked",
      `Previše pogrešnih pokušaja. Probaj za ${minutes} min.`,
      429,
    );
  }

  const attemptHash = await hashPin(body.pin, existing.pinSalt);
  if (!safeEqual(attemptHash, existing.pinHash)) {
    const failedAttempts = (existing.failedAttempts ?? 0) + 1;
    const locked = failedAttempts >= MAX_FAILED;
    await blobs.setJSON(username, {
      ...existing,
      failedAttempts: locked ? 0 : failedAttempts,
      lockedUntil: locked ? now + LOCKOUT_MS : undefined,
    });
    return fail(
      "pin",
      locked
        ? "Previše pogrešnih pokušaja. Zaključano na 5 minuta."
        : "Pogrešan PIN.",
      401,
    );
  }

  const profile: Profile = { ...existing, failedAttempts: 0, lockedUntil: undefined };

  if (body.action === "auth") {
    await blobs.setJSON(username, profile);
    return json({ ok: true, created: false, profile: publicProfile(profile) });
  }

  /* --- Označavanje treninga --- */
  if (body.action === "mark") {
    if (!isValidDate(body.date)) return fail("date", "Neispravan datum.");
    const types = body.types;
    if (!Array.isArray(types) || types.length < 1 || types.length > 2) {
      return fail("type", "Odaberi jedan ili dva tipa treninga.");
    }
    if (new Set(types).size !== types.length) {
      return fail("type", "Isti tip ne može biti odabran dvaput.");
    }
    if (!types.every((t) => TRAINING_TYPES.includes(t as TrainingType))) {
      return fail("type", "Nepoznat tip treninga.");
    }
    // Samo današnji dan — ne dopuštamo naknadno popravljanje povijesti.
    const today = new Date().toISOString().slice(0, 10);
    if (body.date !== today) {
      return fail("date", "Možeš označiti samo današnji dan.", 403);
    }
    profile.entries = { ...profile.entries, [body.date]: types as TrainingType[] };
    await blobs.setJSON(username, profile);
    return json({ ok: true, profile: publicProfile(profile) });
  }

  return fail("action", "Nepoznata akcija.");
};
