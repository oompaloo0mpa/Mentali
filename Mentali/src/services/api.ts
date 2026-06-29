import Constants from "expo-constants";
import { Platform } from "react-native";

function resolveApiBaseUrl(): string {
  const configured = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim();

  if (configured && !configured.includes("localhost")) {
    return configured;
  }

  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (
      Constants as unknown as {
        manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
      }
    ).manifest2?.extra?.expoClient?.hostUri;

  const host = hostUri?.split(":")[0];
  if (host) {
    return `http://${host}:4000/api`;
  }

  if (Platform.OS === "android" && configured.includes("localhost")) {
    return configured.replace("localhost", "10.0.2.2");
  }

  return configured || "http://localhost:4000/api";
}

const API_BASE_URL = resolveApiBaseUrl();

type AuthMode = "phone" | "email";

async function request(path: string, options?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      `Network request failed. API base URL: ${API_BASE_URL}. Make sure backend is running and reachable from this device.`
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data;
}

export async function registerWithEmail(payload: {
  email: string;
  username: string;
  displayName: string;
  password: string;
  phone: string;
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, authProvider: "email" }),
  });
}

export async function login(payload: { mode: AuthMode; identifier: string; password: string }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** @deprecated Use login() */
export async function loginWithEmail(payload: { identifier: string; password: string }) {
  return login({ mode: "email", ...payload });
}

export async function requestResetCode(payload: { mode: AuthMode; value: string }) {
  return request("/auth/request-reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyResetCode(payload: { mode: AuthMode; value: string; code: string }) {
  return request("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: {
  mode: AuthMode;
  value: string;
  code: string;
  newPassword: string;
}) {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveDailyCheckIn(payload: {
  userId: string;
  moodEmoji: string;
  moodScore: number;
  reflectionText?: string | null;
  checkInDate: string;
}) {
  return request("/daily-checkins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveChatbotSession(payload: {
  userId: string;
  responses: { questionId: string; value: number; scale: string }[];
  overallWellbeingLevel: string;
  generatedInsight: string;
  sessionDate: string;
}) {
  return request("/chatbot-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
