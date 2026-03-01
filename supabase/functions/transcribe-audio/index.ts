import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY is not configured" }),
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
    const audioBlob = await audioResp.blob();
    console.log(`Audio fetched, size: ${audioBlob.size} bytes`);

    // Send to ElevenLabs Scribe
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model_id", "scribe_v2");
    formData.append("language_code", language || "ara");
    formData.append("tag_audio_events", "false");
    formData.append("diarize", "false");

    console.log("Sending to ElevenLabs STT...");
    const sttResp = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!sttResp.ok) {
      const errText = await sttResp.text();
      console.error(`ElevenLabs STT error: ${sttResp.status}`, errText);

      const missingSttPermission =
        sttResp.status === 401 &&
        errText.includes("missing_permissions") &&
        errText.includes("speech_to_text");

      return new Response(
        JSON.stringify({
          error: missingSttPermission
            ? "ElevenLabs API key is missing speech_to_text permission"
            : `Transcription failed: ${sttResp.status}`,
          provider_status: sttResp.status,
        }),
        {
          status: missingSttPermission ? 403 : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await sttResp.json();
    console.log(`Transcription complete, words: ${result.words?.length || 0}`);

    // Group words into lines (sentences) based on pauses
    const words = result.words || [];
    const lines: { text: string; start: number; end: number }[] = [];
    let currentLine: { words: string[]; start: number; end: number } | null = null;
    const PAUSE_THRESHOLD = 0.8; // seconds - gap between words to split lines

    for (const word of words) {
      if (!word.text || word.text.trim() === "") continue;
      
      if (!currentLine) {
        currentLine = { words: [word.text], start: word.start, end: word.end };
      } else {
        const gap = word.start - currentLine.end;
        if (gap > PAUSE_THRESHOLD || currentLine.words.length >= 8) {
          // Finish current line
          lines.push({
            text: currentLine.words.join(" "),
            start: currentLine.start,
            end: currentLine.end,
          });
          currentLine = { words: [word.text], start: word.start, end: word.end };
        } else {
          currentLine.words.push(word.text);
          currentLine.end = word.end;
        }
      }
    }
    if (currentLine && currentLine.words.length > 0) {
      lines.push({
        text: currentLine.words.join(" "),
        start: currentLine.start,
        end: currentLine.end,
      });
    }

    return new Response(
      JSON.stringify({
        text: result.text,
        words: result.words,
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
