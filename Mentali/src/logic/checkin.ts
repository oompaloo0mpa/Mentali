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
  /** Marks a "prefer not to say" choice that is excluded from scoring. */
  skip?: boolean;
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
  /** True when the user chose not to answer; excluded from scoring. */
  skipped?: boolean;
  /** How confident the inference was (0–1). Omitted for explicit chip answers. */
  confidence?: number;
  /** Short snippet that informed the score. */
  evidence?: string;
  /** How the answer was captured. */
  source?: 'free_text' | 'chip' | 'inferred' | 'skipped';
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
  /** How many items were answered (skipped items are excluded). */
  answeredCount: number;
  /** Total number of items in the scale. */
  itemCount: number;
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

/**
 * Full snapshot of a day's check-in, persisted so the summary can be
 * reopened after the app restarts.
 */
export interface TodaySnapshot {
  date: string;
  mood: MoodOption;
  phq4: WellbeingResult;
  k10: WellbeingResult | null;
}

/** A support contact shown on the escalation card. */
export interface SupportResource {
  label: string;
  description?: string;
  /** Phone number for a tel: link (digits and a leading + only). */
  phone?: string;
  /** Web address to open in the browser. */
  url?: string;
}
