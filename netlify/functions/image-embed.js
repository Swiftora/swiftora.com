export default async () => {
  const vec = Array.from({ length: 512 }, () => Math.random());
  return new Response(JSON.stringify({ vector: vec }), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
  });
};
