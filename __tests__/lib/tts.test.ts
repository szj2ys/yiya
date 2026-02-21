import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { speak, isTtsSupported, mapLanguage, isMuted, setMuted, toggleMute, _resetMuteCache } from "@/lib/tts";

describe("tts utility", () => {
  describe("mapLanguage", () => {
    it("should map course language to BCP-47 tag", () => {
      expect(mapLanguage("Spanish")).toBe("es-ES");
      expect(mapLanguage("French")).toBe("fr-FR");
      expect(mapLanguage("Italian")).toBe("it-IT");
      expect(mapLanguage("Japanese")).toBe("ja-JP");
      expect(mapLanguage("Chinese")).toBe("zh-CN");
      expect(mapLanguage("English")).toBe("en-US");
    });

    it("should pass through already-mapped BCP-47 tags", () => {
      expect(mapLanguage("es-ES")).toBe("es-ES");
      expect(mapLanguage("fr-FR")).toBe("fr-FR");
    });

    it("should return the input for unknown languages", () => {
      expect(mapLanguage("Klingon")).toBe("Klingon");
    });
  });

  describe("isTtsSupported", () => {
    it("should return true when speechSynthesis is available", () => {
      // jsdom environment — speechSynthesis may or may not exist,
      // but we can define it for the test.
      Object.defineProperty(window, "speechSynthesis", {
        value: { speak: vi.fn(), cancel: vi.fn() },
        writable: true,
        configurable: true,
      });
      expect(isTtsSupported()).toBe(true);
    });

    it("should return false when speechSynthesis is unavailable", () => {
      const original = window.speechSynthesis;
      // @ts-expect-error — intentionally removing for test
      delete window.speechSynthesis;
      expect(isTtsSupported()).toBe(false);
      // Restore
      Object.defineProperty(window, "speechSynthesis", {
        value: original,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("speak", () => {
    let mockSpeak: ReturnType<typeof vi.fn>;
    let mockCancel: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSpeak = vi.fn();
      mockCancel = vi.fn();
      Object.defineProperty(window, "speechSynthesis", {
        value: { speak: mockSpeak, cancel: mockCancel },
        writable: true,
        configurable: true,
      });

      // Mock SpeechSynthesisUtterance
      vi.stubGlobal(
        "SpeechSynthesisUtterance",
        class {
          text: string;
          lang = "";
          rate = 1;
          constructor(text: string) {
            this.text = text;
          }
        },
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should call speechSynthesis.speak with correct language", () => {
      speak("hola", "Spanish");

      expect(mockCancel).toHaveBeenCalled();
      expect(mockSpeak).toHaveBeenCalledOnce();

      const utterance = mockSpeak.mock.calls[0][0];
      expect(utterance.text).toBe("hola");
      expect(utterance.lang).toBe("es-ES");
      expect(utterance.rate).toBe(0.9);
    });

    it("should not throw when speechSynthesis is unavailable", () => {
      // @ts-expect-error — intentionally removing for test
      delete window.speechSynthesis;

      expect(() => speak("hello", "English")).not.toThrow();
    });

    it("should not speak empty text", () => {
      speak("", "Spanish");

      expect(mockSpeak).not.toHaveBeenCalled();
    });

    it("should cancel previous utterance before speaking new one", () => {
      speak("bonjour", "French");
      speak("merci", "French");

      expect(mockCancel).toHaveBeenCalledTimes(2);
    });

    it("should not speak when muted", () => {
      setMuted(true);
      speak("hola", "Spanish");

      expect(mockSpeak).not.toHaveBeenCalled();
      expect(mockCancel).not.toHaveBeenCalled();

      // Clean up
      setMuted(false);
    });
  });

  describe("mute state", () => {
    beforeEach(() => {
      localStorage.clear();
      _resetMuteCache();
    });

    afterEach(() => {
      _resetMuteCache();
    });

    it("should default to unmuted", () => {
      expect(isMuted()).toBe(false);
    });

    it("should persist mute preference to localStorage", () => {
      setMuted(true);
      expect(localStorage.getItem("yiya-muted")).toBe("true");
      expect(isMuted()).toBe(true);

      setMuted(false);
      expect(localStorage.getItem("yiya-muted")).toBe("false");
      expect(isMuted()).toBe(false);
    });

    it("should lazy-load mute preference from localStorage", () => {
      localStorage.setItem("yiya-muted", "true");
      _resetMuteCache();

      expect(isMuted()).toBe(true);
    });

    it("should toggle mute state", () => {
      expect(isMuted()).toBe(false);

      const result1 = toggleMute();
      expect(result1).toBe(true);
      expect(isMuted()).toBe(true);

      const result2 = toggleMute();
      expect(result2).toBe(false);
      expect(isMuted()).toBe(false);
    });

    it("should persist toggle to localStorage", () => {
      toggleMute(); // false → true
      expect(localStorage.getItem("yiya-muted")).toBe("true");

      toggleMute(); // true → false
      expect(localStorage.getItem("yiya-muted")).toBe("false");
    });
  });
});
