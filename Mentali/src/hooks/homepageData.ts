import type { ImageSourcePropType } from 'react-native';

import { MOOD_OPTIONS } from '@/data/moods';

export type StatItem = {
  icon: ImageSourcePropType;
  value: string;
  color: string;
};

export type MoodItem = {
  id: string;
  label: string;
  image: ImageSourcePropType;
  color: string;
  homeKey: string;
};

export type QuestItem = {
  id?: string;
  title: string;
  subtitle: string;
  points: string;
  active: boolean;
  completed?: boolean;
};

export type NavItem = {
  icon: string;
  active?: boolean;
};

export type AppNotification = {
  id: string;
  icon: 'person-add' | 'flame' | 'chatbubble-ellipses' | 'trophy';
  title: string;
  time: string;
  read: boolean;
  recent: boolean;
};

const streakIcon = require('../../assets/images/StreakIcon.png') as ImageSourcePropType;
const diamondIcon = require('../../assets/images/DiamondIcon.png') as ImageSourcePropType;
const brainfreezeIcon = require('../../assets/images/BrainfreezeIcon.png') as ImageSourcePropType;

export const stats: StatItem[] = [
  { icon: streakIcon, value: '67', color: '#FF9800' },
  { icon: diamondIcon, value: '15', color: '#C86BFE' },
  { icon: brainfreezeIcon, value: '2', color: '#71BFEA' },
];

/** Homepage mood strip — same faces as the chatbot. */
export const moods: MoodItem[] = MOOD_OPTIONS.map((m) => ({
  id: m.id,
  label: m.label,
  image: m.image,
  color: m.color,
  homeKey: m.homeKey,
}));

export const questPool: QuestItem[] = [
  {
    title: "Complete today's check-in",
    subtitle: 'Finish your daily wellbeing chat once today.',
    points: '+10 pts',
    active: true,
  },
  {
    title: 'Pick your mood',
    subtitle: 'Choose how you feel on the homepage mood strip.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Review your check-in summary',
    subtitle: "Open your summary after finishing today's check-in.",
    points: '+6 pts',
    active: true,
  },
  {
    title: 'Keep your streak alive',
    subtitle: 'Check in on a day when your streak is still going.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Send a supportive message',
    subtitle: 'Send one message to a friend in chat.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Reply to a friend',
    subtitle: 'Respond to a message using the reply action.',
    points: '+6 pts',
    active: true,
  },
  {
    title: 'Grow your circle',
    subtitle: 'Send a friend request using a friend code.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Accept a friend request',
    subtitle: 'Approve an incoming friend request.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Protect your messaging streak',
    subtitle: 'Send a message when a friend streak is at risk.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Open a friend chat',
    subtitle: "Visit a friend's chat screen today.",
    points: '+4 pts',
    active: true,
  },
  {
    title: 'Answer wellbeing questions',
    subtitle: 'Respond to at least one question during check-in.',
    points: '+6 pts',
    active: true,
  },
  {
    title: 'Share in your check-in chat',
    subtitle: 'Type a message during the wellbeing chat.',
    points: '+7 pts',
    active: true,
  },
  {
    title: 'Visit your wardrobe',
    subtitle: 'Open the wardrobe screen from Home.',
    points: '+4 pts',
    active: true,
  },
  {
    title: 'Try a new color theme',
    subtitle: 'Change your app color theme in settings.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Check your notifications',
    subtitle: 'Open the notifications panel on Home.',
    points: '+4 pts',
    active: true,
  },
];

/** @deprecated Use questPool — kept for backwards compatibility */
export const quests: QuestItem[] = questPool.slice(0, 3);

export const navItems: NavItem[] = [
  { icon: 'home-outline', active: true },
  { icon: 'people-outline' },
  { icon: 'trophy-outline' },
  { icon: 'bag-outline' },
  { icon: 'shirt-outline' },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    icon: 'person-add',
    title: 'A friend sent you a request',
    time: '2m ago',
    read: false,
    recent: true,
  },
  {
    id: 'notif-2',
    icon: 'flame',
    title: 'Your streak is on fire',
    time: '18m ago',
    read: false,
    recent: true,
  },
  {
    id: 'notif-3',
    icon: 'chatbubble-ellipses',
    title: 'New message from Maya',
    time: 'Yesterday',
    read: true,
    recent: false,
  },
  {
    id: 'notif-4',
    icon: 'trophy',
    title: 'You unlocked Bronze rewards',
    time: '2 days ago',
    read: true,
    recent: false,
  },
];
