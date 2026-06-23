import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native';

import { BandCard } from '@/components/wellbeing/BandCard';
import { ScoreBar } from '@/components/wellbeing/ScoreBar';
import { SupportCard } from '@/components/wellbeing/SupportCard';
import { Disclaimer } from '@/components/wellbeing/Disclaimer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { bandColor } from '@/components/wellbeing/bandColor';
import { COPY } from '@/data/checkInContent';
import { subscaleLabel } from '@/logic/wellbeing';
import type { MoodOption, StreakState, WellbeingResult } from '@/types/wellbeing';
import { colors, radius, spacing, typography } from '@/theme/colors';

const FLAME = require('../../assets/flame.png');

interface Props {
  mood: MoodOption;
  streak: StreakState;
  phq4: WellbeingResult;
  k10: WellbeingResult | null;
  onDeeper: () => void;
  onDone: () => void;
}

export function SummaryScreen({ mood, streak, phq4, k10, onDeeper, onDone }: Props) {
  const suggestSupport = phq4.suggestSupport || (k10?.suggestSupport ?? false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your check-in</Text>

        <View style={styles.todayRow}>
          <Text style={styles.todayEmoji}>{mood.emoji}</Text>
          <View style={styles.flex}>
            <Text style={styles.todayMood}>Today you felt {mood.label.toLowerCase()}</Text>
            <View style={styles.streakRow}>
              <Image source={FLAME} style={styles.streakFlame} resizeMode="contain" />
              <Text style={styles.streak}>{streak.current}-day streak</Text>
            </View>
          </View>
        </View>

        <BandCard result={phq4} />

        <View style={styles.bars}>
          <ScoreBar
            label="Worry / anxiety"
            value={phq4.anxietyScore ?? 0}
            max={6}
            hint={subscaleLabel(phq4.anxietyScore ?? 0)}
            color={colors.bandModerate}
          />
          <ScoreBar
            label="Low mood"
            value={phq4.moodScore ?? 0}
            max={6}
            hint={subscaleLabel(phq4.moodScore ?? 0)}
            color={colors.bandHigh}
          />
        </View>

        {k10 ? <BandCard result={k10} /> : null}

        {suggestSupport ? <SupportCard /> : <EncouragementNote level={phq4.band.level} />}

        <View style={styles.actions}>
          {!k10 ? (
            <PrimaryButton label="Do a deeper check-in (optional)" variant="ghost" onPress={onDeeper} />
          ) : null}
          <PrimaryButton label="Done for today" onPress={onDone} />
        </View>

        {!k10 ? <Text style={styles.deeperHint}>{COPY.deeperInvite}</Text> : null}

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

function EncouragementNote({ level }: { level: WellbeingResult['band']['level'] }) {
  return (
    <View style={[styles.note, { borderLeftColor: bandColor(level) }]}>
      <Text style={styles.noteText}>
        Small, steady check-ins build real self-awareness. Come back tomorrow to keep your
        streak going. 💛
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  flex: { flex: 1 },
  title: { ...typography.title, color: colors.textPrimary },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  todayEmoji: { fontSize: 40 },
  todayMood: { ...typography.subheading, color: colors.textPrimary },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streakFlame: { width: 18, height: 18 },
  streak: { ...typography.body, color: colors.textSecondary },
  bars: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  note: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.lg,
  },
  noteText: { ...typography.body, color: colors.textSecondary },
  actions: { gap: spacing.md },
  deeperHint: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
