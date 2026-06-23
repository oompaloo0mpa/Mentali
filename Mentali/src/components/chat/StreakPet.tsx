import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlameIcon } from '@/components/chat/FlameIcon';
import { getStreakColor } from '@/constants/theme';

type Props = {
  streak: number;
  /** Today's streak task done → happy face, otherwise sad. */
  done?: boolean;
  onPress?: () => void;
  size?: number;
};

/**
 * Streak pet flame. Unlocks at a 10-day streak; colour scales with the streak,
 * and the mood face reflects whether today's streak is done. Tapping it opens
 * the streak guide.
 */
export function StreakPet({ streak, done = true, onPress, size = 56 }: Props) {
  if (streak < 10) return null;

  const color = getStreakColor(streak);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.glow, { shadowColor: color }]}>
        <FlameIcon streak={streak} size={size} />
      </View>
      {/* Artwork is already happy; show a sad badge only when the streak lapses. */}
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
