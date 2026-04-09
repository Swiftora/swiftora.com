// npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_ORIGINS = ["https://www.swiftora.com", "https://swiftora.com"];

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  },
});

function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  return {
    "access-control-allow-origin": ALLOWED_ORIGINS.includes(origin) ? origin : "",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { filename, contentType } = await req.json().catch(() => ({}));
  if (!filename || !contentType) return new Response("Bad request", { status: 400 });

  const key = `uploads/${Date.now()}_${filename.replace(/[^\w.\-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  return new Response(
    JSON.stringify({ url, key, publicUrl: `${process.env.S3_PUBLIC_BASE}/${key}` }),
    { headers: { "content-type": "application/json", ...corsHeaders(req) } }
  );
};
