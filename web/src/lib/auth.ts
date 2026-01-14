import { generateId } from "./utils";
import { User, UserRole } from "./types";

const USERS_KEY = "form_builder_users";
const SESSION_KEY = "form_builder_session";

export type AuthResult = {
  user: User;
  token: string;
};

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResult> {
  await delay();
  const users = readUsers();
  if (users[email]) {
    throw new Error("User already exists");
  }
  const user: User = { id: generateId("user"), name, email, role };
  users[email] = { ...user, password };
  writeUsers(users);
  const token = fakeJwt(user);
  setSession(token, user);
  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  await delay();
  const users = readUsers();
  const record = users[email];
  if (!record || record.password !== password) {
    throw new Error("Invalid credentials");
  }
  const user: User = { id: record.id, name: record.name, email, role: record.role };
  const token = fakeJwt(user);
  setSession(token, user);
  return { user, token };
}

export function getSession(): AuthResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthResult;
    return parsed;
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

function fakeJwt(user: User) {
  // For demo only; replace with real JWT from API.
  return btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role, ts: Date.now() }));
}

function readUsers(): Record<string, User & { password: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, User & { password: string }>) : {};
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, User & { password: string }>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
