import type { TrainingType } from "./trainings";

export interface Profile {
  username: string;
  createdAt: string;
  entries: Record<string, TrainingType[]>;
}

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ApiError";
  }
}

async function post<T extends object>(
  body: Record<string, unknown>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network", "Nema veze sa serverom. Provjeri internet.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("server", "Server je vratio neispravan odgovor.");
  }

  const data = payload as { ok?: boolean; error?: string; message?: string };
  if (!data.ok) {
    throw new ApiError(data.error ?? "server", data.message ?? "Nešto je puklo.");
  }
  return data as unknown as T;
}

/** Postoji li ime? Zove se prije PIN koraka da znamo prijavljujemo li ili registriramo. */
export async function checkUsername(username: string): Promise<boolean> {
  const data = await post<{ exists: boolean }>({ action: "check", username });
  return data.exists === true;
}

export async function authenticate(username: string, pin: string) {
  const data = await post<{ profile: Profile; created?: boolean }>({
    action: "auth",
    username,
    pin,
  });
  return { profile: data.profile, created: data.created === true };
}

export async function markTraining(
  username: string,
  pin: string,
  date: string,
  types: TrainingType[],
): Promise<Profile> {
  const data = await post<{ profile: Profile }>({
    action: "mark",
    username,
    pin,
    date,
    types,
  });
  return data.profile;
}

/* ---------------------------------------------------------------------------
   Sesija. PIN držimo u localStorage kako ga ne bi trebao upisivati svaki put.
   Svjestan kompromis: štiti evidenciju treninga, ne bankovni račun.
--------------------------------------------------------------------------- */

const SESSION_KEY = "training-tracker:session";

export interface Session {
  username: string;
  pin: string;
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed.username !== "string" || typeof parsed.pin !== "string") {
      return null;
    }
    return { username: parsed.username, pin: parsed.pin };
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Privatni način rada blokira storage — aplikacija i dalje radi, samo se
    // pri sljedećem otvaranju ponovno prijavljuješ.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* isto kao gore */
  }
}
