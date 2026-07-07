import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { WellbeingResult } from '@/logic/checkin';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { bandColor } from './bandColor';

interface Props {
  result: WellbeingResult;
}

function periodLabel(scale: WellbeingResult['scale']): string {
  return scale === 'phq4' ? 'Today' : 'Lately';
}

export function BandCard({ result }: Props) {
  const accent = bandColor(result.band.level);

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <View style={styles.headerRow}>
        <Text style={styles.period}>{periodLabel(result.scale)}</Text>
        <View style={[styles.dot, { backgroundColor: accent }]} />
      </View>
      <Text style={styles.title}>{result.band.title}</Text>
      <Text style={styles.message}>{result.band.message}</Text>
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
  period: { ...typography.label, color: colors.textMuted, letterSpacing: 0.4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
});
