import type { ImageSourcePropType } from 'react-native';

const streakIcon = require('../../assets/images/StreakIcon.png') as ImageSourcePropType;
const diamondIcon = require('../../assets/images/DiamondIcon.png') as ImageSourcePropType;
const brainfreezeIcon = require('../../assets/images/BrainfreezeIcon.png') as ImageSourcePropType;

const happyFeeling = require('../../assets/images/happyFeeling.png') as ImageSourcePropType;
const contentFeeling = require('../../assets/images/contentFeeling.png') as ImageSourcePropType;
const averageFeeling = require('../../assets/images/averageFeeling.png') as ImageSourcePropType;
const sadFeeling = require('../../assets/images/sadFeeling.png') as ImageSourcePropType;
const depressedFeeling = require('../../assets/images/depressedFeeling.png') as ImageSourcePropType;

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

export const stats: StatItem[] = [
  { icon: streakIcon, value: '67', color: '#FF9800' },
  { icon: diamondIcon, value: '15', color: '#C86BFF' },
  { icon: brainfreezeIcon, value: '2', color: '#71BFEA' },
];

export const moods: MoodItem[] = [
  { label: 'great', image: happyFeeling, color: '#7CD957' },
  { label: 'good', image: contentFeeling, color: '#FFE06D' },
  { label: 'meh', image: averageFeeling, color: '#FF8C42' },
  { label: 'sad', image: sadFeeling, color: '#B8DCF5' },
  { label: 'cry', image: depressedFeeling, color: '#B6C9B7' },
];

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