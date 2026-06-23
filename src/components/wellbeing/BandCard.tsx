import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { WellbeingResult } from '@/types/wellbeing';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { bandColor } from './bandColor';

interface Props {
  result: WellbeingResult;
}

/** Headline card summarising a screening result in gentle language. */
export function BandCard({ result }: Props) {
  const accent = bandColor(result.band.level);
  const scaleName = result.scale === 'phq4' ? 'Quick check-in' : 'Deeper check-in';

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.headerRow}>
        <Text style={styles.scaleName}>{scaleName}</Text>
        <View style={[styles.dot, { backgroundColor: accent }]} />
      </View>
      <Text style={styles.title}>{result.band.title}</Text>
      <Text style={styles.message}>{result.band.message}</Text>
      <Text style={styles.score}>
        Score {result.total} / {result.maxTotal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scaleName: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary },
  score: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
});
