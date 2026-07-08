import Constants from "expo-constants";
import { Platform } from "react-native";

import type { DailyCheckInDoc } from "@/services/wellbeingHistory";
import { getAuthToken, loadAuthToken } from "@/storage/authStorage";

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
type SocialProvider = "apple" | "google";

export async function apiRequest(path: string, options?: RequestInit) {
  const token = getAuthToken() ?? (await loadAuthToken());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
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
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, authProvider: "email" }),
  });
}

export async function login(payload: { mode: AuthMode; identifier: string; password: string }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginWithSocial(payload: {
  provider: SocialProvider;
  email?: string;
  fullName?: string;
  identityToken?: string;
  authorizationCode?: string;
  accessToken?: string;
}) {
  return apiRequest("/auth/social", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** @deprecated Use login() */
export async function loginWithEmail(payload: { identifier: string; password: string }) {
  return login({ mode: "email", ...payload });
}

export async function requestResetCode(payload: { mode: AuthMode; value: string }) {
  return apiRequest("/auth/request-reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyResetCode(payload: { mode: AuthMode; value: string; code: string }) {
  return apiRequest("/auth/verify-reset-code", {
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
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveDailyCheckIn(payload: {
  userId: string;
  moodId?: string;
  moodEmoji: string;
  moodScore: number;
  reflectionText?: string | null;
  checkInDate: string;
  phq4?: {
    total: number;
    anxietyScore: number;
    moodScore: number;
    band: string;
    suggestSupport: boolean;
    answeredCount: number;
    itemCount: number;
  } | null;
  k10?: {
    total: number;
    band: string;
    suggestSupport: boolean;
    answeredCount: number;
    itemCount: number;
  } | null;
  responses?: {
    questionId: string;
    scale: string;
    dimension: string;
    value: number;
    label: string;
    skipped?: boolean;
    confidence?: number;
    source?: string;
  }[];
}) {
  return apiRequest("/daily-checkins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchWellbeingHistory(userId: string): Promise<DailyCheckInDoc[]> {
  const result = await apiRequest(`/daily-checkins/${userId}`);
  return (result?.data ?? []) as DailyCheckInDoc[];
}

export async function fetchUserPreferences(userId: string) {
  const result = await apiRequest(`/preferences/${userId}`);
  return result?.data ?? null;
}

export async function updateUserPreferences(
  userId: string,
  payload: {
    anonymousMode?: boolean;
    showMoodToFriends?: boolean;
    allowFriendRequests?: boolean;
    leaderboardNotifications?: boolean;
    encouragementNotifications?: boolean;
    dailyReminderEnabled?: boolean;
    theme?: string;
    currentMoodId?: string;
    currentMoodEmoji?: string;
  },
) {
  const result = await apiRequest(`/preferences/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return result?.data ?? null;
}

export type FriendListRow = {
  id: string;
  userId: string;
  name: string;
  code?: string;
  streak: number;
  lastSeen: string;
  streakDone: boolean;
  lastStreakDoneDate?: string | null;
  lastStreakDate?: string | null;
  addedAt?: number;
  blocked?: boolean;
  moodId?: string;
  moodEmoji?: string;
};

export type FriendRequestRow = {
  id: string;
  userId: string;
  name: string;
  username?: string | null;
  anonymousMode?: boolean;
};

export async function fetchFriendsView(userId: string): Promise<{
  friends: FriendListRow[];
  requests: FriendRequestRow[];
}> {
  const result = await apiRequest(`/friends/view/${userId}`);
  return {
    friends: result?.friends ?? [],
    requests: result?.requests ?? [],
  };
}

export async function bootstrapFriendsIfEmpty(userId: string) {
  return apiRequest(`/friends/bootstrap/${userId}`, { method: 'POST' });
}

export async function fetchUserProfile(userId: string) {
  const result = await apiRequest(`/users/${userId}`);
  return result?.user ?? null;
}

export async function updateUserProfile(
  userId: string,
  payload: { displayName?: string; username?: string; onboardingCompleted?: boolean },
) {
  const result = await apiRequest(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return result?.user ?? null;
}

export async function blockFriendship(friendshipId: string) {
  return apiRequest(`/friends/${friendshipId}/block`, { method: "POST" });
}

export async function completeUserQuest(userQuestId: string) {
  return apiRequest(`/user-quests/${userQuestId}/complete`, { method: 'POST' });
}

export type NotificationRow = {
  id: string;
  icon: 'person-add' | 'flame' | 'chatbubble-ellipses' | 'trophy';
  title: string;
  time: string;
  read: boolean;
  recent: boolean;
  createdAt?: string;
};

export async function fetchNotifications(userId: string): Promise<NotificationRow[]> {
  const result = await apiRequest(`/notifications/${userId}`);
  return (result?.data ?? []) as NotificationRow[];
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(userId: string) {
  return apiRequest(`/notifications/${userId}/read-all`, { method: 'PATCH' });
}

export async function clearNotifications(userId: string) {
  return apiRequest(`/notifications/${userId}`, { method: 'DELETE' });
}

export async function fetchActiveQuests() {
  const result = await apiRequest("/quests/active");
  return result?.data ?? [];
}

export type DailyQuestRow = {
  id: string;
  questId: string;
  title: string;
  description: string;
  rewardPoints: number;
  category: "social" | "checkin" | "reflection";
  completed: boolean;
  completedAt?: string | null;
};

export async function fetchDailyQuests(userId: string): Promise<DailyQuestRow[]> {
  const result = await apiRequest(`/user-quests/${userId}/daily`);
  return (result?.data ?? []) as DailyQuestRow[];
}

export async function assignDailyQuests(
  userId: string,
  count = 3,
  replace = false,
): Promise<DailyQuestRow[]> {
  const result = await apiRequest("/user-quests/assign-daily", {
    method: "POST",
    body: JSON.stringify({ userId, count, replace }),
  });
  return (result?.data ?? []) as DailyQuestRow[];
}

export async function fetchUserQuests(userId: string) {
  const result = await apiRequest(`/user-quests/${userId}`);
  return result?.data ?? [];
}

export async function fetchShopItems() {
  const result = await apiRequest("/shop/items");
  return result?.data ?? [];
}

export async function lookupUserByFriendCode(code: string, viewerId?: string | null) {
  const params = new URLSearchParams({ code });
  if (viewerId) params.set("viewerId", viewerId);
  const result = await apiRequest(`/users/lookup-by-code?${params.toString()}`);
  return result?.user ?? null;
}

export async function requestFriendByCode(fromUserId: string, friendCode: string) {
  return apiRequest("/friends/request-by-code", {
    method: "POST",
    body: JSON.stringify({ fromUserId, friendCode }),
  });
}

export async function acceptFriendRequest(requestId: string) {
  return apiRequest(`/friends/${requestId}/accept`, { method: 'POST' });
}

export async function rejectFriendRequest(requestId: string) {
  return apiRequest(`/friends/${requestId}/reject`, { method: 'POST' });
}

/** Delete the friendship document so either user can re-add the other later. */
export async function removeFriendship(friendshipId: string) {
  return apiRequest(`/friends/${friendshipId}/reject`, { method: 'POST' });
}

export type ChatMessageRow = {
  _id: string;
  friendshipId: string;
  senderUserId: string;
  recipientUserId: string;
  text: string;
  imageUri?: string;
  fileName?: string;
  fileUri?: string;
  createdAt: string;
};

export async function fetchChatMessages(friendshipId: string, viewerUserId: string): Promise<ChatMessageRow[]> {
  const params = new URLSearchParams({ viewerUserId });
  const result = await apiRequest(`/chats/${friendshipId}/messages?${params.toString()}`);
  return result?.data ?? [];
}

export async function sendChatMessage(
  friendshipId: string,
  payload: {
    senderUserId: string;
    text: string;
    imageUri?: string;
    fileName?: string;
    fileUri?: string;
  },
): Promise<{ data: ChatMessageRow; streak?: number; streakUnlocked?: boolean }> {
  return apiRequest(`/chats/${friendshipId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(userId: string) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' });
}
