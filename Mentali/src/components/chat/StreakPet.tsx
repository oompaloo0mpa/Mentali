import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getStreakColor } from '@/theme/theme';

type Props = {
  streak: number;
  done?: boolean;
  onPress?: () => void;
  size?: number;
};

/** Unlocks at day 1; colour scales with streak. Tap opens the streak guide. */
const SOURCES = {
  orange: require('../../../assets/images/streak/orange.png'),
  blue: require('../../../assets/images/streak/blue.png'),
  purple: require('../../../assets/images/streak/purple.png'),
  // For streak >= 500, this should be the rainbow streak pet creature.
  // (We keep the old `assets/images/streak/rainbow.png` flame artwork for other UI.)
  rainbow: require('../../../assets/images/streak/rainbow_pet.png'),
};

type StreakTier = keyof typeof SOURCES;
function getStreakTier(streak: number): StreakTier {
  if (streak >= 500) return 'rainbow';
  if (streak >= 250) return 'purple';
  if (streak >= 100) return 'blue';
  return 'orange';
}

export function StreakPet({ streak, done = true, onPress, size = 54 }: Props) {
  if (streak < 1) return null;

  const color = getStreakColor(streak);
  const tier = getStreakTier(streak);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View
        style={[
          styles.glow,
          {
            shadowColor: color,
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: Math.round(size * 0.1),
            borderRadius: Math.round(size * 0.3),
            elevation: 6,
          },
        ]}>
        <Image
          source={SOURCES[tier]}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      </View>
      {!done && (
        <View style={styles.moodBadge}>
          <Text style={styles.moodText}>😢</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  glow: {
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  moodBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodText: { fontSize: 12 },
});
