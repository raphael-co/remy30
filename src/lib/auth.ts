import crypto from "crypto";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 jours
const COOKIE_NAME = "session";
const ISSUER = "remy-site";

export type UserRole = "USER" | "ADMIN";

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("JWT_SECRET missing or too short (>= 32 chars)");
  }
  return s;
}

function b64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlJson(obj: any) {
  return b64url(Buffer.from(JSON.stringify(obj)));
}

function b64urlToBuffer(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const base64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const iter = 120_000;
  const keylen = 32;
  const digest = "sha256";
  const hash = crypto.pbkdf2Sync(password, salt, iter, keylen, digest);
  // format: pbkdf2$sha256$iter$salt$hash
  return `pbkdf2$${digest}$${iter}$${b64url(salt)}$${b64url(hash)}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 5) return false;
  const [kind, digest, iterStr, saltB64, hashB64] = parts;
  if (kind !== "pbkdf2") return false;

  const iter = Number(iterStr);
  if (!Number.isFinite(iter) || iter < 10_000) return false;

  const salt = b64urlToBuffer(saltB64);
  const expected = b64urlToBuffer(hashB64);

  const actual = crypto.pbkdf2Sync(password, salt, iter, expected.length, digest as any);
  return crypto.timingSafeEqual(expected, actual);
}

export type SessionPayload = {
  iss: string;
  sub: string; // userId
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export function signSession(userId: string, name: string, role: UserRole) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iss: ISSUER,
    sub: userId,
    name,
    role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = b64urlJson(header);
  const payloadB64 = b64urlJson(payload);

  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest();
  const sigB64 = b64url(sig);
  return `${data}.${sigB64}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;

    const data = `${h}.${p}`;
    const expected = crypto.createHmac("sha256", getSecret()).update(data).digest();
    const got = b64urlToBuffer(s);
    if (got.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(expected, got)) return null;

    const payload = JSON.parse(b64urlToBuffer(p).toString("utf8")) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== ISSUER) return null;
    if (!payload.sub) return null;
    if (payload.exp <= now) return null;
    if (payload.role !== "USER" && payload.role !== "ADMIN") return null;

    return payload;
  } catch {
    return null;
  }
}

export const authCookie = {
  name: COOKIE_NAME,
  serialize(value: string) {
    const secure = process.env.NODE_ENV === "production";
    return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_TTL_SECONDS}; ${
      secure ? "Secure; " : ""
    }`;
  },
  clear() {
    const secure = process.env.NODE_ENV === "production";
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${secure ? "Secure; " : ""}`;
  },
};
