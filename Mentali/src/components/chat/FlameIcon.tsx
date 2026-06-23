import { Image } from 'expo-image';

type Props = {
  streak: number;
  size?: number;
};

// Streak-pet artwork per tier (transparent PNGs).
const SOURCES = {
  orange: require('@/assets/images/streak/orange.png'),
  blue: require('@/assets/images/streak/blue.png'),
  purple: require('@/assets/images/streak/purple.png'),
  rainbow: require('@/assets/images/streak/rainbow.png'),
};

export type StreakTier = keyof typeof SOURCES;

export function getStreakTier(streak: number): StreakTier {
  if (streak >= 500) return 'rainbow';
  if (streak >= 250) return 'purple';
  if (streak >= 100) return 'blue';
  return 'orange';
}

/**
 * Streak-pet flame whose artwork reflects the streak tier:
 * orange (10-99) → blue (100-249) → purple (250-499) → rainbow (500+).
 */
export function FlameIcon({ streak, size = 64 }: Props) {
  return (
    <Image
      source={SOURCES[getStreakTier(streak)]}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
