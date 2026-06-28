/** Design tokens for the check-in experience. */

export const colors = {
  background: '#2B2B2F',
  surface: '#323237',
  surfaceMuted: '#3A3A40',

  botBubble: '#F4A9D7',
  botBubbleText: '#2A2230',

  userBubble: '#C2218F',
  userBubbleText: '#FFFFFF',

  primary: '#D81E9E',
  primaryDark: '#A6166F',
  primarySoft: '#F4A9D7',

  textPrimary: '#F5F1F4',
  textSecondary: '#B9B3BB',
  textMuted: '#8A8590',
  textOnPink: '#2A2230',

  border: '#46464C',
  chipBorder: '#D81E9E',
  chipText: '#F4A9D7',

  bandCalm: '#5FB8A6',
  bandMild: '#E2C36B',
  bandModerate: '#E59B5C',
  bandHigh: '#E2738C',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 19, fontWeight: '700' as const },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  bubble: { fontSize: 15, fontWeight: '500' as const, lineHeight: 21 },
  label: { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
} as const;
