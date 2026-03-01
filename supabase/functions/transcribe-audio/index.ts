import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, audioBase64: inputBase64, language, chunkOffset } = await req.json();

    if (!audioUrl && !inputBase64) {
      return new Response(JSON.stringify({ error: "audioUrl or audioBase64 is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let audioBase64: string;

    if (inputBase64) {
      // Client already sent base64 audio data (from chunked processing)
      audioBase64 = inputBase64;
      console.log(`Received base64 audio chunk, size: ~${Math.round(inputBase64.length * 3 / 4)} bytes, offset: ${chunkOffset || 0}s`);
    } else {
      // Fetch audio from URL (no Range header to avoid 401 on Archive.org)
      console.log(`Fetching audio (max ${MAX_AUDIO_BYTES} bytes) from: ${audioUrl}`);
      const audioResp = await fetch(audioUrl);
      if (!audioResp.ok) {
        throw new Error(`Failed to fetch audio: ${audioResp.status}`);
      }

      const reader = audioResp.body?.getReader();
      if (!reader) throw new Error("No response body");

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      while (totalSize < MAX_AUDIO_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        const remaining = MAX_AUDIO_BYTES - totalSize;
        if (value.byteLength > remaining) {
          chunks.push(value.slice(0, remaining));
          totalSize += remaining;
          break;
        }
        chunks.push(value);
        totalSize += value.byteLength;
      }
      reader.cancel().catch(() => {});

      const audioBuffer = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        audioBuffer.set(chunk, offset);
        offset += chunk.byteLength;
      }

      audioBase64 = base64Encode(audioBuffer);
      console.log(`Audio fetched, size: ${totalSize} bytes`);
    }

    const timeOffset = chunkOffset || 0;
    const systemPrompt = `You are an expert Arabic audio transcriber. Listen to the audio and transcribe it accurately.

IMPORTANT RULES:
- Transcribe the Arabic speech word by word
- Split the transcription into logical lines/sentences (each 3-8 words)
- For each line, estimate the approximate start and end time in seconds RELATIVE TO THIS AUDIO CHUNK (starting from 0)
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
                text: `Transcribe this Arabic audio recording. It is a religious devotional chant (ابتهال). Return the transcription as JSON with lines and timestamps.`,
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: inputBase64 ? "wav" : "mp3",
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

    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: { text?: string; lines?: { text: string; start: number; end: number }[] };
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI JSON:", jsonStr.substring(0, 500));
      parsed = {
        text: rawContent,
        lines: [{ text: rawContent, start: 0, end: 30 }],
      };
    }

    // Apply time offset for chunked audio
    const lines = (parsed.lines || []).map((l) => ({
      text: l.text,
      start: l.start + timeOffset,
      end: l.end + timeOffset,
    }));

    console.log(`Transcription complete: ${lines.length} lines (offset: ${timeOffset}s)`);

    return new Response(
      JSON.stringify({
        text: parsed.text || lines.map((l) => l.text).join(" "),
        lines,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Transcription error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
