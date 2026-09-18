import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ThoughtDrop — Dump thoughts, get structure";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF4EC",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="96" height="96" viewBox="0 0 24 24">
            <path
              d="M12 2C12 2 4.5 10.8 4.5 16A7.5 7.5 0 0 0 19.5 16C19.5 10.8 12 2 12 2Z"
              fill="#CF5A28"
            />
            <circle cx="12" cy="15.5" r="2.3" fill="#FAF4EC" />
          </svg>
          <span
            style={{ fontSize: "72px", fontWeight: 600, color: "#2E2620" }}
          >
            ThoughtDrop
          </span>
        </div>
        <p
          style={{
            fontSize: "36px",
            color: "#8A7A66",
            marginTop: "24px",
          }}
        >
          Dump thoughts, get structure.
        </p>
      </div>
    ),
    size,
  );
}
