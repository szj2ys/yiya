import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "Someone";
  const score = searchParams.get("score") || "?";
  const total = searchParams.get("total") || "5";
  const language = searchParams.get("language") || "a language";

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
            "linear-gradient(135deg, #f5f3ff 0%, #fafafa 50%, #f0fdf4 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              Y
            </div>
            <span
              style={{
                fontSize: "36px",
                fontWeight: 800,
                color: "#171717",
              }}
            >
              Yiya
            </span>
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#7c3aed",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            {name} scored {score}/{total} in {language}
          </div>

          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#171717",
              textAlign: "center",
            }}
          >
            Can you beat their score?
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "#737373",
              marginTop: "8px",
            }}
          >
            Play the challenge and find out!
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
