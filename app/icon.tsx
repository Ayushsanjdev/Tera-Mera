import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#121212",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="22" height="14" viewBox="0 0 40 24">
        <circle
          cx="14"
          cy="12"
          r="10"
          fill="none"
          stroke="#f5a524"
          strokeWidth="2.5"
        />
        <circle
          cx="26"
          cy="12"
          r="10"
          fill="none"
          stroke="#34d399"
          strokeWidth="2.5"
        />
      </svg>
    </div>,
    { ...size },
  );
}
