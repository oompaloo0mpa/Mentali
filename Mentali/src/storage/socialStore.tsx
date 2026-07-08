import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { moodById } from '@/data/moods';
import {
  acceptFriendRequest,
  blockFriendship,
  bootstrapFriendsIfEmpty,
  clearNotifications as clearNotificationsApi,
  fetchChatMessages,
  fetchFriendsView,
  fetchNotifications,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
  rejectFriendRequest,
  removeFriendship,
  requestFriendByCode,
  sendChatMessage,
  type ChatMessageRow,
  type FriendListRow,
  type FriendRequestRow,
  type NotificationRow,
} from '@/services/api';
import { completeSocialQuests } from '@/services/dailyQuestProgress';

import {
  DAILY_QUESTS,
  findDirectoryUser,
  FRIENDS,
  INCOMING_REQUESTS,
  INITIAL_CHATS,
  MILESTONES,
  seedGreeting,
  type AppNotification,
  type ChatMessage,
  type Friend,
  type FriendRequest,
  type Quest,
} from '@/data/mockData';
import { useUserProfile } from '@/storage/userProfileStore';

const STORAGE_KEY = 'mentali.social.v7';
const LEGACY_STORAGE_KEYS = ['mentali.social.v6', 'mentali.social.v5', 'mentali.social.v4'];

function mapNotificationRows(rows: NotificationRow[]): AppNotification[] {
  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    time: row.time,
    read: row.read,
    recent: row.recent,
  }));
}

/** Friends added within this many days show under the "New" filter. */
export const NEW_FRIEND_DAYS = 7;

export type AddFriendResult = { ok: boolean; message: string };

export type MuteDuration = '8h' | '24h' | '1w';

const MUTE_MS: Record<MuteDuration, number> = {
  '8h': 8 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
};

