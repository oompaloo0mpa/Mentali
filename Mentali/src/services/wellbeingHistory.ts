import { MOOD_OPTIONS } from '@/data/moods';
import type { BandLevel, CheckInRecord } from '@/logic/checkin';

export type StoredWellbeingScale = {
  total: number;
  band: BandLevel;
  suggestSupport: boolean;
  answeredCount: number;
  itemCount: number;
  anxietyScore?: number;
  moodScore?: number;
};

export type StoredCheckInResponse = {
  questionId: string;
  scale: 'phq4' | 'k10';
  dimension: string;
  value: number;
  label: string;
  skipped?: boolean;
  confidence?: number | null;
  source?: string | null;
};

export type DailyCheckInDoc = {
  checkInDate: string;
  moodId?: string | null;
  moodEmoji?: string;
  moodScore?: number;
  phq4?: StoredWellbeingScale | null;
  k10?: StoredWellbeingScale | null;
  responses?: StoredCheckInResponse[];
};

function moodIdFromScore(score: number | undefined): string {
  const match = MOOD_OPTIONS.find((m) => m.value === score);
  return match?.id ?? 'okay';
}

function dateKeyFromDoc(doc: DailyCheckInDoc): string | null {
  if (!doc.checkInDate) return null;
  return new Date(doc.checkInDate).toISOString().slice(0, 10);
}

/** Maps a server daily check-in document into a compact trend record. */
export function mapDailyCheckInToRecord(doc: DailyCheckInDoc): CheckInRecord | null {
  const date = dateKeyFromDoc(doc);
  if (!date || !doc.phq4?.band) return null;

  return {
    date,
    moodId: doc.moodId ?? moodIdFromScore(doc.moodScore),
    moodValue: doc.moodScore ?? 2,
    phq4Total: doc.phq4.total,
    band: doc.phq4.band,
    k10Total: doc.k10?.total,
  };
}

export function mapDailyCheckInDocs(docs: DailyCheckInDoc[]): CheckInRecord[] {
  return docs
    .map(mapDailyCheckInToRecord)
    .filter((record): record is CheckInRecord => record != null)
    .sort((a, b) => a.date.localeCompare(b.date));
}
