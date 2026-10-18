import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime AI Studio",
  description: "Create anime stories and scene-by-scene storyboards with AI."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        background: "#0c0c16",
        color: "#f5f3ff",
        fontFamily: "Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}
