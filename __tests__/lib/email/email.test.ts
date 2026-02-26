import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

describe("sendEmail", () => {
  beforeEach(() => {
    vi.resetModules();
    sendMock.mockReset();
  });

  it("should send email when API key is configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockResolvedValue({ id: "email_123" });

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result).toBe(true);
    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      }),
    );
  });

  it("should no-op when API key is missing", async () => {
    delete process.env.RESEND_API_KEY;

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("should return false when send throws", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    sendMock.mockRejectedValue(new Error("API error"));

    const { sendEmail } = await import("@/lib/email");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result).toBe(false);
  });
});
