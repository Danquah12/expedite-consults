import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "onyx", speed = 1.0, model = "tts-1" } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text prompt is required for speech synthesis" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured in environment variables" },
        { status: 500 }
      );
    }

    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const selectedVoice = validVoices.includes(voice) ? voice : "onyx";
    const cleanText = text.slice(0, 4000);

    const openAiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model === "tts-1-hd" ? "tts-1-hd" : "tts-1",
        input: cleanText,
        voice: selectedVoice,
        response_format: "mp3",
        speed: Math.max(0.5, Math.min(2.0, Number(speed) || 1.0)),
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      const errorMessage =
        (errorData as { error?: { message?: string; code?: string } })?.error?.message ||
        `OpenAI TTS API error: HTTP ${openAiResponse.status}`;

      return NextResponse.json(
        {
          error: errorMessage,
          code: (errorData as { error?: { code?: string } })?.error?.code || "tts_error",
        },
        { status: openAiResponse.status }
      );
    }

    const audioArrayBuffer = await openAiResponse.arrayBuffer();

    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioArrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("OpenAI TTS handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in TTS engine" },
      { status: 500 }
    );
  }
}
