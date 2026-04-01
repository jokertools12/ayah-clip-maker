import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lines, totalDuration } = await req.json();

    if (!lines || !Array.isArray(lines) || lines.length === 0 || !totalDuration) {
      return new Response(JSON.stringify({ error: "Missing lines or totalDuration" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linesText = lines.map((l: any, i: number) =>
      `${i}: "${l.text}" [${l.start.toFixed(2)}s - ${l.end.toFixed(2)}s]`
    ).join("\n");

    const prompt = `You are a precise Arabic speech timing expert. Given transcribed lines with approximate timestamps from an Arabic religious audio (ibtahalat/nasheed), refine the start and end times so they match natural Arabic speech patterns.

Total audio duration: ${totalDuration.toFixed(2)} seconds
Number of lines: ${lines.length}

Current lines:
${linesText}

Rules:
1. Lines must not overlap
2. First line starts at or after 0
3. Last line ends at or before ${totalDuration.toFixed(2)}
4. Longer Arabic words/phrases need more time
5. Short pauses (0.2-0.5s) between lines are natural
6. Keep the overall order and don't merge or split lines
7. Distribute time proportionally based on word count and syllable density

Return ONLY a JSON array with objects having "start" and "end" as numbers (seconds). No explanations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a timing refinement assistant. Return only valid JSON arrays." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "refine_timings",
              description: "Return refined timing for each transcribed line",
              parameters: {
                type: "object",
                properties: {
                  timings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        start: { type: "number" },
                        end: { type: "number" },
                      },
                      required: ["start", "end"],
                    },
                  },
                },
                required: ["timings"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "refine_timings" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const timings = parsed.timings;

    if (!Array.isArray(timings) || timings.length !== lines.length) {
      return new Response(JSON.stringify({ error: "Timing count mismatch" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Merge refined timings with original text
    const refinedLines = lines.map((l: any, i: number) => ({
      text: l.text,
      start: timings[i].start,
      end: timings[i].end,
    }));

    return new Response(JSON.stringify({ refinedLines }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refine-timing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
