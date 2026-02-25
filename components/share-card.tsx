"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2, X } from "lucide-react";

type Props = {
  streak: number;
  wordsLearned: number;
  language: string;
  accuracy: number;
  onClose: () => void;
};

const CARD_WIDTH = 390;
const CARD_HEIGHT = 520;

/** Map common language names to flag emoji. */
const languageFlags: Record<string, string> = {
  spanish: "\uD83C\uDDEA\uD83C\uDDF8",
  french: "\uD83C\uDDEB\uD83C\uDDF7",
  german: "\uD83C\uDDE9\uD83C\uDDEA",
  italian: "\uD83C\uDDEE\uD83C\uDDF9",
  portuguese: "\uD83C\uDDE7\uD83C\uDDF7",
  japanese: "\uD83C\uDDEF\uD83C\uDDF5",
  korean: "\uD83C\uDDF0\uD83C\uDDF7",
  chinese: "\uD83C\uDDE8\uD83C\uDDF3",
  english: "\uD83C\uDDEC\uD83C\uDDE7",
  arabic: "\uD83C\uDDF8\uD83C\uDDE6",
  hindi: "\uD83C\uDDEE\uD83C\uDDF3",
  russian: "\uD83C\uDDF7\uD83C\uDDFA",
  turkish: "\uD83C\uDDF9\uD83C\uDDF7",
  dutch: "\uD83C\uDDF3\uD83C\uDDF1",
  swedish: "\uD83C\uDDF8\uD83C\uDDEA",
  polish: "\uD83C\uDDF5\uD83C\uDDF1",
  croatian: "\uD83C\uDDED\uD83C\uDDF7",
};

function getFlag(language: string): string {
  return languageFlags[language.toLowerCase()] ?? "\uD83C\uDF0D";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Draw the share card onto a canvas context. */
function drawCard(
  ctx: CanvasRenderingContext2D,
  props: Omit<Props, "onClose">,
  scale: number = 2,
) {
  const w = CARD_WIDTH * scale;
  const h = CARD_HEIGHT * scale;
  const s = scale; // shorthand

  // --- Background gradient ---
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#f0fdf4"); // green-50
  gradient.addColorStop(0.5, "#f8fffe");
  gradient.addColorStop(1, "#ffffff");

  // Rounded rect clip
  const radius = 24 * s;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.clip();

  // Subtle border
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.roundRect(0.5 * s, 0.5 * s, w - 1 * s, h - 1 * s, radius);
  ctx.stroke();

  // --- Top: Logo + App Name ---
  ctx.fillStyle = "#16a34a"; // green-600
  ctx.font = `bold ${20 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("\uD83C\uDF3F Yiya", w / 2, 50 * s);

  // Thin separator
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(40 * s, 70 * s);
  ctx.lineTo(w - 40 * s, 70 * s);
  ctx.stroke();

  // --- Middle: Stats ---
  const statsStartY = 110 * s;
  const rowHeight = 90 * s;

  // Streak
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${48 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`\uD83D\uDD25 ${props.streak}`, w / 2, statsStartY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("day streak", w / 2, statsStartY + 24 * s);

  // Words learned
  const wordsY = statsStartY + rowHeight;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${36 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.wordsLearned}`, w / 2, wordsY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("words learned", w / 2, wordsY + 24 * s);

  // Language
  const langY = statsStartY + rowHeight * 2;
  const flag = getFlag(props.language);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${28 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${flag} ${props.language}`, w / 2, langY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("studying", w / 2, langY + 24 * s);

  // Accuracy
  const accY = statsStartY + rowHeight * 3;
  ctx.fillStyle = "#16a34a";
  ctx.font = `bold ${36 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.accuracy}%`, w / 2, accY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `500 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("accuracy", w / 2, accY + 24 * s);

  // --- Bottom: CTA + Date ---
  ctx.fillStyle = "#16a34a";
  ctx.font = `600 ${16 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("Learn with me on Yiya", w / 2, h - 50 * s);

  ctx.fillStyle = "#9ca3af";
  ctx.font = `400 ${12 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(formatDate(), w / 2, h - 28 * s);
}

export const ShareCard = ({
  streak,
  wordsLearned,
  language,
  accuracy,
  onClose,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  const flag = getFlag(language);
  const dateStr = formatDate();

  // Draw canvas on mount
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

    drawCard(ctx, { streak, wordsLearned, language, accuracy }, scale);
    setIsReady(true);
  }, [streak, wordsLearned, language, accuracy]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const dateSlug = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.download = `yiya-streak-${dateSlug}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try native Web Share API with file (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (blob) {
          const dateSlug = new Date().toISOString().slice(0, 10);
          const file = new File([blob], `yiya-streak-${dateSlug}.png`, {
            type: "image/png",
          });
          await navigator.share({
            title: "My Yiya Learning Streak",
            text: `I'm on a ${streak}-day streak learning ${language} on Yiya!`,
            files: [file],
          });
          return;
        }
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy app URL to clipboard
    try {
      await navigator.clipboard.writeText(process.env.NEXT_PUBLIC_APP_URL ?? "https://yiya.app");
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, [streak, language]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-label="Share your progress"
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

        {/* HTML Preview Card */}
        <div
          className="w-[390px] max-w-full rounded-2xl border border-neutral-200 overflow-hidden shadow-sm"
          style={{
            background: "linear-gradient(180deg, #f0fdf4 0%, #f8fffe 50%, #ffffff 100%)",
          }}
        >
          <div className="flex flex-col items-center px-8 py-8">
            {/* Logo */}
            <p className="text-xl font-bold text-green-600 mb-1">
              {"\uD83C\uDF3F"} Yiya
            </p>
            <div className="w-full border-t border-neutral-200 my-3" />

            {/* Stats */}
            <div className="flex flex-col items-center gap-6 w-full py-2">
              {/* Streak */}
              <div className="text-center">
                <p className="text-5xl font-bold text-neutral-900">
                  {"\uD83D\uDD25"} {streak}
                </p>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  day streak
                </p>
              </div>

              {/* Words Learned */}
              <div className="text-center">
                <p className="text-4xl font-bold text-neutral-900">
                  {wordsLearned}
                </p>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  words learned
                </p>
              </div>

              {/* Language */}
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">
                  {flag} {language}
                </p>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  studying
                </p>
              </div>

              {/* Accuracy */}
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">
                  {accuracy}%
                </p>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  accuracy
                </p>
              </div>
            </div>

            {/* CTA + Date */}
            <div className="mt-4 text-center">
              <p className="text-base font-semibold text-green-600">
                Learn with me on Yiya
              </p>
              <p className="text-xs text-neutral-400 mt-1">{dateStr}</p>
            </div>
          </div>
        </div>

        {/* Hidden canvas for export */}
        <canvas
          ref={canvasRef}
          className="hidden"
          aria-hidden="true"
          data-testid="share-card-canvas"
        />

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!isReady}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700 active:bg-emerald-800 transition disabled:opacity-50"
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
};
