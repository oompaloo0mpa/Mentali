import type { StreakState } from '@/types/wellbeing';

/** Local date key like "2026-06-23" (avoids UTC off-by-one issues). */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole-day difference between two date keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

export const emptyStreak: StreakState = {
  current: 0,
  longest: 0,
  lastCheckInDate: null,
};

/**
 * Apply a check-in for `today`, returning the next streak state.
 * - Same day  -> unchanged (already counted today).
 * - Next day  -> increment.
 * - Otherwise -> reset to 1.
 */
export function applyCheckIn(state: StreakState, today: string = dateKey()): StreakState {
  if (state.lastCheckInDate === today) return state;

  const gap = state.lastCheckInDate ? daysBetween(state.lastCheckInDate, today) : null;
  const current = gap === 1 ? state.current + 1 : 1;

  return {
    current,
    longest: Math.max(state.longest, current),
    lastCheckInDate: today,
  };
}

/** True if the user has already completed today's check-in. */
export function hasCheckedInToday(state: StreakState, today: string = dateKey()): boolean {
  return state.lastCheckInDate === today;
}
