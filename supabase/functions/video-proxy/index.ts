const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only allow video CDN domains we trust
    const parsed = new URL(url);
    const allowed = [
      "player.vimeo.com",
      "videos.pexels.com",
      "www.pexels.com",
      "images.pexels.com",
    ];
    if (!allowed.some((d) => parsed.hostname.endsWith(d))) {
      return new Response(JSON.stringify({ error: "Domain not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(url);
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${resp.status}` }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = resp.headers.get("content-type") || "video/mp4";
    const body = await resp.arrayBuffer();

    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
