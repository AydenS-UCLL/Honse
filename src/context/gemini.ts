/**
 * Minimal Gemini client (plain fetch, no SDK, so nothing new to install).
 *
 * Env vars (server side only):
 *   GEMINI_API_KEY  required. Get one free at https://aistudio.google.com/apikey
 *   GEMINI_MODEL    optional. Defaults to gemini-2.5-flash. Any Flash model works.
 */

const DEFAULT_MODEL = "gemini-2.5-flash";

export class GeminiError extends Error {}

export function geminiConfigured(): boolean {
  return Boolean(process.env["GEMINI_API_KEY"]);
}

type GenerateOptions = {
  system: string;
  prompt: string;
  temperature?: number;
  timeoutMs?: number;
};

/** Calls Gemini in JSON mode and returns the parsed JSON. Throws GeminiError on any failure. */
export async function generateJSON<T>(opts: GenerateOptions): Promise<T> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new GeminiError("GEMINI_API_KEY is not set");

  const model = process.env["GEMINI_MODEL"] || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.2,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new GeminiError(`Gemini ${model} returned ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new GeminiError(
      `Gemini returned no text${data.promptFeedback?.blockReason ? ` (blocked: ${data.promptFeedback.blockReason})` : ""}`,
    );
  }

  try {
    // Strip ```json fences in case the model adds them despite JSON mode.
    return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")) as T;
  } catch {
    throw new GeminiError(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
  }
}
