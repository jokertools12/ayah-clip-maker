import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, language } = await req.json();
    if (!audioUrl) {
      return new Response(JSON.stringify({ error: "audioUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the audio file
    console.log(`Fetching audio from: ${audioUrl}`);
    const audioResp = await fetch(audioUrl);
    if (!audioResp.ok) {
      throw new Error(`Failed to fetch audio: ${audioResp.status}`);
    }
    const audioBuffer = await audioResp.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);
    console.log(`Audio fetched, size: ${audioBuffer.byteLength} bytes`);

    // Use Lovable AI Gateway (Gemini) for transcription
    const systemPrompt = `You are an expert Arabic audio transcriber. Listen to the audio and transcribe it accurately.

IMPORTANT RULES:
- Transcribe the Arabic speech word by word
- Split the transcription into logical lines/sentences (each 3-8 words)
- For each line, estimate the approximate start and end time in seconds
- Return ONLY valid JSON, no markdown, no explanation

Return JSON in this exact format:
{
  "text": "full transcription text",
  "lines": [
    {"text": "first line of text", "start": 0.0, "end": 3.5},
    {"text": "second line of text", "start": 3.5, "end": 7.0}
  ]
}`;

    console.log("Sending to Lovable AI Gateway (Gemini)...");
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Transcribe this ${language === "ara" ? "Arabic" : "Arabic"} audio recording. It is a religious devotional chant (ابتهال). Return the transcription as JSON with lines and timestamps.`,
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: "mp3",
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error(`AI Gateway error: ${aiResp.status}`, errText);

      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI transcription failed: ${aiResp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResp.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";
    console.log("AI response received, parsing...");

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: { text?: string; lines?: { text: string; start: number; end: number }[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI JSON:", jsonStr.substring(0, 500));
      // Fallback: treat entire response as single line
      parsed = {
        text: rawContent,
        lines: [{ text: rawContent, start: 0, end: 30 }],
      };
    }

    const lines = parsed.lines || [];
    console.log(`Transcription complete: ${lines.length} lines`);

    return new Response(
      JSON.stringify({
        text: parsed.text || lines.map((l) => l.text).join(" "),
        lines,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Transcription error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
