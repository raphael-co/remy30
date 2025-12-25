import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const s3 = new S3Client({
  region: "auto",
  endpoint: requireEnv("R2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

function keyFromPublicUrl(publicUrl: string): string | null {
  const base = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
  const u = publicUrl.trim();

  if (!u.startsWith(base + "/")) return null;

  const key = u.slice((base + "/").length);
  if (!key || key.includes("..")) return null;

  // un minimum de sanitation
  if (!/^[a-zA-Z0-9/_\-\.]+$/.test(key)) return null;

  return key;
}

export async function DELETE(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const url = typeof (body as any).url === "string" ? (body as any).url : "";
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const key = keyFromPublicUrl(url);
  if (!key) {
    return NextResponse.json({ error: "Invalid url (not in R2_PUBLIC_BASE_URL)" }, { status: 400 });
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: requireEnv("R2_BUCKET"),
      Key: key,
    })
  );

  return NextResponse.json({ ok: true, key });
}
