/**
 * Orbit Cloud Backend API Client
 */

// If VITE_API_URL is configured (e.g. deployed Render URL), use it. Otherwise use relative /api
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

export async function sendLoginCode(email: string): Promise<{
  success: boolean;
  message: string;
  provider?: string;
  devCode?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    // If backend is unreachable (e.g. static Vite preview), fallback to client code
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      success: true,
      message: "Code generated",
      provider: "client-offline",
      devCode: fallbackCode,
    };
  }
}

export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<{
  success: boolean;
  message?: string;
  email?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: "Could not connect to authentication server",
    };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}
