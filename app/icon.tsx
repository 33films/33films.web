import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          color: "#F2F0EA",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.05em",
        }}
      >
        33
      </div>
    ),
    { ...size }
  );
}
