import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  total: number;
  /** Number of completed questions (0..total). */
  completed: number;
}

/** Slim progress track + "x of y" label shown under the chat header. */
export function ProgressDots({ total, completed }: Props) {
  const pct = total === 0 ? 0 : Math.min(1, completed / total);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.label}>
        {Math.min(completed, total)} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  label: { ...typography.caption, color: colors.textSecondary },
});
