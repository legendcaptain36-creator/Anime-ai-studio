"use client";

import { useState } from "react";

type Scene = {
  number: number;
  duration_seconds: number;
  visual_prompt: string;
  camera: string;
  action: string;
  sound: string;
};

type Storyboard = {
  title: string;
  style: string;
  scenes: Scene[];
};

export default function Home() {
  const [idea, setIdea] = useState(
    "A young hero discovers a glowing dragon egg in a magical forest."
  );
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setStoryboard(null);

    try {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setStoryboard(data.storyboard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadStoryboard() {
    if (!storyboard) return;

    const blob = new Blob(
      [JSON.stringify(storyboard, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anime-storyboard.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: "40px 20px"
    }}>
      <p style={{ color: "#c4b5fd" }}>
        YOUR PERSONAL AI CREATIVE STUDIO
      </p>

      <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)" }}>
        Anime AI Studio
      </h1>

      <p style={{ color: "#c4c4d4", lineHeight: 1.7 }}>
        Turn your imagination into an original anime storyboard.
        Generate scenes and prompts ready for a video-generation
        service.
      </p>

      <section style={{
        background: "#171727",
        border: "1px solid #35354d",
        borderRadius: 16,
        padding: 22,
        marginTop: 28
      }}>
        <label htmlFor="idea">
          <strong>What anime do you want to create?</strong>
        </label>

        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={2000}
          rows={5}
          style={{
            display: "block",
            boxSizing: "border-box",
            width: "100%",
            marginTop: 14,
            padding: 14,
            borderRadius: 10,
            border: "1px solid #454560",
            background: "#0c0c16",
            color: "white",
            fontSize: 16,
            lineHeight: 1.6
          }}
        />

        <button
          onClick={generate}
          disabled={loading || !idea.trim()}
          style={{
            marginTop: 16,
            padding: "14px 20px",
            borderRadius: 10,
            border: 0,
            background: loading ? "#55516b" : "#a78bfa",
            color: "#171329",
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? "wait" : "pointer"
          }}
        >
          {loading ? "Creating your storyboard..." : "Generate Anime Storyboard"}
        </button>

        {error && (
          <p role="alert" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        )}
      </section>

      {storyboard && (
        <section style={{ marginTop: 32 }}>
          <h2>{storyboard.title}</h2>
          <p style={{ color: "#c4c4d4" }}>{storyboard.style}</p>

          {storyboard.scenes.map((scene) => (
            <article
              key={scene.number}
              style={{
                background: "#171727",
                border: "1px solid #35354d",
                borderRadius: 14,
                padding: 20,
                marginTop: 16
              }}
            >
              <h3>Scene {scene.number}</h3>
              <p>Duration: {scene.duration_seconds} seconds</p>
              <p><strong>Visual prompt</strong></p>
              <p style={{ lineHeight: 1.7 }}>
                {scene.visual_prompt}
              </p>
              <p><strong>Camera:</strong> {scene.camera}</p>
              <p><strong>Action:</strong> {scene.action}</p>
              <p><strong>Sound:</strong> {scene.sound}</p>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(scene.visual_prompt)
                }
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #66617d",
                  background: "transparent",
                  color: "white"
                }}
              >
                Copy visual prompt
              </button>
            </article>
          ))}

          <button
            onClick={downloadStoryboard}
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              border: 0,
              background: "#c4b5fd",
              color: "#171329",
              fontWeight: 700
            }}
          >
            Download storyboard JSON
          </button>
        </section>
      )}
    </main>
  );
}
