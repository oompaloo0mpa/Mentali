import { Platform } from 'react-native';

/**
 * Mentali brand palette.
 * The Social + Chat screens use a fixed dark theme with magenta accents,
 * matching the product mockups, so these tokens are referenced directly.
 */
export const Brand = {
  // Surfaces
  background: '#262626',
  surface: '#1F1F1F',
  surfaceElevated: '#171717',
  divider: '#3A3A3A',

  // Magenta / pink family
  magenta: '#D81B9C', // friend code border, search, bottom bar
  magentaDeep: '#A8228F', // outgoing chat bubble
  pink: '#F178AE', // send buttons, "Back" button
  pinkBubble: '#EE8FB8', // incoming chat bubble

  // Text
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textMuted: '#8A8A8A',
  textOnBubble: '#FFFFFF',

  // Status / accents
  fire: '#FF7A1A',
  diamond: '#E0119D',
  gem: '#34B7F1',
  happy: '#F1C40F',
  success: '#3FBF4F',
  danger: '#E53935',
} as const;

/** Streak-pet flame colours, unlocked at a 10-day streak. */
export const StreakColors = {
  orange: '#FF7A1A', // 10-99
  blue: '#34B7F1', // 100-249
  purple: '#9B59B6', // 250-499
  rainbow: '#FF4FD8', // 500+ (rendered with a glow as a stand-in for the rainbow flame)
} as const;

export function getStreakColor(streak: number): string {
  if (streak >= 500) return StreakColors.rainbow;
  if (streak >= 250) return StreakColors.purple;
  if (streak >= 100) return StreakColors.blue;
  return StreakColors.orange;
}

/** Consistent spacing scale (in px). */
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

/**
 * Light/Dark token sets consumed by the generic ThemedText / ThemedView
 * components. The app is dark-first, so both schemes lean dark to match the
 * mockups while keeping the themed components fully functional.
 */
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
