/** In-memory mock data for Friends. Replace with API calls when the backend is ready. */

export type Friend = {
  id: string;
  name: string;
  streak: number;
  mood: string;
  lastSeen: string;
  /** Drives the streak pet's happy or sad mood. */
  streakDone: boolean;
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
  { id: 'f1', name: 'Alex', streak: 67, mood: '😊', lastSeen: 'Last seen 3m ago', streakDone: true },
  { id: 'f2', name: 'Josh', streak: 10, mood: '😊', lastSeen: 'Last seen 3m ago', streakDone: false },
];

export function getFriendById(id?: string): Friend | undefined {
  return FRIENDS.find((f) => f.id === id);
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm1', text: "Hey there, Jayden! I'm here to check in with you.", sender: 'them' },
  { id: 'm2', text: "Want to talk a little about how today's been?", sender: 'them' },
  { id: 'm3', text: 'Not right now.', sender: 'me' },
  { id: 'm4', text: 'No worries, I am always here if you change your mind!', sender: 'them' },
];

export const MOTIVATIONAL_SUGGESTIONS: string[] = [
  'Don’t give up! I am so proud of you!',
  'You’ve got this — one small step at a time.',
  'Proud of how far you’ve come today.',
  'Take a breath. You’re doing great.',
  'I believe in you, always.',
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', icon: 'person-add', title: 'Alex sent you a friend request', time: '2m ago' },
  { id: 'n2', icon: 'flame', title: 'Your 10-day streak with Josh is at risk!', time: '1h ago' },
  { id: 'n3', icon: 'chatbubble-ellipses', title: 'Alex sent you a message', time: '3h ago' },
  { id: 'n4', icon: 'trophy', title: 'You reached a 67-day streak 🎉', time: 'Yesterday' },
];