type SocialState = {
  friends: Friend[];
  requests: FriendRequest[];
  chats: Record<string, ChatMessage[]>;
  notifications: AppNotification[];
  quests: Quest[];
  questDate: string;
  /** Highest milestone already celebrated per friend, so a celebration only shows once. */
  celebrated: Record<string, number>;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(today = todayKey()): string {
  const d = new Date(`${today}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function applyMessageStreak(
  friend: Friend,
  today = todayKey(),
): { streak: number; lastStreakDate: string; unlocked: boolean } {
  const lastDate = friend.lastStreakDate ?? null;
  if (lastDate === today) {
    return { streak: friend.streak, lastStreakDate: today, unlocked: false };
  }

  let newStreak: number;
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate === yesterdayKey(today)) {
    newStreak = friend.streak + 1;
  } else {
    newStreak = 1;
  }

  return {
    streak: newStreak,
    lastStreakDate: today,
    unlocked: friend.streak === 0 && newStreak >= 1,
  };
}

function freshQuests(): Quest[] {
  return DAILY_QUESTS.map((q) => ({ ...q, progress: 0, rewarded: false }));
}

function initialState(): SocialState {
  const friends = FRIENDS.map((f) => normalizeFriend({ ...f }));
  return {
    friends,
    requests: normalizeIncomingRequests(friends, INCOMING_REQUESTS),
    chats: Object.fromEntries(Object.entries(INITIAL_CHATS).map(([id, msgs]) => [id, msgs.map((m) => ({ ...m }))])),
    notifications: [],
    quests: freshQuests(),
    questDate: todayKey(),
    celebrated: {},
  };
}

function friendNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Drop stale demo requests and ensure the anonymous Riley demo is available. */
function normalizeIncomingRequests(friends: Friend[], stored: FriendRequest[] | undefined): FriendRequest[] {
  const friendNames = new Set(friends.map((f) => friendNameKey(f.name)));

  const pending = (stored ?? [])
    .map((request) => {
      // Legacy seed stored Alex without anonymousMode — upgrade to the Riley demo.
      if (request.id === 'r1' && friendNameKey(request.name) === 'alex' && !request.anonymousMode) {
        return { ...INCOMING_REQUESTS[0] };
      }
      return request;
    })
    .filter((request) => !friendNames.has(friendNameKey(request.name)));

  const pendingNames = new Set(pending.map((r) => friendNameKey(r.name)));

  if (pending.length === 0 && !friendNames.has('riley')) {
    return INCOMING_REQUESTS.map((r) => ({ ...r }));
  }

  for (const seed of INCOMING_REQUESTS) {
    const key = friendNameKey(seed.name);
    if (!friendNames.has(key) && !pendingNames.has(key)) {
      pending.push({ ...seed });
    }
  }

  return pending;
}

function hydrateSocialState(parsed: Partial<SocialState>): SocialState {
  const base = initialState();
  const friends = (parsed.friends ?? base.friends).map(normalizeFriend);
  const questDateStale = parsed.questDate !== todayKey();

  return {
    ...base,
    ...parsed,
    friends,
    requests: normalizeIncomingRequests(friends, parsed.requests),
    quests: questDateStale ? freshQuests() : (parsed.quests ?? base.quests),
    questDate: questDateStale ? todayKey() : (parsed.questDate ?? base.questDate),
    chats: parsed.chats ?? base.chats,
    notifications: parsed.notifications ?? [],
  };
}

async function loadPersistedSocialState(): Promise<SocialState | null> {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) continue;

    const parsed = JSON.parse(raw) as Partial<SocialState>;
    const state = hydrateSocialState(parsed);

    if (key !== STORAGE_KEY) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      await AsyncStorage.removeItem(key).catch(() => {});
    }

    return state;
  }

  return null;
}

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function isSameDay(epoch: number | null | undefined): boolean {
  if (!epoch) return false;
  return new Date(epoch).toISOString().slice(0, 10) === todayKey();
}

function normalizeFriend(friend: Friend): Friend {
  const addedAt = friend.addedAt ?? Date.now() - 30 * 24 * 60 * 60 * 1000;
  const lastStreakDoneDate =
    friend.lastStreakDoneDate ?? (friend.streakDone ? todayKey() : null);
  const streakDone = lastStreakDoneDate === todayKey();
  return { ...friend, addedAt, lastStreakDoneDate, streakDone };
}

function fromApiFriend(row: FriendListRow): Friend {
  return normalizeFriend({
    id: row.id,
    userId: row.userId,
    name: row.name,
    code: row.code,
    streak: row.streak,
    lastSeen: row.lastSeen,
    streakDone: row.streakDone,
    lastStreakDoneDate: row.lastStreakDoneDate ?? null,
    addedAt: row.addedAt,
    pinned: false,
    blocked: row.blocked ?? false,
    moodId: row.moodId,
    moodEmoji: row.moodEmoji,
    lastStreakDate: row.lastStreakDate ?? null,
  });
}

function fromApiRequest(row: FriendRequestRow): FriendRequest {
  return {
    id: row.id,
    name: row.name,
    username: row.username ?? undefined,
    anonymousMode: row.anonymousMode ?? false,
  };
}

/**
 * Merge a fresh friends list from the server into the current state, preserving
 * existing chat threads and seeding a greeting for any friendship that has no chat yet.
 */
function mergeFriendsFromApi(
  prev: SocialState,
  remote: { friends: FriendListRow[]; requests: FriendRequestRow[] },
): SocialState {
  const newFriends = remote.friends.map(fromApiFriend);
  const newChats = { ...prev.chats };
  for (const f of newFriends) {
    if (!newChats[f.id]) {
      newChats[f.id] = seedGreeting();
    }
  }
  return {
    ...prev,
    friends: newFriends,
    requests: remote.requests.map(fromApiRequest),
    chats: newChats,
  };
}

function fromApiChatMessage(row: ChatMessageRow, viewerUserId: string): ChatMessage {
  return {
    id: row._id,
    text: row.text ?? '',
    imageUri: row.imageUri,
    fileName: row.fileName,
    fileUri: row.fileUri,
    sender: row.senderUserId === viewerUserId ? 'me' : 'them',
  };
}

/** Whether the friend completed their daily streak check-in today. */
export function isStreakDoneToday(friend: Friend): boolean {
  if (friend.lastStreakDoneDate) return friend.lastStreakDoneDate === todayKey();
  return friend.streakDone;
}

/** Whether someone messaged in this friendship today (messaging streak is safe). */
export function isMessagingStreakSafeToday(friend: Friend): boolean {
  return friend.lastStreakDate === todayKey();
}

/** Active messaging streak that will reset if no one texts today. */
export function isMessagingStreakAtRisk(friend: Friend): boolean {
  return friend.streak >= 1 && !isMessagingStreakSafeToday(friend);
}

/** Added within the last NEW_FRIEND_DAYS days. */
export function isNewFriend(friend: Friend): boolean {
  const addedAt = friend.addedAt ?? 0;
  return Date.now() - addedAt < NEW_FRIEND_DAYS * 24 * 60 * 60 * 1000;
}

/** Messaging streak at risk — no message sent in this friendship today. */
export function isFriendAtRisk(friend: Friend): boolean {
  return isMessagingStreakAtRisk(friend);
}

/** Hasn't checked in today and you haven't messaged them yet — worth reaching out. */
export function friendNeedsSupport(friend: Friend): boolean {
  return !isStreakDoneToday(friend) && !isSameDay(friend.lastMessagedAt);
}

/** Mood emoji derived from whether the friend checked in today. */
export function friendMood(friend: Friend): string {
  return friend.moodEmoji ?? (isStreakDoneToday(friend) ? '😊' : '😢');
}

/** Same mood face images used on the home page mood picker (used in the friends list). */
export function friendMoodImage(friend: Friend): ImageSourcePropType {
  const mood = friend.moodId ? moodById(friend.moodId) : undefined;
  if (mood?.image) return mood.image;
  return isStreakDoneToday(friend) ? moodById('great')!.image : moodById('low')!.image;
}

export function isMuted(friend: Friend): boolean {
  return !!friend.mutedUntil && friend.mutedUntil > Date.now();
}

export type BadgeTone = 'info' | 'warning' | 'quest';

export type FriendBadge = { label: string; tone: BadgeTone };

/** Lightweight, derived activity badges shown on a friend row. */
export function friendBadges(friend: Friend, questActive: boolean): FriendBadge[] {
  const badges: FriendBadge[] = [];
  if (friend.hasUnread) badges.push({ label: 'New message', tone: 'info' });
  if (isMessagingStreakAtRisk(friend)) badges.push({ label: 'Streak at risk', tone: 'warning' });
  if (friendNeedsSupport(friend) && !isFriendAtRisk(friend)) {
    badges.push({ label: 'Reach out', tone: 'warning' });
  }
  if (questActive && !isSameDay(friend.lastMessagedAt)) badges.push({ label: 'Quest partner', tone: 'quest' });
  return badges;
}

export function highestMilestone(streak: number): number {
  let result = 0;
  for (const m of MILESTONES) if (streak >= m) result = m;
  return result;
}

type SocialContextValue = {
  hydrated: boolean;
  friends: Friend[];
  requests: FriendRequest[];
  notifications: AppNotification[];
  quests: Quest[];
  unreadNotifications: number;
  pendingMilestone: { friend: Friend; milestone: number } | null;
  chatFor: (friendId: string) => ChatMessage[];
  friendById: (friendId?: string) => Friend | undefined;
  addFriendByCode: (code: string) => AddFriendResult;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  /** Manually re-fetch friends + requests from the server (used for pull-to-refresh). */
  refreshFriendsView: () => Promise<void>;
  sendMessage: (friendId: string, message: Omit<ChatMessage, 'id' | 'sender'> & { sender?: 'me' | 'them' }) => void;
  refreshChat: (friendId: string) => Promise<void>;
  markChatRead: (friendId: string) => void;
  togglePin: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  blockFriend: (friendId: string) => void;
  unblockFriend: (friendId: string) => void;
  muteFriend: (friendId: string, duration: MuteDuration) => void;
  unmuteFriend: (friendId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  dismissMilestone: () => void;
};

const SocialContext = createContext<SocialContextValue | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { profile, refreshProfileStats } = useUserProfile();
  const [state, setState] = useState<SocialState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Mirror of the latest state so stable callbacks can read current values without re-creating.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const persisted = await loadPersistedSocialState();
        if (active && persisted) {
          setState(persisted);
        }
      } catch {
        // Ignore corrupt storage and fall back to seed data.
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !profile.userId) return;
    let active = true;

    (async () => {
      try {
        let remote = await fetchFriendsView(profile.userId!);

        // Fresh databases may not have social rows yet — bootstrap test data once.
        if (remote.friends.length === 0 && remote.requests.length === 0) {
          await bootstrapFriendsIfEmpty(profile.userId!);
          remote = await fetchFriendsView(profile.userId!);
        }

        if (!active) return;
        setState((prev) => mergeFriendsFromApi(prev, remote));
      } catch {
        // API optional: keep local persisted fallback when backend is unavailable.
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, profile.userId]);

  const refreshNotifications = useCallback(async () => {
    if (!profile.userId) return;
    try {
      const rows = await fetchNotifications(profile.userId);
      setState((prev) => ({ ...prev, notifications: mapNotificationRows(rows) }));
    } catch {
      // Keep existing notifications when offline.
    }
  }, [profile.userId]);

  useEffect(() => {
    if (!hydrated || !profile.userId) {
      setState((prev) => ({ ...prev, notifications: [] }));
      return;
    }
    void refreshNotifications();
  }, [hydrated, profile.userId, profile.points, refreshNotifications]);

  // Poll every 30 s so new friend requests and accepted friendships appear on both sides
  // without requiring the user to restart the app.
  useEffect(() => {
    if (!hydrated || !profile.userId) return;
    const POLL_MS = 10_000;
    const id = setInterval(async () => {
      try {
        const remote = await fetchFriendsView(profile.userId!);
        setState((prev) => mergeFriendsFromApi(prev, remote));
      } catch {
        // Ignore transient network errors between polls.
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [hydrated, profile.userId]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const update = useCallback((fn: (prev: SocialState) => SocialState) => setState(fn), []);

  const addFriendByCode = useCallback<SocialContextValue['addFriendByCode']>(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, message: 'Enter a friend code.' };

      if (normalized === profile.friendCode.toUpperCase()) {
        return { ok: false, message: "That's your own friend code." };
      }

      if (profile.userId) {
        requestFriendByCode(profile.userId, normalized)
          .then(async () => {
            const remote = await fetchFriendsView(profile.userId!);
            setState((prev) => mergeFriendsFromApi(prev, remote));
            await refreshNotifications();
          })
          .catch(() => {});
        return { ok: true, message: 'Friend request sent.' };
      }

      const directoryUser = findDirectoryUser(normalized);
      if (!directoryUser) {
        return { ok: false, message: 'No user found for that friend code.' };
      }

      const alreadyFriend = stateRef.current.friends.some((f) => f.code?.toUpperCase() === normalized);
      if (alreadyFriend) {
        return { ok: false, message: `You're already friends with ${directoryUser.name}.` };
      }

      const addedName = directoryUser.name;

      update((prev) => {
        const id = uid('f');
        const friend = normalizeFriend({
          id,
          name: addedName,
          code: directoryUser.code,
          streak: 0,
          lastSeen: 'Just now',
          streakDone: false,
          lastStreakDoneDate: null,
          addedAt: Date.now(),
          pinned: false,
        });
        return {
          ...prev,
          friends: [...prev.friends, friend],
          chats: { ...prev.chats, [id]: seedGreeting() },
          notifications: [
            {
              id: uid('n'),
              icon: 'person-add',
              title: `You added ${addedName} as a friend`,
              time: 'Just now',
              read: false,
              recent: true,
            },
            ...prev.notifications,
          ],
        };
      });

      return { ok: true, message: `Added ${addedName} as a friend.` };
    },
    [profile.friendCode, profile.userId, refreshNotifications, update],
  );

  const acceptRequest = useCallback(
    (id: string) => {
      if (profile.userId) {
        // Optimistically move the request to the friends list so the UI responds instantly.
        // Use the request `id` as the friend ID — it is the MongoDB friendship _id, so the
        // chat seeded here will match the ID returned by the server after accept.
        update((prev) => {
          const req = prev.requests.find((r) => r.id === id);
          if (!req) return prev;
          const friend = normalizeFriend({
            id,
            name: req.name,
            streak: 0,
            lastSeen: 'Just now',
            streakDone: false,
            lastStreakDoneDate: null,
            addedAt: Date.now(),
            pinned: false,
          });
          return {
            ...prev,
            requests: prev.requests.filter((r) => r.id !== id),
            friends: [...prev.friends, friend],
            chats: { ...prev.chats, [id]: prev.chats[id] ?? seedGreeting() },
          };
        });
        // Confirm with the server and sync authoritative state (moods, streaks, etc.).
        acceptFriendRequest(id)
          .then(async () => {
            const remote = await fetchFriendsView(profile.userId!);
            setState((prev) => mergeFriendsFromApi(prev, remote));
            await refreshNotifications();
          })
          .catch(() => {});
        return;
      }
      update((prev) => {
        const req = prev.requests.find((r) => r.id === id);
        if (!req) return prev;
        const friendId = uid('f');
        const friend = normalizeFriend({
          id: friendId,
          name: req.name,
          streak: 0,
          lastSeen: 'Just now',
          streakDone: false,
          lastStreakDoneDate: null,
          addedAt: Date.now(),
          pinned: false,
        });
        return {
          ...prev,
          requests: prev.requests.filter((r) => r.id !== id),
          friends: [...prev.friends, friend],
          chats: { ...prev.chats, [friendId]: seedGreeting() },
        };
      });
    },
    [profile.userId, refreshNotifications, update],
  );

  const rejectRequest = useCallback(
    (id: string) => {
      // Optimistically remove the request immediately regardless of online/offline state.
      update((prev) => ({ ...prev, requests: prev.requests.filter((r) => r.id !== id) }));
      if (profile.userId) {
        rejectFriendRequest(id).catch(() => {});
      }
    },
    [profile.userId, update],
  );

  const sendMessage = useCallback<SocialContextValue['sendMessage']>(
    (friendId, message) => {
      const me = profile.userId;
      const friend = stateRef.current.friends.find((f) => f.id === friendId);
      update((prev) => {
        const sender = message.sender ?? 'me';
        const msg: ChatMessage = { ...message, id: uid('m'), sender };
        const thread = prev.chats[friendId] ?? seedGreeting();
        const next: SocialState = {
          ...prev,
          chats: { ...prev.chats, [friendId]: [...thread, msg] },
        };

        if (sender !== 'me') return next;

        const today = todayKey();
        const targetFriend = prev.friends.find((f) => f.id === friendId);
        const alreadyMessagedToday = isSameDay(targetFriend?.lastMessagedAt);
        const streakResult = targetFriend ? applyMessageStreak(targetFriend, today) : null;

        next.friends = prev.friends.map((f) => {
          if (f.id !== friendId) return f;
          return {
            ...f,
            lastMessagedAt: Date.now(),
            hasUnread: false,
            ...(streakResult
              ? { streak: streakResult.streak, lastStreakDate: streakResult.lastStreakDate }
              : {}),
          };
        });

        next.quests = prev.quests.map((q) => {
          if (q.progress >= q.goal) return q;
          if (q.id === 'q-reach-out' && alreadyMessagedToday) return q;
          const progress = Math.min(q.goal, q.progress + 1);
          const justFinished = progress >= q.goal && !q.rewarded;
          return { ...q, progress, rewarded: q.rewarded || justFinished };
        });

        return next;
      });

      if (me && friend?.userId && (message.sender ?? 'me') === 'me') {
        completeSocialQuests(me)
          .then(() => refreshProfileStats())
          .catch(() => {});
        sendChatMessage(friendId, {
          senderUserId: me,
          text: message.text,
          imageUri: message.imageUri,
          fileName: message.fileName,
          fileUri: message.fileUri,
        })
          .then(async (result) => {
            const [rows, remote] = await Promise.all([
              fetchChatMessages(friendId, me),
              fetchFriendsView(me),
            ]);
            setState((prev) => {
              const merged = mergeFriendsFromApi(prev, remote);
              if (typeof result?.streak === 'number') {
                merged.friends = merged.friends.map((f) =>
                  f.id === friendId ? { ...f, streak: result.streak! } : f,
                );
              }
              return {
                ...merged,
                chats: {
                  ...merged.chats,
                  [friendId]: rows.map((row) => fromApiChatMessage(row, me)),
                },
              };
            });
          })
          .catch(() => {});
      }
    },
    [profile.userId, refreshProfileStats, update],
  );

  const refreshFriendsView = useCallback<SocialContextValue['refreshFriendsView']>(async () => {
    if (!profile.userId) return;
    try {
      const remote = await fetchFriendsView(profile.userId);
      setState((prev) => mergeFriendsFromApi(prev, remote));
    } catch {
      // Keep existing state when offline.
    }
  }, [profile.userId]);

  const refreshChat = useCallback<SocialContextValue['refreshChat']>(
    async (friendId: string) => {
      const me = profile.userId;
      const friend = stateRef.current.friends.find((f) => f.id === friendId);
      if (!me || !friend?.userId) return;

      try {
        const rows = await fetchChatMessages(friendId, me);
        setState((prev) => ({
          ...prev,
          chats: { ...prev.chats, [friendId]: rows.map((row) => fromApiChatMessage(row, me)) },
        }));
      } catch {
        // Keep local chat fallback while offline.
      }
    },
    [profile.userId],
  );

  const markChatRead = useCallback(
    (friendId: string) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, hasUnread: false } : f)),
      })),
    [update],
  );

  const togglePin = useCallback(
    (friendId: string) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, pinned: !f.pinned } : f)),
      })),
    [update],
  );

  const removeFriend = useCallback(
    (friendId: string) => {
      update((prev) => {
        const rest = { ...prev.chats };
        delete rest[friendId];
        return { ...prev, friends: prev.friends.filter((f) => f.id !== friendId), chats: rest };
      });
      // Delete the friendship document on the server so either user can re-add the other.
      if (profile.userId) {
        removeFriendship(friendId).catch(() => {});
      }
    },
    [profile.userId, update],
  );

  const blockFriend = useCallback(
    (friendId: string) => {
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, blocked: true } : f)),
      }));
      if (profile.userId) {
        blockFriendship(friendId).catch(() => {});
      }
    },
    [profile.userId, update],
  );

  const unblockFriend = useCallback(
    (friendId: string) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, blocked: false } : f)),
      })),
    [update],
  );

  const muteFriend = useCallback(
    (friendId: string, duration: MuteDuration) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) =>
          f.id === friendId ? { ...f, mutedUntil: Date.now() + MUTE_MS[duration] } : f,
        ),
      })),
    [update],
  );

  const unmuteFriend = useCallback(
    (friendId: string) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, mutedUntil: null } : f)),
      })),
    [update],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
      markNotificationReadApi(id).catch(() => {});
    },
    [update],
  );

  const markAllNotificationsRead = useCallback(() => {
    update((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
    if (profile.userId) {
      markAllNotificationsReadApi(profile.userId).catch(() => {});
    }
  }, [profile.userId, update]);

  const clearNotifications = useCallback(() => {
    update((prev) => ({ ...prev, notifications: [] }));
    if (profile.userId) {
      clearNotificationsApi(profile.userId).catch(() => {});
    }
  }, [profile.userId, update]);

  const pendingMilestone = useMemo(() => {
    for (const friend of state.friends) {
      const reached = highestMilestone(friend.streak);
      if (reached > 0 && reached > (state.celebrated[friend.id] ?? 0)) {
        return { friend, milestone: reached };
      }
    }
    return null;
  }, [state.friends, state.celebrated]);

  const dismissMilestone = useCallback(() => {
    update((prev) => {
      for (const friend of prev.friends) {
        const reached = highestMilestone(friend.streak);
        if (reached > 0 && reached > (prev.celebrated[friend.id] ?? 0)) {
          return { ...prev, celebrated: { ...prev.celebrated, [friend.id]: reached } };
        }
      }
      return prev;
    });
  }, [update]);

  const chatFor = useCallback((friendId: string) => state.chats[friendId] ?? [], [state.chats]);
  const friendById = useCallback(
    (friendId?: string) => state.friends.find((f) => f.id === friendId),
    [state.friends],
  );

  const unreadNotifications = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  const value = useMemo<SocialContextValue>(
    () => ({
      hydrated,
      friends: state.friends,
      requests: state.requests,
      notifications: state.notifications,
      quests: state.quests,
      unreadNotifications,
      pendingMilestone,
      chatFor,
      friendById,
      addFriendByCode,
      acceptRequest,
      rejectRequest,
      refreshFriendsView,
      sendMessage,
      refreshChat,
      markChatRead,
      togglePin,
      removeFriend,
      blockFriend,
      unblockFriend,
      muteFriend,
      unmuteFriend,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      dismissMilestone,
    }),
    [
      hydrated,
      state,
      unreadNotifications,
      pendingMilestone,
      chatFor,
      friendById,
      addFriendByCode,
      acceptRequest,
      rejectRequest,
      refreshFriendsView,
      sendMessage,
      refreshChat,
      markChatRead,
      togglePin,
      removeFriend,
      blockFriend,
      unblockFriend,
      muteFriend,
      unmuteFriend,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      dismissMilestone,
    ],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial(): SocialContextValue {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used within a SocialProvider');
  return ctx;
}
