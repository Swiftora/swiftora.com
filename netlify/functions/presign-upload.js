// npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  },
});

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { filename, contentType } = await req.json().catch(() => ({}));
  if (!filename || !contentType) return new Response("Bad request", { status: 400 });

  const key = `uploads/${Date.now()}_${filename.replace(/[^\w.\-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    // ACL: "public-read", // optional; you can keep private if serving via CloudFront
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  return new Response(
    JSON.stringify({ url, key, publicUrl: `${process.env.S3_PUBLIC_BASE}/${key}` }),
    { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }
  );
};
