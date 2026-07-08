import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/AppIcon';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { getStreakVisuals } from '@/theme/theme';

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
  const visuals = getStreakVisuals(current);

  return (
    <Pressable
      onLongPress={onReset}
      delayLongPress={600}
      android_ripple={onReset ? { color: 'rgba(255,255,255,0.06)' } : undefined}
      style={styles.card}
    >
      {active && visuals.pillGradientColors ? (
        <LinearGradient
          colors={[...visuals.pillGradientColors]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.flameWrap}>
          <AppIcon name="fire" size={26} />
        </LinearGradient>
      ) : (
        <View style={[styles.flameWrap, { backgroundColor: active ? visuals.pillBg : 'rgba(255,255,255,0.06)' }]}> 
          <AppIcon name="fire" size={26} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.headline, active && { color: visuals.color }]}>{headline}</Text>
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
  flameWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  headline: { ...typography.heading, color: colors.textPrimary },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
