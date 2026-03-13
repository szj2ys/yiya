"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Share2, X, Copy, Check } from "lucide-react";
import { track } from "@/lib/analytics";

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

/** Draw the share card onto a canvas context with vibrant design. */
function drawCard(
  ctx: CanvasRenderingContext2D,
  props: Omit<Props, "onClose">,
  scale: number = 2,
) {
  const w = CARD_WIDTH * scale;
  const h = CARD_HEIGHT * scale;
  const s = scale;

  // --- Vibrant gradient background (green-500 to green-600) ---
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#22c55e"); // green-500
  gradient.addColorStop(0.6, "#16a34a"); // green-600
  gradient.addColorStop(1, "#15803d"); // green-700

  // Rounded rect clip
  const radius = 24 * s;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.clip();

  // Decorative circles for visual interest
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.arc(w * 0.8, h * 0.2, 80 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.2, h * 0.85, 60 * s, 0, Math.PI * 2);
  ctx.fill();

  // --- Top: Logo + App Name ---
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${24 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("\uD83C\uDF3F Yiya", w / 2, 55 * s);

  // White separator
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(60 * s, 80 * s);
  ctx.lineTo(w - 60 * s, 80 * s);
  ctx.stroke();

  // --- Middle: Stats with larger text ---
  const statsStartY = 130 * s;
  const rowHeight = 95 * s;

  // Streak - biggest number
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${56 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`\uD83D\uDD25 ${props.streak}`, w / 2, statsStartY);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `600 ${16 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("day streak", w / 2, statsStartY + 28 * s);

  // Words learned
  const wordsY = statsStartY + rowHeight;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${40 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.wordsLearned}`, w / 2, wordsY);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `600 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("words learned", w / 2, wordsY + 24 * s);

  // Language
  const langY = statsStartY + rowHeight * 2;
  const flag = getFlag(props.language);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${32 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${flag} ${props.language}`, w / 2, langY);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `600 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("studying", w / 2, langY + 24 * s);

  // Accuracy
  const accY = statsStartY + rowHeight * 3;
  ctx.fillStyle = "#fbbf24"; // amber-400 for contrast
  ctx.font = `bold ${40 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(`${props.accuracy}%`, w / 2, accY);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `600 ${14 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("accuracy", w / 2, accY + 24 * s);

  // --- Bottom: CTA + Date ---
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${18 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("Learn with me on Yiya", w / 2, h - 45 * s);

  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = `500 ${12 * s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(formatDate(), w / 2, h - 22 * s);
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
  const [copied, setCopied] = useState(false);

  const flag = getFlag(language);
  const dateStr = formatDate();

  // Track when card is opened
  useEffect(() => {
    track("share_card_opened", { type: "streak_card", streak, accuracy });
  }, [streak, accuracy]);

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

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    track("share_attempted", { type: "streak_card", method: "download" });

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const dateSlug = new Date().toISOString().slice(0, 10);
      const link = document.createElement("a");
      link.download = `yiya-streak-${dateSlug}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      track("share_completed", { type: "streak_card", method: "download", success: true });
      toast.success("Image downloaded!");
    } catch {
      track("share_completed", { type: "streak_card", method: "download", success: false });
      toast.error("Could not download image.");
    }
  }, []);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    track("share_attempted", { type: "streak_card", method: "native" });

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
          track("share_completed", { type: "streak_card", method: "native", success: true });
          return;
        }
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy text to clipboard
    track("share_attempted", { type: "streak_card", method: "clipboard" });
    try {
      const text = `I'm on a ${streak}-day streak learning ${language} on Yiya! \uD83D\uDD25\n\nJoin me: https://yiya.app`;
      await navigator.clipboard.writeText(text);
      track("share_completed", { type: "streak_card", method: "clipboard", success: true });
      toast.success("Copied to clipboard!");
    } catch {
      track("share_completed", { type: "streak_card", method: "clipboard", success: false });
      toast.error("Could not copy to clipboard.");
    }
  }, [streak, language]);

  const handleCopyText = useCallback(async () => {
    track("share_attempted", { type: "streak_card", method: "clipboard" });
    try {
      const text = `I'm on a ${streak}-day streak learning ${language} on Yiya! \uD83D\uDD25\n\nJoin me: https://yiya.app`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track("share_completed", { type: "streak_card", method: "clipboard", success: true });
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      track("share_completed", { type: "streak_card", method: "clipboard", success: false });
      toast.error("Could not copy to clipboard.");
    }
  }, [streak, language]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-label="Share your progress"
    >
      <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-5 shadow-2xl max-w-[420px] w-full">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* HTML Preview Card with vibrant gradient */}
        <div
          className="w-full max-w-[390px] rounded-2xl overflow-hidden shadow-lg"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)",
          }}
        >
          <div className="flex flex-col items-center px-6 py-6 text-white">
            {/* Logo */}
            <p className="text-2xl font-bold mb-1">
              {"\uD83C\uDF3F"} Yiya
            </p>
            <div className="w-full border-t border-white/30 my-3" />

            {/* Stats */}
            <div className="flex flex-col items-center gap-5 w-full py-2">
              {/* Streak - largest */}
              <div className="text-center">
                <p className="text-6xl font-bold">
                  {"\uD83D\uDD25"} {streak}
                </p>
                <p className="text-base font-semibold text-white/90 mt-1">
                  day streak
                </p>
              </div>

              {/* Words Learned */}
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {wordsLearned}
                </p>
                <p className="text-sm font-medium text-white/90 mt-1">
                  words learned
                </p>
              </div>

              {/* Language */}
              <div className="text-center">
                <p className="text-3xl font-bold">
                  {flag} {language}
                </p>
                <p className="text-sm font-medium text-white/90 mt-1">
                  studying
                </p>
              </div>

              {/* Accuracy */}
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-300">
                  {accuracy}%
                </p>
                <p className="text-sm font-medium text-white/90 mt-1">
                  accuracy
                </p>
              </div>
            </div>

            {/* CTA + Date */}
            <div className="mt-4 text-center">
              <p className="text-lg font-bold">
                Learn with me on Yiya
              </p>
              <p className="text-xs text-white/70 mt-1">{dateStr}</p>
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

        {/* Action buttons - stacked for better mobile UX */}
        <div className="flex flex-col gap-2 w-full">
          <button
            type="button"
            onClick={handleShare}
            disabled={!isReady}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-white font-semibold py-3 hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 shadow-sm"
          >
            <Share2 className="h-5 w-5" />
            Share
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!isReady}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 text-neutral-700 font-semibold py-3 hover:bg-neutral-200 active:bg-neutral-300 transition disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              Download
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              disabled={!isReady}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 text-neutral-700 font-semibold py-3 hover:bg-neutral-200 active:bg-neutral-300 transition disabled:opacity-50"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
