import { cookies } from "next/headers";
import { authCookie, verifySession } from "@/lib/auth";

export async function requireAdmin() {
  const token = (await cookies()).get(authCookie.name)?.value || "";
  const sess = token ? verifySession(token) : null;
  if (!sess) return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  console.log(sess);
  if (sess.role !== "ADMIN") return { ok: false as const, status: 403 as const, error: "Forbidden" };
  return { ok: true as const, session: sess };
}
