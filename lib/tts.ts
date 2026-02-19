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
