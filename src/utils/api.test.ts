import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerAccount, loginAccount } from "./api";

describe("API Client Auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registerAccount calls /api/auth/register and returns response", async () => {
    const mockResponse = {
      success: true,
      email: "tester",
      message: "Account registered successfully",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const res = await registerAccount("tester", "password123");
    expect(res.success).toBe(true);
    expect(res.email).toBe("tester");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/register"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ identifier: "tester", password: "password123" }),
      }),
    );
  });

  it("loginAccount calls /api/auth/login and handles incorrect password", async () => {
    const mockResponse = {
      success: false,
      message: "Incorrect password. Please try again.",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => mockResponse,
    });

    const res = await loginAccount("tester", "wrongpass");
    expect(res.success).toBe(false);
    expect(res.message).toBe("Incorrect password. Please try again.");
  });

  it("loginAccount handles network outage gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    const res = await loginAccount("tester", "mypassword");
    expect(res.success).toBe(false);
    expect(res.message).toContain("Could not connect");
  });
});
