/** Seed data for Friends. Persisted state is managed by the social store; replace with API calls when the backend is ready. */

export type Friend = {
  id: string;
  /** Backing user record id from MongoDB when fetched from API. */
  userId?: string;
  name: string;
  /** Unique friend code used to add this person. Must match a directory entry. */
  code?: string;
  streak: number;
  lastSeen: string;
  /** Derived from lastStreakDoneDate === today; kept for persisted snapshots. */
  streakDone: boolean;
  /** ISO date (YYYY-MM-DD) when the friend last completed their daily streak. */
  lastStreakDoneDate?: string | null;
  /** Epoch ms when this friendship was created. */
  addedAt?: number;
  pinned: boolean;
  /** When true, the chat is disabled until the user unblocks them. The friend is kept, not deleted. */
  blocked?: boolean;
  /** Epoch ms until which the friend is muted, or null when not muted. */
  mutedUntil?: number | null;
  /** Epoch ms of the last message sent to this friend, used for badges and quest progress. */
  lastMessagedAt?: number | null;
  hasUnread?: boolean;
  /** Current daily mood selected on the friend's homepage. */
  moodId?: string;
  moodEmoji?: string;
};

export type FriendRequest = {
  id: string;
  name: string;
  username?: string;
  anonymousMode?: boolean;
};

export type ChatMessage = {
  id: string;
  text: string;
  imageUri?: string;
  fileName?: string;
  fileUri?: string;
  sender: 'me' | 'them';
};

export type AppNotification = {
  id: string;
  icon: 'person-add' | 'flame' | 'chatbubble-ellipses' | 'trophy';
  title: string;
  time: string;
  read: boolean;
  /** Groups the notification under "Today" when true, otherwise "Earlier". */
  recent: boolean;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  icon: string;
  goal: number;
  progress: number;
  rewardGems: number;
  /** Set once the reward has been granted so gems are not awarded twice. */
  rewarded: boolean;
};

export const CURRENT_USER = {
  name: 'Jayden',
  friendCode: '1IHIDA',
  fireStreak: 67,
  diamonds: 15,
  gems: 2,
};

export const INCOMING_REQUESTS: FriendRequest[] = [
  { id: 'r1', name: 'Riley', username: 'riley', anonymousMode: true },
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysAgoMs = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;
const daysAgoIso = (days: number) => new Date(daysAgoMs(days)).toISOString().slice(0, 10);

export const FRIENDS: Friend[] = [
  {
    id: 'f1',
    userId: 'seed-alex',
    name: 'Alex',
    code: 'ALX7K2',
    streak: 67,
    lastSeen: 'Last seen 3m ago',
    streakDone: true,
    lastStreakDoneDate: todayIso(),
    addedAt: daysAgoMs(45),
    pinned: false,
    moodId: 'great',
    moodEmoji: '😄',
  },
  {
    id: 'f2',
    userId: 'seed-josh',
    name: 'Josh',
    code: 'JSH4M9',
    streak: 10,
    lastSeen: 'Last seen 3m ago',
    streakDone: false,
    lastStreakDoneDate: daysAgoIso(1),
    addedAt: daysAgoMs(20),
    pinned: false,
    hasUnread: true,
    moodId: 'low',
    moodEmoji: '😟',
  },
];

/**
 * The only friend codes that can be added. A typed code must match one of these
 * entries (case-insensitive), so random/made-up codes are rejected. Codes are unique.
 */
export type DirectoryUser = {
  code: string;
  name: string;
  username: string;
  anonymousMode: boolean;
};

export const FRIEND_DIRECTORY: DirectoryUser[] = [
  { code: 'ALX7K2', name: 'Alex', username: 'alex', anonymousMode: false },
  { code: 'JSH4M9', name: 'Josh', username: 'josh', anonymousMode: false },
  { code: 'MAYA3X', name: 'Maya', username: 'maya', anonymousMode: true },
  { code: 'JRDN8V', name: 'Jordan', username: 'jordan', anonymousMode: false },
  { code: 'KAI22L', name: 'Kai', username: 'kai', anonymousMode: true },
  { code: 'PRY6H3', name: 'Priya', username: 'priya', anonymousMode: false },
];

/** Looks up a directory user by friend code, ignoring case and surrounding spaces. */
export function findDirectoryUser(code: string): DirectoryUser | undefined {
  const normalized = code.trim().toUpperCase();
  return FRIEND_DIRECTORY.find((entry) => entry.code === normalized);
}

const GREETING: ChatMessage[] = [
  { id: 'm1', text: "Hey there, Jayden! I'm here to check in with you.", sender: 'them' },
  { id: 'm2', text: "Want to talk a little about how today's been?", sender: 'them' },
  { id: 'm3', text: 'Not right now.', sender: 'me' },
  { id: 'm4', text: 'No worries, I am always here if you change your mind!', sender: 'them' },
];

/** Returns a fresh greeting thread for a newly opened chat. */
export function seedGreeting(): ChatMessage[] {
  return GREETING.map((m) => ({ ...m }));
}

export const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  f1: seedGreeting(),
  f2: seedGreeting(),
};

export const MOTIVATIONAL_SUGGESTIONS: string[] = [
  'Don’t give up! I am so proud of you!',
  'You’ve got this — one small step at a time.',
  'Proud of how far you’ve come today.',
  'Take a breath. You’re doing great.',
  'I believe in you, always.',
];

export const DAILY_QUESTS: Quest[] = [
  {
    id: 'q-motivate',
    title: 'Send a motivational text',
    description: 'Message any friend something kind',
    icon: 'heart',
    goal: 1,
    progress: 0,
    rewardGems: 5,
    rewarded: false,
  },
  {
    id: 'q-reach-out',
    title: 'Reach out to 2 friends',
    description: 'Start a conversation with two different friends',
    icon: 'people',
    goal: 2,
    progress: 0,
    rewardGems: 8,
    rewarded: false,
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', icon: 'person-add', title: 'Alex sent you a friend request', time: '2m ago', read: false, recent: true },
  { id: 'n2', icon: 'flame', title: 'Your 10-day streak with Josh is at risk!', time: '1h ago', read: false, recent: true },
  { id: 'n3', icon: 'chatbubble-ellipses', title: 'Maya sent you a message', time: '3h ago', read: false, recent: true },
  { id: 'n4', icon: 'person-add', title: 'Jordan accepted your friend request', time: '5h ago', read: true, recent: true },
  { id: 'n5', icon: 'trophy', title: 'You reached a 67-day streak 🎉', time: 'Yesterday', read: true, recent: false },
  { id: 'n6', icon: 'flame', title: 'Josh kept the streak alive for you', time: '2 days ago', read: true, recent: false },
];

/** Streak lengths that unlock a shared milestone celebration. */
export const MILESTONES = [7, 30, 100] as const;
