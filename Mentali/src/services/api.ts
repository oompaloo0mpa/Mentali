import Constants from "expo-constants";
import { Platform } from "react-native";
import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";

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

function getApiOrigin(): string {
  return new URL(API_BASE_URL).origin;
}

function guessMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
  };
  return map[ext] ?? 'application/octet-stream';
}

export function isRemoteMediaUri(uri?: string | null): boolean {
  return !!uri && (/^https?:\/\//i.test(uri) || uri.startsWith('/api/uploads/'));
}

/** Build a device-reachable URL for chat attachments stored on the API server. */
export function resolveMediaUrl(uri?: string | null): string | undefined {
  if (!uri) return undefined;

  // Local file preview while a message is sending optimistically.
  if (!uri.startsWith('/') && !/^https?:\/\//i.test(uri)) {
    return uri;
  }

  const apiOrigin = getApiOrigin();

  if (uri.startsWith('/api/')) {
    return `${apiOrigin}${uri}`;
  }

  if (/^https?:\/\//i.test(uri)) {
    try {
      const parsed = new URL(uri);
      if (parsed.pathname.startsWith('/api/uploads/')) {
        return `${apiOrigin}${parsed.pathname}`;
      }
      const loopback =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === '10.0.2.2';
      if (loopback) {
        return `${apiOrigin}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return uri;
    }
  }

  return uri;
}

export async function uploadChatAttachment(
  localUri: string,
  fileName: string,
  mimeType?: string,
): Promise<string> {
  const base64 = await readAsStringAsync(localUri, {
    encoding: EncodingType.Base64,
  });
  if (!base64) throw new Error('Could not read attachment');

  const result = await apiRequest('/chats/uploads', {
    method: 'POST',
    body: JSON.stringify({
      fileName,
      mimeType: mimeType || guessMimeType(fileName),
      data: base64,
    }),
  });
  const url = String(result?.url ?? '');
  if (!url) throw new Error('Upload failed');
  return url;
}

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
  currentTier?: string;
  leaderboardRank?: number | null;
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
  trackKey?: string | null;
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
  replyToMessageId?: string | null;
  replyToText?: string | null;
  replyToSenderUserId?: string | null;
  pinned?: boolean;
  editedAt?: string | null;
  deletedAt?: string | null;
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
    replyToMessageId?: string;
  },
): Promise<{ data: ChatMessageRow; streak?: number; streakUnlocked?: boolean }> {
  return apiRequest(`/chats/${friendshipId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function editChatMessage(
  friendshipId: string,
  messageId: string,
  payload: { senderUserId: string; text: string },
) {
  return apiRequest(`/chats/${friendshipId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, action: 'edit' }),
  });
}

export async function pinChatMessage(
  friendshipId: string,
  messageId: string,
  payload: { senderUserId: string; pinned: boolean },
) {
  return apiRequest(`/chats/${friendshipId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...payload, action: payload.pinned ? 'pin' : 'unpin' }),
  });
}

export async function deleteChatMessage(
  friendshipId: string,
  messageId: string,
  payload: { senderUserId: string },
) {
  return apiRequest(`/chats/${friendshipId}/messages/${messageId}`, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  });
}

export async function deleteAccount(userId: string) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' });
}
