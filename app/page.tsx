"use client";

import { useEffect, useState } from "react";

type VideoState = "idle" | "starting" | "processing" | "ready" | "failed";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [videoState, setVideoState] = useState<VideoState>("idle");
  const [requestId, setRequestId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId || videoState !== "processing") return;

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/video?requestId=" + encodeURIComponent(requestId), { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error || "Could not check video status.");
          setVideoState("failed");
          return;
        }
        if (data.status === "COMPLETED" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setVideoState("ready");
        } else if (data.status === "FAILED") {
          setError(data.error || "Video generation failed. Please try again.");
          setVideoState("failed");
        }
      } catch {
        if (!cancelled) {
          setError("Connection interrupted while checking your video. Please try again.");
          setVideoState("failed");
        }
      }
    };

    void checkStatus();
    const timer = window.setInterval(() => void checkStatus(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [requestId, videoState]);

  async function createVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setVideoUrl("");
    setRequestId("");
    setVideoState("starting");

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start video generation.");
      setRequestId(data.requestId);
      setVideoState("processing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setVideoState("failed");
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "30px 18px 60px", background: "radial-gradient(ellipse at top, #27204d 0%, #11101e 45%, #0c0c16 100%)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ textAlign: "center", padding: "30px 0 34px" }}>
          <div style={{ display: "inline-block", padding: "7px 12px", border: "1px solid #51427b", borderRadius: 999, color: "#c4b5fd", fontSize: 12, letterSpacing: 2, marginBottom: 18 }}>
            AI-POWERED VIDEO CREATION
          </div>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 62px)", lineHeight: 1.08, margin: "0 0 14px", letterSpacing: -1.5 }}>
            Anime <span style={{ color: "#a78bfa" }}>AI Studio</span>
          </h1>
          <p style={{ color: "#b9b5ce", fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: "0 auto" }}>
            Describe the anime you imagine. Generate a real animated video clip and watch it right here.
          </p>
        </header>

        <section style={{ background: "rgba(24, 22, 43, .94)", border: "1px solid #38314f", borderRadius: 22, padding: "clamp(18px, 4vw, 30px)", boxShadow: "0 24px 70px rgba(0,0,0,.25)" }}>
          <form onSubmit={createVideo}>
            <label htmlFor="idea" style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>Describe the video you want</label>
            <p style={{ color: "#aaa5c2", fontSize: 14, lineHeight: 1.6, margin: "0 0 14px" }}>
              Example: A brave anime girl with blue hair runs across rooftops at sunset while a giant dragon flies between glowing skyscrapers.
            </p>
            <textarea
              id="idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="Describe your characters, their actions, the setting, and the mood..."
              maxLength={1500}
              required
              rows={5}
              style={{ boxSizing: "border-box", width: "100%", resize: "vertical", padding: 16, borderRadius: 14, border: "1px solid #51476f", background: "#100f1d", color: "#f5f3ff", font: "inherit", fontSize: 15, lineHeight: 1.6, outlineColor: "#a78bfa" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#8e89a8", fontSize: 12, margin: "8px 2px 18px" }}>
              <span>Anime style · 720p · Landscape video · Up to 5 seconds</span>
              <span>{idea.length}/1500</span>
            </div>
            <button type="submit" disabled={!idea.trim() || videoState === "starting" || videoState === "processing"} style={{ width: "100%", padding: "15px 18px", border: 0, borderRadius: 13, color: "white", fontWeight: 700, fontSize: 16, cursor: !idea.trim() || videoState === "starting" || videoState === "processing" ? "not-allowed" : "pointer", background: !idea.trim() || videoState === "starting" || videoState === "processing" ? "#51476f" : "linear-gradient(90deg, #7c3aed, #a855f7)", opacity: !idea.trim() || videoState === "starting" || videoState === "processing" ? .75 : 1 }}>
              {videoState === "starting" ? "Starting your video..." : videoState === "processing" ? "Creating your anime video..." : "✦ Generate Anime Video"}
            </button>
          </form>
        </section>

        {(videoState === "starting" || videoState === "processing") && (
          <section role="status" style={{ marginTop: 22, padding: 22, textAlign: "center", border: "1px solid #51476f", borderRadius: 18, background: "#18162b" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🎬</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{videoState === "starting" ? "Starting your render" : "Your anime is being animated"}</h2>
            <p style={{ color: "#b9b5ce", margin: 0, lineHeight: 1.6 }}>Video generation can take a few minutes. Keep this page open while we wait for the clip.</p>
          </section>
        )}

        {error && (
          <p role="alert" style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#351d2b", border: "1px solid #71364d", color: "#fecdd3", lineHeight: 1.6, overflowWrap: "anywhere" }}>{error}</p>
        )}

        {videoState === "ready" && videoUrl && (
          <section style={{ marginTop: 26, padding: "clamp(16px, 4vw, 26px)", borderRadius: 20, border: "1px solid #51476f", background: "#18162b" }}>
            <p style={{ color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 2, fontSize: 12, margin: "0 0 10px" }}>Your video is ready</p>
            <h2 style={{ margin: "0 0 18px", fontSize: 24 }}>Watch your anime</h2>
            <video controls playsInline preload="metadata" src={videoUrl} style={{ width: "100%", display: "block", borderRadius: 14, background: "#000", maxHeight: 520 }} />
            <a href={videoUrl} target="_blank" rel="noreferrer" download style={{ display: "inline-block", marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "#7c3aed", color: "white", textDecoration: "none", fontWeight: 700 }}>Open / Download Video ↗</a>
            <p style={{ color: "#9690ad", fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>This is a short generated clip. Longer anime episodes require generating and combining multiple clips.</p>
          </section>
        )}

        <footer style={{ textAlign: "center", color: "#77728f", fontSize: 12, paddingTop: 30 }}>
          Anime AI Studio · Turn your imagination into motion
        </footer>
      </div>
    </main>
  );
}
