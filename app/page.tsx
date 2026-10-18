"use client";

import { useState } from "react";

type Scene = {
  number?: number;
  duration_seconds?: number;
  visual_prompt: string;
  camera?: string;
  action?: string;
  sound?: string;
};

type Storyboard = {
  title: string;
  style?: string;
  scenes: Scene[];
};

export default function Home() {
  const [idea, setIdea] = useState("");
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateStoryboard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStoryboard(null);
    setLoading(true);

    try {
      const response = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate your storyboard.");
      }

      setStoryboard(data.storyboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadStoryboard() {
    if (!storyboard) return;
    const blob = new Blob([JSON.stringify(storyboard, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "anime-storyboard.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyStoryboard() {
    if (!storyboard) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(storyboard, null, 2));
      setError("Storyboard copied to clipboard.");
    } catch {
      setError("Copy was blocked by your browser. Use Download JSON instead.");
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "32px 18px 60px", background: "radial-gradient(ellipse at top, #27204d 0%, #11101e 45%, #0c0c16 100%)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ textAlign: "center", padding: "28px 0 34px" }}>
          <div style={{ display: "inline-block", padding: "7px 12px", border: "1px solid #51427b", borderRadius: 999, color: "#c4b5fd", fontSize: 12, letterSpacing: 2, marginBottom: 18 }}>
            AI-POWERED CREATIVE STUDIO
          </div>
          <h1 style={{ fontSize: "clamp(34px, 7vw, 58px)", lineHeight: 1.08, margin: "0 0 14px", letterSpacing: -1.5 }}>
            Anime <span style={{ color: "#a78bfa" }}>AI Studio</span>
          </h1>
          <p style={{ color: "#b9b5ce", fontSize: 16, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            Create an original anime story with four cinematic scenes using your AI model.
          </p>
        </header>

        <section style={{ background: "rgba(24, 22, 43, .92)", border: "1px solid #38314f", borderRadius: 22, padding: "clamp(18px, 4vw, 30px)", boxShadow: "0 24px 70px rgba(0,0,0,.25)" }}>
          <form onSubmit={generateStoryboard}>
            <label htmlFor="idea" style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
              What is your anime about?
            </label>
            <p style={{ color: "#aaa5c2", fontSize: 14, lineHeight: 1.6, margin: "0 0 14px" }}>
              Describe the hero, the world, and what happens. For example: A young inventor discovers a glowing dragon egg in a futuristic Tokyo.
            </p>
            <textarea
              id="idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="In a city floating above the clouds, a shy student discovers..."
              maxLength={2000}
              required
              rows={5}
              style={{ boxSizing: "border-box", width: "100%", resize: "vertical", padding: 16, borderRadius: 14, border: "1px solid #51476f", background: "#100f1d", color: "#f5f3ff", font: "inherit", fontSize: 15, lineHeight: 1.6, outlineColor: "#a78bfa" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", color: "#8e89a8", fontSize: 12, margin: "8px 2px 18px" }}>
              <span>Original characters · 4 cinematic scenes</span>
              <span>{idea.length}/2000</span>
            </div>
            <button type="submit" disabled={loading || !idea.trim()} style={{ width: "100%", padding: "15px 18px", border: 0, borderRadius: 13, color: "white", fontWeight: 700, fontSize: 16, cursor: loading || !idea.trim() ? "not-allowed" : "pointer", background: loading || !idea.trim() ? "#51476f" : "linear-gradient(90deg, #7c3aed, #a855f7)", opacity: loading || !idea.trim() ? .75 : 1 }}>
              {loading ? "Creating your storyboard..." : "✦ Generate Free Anime Storyboard"}
            </button>
          </form>
          {error && (
            <p role="status" style={{ margin: "16px 0 0", padding: 12, borderRadius: 10, background: "#241b32", color: "#ddd6fe", lineHeight: 1.5, overflowWrap: "anywhere" }}>
              {error}
            </p>
          )}
        </section>

        {storyboard && (
          <section style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
              <div>
                <p style={{ color: "#a78bfa", textTransform: "uppercase", letterSpacing: 2, fontSize: 11, margin: "0 0 7px" }}>Your storyboard is ready</p>
                <h2 style={{ fontSize: 27, margin: 0 }}>{storyboard.title}</h2>
                {storyboard.style && <p style={{ color: "#aaa5c2", margin: "8px 0 0" }}>{storyboard.style}</p>}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={copyStoryboard} style={{ padding: "10px 13px", border: "1px solid #51476f", borderRadius: 10, background: "#201b35", color: "#eee9ff", cursor: "pointer" }}>Copy JSON</button>
                <button type="button" onClick={downloadStoryboard} style={{ padding: "10px 13px", border: 0, borderRadius: 10, background: "#7c3aed", color: "white", cursor: "pointer" }}>Download JSON</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
              {storyboard.scenes.map((scene, index) => (
                <article key={scene.number ?? index} style={{ padding: 20, borderRadius: 16, background: "#18162b", border: "1px solid #38314f" }}>
                  <p style={{ color: "#c4b5fd", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>Scene {scene.number ?? index + 1} · {scene.duration_seconds ?? 5}s</p>
                  <h3 style={{ fontSize: 17, margin: "0 0 12px" }}>Visual direction</h3>
                  <p style={{ color: "#c7c2d9", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{scene.visual_prompt}</p>
                  {scene.camera && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#b9b5ce" }}><strong style={{ color: "#eee9ff" }}>Camera:</strong> {scene.camera}</p>}
                  {scene.action && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#b9b5ce" }}><strong style={{ color: "#eee9ff" }}>Action:</strong> {scene.action}</p>}
                  {scene.sound && <p style={{ fontSize: 13, lineHeight: 1.6, color: "#b9b5ce" }}><strong style={{ color: "#eee9ff" }}>Sound:</strong> {scene.sound}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <p style={{ textAlign: "center", color: "#aaa5c2", fontSize: 12, lineHeight: 1.6, paddingTop: 18 }}>Free mode creates a story and scene plan. It does not generate or download a real MP4 video.</p>
        <footer style={{ textAlign: "center", color: "#77728f", fontSize: 12, paddingTop: 14 }}>
          Anime AI Studio · Built for your imagination
        </footer>
      </div>
    </main>
  );
}
