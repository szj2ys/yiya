import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  getReferralData,
  clearReferralData,
  captureUtmParams,
  getServerReferralData,
  syncReferralCookie,
} from "@/lib/referral";
import { buildTrackPayload } from "@/lib/analytics";

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage });
Object.defineProperty(globalThis, "document", {
  value: { cookie: "" },
  writable: true,
});

describe("referral", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    document.cookie = "";
  });

  describe("getReferralData", () => {
    it("should return empty object when no referral data exists", () => {
      expect(getReferralData()).toEqual({});
    });

    it("should return challenge referral from localStorage", () => {
      mockLocalStorage.setItem("yiya_ref_challenge", "abc-123");
      expect(getReferralData()).toEqual({ ref_source: "challenge", ref_id: "abc-123" });
    });

    it("should return UTM data from localStorage", () => {
      mockLocalStorage.setItem("yiya_utm", JSON.stringify({ utm_source: "twitter", utm_campaign: "launch" }));
      expect(getReferralData()).toEqual({ utm_source: "twitter", utm_campaign: "launch" });
    });

    it("should combine challenge and UTM data", () => {
      mockLocalStorage.setItem("yiya_ref_challenge", "abc-123");
      mockLocalStorage.setItem("yiya_utm", JSON.stringify({ utm_source: "twitter" }));
      expect(getReferralData()).toEqual({
        ref_source: "challenge",
        ref_id: "abc-123",
        utm_source: "twitter",
      });
    });
  });

  describe("clearReferralData", () => {
    it("should remove all referral keys from localStorage", () => {
      mockLocalStorage.setItem("yiya_ref_challenge", "abc");
      mockLocalStorage.setItem("yiya_utm", "{}");
      clearReferralData();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("yiya_ref_challenge");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("yiya_utm");
    });
  });

  describe("captureUtmParams", () => {
    it("should capture UTM params from URL and store in localStorage", () => {
      Object.defineProperty(globalThis, "location", {
        value: { search: "?utm_source=twitter&utm_medium=social&utm_campaign=launch" },
        writable: true,
        configurable: true,
      });

      captureUtmParams();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "yiya_utm",
        JSON.stringify({ utm_source: "twitter", utm_medium: "social", utm_campaign: "launch" }),
      );
    });

    it("should not store when no UTM params present", () => {
      Object.defineProperty(globalThis, "location", {
        value: { search: "" },
        writable: true,
        configurable: true,
      });

      captureUtmParams();

      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith("yiya_utm", expect.anything());
    });
  });

  describe("getServerReferralData", () => {
    it("should return empty object for null cookie", () => {
      expect(getServerReferralData(null)).toEqual({});
    });

    it("should parse referral data from encoded cookie value", () => {
      const data = { ref_source: "challenge", ref_id: "abc-123", utm_source: "twitter" };
      const cookie = encodeURIComponent(JSON.stringify(data));
      expect(getServerReferralData(cookie)).toEqual(data);
    });

    it("should return empty object for malformed cookie", () => {
      expect(getServerReferralData("not-json")).toEqual({});
    });
  });

  describe("syncReferralCookie", () => {
    it("should set cookie when referral data exists", () => {
      mockLocalStorage.setItem("yiya_ref_challenge", "abc-123");
      syncReferralCookie();
      expect(document.cookie).toContain("yiya_ref=");
    });
  });
});

describe("analytics referral types", () => {
  it("should accept ref_source and ref_id in signup_completed", () => {
    const payload = buildTrackPayload("signup_completed", {
      user_id: "user-1",
      ref_source: "challenge",
      ref_id: "abc-123",
      utm_source: "twitter",
    });
    expect(payload.properties).toMatchObject({
      user_id: "user-1",
      ref_source: "challenge",
      ref_id: "abc-123",
      utm_source: "twitter",
    });
  });

  it("should accept ref_source and ref_id in user_activated", () => {
    const payload = buildTrackPayload("user_activated", {
      user_id: "user-1",
      lesson_count: 3,
      ref_source: "challenge",
      ref_id: "abc-123",
    });
    expect(payload.properties).toMatchObject({
      user_id: "user-1",
      lesson_count: 3,
      ref_source: "challenge",
      ref_id: "abc-123",
    });
  });
});
