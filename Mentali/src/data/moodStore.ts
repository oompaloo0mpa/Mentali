import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const moodSelections = new Map<string, number>();

export const DEFAULT_TODAY_MOOD_INDEX = 3;

export function subscribeMoodStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitMoodStoreChange() {
  listeners.forEach((listener) => listener());
}

export function getMoodForDate(dateKey: string) {
  return moodSelections.get(dateKey);
}

export function setMoodForDate(dateKey: string, moodIndex: number) {
  moodSelections.set(dateKey, moodIndex);
  emitMoodStoreChange();
}

export function useMoodForDate(dateKey: string) {
  return useSyncExternalStore(
    subscribeMoodStore,
    () => moodSelections.get(dateKey),
    () => moodSelections.get(dateKey),
  );
}