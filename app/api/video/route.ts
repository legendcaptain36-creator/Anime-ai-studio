import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "fal-ai/wan/v2.2-5b/text-to-video";

function configureFal() {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("MISSING_FAL_KEY");
  fal.config({ credentials: key });
}

export async function POST(request: Request) {
  try {
    configureFal();
    const body = await request.json();
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";

    if (!idea || idea.length > 1500) {
      return NextResponse.json(
        { error: "Please enter a video idea between 1 and 1500 characters." },
        { status: 400 }
      );
    }

    const prompt = [
      "Create a beautiful original Japanese anime-style animated video.",
      "Cinematic composition, detailed hand-drawn anime aesthetic, expressive character animation, smooth motion, rich lighting, coherent scene, professional animation quality.",
      "No captions, no subtitles, no logos, no watermark.",
      "Story idea: " + idea
    ].join("\n");

    const submitted = await fal.queue.submit(MODEL, {
      input: {
        prompt,
        num_frames: 81,
        frames_per_second: 24,
        resolution: "720p",
        aspect_ratio: "16:9",
        enable_safety_checker: true
      }
    });

    return NextResponse.json({ requestId: submitted.request_id, status: "IN_QUEUE" });
  } catch (error) {
    console.error("Video submission failed:", error);
    if (error instanceof Error && error.message === "MISSING_FAL_KEY") {
      return NextResponse.json(
        { error: "Video generation is almost ready. Add FAL_KEY in Vercel Project Settings → Environment Variables, then redeploy." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Could not start video generation. Check your fal.ai account and API key, then try again." },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  try {
    configureFal();
    const requestId = new URL(request.url).searchParams.get("requestId");
    if (!requestId || requestId.length > 200) {
      return NextResponse.json({ error: "Missing or invalid video request ID." }, { status: 400 });
    }

    const status = await fal.queue.status(MODEL, { requestId });
    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(MODEL, { requestId });
      const videoUrl = result.data?.video?.url;
      if (!videoUrl) {
        return NextResponse.json({ error: "The video service finished without returning a video." }, { status: 502 });
      }
      return NextResponse.json({ status: "COMPLETED", videoUrl });
    }

    if ((status.status as string) === "FAILED") {
      return NextResponse.json({ status: "FAILED", error: "Video generation failed. Please try a shorter or different prompt." });
    }

    return NextResponse.json({ status: status.status || "IN_PROGRESS" });
  } catch (error) {
    console.error("Video status check failed:", error);
    if (error instanceof Error && error.message === "MISSING_FAL_KEY") {
      return NextResponse.json({ error: "Add FAL_KEY in Vercel Project Settings → Environment Variables, then redeploy." }, { status: 503 });
    }
    return NextResponse.json({ error: "Could not check video status. Please try again." }, { status: 502 });
  }
}
