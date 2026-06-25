import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CheckInRecord, StreakState } from '@/types/wellbeing';
import { emptyStreak } from '@/logic/streak';

/** AsyncStorage persistence for streak and check-in history. */

const STREAK_KEY = 'mentali.streak.v1';
const HISTORY_KEY = 'mentali.history.v1';

export async function loadStreak(): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    return raw ? (JSON.parse(raw) as StreakState) : emptyStreak;
  } catch {
    return emptyStreak;
  }
}

export async function saveStreak(state: StreakState): Promise<void> {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(state));
  } catch {
    // Non-fatal: keep the current session running.
  }
}

export async function loadHistory(): Promise<CheckInRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CheckInRecord[]) : [];
  } catch {
    return [];
  }
}

/** Clears streak and history (used by reset/testing flows). */
export async function clearCheckInData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STREAK_KEY, HISTORY_KEY]);
  } catch {
    // Non-fatal.
  }
}

export async function addHistoryRecord(record: CheckInRecord): Promise<CheckInRecord[]> {
  const history = await loadHistory();
  // Keep one record per day and limit history size.
  const next = [record, ...history.filter((r) => r.date !== record.date)].slice(0, 60);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal.
  }
  return next;
}
