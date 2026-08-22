import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Kelsira — Fair Reputation, AI-Assisted Reviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo-mark.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          backgroundImage:
            "radial-gradient(circle at 25% 15%, rgba(79,124,255,0.35), transparent 45%), radial-gradient(circle at 80% 85%, rgba(79,124,255,0.18), transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <img src={logoSrc} width={96} height={96} alt="" />
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#f4f5f7" }}>
            Kelsira
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#b7bac2",
            maxWidth: 880,
            textAlign: "center",
          }}
        >
          Fair reputation, AI-assisted reviews
        </div>
      </div>
    ),
    { ...size },
  );
}
