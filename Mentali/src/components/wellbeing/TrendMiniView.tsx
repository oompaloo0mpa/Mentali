import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bandColor } from '@/components/wellbeing/bandColor';
import { MOODS } from '@/data/checkInContent';
import type { CheckInRecord } from '@/types/wellbeing';
import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  history: CheckInRecord[];
}

type Range = 7 | 30;

const BAR_MIN = 6;
const BAR_MAX = 44;

function moodEmoji(moodId: string): string {
  return MOODS.find((m) => m.id === moodId)?.emoji ?? '';
}

function dayLabel(dateKey: string): string {
  const day = dateKey.slice(-2);
  return day.startsWith('0') ? day.slice(1) : day;
}

/** Compact mood and wellbeing trend over the last 7 or 30 days. */
export function TrendMiniView({ history }: Props) {
  const [range, setRange] = useState<Range>(7);

  const items = useMemo(() => {
    return [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-range);
  }, [history, range]);

  if (history.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Your trend</Text>
        <Text style={styles.empty}>Check in a few days to see your trend here.</Text>
      </View>
    );
  }

  const showLabels = range === 7;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Your trend</Text>
        <View style={styles.toggle}>
          {([7, 30] as Range[]).map((r) => {
            const active = r === range;
            return (
              <Pressable
                key={r}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Show last ${r} days`}
                hitSlop={6}
                onPress={() => setRange(r)}
                style={[styles.toggleItem, active && styles.toggleItemActive]}
              >
                <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{r}d</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bars}>
        {items.map((record) => {
          const height = BAR_MIN + (record.moodValue / 4) * (BAR_MAX - BAR_MIN);
          return (
            <View key={record.date} style={styles.barColumn}>
              <View
                accessibilityRole="image"
                accessibilityLabel={`${record.date}: mood ${record.moodValue} of 4`}
                style={[styles.bar, { height, backgroundColor: bandColor(record.band) }]}
              />
              {showLabels ? <Text style={styles.barLabel}>{dayLabel(record.date)}</Text> : null}
            </View>
          );
        })}
      </View>

      <Text style={styles.legend}>
        {moodEmoji(items[items.length - 1].moodId)} Bar height shows mood; color shows wellbeing band.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.heading, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textSecondary },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 2,
  },
  toggleItem: {
    minWidth: 40,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  toggleItemActive: { backgroundColor: colors.primary },
  toggleText: { ...typography.label, color: colors.textSecondary },
  toggleTextActive: { color: colors.white },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX + 18,
    gap: 2,
  },
  barColumn: { flex: 1, alignItems: 'center', gap: spacing.xs },
  bar: { width: '70%', maxWidth: 14, borderRadius: radius.sm },
  barLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  legend: { ...typography.caption, color: colors.textMuted },
});
