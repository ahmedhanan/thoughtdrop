import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg width="128" height="128" viewBox="0 0 24 24">
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
