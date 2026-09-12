/**
 * Orbit Cloud Backend API Client
 */

// If VITE_API_URL is configured (e.g. deployed Render URL), use it. Otherwise use relative /api
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

export async function registerAccount(
  identifier: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message:
        "Could not connect to authentication server. Please check your network.",
    };
  }
}

export async function loginAccount(
  identifier: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    return data;
  } catch {
    return {
      success: false,
      message:
        "Could not connect to authentication server. Please check your network.",
    };
  }
}

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
  } catch {
    // If backend is unreachable (e.g. static Vite preview), fallback to client code
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      success: true,
      message: "Code generated locally (offline mode)",
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
  } catch {
    return {
      success: false,
      message: "Could not connect to authentication server",
    };
  }
}

/**
 * Fetch synchronized cloud data from Upstash Redis
 */
export async function fetchCloudUserData(email: string): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/user/data?email=${encodeURIComponent(email)}`,
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export type SyncResponse = {
  success: boolean;
  cloudData?: any;
};

/**
 * Sync user financial profile to Upstash Redis for multi-device access
 */
export async function syncCloudUserData(
  email: string,
  data: any,
): Promise<SyncResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/user/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, data }),
    });
    if (!res.ok) return { success: false };
    const json = await res.json();
    return {
      success: true,
      cloudData: json.data,
    };
  } catch {
    return { success: false };
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
