import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  label: string;
  value: number;
  max: number;
  hint: string;
  color: string;
}

/** A soft horizontal bar for a single sub-scale (e.g. anxiety / mood). */
export function ScoreBar({ label, value, max, hint, color }: Props) {
  const pct = max === 0 ? 0 : Math.min(1, value / max);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.subheading, color: colors.textPrimary },
  hint: { ...typography.caption, color: colors.textSecondary },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
