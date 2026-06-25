/** Seed data for Friends. Persisted state is managed by the social store; replace with API calls when the backend is ready. */

export type Friend = {
  id: string;
  name: string;
  streak: number;
  lastSeen: string;
  /** Single source of truth for the friend's mood across the row, chat header, and streak pet. */
  streakDone: boolean;
  pinned: boolean;
  /** Epoch ms until which the friend is muted, or null when not muted. */
  mutedUntil?: number | null;
  /** Epoch ms of the last message sent to this friend, used for badges and quest progress. */
  lastMessagedAt?: number | null;
  hasUnread?: boolean;
};

export type FriendRequest = {
  id: string;
  name: string;
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
  friendCode: '1IHIDA2',
  fireStreak: 67,
  diamonds: 15,
  gems: 2,
};

export const INCOMING_REQUESTS: FriendRequest[] = [{ id: 'r1', name: 'Alex' }];

export const FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Alex',
    streak: 67,
    lastSeen: 'Last seen 3m ago',
    streakDone: true,
    pinned: false,
  },
  {
    id: 'f2',
    name: 'Josh',
    streak: 10,
    lastSeen: 'Last seen 3m ago',
    streakDone: false,
    pinned: false,
    hasUnread: true,
  },
];

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
  { id: 'n3', icon: 'chatbubble-ellipses', title: 'Alex sent you a message', time: '3h ago', read: true, recent: true },
  { id: 'n4', icon: 'trophy', title: 'You reached a 67-day streak 🎉', time: 'Yesterday', read: true, recent: false },
];

/** Streak lengths that unlock a shared milestone celebration. */
export const MILESTONES = [7, 30, 100] as const;
