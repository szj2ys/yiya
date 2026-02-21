/**
 * Browser-native TTS (Text-to-Speech) utility wrapping the Web Speech API.
 *
 * Zero cost, offline-capable, no API keys required.
 * Gracefully degrades to a no-op on unsupported browsers.
 */

const LANGUAGE_MAP: Record<string, string> = {
  Spanish: "es-ES",
  French: "fr-FR",
  Italian: "it-IT",
  Japanese: "ja-JP",
  Chinese: "zh-CN",
  English: "en-US",
};

// ---------------------------------------------------------------------------
// Mute state
// ---------------------------------------------------------------------------

const MUTE_KEY = "yiya-muted";

let _muted = false;
let _mutedLoaded = false;

/** Whether TTS is currently muted. Lazy-loads from localStorage on first call. */
export function isMuted(): boolean {
  if (!_mutedLoaded) {
    try {
      _muted = typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "true";
    } catch {
      // localStorage unavailable — default to unmuted
    }
    _mutedLoaded = true;
  }
  return _muted;
}

/** Set mute state and persist to localStorage. */
export function setMuted(muted: boolean): void {
  _muted = muted;
  _mutedLoaded = true;
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_KEY, String(muted));
    }
  } catch {
    // localStorage unavailable — ignore
  }
}

/** Toggle mute state. Returns the new muted value. */
export function toggleMute(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

/**
 * Reset internal mute cache. **Only for tests** — forces the next `isMuted()`
 * call to re-read localStorage.
 */
export function _resetMuteCache(): void {
  _muted = false;
  _mutedLoaded = false;
}

/**
 * Map a course language name (e.g. "Spanish") to a BCP-47 language tag
 * (e.g. "es-ES"). Returns the input unchanged if no mapping exists,
 * so pre-mapped tags like "es-ES" pass through.
 */
export function mapLanguage(courseLanguage: string): string {
  return LANGUAGE_MAP[courseLanguage] ?? courseLanguage;
}

/** Check whether the browser supports the Web Speech API. */
export function isTtsSupported(): boolean {
  return (
    typeof window !== "undefined" && "speechSynthesis" in window
  );
}

/**
 * Speak the given text aloud using the browser's speech synthesis.
 *
 * @param text  - The text to pronounce.
 * @param lang  - A BCP-47 language tag (e.g. "es-ES") **or** a course
 *                language name (e.g. "Spanish") that will be mapped
 *                automatically.
 *
 * Silently does nothing when:
 * - The browser does not support `speechSynthesis`
 * - The text is empty
 */
export function speak(text: string, lang: string): void {
  if (isMuted()) return;
  if (!text || !isTtsSupported()) return;

  try {
    // Cancel any in-progress utterance to avoid overlap.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = mapLanguage(lang);
    utterance.rate = 0.9; // Slightly slower for language learners
    window.speechSynthesis.speak(utterance);
  } catch {
    // Silently swallow — never block the UI.
  }
}
