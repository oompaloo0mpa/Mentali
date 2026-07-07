import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CheckInRecord, StreakState, TodaySnapshot } from '@/logic/checkin';
import { emptyStreak } from '@/logic/streak';

/** AsyncStorage persistence for streak and check-in history. */

const STREAK_KEY = 'mentali.streak.v1';
const HISTORY_KEY = 'mentali.history.v1';
const TODAY_KEY = 'mentali.today.v1';

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

/** Stores the full result for today so the summary survives an app restart. */
export async function saveTodaySnapshot(snapshot: TodaySnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(TODAY_KEY, JSON.stringify(snapshot));
  } catch {
    // Non-fatal.
  }
}

/** Returns the stored snapshot only when it belongs to `today`. */
export async function loadTodaySnapshot(today: string): Promise<TodaySnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(TODAY_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as TodaySnapshot;
    return snapshot.date === today ? snapshot : null;
  } catch {
    return null;
  }
}

/** Clears streak, history, and today's snapshot (used by reset/testing flows). */
export async function clearCheckInData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STREAK_KEY, HISTORY_KEY, TODAY_KEY]);
  } catch {
    // Non-fatal.
  }
}

export async function addHistoryRecord(record: CheckInRecord): Promise<CheckInRecord[]> {
  const history = await loadHistory();
  const next = mergeHistoryRecords(history, [record]);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal.
  }
  return next;
}

/** Merges records by date; incoming entries replace existing dates. */
export function mergeHistoryRecords(
  existing: CheckInRecord[],
  incoming: CheckInRecord[],
): CheckInRecord[] {
  const byDate = new Map<string, CheckInRecord>();
  for (const record of existing) byDate.set(record.date, record);
  for (const record of incoming) byDate.set(record.date, record);
  return [...byDate.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 60);
}

export async function saveHistoryRecords(records: CheckInRecord[]): Promise<CheckInRecord[]> {
  const history = await loadHistory();
  const next = mergeHistoryRecords(history, records);
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal.
  }
  return next;
}
