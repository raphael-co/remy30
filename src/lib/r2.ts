import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: requireEnv("R2_ENDPOINT"),
  credentials: {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  },
});

export async function deleteFromR2(key: string) {
  const Bucket = requireEnv("R2_BUCKET");

  await r2.send(
    new DeleteObjectCommand({
      Bucket,
      Key: key,
    })
  );
}
