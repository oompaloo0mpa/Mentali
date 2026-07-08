import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    backgroundElement: '#F2F5F7',
    backgroundSelected: '#E8EDF1',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    backgroundElement: '#1F2223',
    backgroundSelected: '#2A2F31',
  },
} as const;

export type Theme = (typeof Colors)['light'];
export type ThemeColor = keyof Theme;

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 40,
} as const;

export const MaxContentWidth = 640;

export const BottomTabInset = Platform.select({
  ios: 72,
  android: 64,
  web: 0,
  default: 64,
});

export const Fonts = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    default: 'monospace',
  }),
} as const;
