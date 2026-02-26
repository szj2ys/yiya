"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2, X } from "lucide-react";

type Props = {
  challengerName: string;
  language: string;
  friendScore: number;
  challengerScore: number;
  totalQuestions: number;
  onClose: () => void;
};

const CARD_WIDTH = 390;
const CARD_HEIGHT = 520;

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Draw the challenge share card onto a canvas context. */
function drawCard(
  ctx: CanvasRenderingContext2D,
  props: Omit<Props, "onClose">,
  scale: number = 2,
) {
  const w = CARD_WIDTH * scale;
  const h = CARD_HEIGHT * scale;
  const s = scale;

  // Background gradient (Spotify Wrapped-inspired)
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#7c3aed"); // violet-600
  gradient.addColorStop(0.5, "#6d28d9"); // violet-700
  gradient.addColorStop(1, "#4c1d95"); // violet-900

  const radius = 24 * s;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.clip();

  // Logo
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${20 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("\uD83C\uDF3F Yiya Challenge", w / 2, 50 * s);

  // Thin separator
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(40 * s, 70 * s);
  ctx.lineTo(w - 40 * s, 70 * s);
  ctx.stroke();

  // Language
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(props.language, w / 2, 100 * s);

  // Score comparison
  const scoreY = 180 * s;

  // Friend score (left side)
  ctx.fillStyle = "#10b981"; // emerald
  ctx.font = `bold ${64 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.friendScore}`, w * 0.3, scoreY);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("You", w * 0.3, scoreY + 30 * s);

  // VS
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `bold ${18 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("VS", w / 2, scoreY - 10 * s);

  // Challenger score (right side)
  ctx.fillStyle = "#f59e0b"; // amber
  ctx.font = `bold ${64 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.challengerScore}`, w * 0.7, scoreY);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(props.challengerName, w * 0.7, scoreY + 30 * s);

  // Out of total
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `400 ${16 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`out of ${props.totalQuestions}`, w / 2, scoreY + 70 * s);

  // Result text
  const won = props.friendScore > props.challengerScore;
  const tied = props.friendScore === props.challengerScore;
  const resultText = won ? "I won!" : tied ? "We tied!" : "Close match!";
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${32 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(resultText, w / 2, scoreY + 130 * s);

  // CTA
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `600 ${16 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("Can you beat my score?", w / 2, h - 60 * s);

  // Date
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `400 ${12 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(formatDate(), w / 2, h - 30 * s);
}

export function ChallengeShareCard({
  challengerName,
  language,
  friendScore,
  challengerScore,
  totalQuestions,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  const dateStr = formatDate();
  const won = friendScore > challengerScore;
  const tied = friendScore === challengerScore;
  const resultText = won ? "I won!" : tied ? "We tied!" : "Close match!";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = 2;
    canvas.width = CARD_WIDTH * scale;
    canvas.height = CARD_HEIGHT * scale;
    canvas.style.width = `${CARD_WIDTH}px`;
    canvas.style.height = `${CARD_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawCard(
      ctx,
      { challengerName, language, friendScore, challengerScore, totalQuestions },
      scale,
    );
    setIsReady(true);
  }, [challengerName, language, friendScore, challengerScore, totalQuestions]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const dateSlug = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.download = `yiya-challenge-${dateSlug}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (blob) {
          const dateSlug = new Date().toISOString().slice(0, 10);
          const file = new File([blob], `yiya-challenge-${dateSlug}.png`, {
            type: "image/png",
          });
          await navigator.share({
            title: "Yiya Challenge",
            text: `I scored ${friendScore}/${totalQuestions} on a ${language} challenge!`,
            files: [file],
          });
          return;
        }
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(
        process.env.NEXT_PUBLIC_APP_URL ?? "https://yiya.app",
      );
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, [friendScore, totalQuestions, language]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-label="Share challenge results"
    >
      <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-xl max-w-[430px] w-full">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* HTML Preview (matches canvas) */}
        <div
          className="w-[390px] max-w-full rounded-2xl overflow-hidden shadow-sm"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
          }}
        >
          <div className="flex flex-col items-center px-8 py-8 text-white">
            <p className="text-xl font-bold mb-1">
              {"\uD83C\uDF3F"} Yiya Challenge
            </p>
            <div className="w-full border-t border-white/20 my-3" />
            <p className="text-sm text-white/70 mb-6">{language}</p>

            {/* Scores */}
            <div className="flex items-center justify-between w-full px-4 mb-2">
              <div className="text-center flex-1">
                <p className="text-5xl font-extrabold text-emerald-400">
                  {friendScore}
                </p>
                <p className="text-sm text-white/70 mt-1">You</p>
              </div>
              <p className="text-lg font-bold text-white/30 mx-4">VS</p>
              <div className="text-center flex-1">
                <p className="text-5xl font-extrabold text-amber-400">
                  {challengerScore}
                </p>
                <p className="text-sm text-white/70 mt-1">{challengerName}</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-6">
              out of {totalQuestions}
            </p>

            <p className="text-2xl font-bold mb-4">{resultText}</p>

            <p className="text-base font-semibold text-white/80">
              Can you beat my score?
            </p>
            <p className="text-xs text-white/40 mt-2">{dateStr}</p>
          </div>
        </div>

        {/* Hidden canvas for export */}
        <canvas
          ref={canvasRef}
          className="hidden"
          aria-hidden="true"
          data-testid="challenge-share-card-canvas"
        />

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!isReady}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-violet-600 text-white font-semibold py-3 hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!isReady}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white border border-neutral-200 text-neutral-700 font-semibold py-3 hover:bg-neutral-50 active:bg-neutral-100 transition disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
