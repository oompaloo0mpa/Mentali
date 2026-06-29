import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { moods } from '@/hooks/homepageData';

import {
  CURRENT_USER,
  DAILY_QUESTS,
  findDirectoryUser,
  FRIENDS,
  INCOMING_REQUESTS,
  INITIAL_CHATS,
  MILESTONES,
  NOTIFICATIONS,
  seedGreeting,
  type AppNotification,
  type ChatMessage,
  type Friend,
  type FriendRequest,
  type Quest,
} from '@/data/mockData';

const STORAGE_KEY = 'mentali.social.v5';

/** Friends added within this many days show under the "New" filter. */
export const NEW_FRIEND_DAYS = 7;

/** Minimum streak length before a missed day is considered "at risk". */
export const AT_RISK_MIN_STREAK = 7;

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
  gems: number;
  diamonds: number;
  fireStreak: number;
  /** Highest milestone already celebrated per friend, so a celebration only shows once. */
  celebrated: Record<string, number>;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function freshQuests(): Quest[] {
  return DAILY_QUESTS.map((q) => ({ ...q, progress: 0, rewarded: false }));
}

function initialState(): SocialState {
  return {
    friends: FRIENDS.map((f) => normalizeFriend({ ...f })),
    requests: INCOMING_REQUESTS.map((r) => ({ ...r })),
    chats: Object.fromEntries(Object.entries(INITIAL_CHATS).map(([id, msgs]) => [id, msgs.map((m) => ({ ...m }))])),
    notifications: NOTIFICATIONS.map((n) => ({ ...n })),
    quests: freshQuests(),
    questDate: todayKey(),
    gems: CURRENT_USER.gems,
    diamonds: CURRENT_USER.diamonds,
    fireStreak: CURRENT_USER.fireStreak,
    celebrated: {},
  };
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

/** Whether the friend completed their daily streak check-in today. */
export function isStreakDoneToday(friend: Friend): boolean {
  if (friend.lastStreakDoneDate) return friend.lastStreakDoneDate === todayKey();
  return friend.streakDone;
}

/** Added within the last NEW_FRIEND_DAYS days. */
export function isNewFriend(friend: Friend): boolean {
  const addedAt = friend.addedAt ?? 0;
  return Date.now() - addedAt < NEW_FRIEND_DAYS * 24 * 60 * 60 * 1000;
}

/** Long streak (7+ days) but hasn't checked in today — streak may break. */
export function isFriendAtRisk(friend: Friend): boolean {
  return friend.streak >= AT_RISK_MIN_STREAK && !isStreakDoneToday(friend);
}

/** Hasn't checked in today and you haven't messaged them yet — worth reaching out. */
export function friendNeedsSupport(friend: Friend): boolean {
  return !isStreakDoneToday(friend) && !isSameDay(friend.lastMessagedAt);
}

/** Mood emoji derived from whether the friend checked in today. */
export function friendMood(friend: Friend): string {
  return isStreakDoneToday(friend) ? '😊' : '😢';
}

/** Same mood face images used on the home page mood picker (used in the friends list). */
export function friendMoodImage(friend: Friend): ImageSourcePropType {
  return isStreakDoneToday(friend) ? moods[0].image : moods[3].image;
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
  if (isFriendAtRisk(friend)) badges.push({ label: 'Streak at risk', tone: 'warning' });
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
  gems: number;
  diamonds: number;
  fireStreak: number;
  unreadNotifications: number;
  pendingMilestone: { friend: Friend; milestone: number } | null;
  chatFor: (friendId: string) => ChatMessage[];
  friendById: (friendId?: string) => Friend | undefined;
  addFriendByCode: (code: string) => AddFriendResult;
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  sendMessage: (friendId: string, message: Omit<ChatMessage, 'id' | 'sender'> & { sender?: 'me' | 'them' }) => void;
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
  const [state, setState] = useState<SocialState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  // Mirror of the latest state so stable callbacks can read current values without re-creating.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw) as SocialState;
          // Roll the daily quests over when the stored day is stale.
          if (parsed.questDate !== todayKey()) {
            parsed.quests = freshQuests();
            parsed.questDate = todayKey();
          }
          setState({
            ...initialState(),
            ...parsed,
            friends: (parsed.friends ?? []).map(normalizeFriend),
          });
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

      if (normalized === CURRENT_USER.friendCode.toUpperCase()) {
        return { ok: false, message: "That's your own friend code." };
      }

      const directoryUser = findDirectoryUser(normalized);
      if (!directoryUser) {
        return { ok: false, message: 'No user found for that friend code.' };
      }

      const alreadyFriend = stateRef.current.friends.some((f) => f.code?.toUpperCase() === normalized);
      if (alreadyFriend) {
        return { ok: false, message: `You're already friends with ${directoryUser.name}.` };
      }

      update((prev) => {
        const id = uid('f');
        const friend = normalizeFriend({
          id,
          name: directoryUser.name,
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
              title: `You added ${directoryUser.name} as a friend`,
              time: 'Just now',
              read: false,
              recent: true,
            },
            ...prev.notifications,
          ],
        };
      });

      return { ok: true, message: `Added ${directoryUser.name} as a friend.` };
    },
    [update],
  );

  const acceptRequest = useCallback(
    (id: string) => {
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
    [update],
  );

  const rejectRequest = useCallback(
    (id: string) => update((prev) => ({ ...prev, requests: prev.requests.filter((r) => r.id !== id) })),
    [update],
  );

  const sendMessage = useCallback<SocialContextValue['sendMessage']>(
    (friendId, message) => {
      update((prev) => {
        const sender = message.sender ?? 'me';
        const msg: ChatMessage = { ...message, id: uid('m'), sender };
        const thread = prev.chats[friendId] ?? seedGreeting();
        const next: SocialState = {
          ...prev,
          chats: { ...prev.chats, [friendId]: [...thread, msg] },
        };

        if (sender !== 'me') return next;

        const alreadyMessagedToday = isSameDay(prev.friends.find((f) => f.id === friendId)?.lastMessagedAt);
        next.friends = prev.friends.map((f) =>
          f.id === friendId ? { ...f, lastMessagedAt: Date.now(), hasUnread: false } : f,
        );

        let gained = 0;
        next.quests = prev.quests.map((q) => {
          if (q.progress >= q.goal) return q;
          // "Reach out to 2 friends" only counts the first message to a friend each day.
          if (q.id === 'q-reach-out' && alreadyMessagedToday) return q;
          const progress = Math.min(q.goal, q.progress + 1);
          const justFinished = progress >= q.goal && !q.rewarded;
          if (justFinished) gained += q.rewardGems;
          return { ...q, progress, rewarded: q.rewarded || justFinished };
        });
        if (gained > 0) next.gems = prev.gems + gained;

        return next;
      });
    },
    [update],
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
    (friendId: string) =>
      update((prev) => {
        const rest = { ...prev.chats };
        delete rest[friendId];
        return { ...prev, friends: prev.friends.filter((f) => f.id !== friendId), chats: rest };
      }),
    [update],
  );

  const blockFriend = useCallback(
    (friendId: string) =>
      update((prev) => ({
        ...prev,
        friends: prev.friends.map((f) => (f.id === friendId ? { ...f, blocked: true } : f)),
      })),
    [update],
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
    (id: string) =>
      update((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
    [update],
  );

  const markAllNotificationsRead = useCallback(
    () => update((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) })),
    [update],
  );

  const clearNotifications = useCallback(() => update((prev) => ({ ...prev, notifications: [] })), [update]);

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
      gems: state.gems,
      diamonds: state.diamonds,
      fireStreak: state.fireStreak,
      unreadNotifications,
      pendingMilestone,
      chatFor,
      friendById,
      addFriendByCode,
      acceptRequest,
      rejectRequest,
      sendMessage,
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
      sendMessage,
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
