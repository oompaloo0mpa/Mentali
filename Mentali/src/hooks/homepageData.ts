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
    title: 'Read your summary',
    subtitle: 'Open your check-in summary and review the result.',
    points: '+5 pts',
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
    subtitle: 'Send one encouraging message to a friend.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Talk to a friend',
    subtitle: 'Open a friend chat and say hello.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Grow your circle',
    subtitle: 'Send or accept a friend request.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Protect your messaging streak',
    subtitle: 'Send a message to keep a friend streak going.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Write a short reflection',
    subtitle: 'Add a few words in your check-in reflection box.',
    points: '+8 pts',
    active: true,
  },
  {
    title: 'Mark one notification as read',
    subtitle: 'Open notifications and clear one unread item.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Change your wardrobe',
    subtitle: 'Open the wardrobe and save a new look.',
    points: '+5 pts',
    active: true,
  },
  {
    title: 'Visit the shop',
    subtitle: 'Open the shop tab and browse the available items.',
    points: '+6 pts',
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
