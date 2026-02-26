import { describe, it, expect } from "vitest";
import { pushSubscriptions } from "@/db/schema";

describe("pushSubscriptions schema", () => {
  it("should have id column as primary key", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.id).toBeDefined();
    expect(columns.id.name).toBe("id");
    expect(columns.id.primary).toBe(true);
  });

  it("should have userId column that is not null", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.userId).toBeDefined();
    expect(columns.userId.name).toBe("user_id");
    expect(columns.userId.notNull).toBe(true);
  });

  it("should have endpoint column that is not null", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.endpoint).toBeDefined();
    expect(columns.endpoint.name).toBe("endpoint");
    expect(columns.endpoint.notNull).toBe(true);
  });

  it("should have p256dh column that is not null", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.p256dh).toBeDefined();
    expect(columns.p256dh.name).toBe("p256dh");
    expect(columns.p256dh.notNull).toBe(true);
  });

  it("should have auth column that is not null", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.auth).toBeDefined();
    expect(columns.auth.name).toBe("auth");
    expect(columns.auth.notNull).toBe(true);
  });

  it("should have createdAt timestamp column with default", () => {
    const columns = pushSubscriptions as Record<string, any>;
    expect(columns.createdAt).toBeDefined();
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.createdAt.hasDefault).toBe(true);
  });
});
