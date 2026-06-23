/**
 * Shared types for the daily check-in + wellbeing screening feature.
 *
 * IMPORTANT: This is a supportive *check-in*, not a clinical diagnosis. The
 * scoring below is inspired by the structure of PHQ-4 (ultra-brief anxiety /
 * depression screen, 4 items, 0-12) and K10 (broader psychological distress,
 * 10 items, 10-50). Wording is intentionally simplified and human-friendly.
 */

export type ScreenId = 'home' | 'chat' | 'summary';

/** A daily mood, chosen with a single emoji tap. */
export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  /** 0 (struggling) .. 4 (great). Used to colour the day, not to diagnose. */
  value: number;
}

/** A single selectable answer for a check-in question. */
export interface AnswerOption {
  label: string;
  /** Numeric weight contributed to the relevant scale. */
  value: number;
}

export type ScaleKind = 'phq4' | 'k10';

/** Which wellbeing dimension a question feeds into. */
export type Dimension = 'anxiety' | 'mood' | 'distress';

export interface CheckInQuestion {
  id: string;
  /** Short, friendly bot prompt shown as a chat bubble. */
  prompt: string;
  /** Optional softer follow-up line shown under the prompt. */
  helper?: string;
  scale: ScaleKind;
  dimension: Dimension;
  options: AnswerOption[];
}

/** A recorded answer during a session. */
export interface RecordedAnswer {
  questionId: string;
  scale: ScaleKind;
  dimension: Dimension;
  value: number;
  label: string;
}

export type BandLevel = 'calm' | 'mild' | 'moderate' | 'high';

export interface WellbeingBand {
  level: BandLevel;
  title: string;
  /** Supportive, plain-language description. */
  message: string;
}

export interface WellbeingResult {
  scale: ScaleKind;
  total: number;
  maxTotal: number;
  band: WellbeingBand;
  /** PHQ-4 sub-scores (each 0-6). Undefined for K10. */
  anxietyScore?: number;
  moodScore?: number;
  /** True when answers suggest the user may benefit from extra support. */
  suggestSupport: boolean;
}

/** A completed daily check-in, persisted for the streak + history. */
export interface CheckInRecord {
  /** Local date key, e.g. "2026-06-23". */
  date: string;
  moodId: string;
  moodValue: number;
  phq4Total: number;
  band: BandLevel;
  /** Present only if the user opted into the deeper K10 check-in. */
  k10Total?: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastCheckInDate: string | null;
}
