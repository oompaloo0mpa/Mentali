/** Shared types for check-in and wellbeing summaries. */

export type ScreenId = 'home' | 'chat' | 'summary';

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  /** 0 (struggling) to 4 (great). */
  value: number;
}

export interface AnswerOption {
  label: string;
  /** Numeric weight contributed to scoring. */
  value: number;
}

export type ScaleKind = 'phq4' | 'k10';

export type Dimension = 'anxiety' | 'mood' | 'distress';

export interface CheckInQuestion {
  id: string;
  prompt: string;
  /** Optional secondary line shown under the prompt. */
  helper?: string;
  scale: ScaleKind;
  dimension: Dimension;
  options: AnswerOption[];
}

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
  /** Plain-language description for the selected band. */
  message: string;
}

export interface WellbeingResult {
  scale: ScaleKind;
  total: number;
  maxTotal: number;
  band: WellbeingBand;
  /** PHQ-4 sub-scores (0-6 each). Undefined for K10. */
  anxietyScore?: number;
  moodScore?: number;
  /** Whether to surface additional support guidance. */
  suggestSupport: boolean;
}

export interface CheckInRecord {
  /** Local date key, for example "2026-06-23". */
  date: string;
  moodId: string;
  moodValue: number;
  phq4Total: number;
  band: BandLevel;
  /** Present only when the optional K10 flow is completed. */
  k10Total?: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastCheckInDate: string | null;
}
