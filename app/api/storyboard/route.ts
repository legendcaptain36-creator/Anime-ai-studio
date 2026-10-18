import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OLLAMA_API_KEY;
    const model = process.env.OLLAMA_MODEL;

    if (!apiKey || !model) {
      return NextResponse.json(
        { error: "Configure OLLAMA_API_KEY and OLLAMA_MODEL in Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const idea = typeof body.idea === "string"
      ? body.idea.trim()
      : "";

    if (!idea || idea.length > 2000) {
      return NextResponse.json(
        { error: "Enter a story idea of 1–2000 characters." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://ollama.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `You are an expert anime screenwriter.
Create a storyboard for a short, original anime.
Return ONLY valid JSON with this structure:
{
  "title": "string",
  "style": "string",
  "scenes": [
    {
      "number": 1,
      "duration_seconds": 5,
      "visual_prompt": "Detailed anime image/video prompt",
      "camera": "Camera movement",
      "action": "What happens",
      "sound": "Suggested sound or dialogue"
    }
  ]
}
Create exactly 4 scenes. Each scene should last 4 to 8 seconds.
Use vivid visual details and consistent characters.
Do not use existing copyrighted characters.`
            },
            {
              role: "user",
              content: `Create an anime storyboard from this idea: ${idea}`
            }
          ],
          stream: false,
          temperature: 0.8
        })
      }
    );

    if (!response.ok) {
      console.error("Ollama request failed:", response.status);
      return NextResponse.json(
        { error: "Ollama could not generate the storyboard. Check your model, API key and access." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Ollama returned an unexpected response." },
        { status: 502 }
      );
    }

    const cleaned = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let storyboard;
    try {
      storyboard = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "The model returned invalid JSON. Please try again." },
        { status: 502 }
      );
    }

    if (
      typeof storyboard.title !== "string" ||
      !Array.isArray(storyboard.scenes) ||
      storyboard.scenes.length !== 4 ||
      !storyboard.scenes.every(
        (scene: { visual_prompt?: unknown }) =>
          typeof scene.visual_prompt === "string"
      )
    ) {
      return NextResponse.json(
        { error: "The model returned an incomplete storyboard. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ storyboard });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
