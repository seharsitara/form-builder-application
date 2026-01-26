import { User, UserRole } from "./types";

const SESSION_KEY = "form_builder_session";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export type AuthResult = {
  user: User;
  token: string;
};

type AuthResponse = {
  user: User;
  accessToken: string;
};

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = "admin"
): Promise<AuthResult> {
  const data = await postAuth("/auth/register", { name, email, password, role });
  const session: AuthResult = { user: data.user, token: data.accessToken };
  setSession(session.token, session.user);
  return session;
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const data = await postAuth("/auth/login", { email, password });
  const session: AuthResult = { user: data.user, token: data.accessToken };
  setSession(session.token, session.user);
  return session;
}

export function getSession(): AuthResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResult;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  const payload: AuthResult = { token, user };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await extractError(res);
    throw new Error(message || "Authentication failed");
  }

  return res.json();
}

async function extractError(res: Response) {
  try {
    const data = await res.json();
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
  } catch {
    // ignore parse errors
  }
  return res.statusText;
}
