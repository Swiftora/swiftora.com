const ALLOWED_ORIGINS = ["https://www.swiftora.com", "https://swiftora.com"];

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

  const { key, text } = await req.json().catch(() => ({}));

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type, data) =>
        controller.enqueue(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);

      send("status", { msg: "Analyzing image…" }); await sleep(400);
      send("status", { msg: "Generating visual fingerprint…" }); await sleep(500);

      // Replace image with your real thumbnail from S3 or the top vector match
      send("similar", {
        score: 0.82,
        reason: { color: "cream/white", pattern: "hobnail", shape: "ruffled rim" },
        image: "https://your-cdn/placeholder-match.jpg"
      }); await sleep(500);

      send("status", { msg: "Fetching sold comps…" }); await sleep(600);

      send("listing", {
        title: "Oval Butterfly Brooch",
        description: "Vintage oval brooch featuring an orange butterfly encased in resin.",
        suggested: 25.00,
        comps: [
          { title: "Butterfly brooch (vintage)", price: 22.0 },
          { title: "Resin butterfly pin", price: 27.0 }
        ]
      });

      send("done", { ok: true });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      ...corsHeaders(req)
    }
  });
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
