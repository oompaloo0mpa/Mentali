import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { HomeScreen } from '@/screens/HomeScreen';
import { CheckInChatScreen } from '@/screens/CheckInChatScreen';
import { SummaryScreen } from '@/screens/SummaryScreen';
import { PHQ4_QUESTIONS, K10_QUESTIONS } from '@/data/checkInContent';
import { scoreK10, scorePhq4 } from '@/logic/wellbeing';
import { applyCheckIn, dateKey, emptyStreak, hasCheckedInToday } from '@/logic/streak';
import {
  addHistoryRecord,
  clearCheckInData,
  loadStreak,
  saveStreak,
} from '@/storage/checkInStorage';
import type {
  MoodOption,
  RecordedAnswer,
  ScreenId,
  StreakState,
  WellbeingResult,
} from '@/types/wellbeing';
import { colors } from '@/theme/colors';

type Mode = 'phq4' | 'k10';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [mode, setMode] = useState<Mode>('phq4');
  const [mood, setMood] = useState<MoodOption | null>(null);
  const [phq4Result, setPhq4Result] = useState<WellbeingResult | null>(null);
  const [k10Result, setK10Result] = useState<WellbeingResult | null>(null);
  const [streak, setStreak] = useState<StreakState>(emptyStreak);

  useEffect(() => {
    loadStreak().then(setStreak);
  }, []);

  const checkedInToday = useMemo(() => hasCheckedInToday(streak), [streak]);

  const startCheckIn = (selected: MoodOption) => {
    setMood(selected);
    setK10Result(null);
    setMode('phq4');
    setScreen('chat');
  };

  const startDeeper = () => {
    setMode('k10');
    setScreen('chat');
  };

  const handleComplete = async (answers: RecordedAnswer[]) => {
    if (mode === 'phq4') {
      const result = scorePhq4(answers);
      setPhq4Result(result);

      // Update streak once per day, then persist streak + a history record.
      const today = dateKey();
      const nextStreak = applyCheckIn(streak, today);
      setStreak(nextStreak);
      saveStreak(nextStreak);
      if (mood) {
        addHistoryRecord({
          date: today,
          moodId: mood.id,
          moodValue: mood.value,
          phq4Total: result.total,
          band: result.band.level,
        });
      }
    } else {
      setK10Result(scoreK10(answers));
    }
    setScreen('summary');
  };

  const resetStreak = async () => {
    await clearCheckInData();
    setStreak(emptyStreak);
    setPhq4Result(null);
    setK10Result(null);
    setScreen('home');
  };

  const backFromChat = () => setScreen(mode === 'k10' ? 'summary' : 'home');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <HomeScreen
          streak={streak}
          checkedInToday={checkedInToday}
          hasResult={!!phq4Result}
          onStart={startCheckIn}
          onViewSummary={() => setScreen('summary')}
          onResetStreak={resetStreak}
        />
      )}

      {screen === 'chat' && mood && (
        <CheckInChatScreen
          mood={mood}
          questions={mode === 'phq4' ? PHQ4_QUESTIONS : K10_QUESTIONS}
          headerTitle={mode === 'phq4' ? 'Check-in with chatbot' : 'Deeper check-in'}
          completeLabel="See my summary"
          onBack={backFromChat}
          onComplete={handleComplete}
        />
      )}

      {screen === 'summary' && mood && phq4Result && (
        <SummaryScreen
          mood={mood}
          streak={streak}
          phq4={phq4Result}
          k10={k10Result}
          onDeeper={startDeeper}
          onDone={() => setScreen('home')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
});
