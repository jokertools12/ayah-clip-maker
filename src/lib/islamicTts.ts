/**
 * Islamic Content Text-to-Speech Service
 * Uses ElevenLabs via edge function to generate audio for hadiths/sermons
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface TtsResult {
  audioUrl: string;
  blob: Blob;
}

/**
 * Generate TTS audio for Islamic content text
 */
export async function generateIslamicTts(
  text: string,
  voiceId?: string
): Promise<TtsResult> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        text,
        voiceId: voiceId || undefined,
        mode: 'tts',
      }),
    }
  );

  if (!response.ok) {
    let errorMsg = `TTS request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return { audioUrl, blob };
}

// Arabic-optimized voice options for ElevenLabs
export const ARABIC_VOICES = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'صوت هادئ واضح' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'صوت قوي ومؤثر' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'صوت رصين وعميق' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'صوت شاب ومعاصر' },
] as const;
