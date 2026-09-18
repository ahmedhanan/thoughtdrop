import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: the ThoughtDrop droplet mark on cream.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF4EC",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path
            d="M12 2C12 2 4.5 10.8 4.5 16A7.5 7.5 0 0 0 19.5 16C19.5 10.8 12 2 12 2Z"
            fill="#CF5A28"
          />
          <circle cx="12" cy="15.5" r="2.3" fill="#FAF4EC" />
        </svg>
      </div>
    ),
    size,
  );
}
