import type { ImageSourcePropType } from 'react-native';

import type { MoodOption } from '@/logic/checkin';

const happyFeeling = require('../../assets/images/happyFeeling.png') as ImageSourcePropType;
const contentFeeling = require('../../assets/images/contentFeeling.png') as ImageSourcePropType;
const averageFeeling = require('../../assets/images/averageFeeling.png') as ImageSourcePropType;
const sadFeeling = require('../../assets/images/sadFeeling.png') as ImageSourcePropType;
const depressedFeeling = require('../../assets/images/depressedFeeling.png') as ImageSourcePropType;

export type MoodOptionWithImage = MoodOption & {
  image: ImageSourcePropType;
  color: string;
  /** Lowercase key used on the homepage mood strip. */
  homeKey: string;
};

/** Shared mood definitions for homepage, chatbot, and check-in scoring. */
export const MOOD_OPTIONS: MoodOptionWithImage[] = [
  {
    id: 'great',
    emoji: '😄',
    label: 'Great',
    value: 4,
    homeKey: 'great',
    image: happyFeeling,
    color: '#7CD957',
  },
  {
    id: 'good',
    emoji: '🙂',
    label: 'Good',
    value: 3,
    homeKey: 'good',
    image: contentFeeling,
    color: '#FFE06D',
  },
  {
    id: 'okay',
    emoji: '😐',
    label: 'Meh',
    value: 2,
    homeKey: 'meh',
    image: averageFeeling,
    color: '#FF8C42',
  },
  {
    id: 'low',
    emoji: '😟',
    label: 'Sad',
    value: 1,
    homeKey: 'sad',
    image: sadFeeling,
    color: '#B8DCF5',
  },
  {
    id: 'rough',
    emoji: '😢',
    label: 'Rough',
    value: 0,
    homeKey: 'cry',
    image: depressedFeeling,
    color: '#B6C9B7',
  },
];

/** @deprecated Use MOOD_OPTIONS — kept for existing imports. */
export const MOODS: MoodOption[] = MOOD_OPTIONS;

export function moodFromHomeIndex(index: number): MoodOptionWithImage {
  return MOOD_OPTIONS[index] ?? MOOD_OPTIONS[2];
}

export function moodById(id: string): MoodOptionWithImage | undefined {
  return MOOD_OPTIONS.find((m) => m.id === id);
}
