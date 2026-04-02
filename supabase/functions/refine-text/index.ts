import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lines } = await req.json();

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return new Response(JSON.stringify({ error: "Missing lines" }), {
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

    const linesText = lines.map((l: any, i: number) => `${i}: "${l.text}"`).join("\n");

    const prompt = `You are an expert Arabic text editor for Islamic content (Quran recitations, ibtahalat, nasheeds). 

Given these transcribed Arabic lines, please:
1. Fix any broken or incorrectly joined Arabic letters/words
2. Add proper Arabic diacritics (tashkeel) where appropriate for clarity
3. Fix any obvious transcription errors in common Islamic phrases
4. Add subtle, tasteful decorative elements where appropriate:
   - ﷽ (Bismillah) at the beginning if the content starts with Bismillah
   - ﴿ ﴾ around Quranic verses if detected
   - ❁ or ۞ as section dividers if there are natural breaks
5. Keep the meaning and order exactly the same
6. Each line should remain as a separate entry

Current lines:
${linesText}

Return the refined text for each line.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an Arabic text refinement assistant for Islamic content. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "refine_text",
              description: "Return refined Arabic text for each line",
              parameters: {
                type: "object",
                properties: {
                  refinedTexts: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["refinedTexts"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "refine_text" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No tool call in response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const refinedTexts = parsed.refinedTexts;

    if (!Array.isArray(refinedTexts) || refinedTexts.length !== lines.length) {
      return new Response(JSON.stringify({ error: "Text count mismatch" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Merge refined text with original timings
    const refinedLines = lines.map((l: any, i: number) => ({
      text: refinedTexts[i],
      start: l.start,
      end: l.end,
    }));

    return new Response(JSON.stringify({ refinedLines }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("refine-text error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
