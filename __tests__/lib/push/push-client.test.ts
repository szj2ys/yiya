import { describe, it, expect } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/push";

describe("push client utilities", () => {
  it("should convert base64 VAPID key to Uint8Array", () => {
    // A known base64url-encoded string
    const base64 = "SGVsbG8gV29ybGQ"; // "Hello World" in base64url
    const result = urlBase64ToUint8Array(base64);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);

    // Decode back to verify
    const decoded = String.fromCharCode(...Array.from(result));
    expect(decoded).toBe("Hello World");
  });

  it("should handle base64url padding correctly", () => {
    // Test with a string that needs padding
    const base64 = "YQ"; // "a" - needs 2 padding chars
    const result = urlBase64ToUint8Array(base64);
    expect(String.fromCharCode(...Array.from(result))).toBe("a");
  });

  it("should handle base64url special characters", () => {
    // base64url uses - and _ instead of + and /
    const base64url = "dGVzdC1kYXRh"; // "test-data"
    const result = urlBase64ToUint8Array(base64url);
    const decoded = String.fromCharCode(...Array.from(result));
    expect(decoded).toBe("test-data");
  });
});
