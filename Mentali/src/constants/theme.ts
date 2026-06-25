import { Platform } from 'react-native';

/** Brand palette for the dark Social and Chat screens. */
export const Brand = {
  background: '#262626',
  surface: '#1F1F1F',
  surfaceElevated: '#171717',
  divider: '#3A3A3A',

  magenta: '#D81B9C',
  magentaDeep: '#A8228F',
  pink: '#F178AE',
  pinkBubble: '#EE8FB8',

  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textMuted: '#8A8A8A',
  textOnBubble: '#FFFFFF',

  fire: '#FF7A1A',
  diamond: '#E0119D',
  gem: '#34B7F1',
  happy: '#F1C40F',
  success: '#3FBF4F',
  danger: '#E53935',
} as const;

export const StreakColors = {
  orange: '#FF7A1A',
  blue: '#34B7F1',
  purple: '#9B59B6',
  rainbow: '#FF4FD8',
} as const;

export function getStreakColor(streak: number): string {
  if (streak >= 500) return StreakColors.rainbow;
  if (streak >= 250) return StreakColors.purple;
  if (streak >= 100) return StreakColors.blue;
  return StreakColors.orange;
}

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const MaxContentWidth = 480;
export const BottomTabInset = 64;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', system-ui, sans-serif",
    mono: "'SF Mono', 'Roboto Mono', monospace",
  },
});

/** Light/dark tokens for ThemedText and ThemedView. Both schemes use the dark palette. */
export const Colors = {
  light: {
    text: Brand.text,
    textSecondary: Brand.textSecondary,
    background: Brand.background,
    backgroundElement: Brand.surface,
    backgroundSelected: Brand.surfaceElevated,
    tint: Brand.magenta,
    icon: Brand.textSecondary,
  },
  dark: {
    text: Brand.text,
    textSecondary: Brand.textSecondary,
    background: Brand.background,
    backgroundElement: Brand.surface,
    backgroundSelected: Brand.surfaceElevated,
    tint: Brand.magenta,
    icon: Brand.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;
