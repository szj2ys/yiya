import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Speak confidently. One lesson at a time.";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          backgroundImage:
            "linear-gradient(135deg, #f0fdf4 0%, #fafafa 50%, #f0fdf4 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                backgroundColor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "32px",
                fontWeight: 800,
              }}
            >
              Y
            </div>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#171717",
              }}
            >
              Yiya
            </span>
          </div>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#171717",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "#737373",
              marginTop: "8px",
            }}
          >
            Learn languages the fun way
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
