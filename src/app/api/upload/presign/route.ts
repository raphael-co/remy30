import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_BYTES = 30 * 1024 * 1024; // 30MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_FOLDERS = new Set(["hero", "gallery", "uploads", "reviews"]);

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function extFromContentType(ct: string) {
  if (ct === "image/jpeg") return "jpg";
  if (ct === "image/png") return "png";
  if (ct === "image/webp") return "webp";
  if (ct === "image/gif") return "gif";
  return "";
}

const s3 = new S3Client({
  region: "auto",
  endpoint: requireEnv("R2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

type PresignBody = {
  contentType?: unknown;
  size?: unknown;
  folder?: unknown;
};

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as PresignBody;

  const contentType = typeof b.contentType === "string" ? b.contentType : "";
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const size = typeof b.size === "number" ? b.size : Number(b.size);
  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  }
  if (size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const ext = extFromContentType(contentType);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const folderRaw = typeof b.folder === "string" ? b.folder : "uploads";
  const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "uploads";

  const key = `${folder}/${Date.now()}-${crypto.randomBytes(12).toString("hex")}.${ext}`;
  const Bucket = requireEnv("R2_BUCKET");

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const publicUrl = `${requireEnv("R2_PUBLIC_BASE_URL")}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}
