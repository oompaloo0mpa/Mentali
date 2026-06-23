import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native';

import { EmojiPicker } from '@/components/mood/EmojiPicker';
import { StreakBadge } from '@/components/streak/StreakBadge';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { COPY, USER_NAME } from '@/data/checkInContent';
import type { MoodOption, StreakState } from '@/types/wellbeing';
import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  streak: StreakState;
  checkedInToday: boolean;
  onStart: (mood: MoodOption) => void;
  onViewSummary: () => void;
  onResetStreak: () => void;
  hasResult: boolean;
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function HomeScreen({
  streak,
  checkedInToday,
  onStart,
  onViewSummary,
  onResetStreak,
  hasResult,
}: Props) {
  const [selected, setSelected] = useState<MoodOption | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Hi, {USER_NAME} 👋</Text>
        <Text style={styles.date}>{todayLabel()}</Text>

        <View style={styles.streak}>
          <StreakBadge
            current={streak.current}
            longest={streak.longest}
            checkedInToday={checkedInToday}
            onReset={onResetStreak}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {checkedInToday ? "Today's mood" : COPY.moodPrompt}
          </Text>
          <Text style={styles.cardHint}>
            {checkedInToday
              ? 'Nice work checking in today.'
              : 'A quick tap to start — then a few short questions.'}
          </Text>

          <View style={styles.picker}>
            <EmojiPicker
              selectedId={selected?.id}
              onSelect={setSelected}
              disabled={checkedInToday}
            />
          </View>

          {checkedInToday ? (
            hasResult ? (
              <PrimaryButton label="View today's summary" variant="soft" onPress={onViewSummary} />
            ) : null
          ) : (
            <PrimaryButton
              label={selected ? `Check in — feeling ${selected.label.toLowerCase()}` : 'Pick an emoji to begin'}
              disabled={!selected}
              onPress={() => selected && onStart(selected)}
            />
          )}
        </View>

        <Text style={styles.footer}>{COPY.disclaimer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  greeting: { ...typography.title, color: colors.textPrimary },
  date: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.xs },
  streak: { marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cardTitle: { ...typography.heading, color: colors.textPrimary },
  cardHint: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.sm },
  picker: { marginVertical: spacing.sm },
  footer: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
