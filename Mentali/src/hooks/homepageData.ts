import type { ImageSourcePropType } from 'react-native';

import { MOOD_OPTIONS } from '@/data/moods';

export type StatItem = {
  icon: ImageSourcePropType;
  value: string;
  color: string;
};

export type MoodItem = {
  label: string;
  image: ImageSourcePropType;
  color: string;
};

export type QuestItem = {
  title: string;
  subtitle: string;
  points: string;
  active: boolean;
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
  label: m.label,
  image: m.image,
  color: m.color,
}));

export const quests: QuestItem[] = [
  {
    title: 'Daily Check-in',
    subtitle: 'Complete your daily check-in with Mentali',
    points: '+10 pts',
    active: true,
  },
  {
    title: 'How are you feeling today?',
    subtitle: 'Pick your mood depending on',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Talk to a friend!',
    subtitle: 'Send a quick message to a friend of yours',
    points: '+5 pts',
    active: false,
  },
];

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
