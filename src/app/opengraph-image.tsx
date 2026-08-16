import { ImageResponse } from "next/og";

export const alt = "Kelsira — Reputación Justa y Reseñas Asistidas por IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "rgba(79,124,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              color: "#4f7cff",
              fontWeight: 700,
            }}
          >
            K
          </div>
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
          Reputación justa y reseñas asistidas por IA
        </div>
      </div>
    ),
    { ...size },
  );
}
