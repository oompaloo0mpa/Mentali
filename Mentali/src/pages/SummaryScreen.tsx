import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsAccessButton } from '@/components/settings/SettingsAccessButton';

import { BandCard } from '@/components/wellbeing/BandCard';
import { SupportPathway } from '@/components/wellbeing/SupportPathway';
import { TrendMiniView } from '@/components/wellbeing/TrendMiniView';
import { Disclaimer } from '@/components/wellbeing/Disclaimer';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { AppIcon } from '@/components/AppIcon';
import { moodById } from '@/data/moods';
import { reflectionLine } from '@/logic/wellbeing';
import type { CheckInRecord, MoodOption, StreakState, WellbeingResult } from '@/logic/checkin';
import { loadHistory } from '@/storage/checkInStorage';
import { colors, spacing, typography } from '@/theme/colors';

interface Props {
  mood: MoodOption;
  streak: StreakState;
  phq4: WellbeingResult;
  k10: WellbeingResult | null;
  onDone: () => void;
  onOpenFriends?: () => void;
}

export function SummaryScreen({ mood, streak, phq4, k10, onDone, onOpenFriends }: Props) {
  const distressLevel = (k10 ?? phq4).band.level;
  const suggestSupport = phq4.suggestSupport || (k10?.suggestSupport ?? false);
  const reflection = reflectionLine(mood, phq4, k10);
  const moodVisual = moodById(mood.id);
  const [history, setHistory] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View />
        <SettingsAccessButton color={colors.textPrimary} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Thanks for sharing today</Text>

        <View style={styles.todayRow}>
          {moodVisual ? (
            <View style={[styles.moodCircle, { backgroundColor: moodVisual.color }]}>
              <Image source={moodVisual.image} resizeMode="contain" style={styles.moodImage} />
            </View>
          ) : null}
          <View style={styles.flex}>
            <Text style={styles.todayMood}>Today you felt {mood.label.toLowerCase()}</Text>
            <View style={styles.streakRow}>
              <AppIcon name="fire" size={18} />
              <Text style={styles.streak}>{streak.current}-day streak</Text>
            </View>
          </View>
        </View>

        <Text style={styles.reflection}>{reflection}</Text>

        <SupportPathway
          distressLevel={distressLevel}
          suggestSupport={suggestSupport}
          onReachFriend={onOpenFriends}
        />

        <BandCard result={phq4} />
        {k10 ? <BandCard result={k10} /> : null}

        <TrendMiniView history={history} />

        <PrimaryButton label="Done for today" variant="solid" onPress={onDone} />

        <Disclaimer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  flex: { flex: 1 },
  title: { ...typography.title, color: colors.textPrimary },
  reflection: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  moodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImage: { width: 40, height: 40 },
  todayMood: { ...typography.subheading, color: colors.textPrimary },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streak: { ...typography.body, color: colors.textSecondary },
});
