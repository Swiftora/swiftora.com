const ALLOWED_ORIGINS = ["https://www.swiftora.com", "https://swiftora.com"];

export default async (req) => {
  const origin = req.headers.get("origin") || "";
  const cors = ALLOWED_ORIGINS.includes(origin) ? origin : "";
  const vec = Array.from({ length: 512 }, () => Math.random());
  return new Response(JSON.stringify({ vector: vec }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": cors }
  });
};
