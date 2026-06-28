import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  current: number;
  longest: number;
  checkedInToday: boolean;
  /** Long-press to reset (handy while testing the flow). */
  onReset?: () => void;
}

export function StreakBadge({ current, longest, checkedInToday, onReset }: Props) {
  const active = current > 0;
  const headline = active ? `${current}-day streak` : 'Start your streak today';

  return (
    <Pressable
      onLongPress={onReset}
      delayLongPress={600}
      android_ripple={onReset ? { color: 'rgba(255,255,255,0.06)' } : undefined}
      style={styles.card}
    >
      <Ionicons name="flame" size={36} color={active ? '#FF7A1A' : colors.textSecondary} style={!active ? styles.flameDim : undefined} />
      <View style={styles.body}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.sub}>
          {checkedInToday
            ? 'Checked in today — see you tomorrow!'
            : longest > 0
              ? `Longest streak: ${longest} days`
              : 'A quick daily check-in keeps it going.'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  flameDim: { opacity: 0.35 },
  body: { flex: 1 },
  headline: { ...typography.heading, color: colors.textPrimary },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
