import type { BandLevel, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import {
  buildK10Question,
  buildPhq4Question,
  K10_VARIANTS,
  pickVariant,
  PHQ4_FOCUS_PROMPTS,
  PHQ4_PROMPT_VARIANTS,
} from '@/data/checkInQuestionPools';
import { K10_QUESTIONS, PHQ4_QUESTIONS } from '@/data/checkInContent';

export type CheckInFocus =
  | 'balanced'
  | 'anxiety'
  | 'mood'
  | 'energy'
  | 'stress'
  | 'social'
  | 'positive';

export interface UserCheckInProfile {
  checkInCount: number;
  avgMoodValue: number;
  lastBand: BandLevel | null;
  dominantFocus: CheckInFocus;
  recentMoodIds: string[];
  lastAnxietyScore: number | null;
  lastMoodScore: number | null;
  updatedAt: string;
}

export interface PersonalizedCheckInPlan {
  questions: CheckInQuestion[];
  focus: CheckInFocus;
  opener: string;
  sessionIndex: number;
}

export const EMPTY_PROFILE: UserCheckInProfile = {
  checkInCount: 0,
  avgMoodValue: 2,
  lastBand: null,
  dominantFocus: 'balanced',
  recentMoodIds: [],
  lastAnxietyScore: null,
  lastMoodScore: null,
  updatedAt: new Date().toISOString(),
};

const PHQ4_META: { id: string; dimension: 'anxiety' | 'mood'; helper?: string }[] = [
  { id: 'phq4_anx_1', dimension: 'anxiety' },
  { id: 'phq4_anx_2', dimension: 'anxiety', helper: 'Like your mind keeps circling back to something.' },
  { id: 'phq4_mood_1', dimension: 'mood' },
  { id: 'phq4_mood_2', dimension: 'mood', helper: 'Little interest or pleasure in doing things.' },
];

/** K10 item groups by what they tend to measure. */
const K10_BY_FOCUS: Record<CheckInFocus, string[]> = {
  balanced: ['k10_1', 'k10_2', 'k10_4', 'k10_7', 'k10_8', 'k10_9'],
  anxiety: ['k10_2', 'k10_3', 'k10_5', 'k10_6', 'k10_1', 'k10_8'],
  mood: ['k10_7', 'k10_8', 'k10_9', 'k10_10', 'k10_4', 'k10_1'],
  energy: ['k10_1', 'k10_8', 'k10_7', 'k10_5', 'k10_2', 'k10_9'],
  stress: ['k10_2', 'k10_3', 'k10_5', 'k10_8', 'k10_1', 'k10_7'],
  social: ['k10_7', 'k10_9', 'k10_10', 'k10_4', 'k10_2', 'k10_8'],
  positive: ['k10_1', 'k10_7', 'k10_2', 'k10_8', 'k10_5', 'k10_9'],
};

const PHQ4_ORDER_BY_FOCUS: Record<CheckInFocus, string[]> = {
  balanced: ['phq4_anx_1', 'phq4_mood_1', 'phq4_anx_2', 'phq4_mood_2'],
  anxiety: ['phq4_anx_1', 'phq4_anx_2', 'phq4_mood_1', 'phq4_mood_2'],
  mood: ['phq4_mood_1', 'phq4_mood_2', 'phq4_anx_1', 'phq4_anx_2'],
  energy: ['phq4_mood_1', 'phq4_anx_1', 'phq4_mood_2', 'phq4_anx_2'],
  stress: ['phq4_anx_1', 'phq4_anx_2', 'phq4_mood_1', 'phq4_mood_2'],
  social: ['phq4_mood_1', 'phq4_mood_2', 'phq4_anx_1', 'phq4_anx_2'],
  positive: ['phq4_mood_2', 'phq4_mood_1', 'phq4_anx_1', 'phq4_anx_2'],
};

function resolveFocus(mood: MoodOption, profile: UserCheckInProfile): CheckInFocus {
  if (profile.checkInCount === 0) {
    if (mood.value >= 3) return 'positive';
    if (mood.value <= 1) return 'mood';
    return 'balanced';
  }

  const recentLow = profile.recentMoodIds.filter((id) => id === 'low' || id === 'rough').length >= 2;
  const recentGood = profile.recentMoodIds.filter((id) => id === 'great' || id === 'good').length >= 2;

  if (mood.value <= 1 || recentLow) return 'mood';
  if (mood.value >= 3 && recentGood) return 'positive';

  const anxietyHigh =
    profile.lastAnxietyScore != null &&
    profile.lastMoodScore != null &&
    profile.lastAnxietyScore > profile.lastMoodScore &&
    profile.lastAnxietyScore >= 3;

  if (anxietyHigh || profile.dominantFocus === 'anxiety') return 'anxiety';
  if (profile.dominantFocus === 'energy') return 'energy';
  if (profile.dominantFocus === 'stress') return 'stress';
  if (profile.dominantFocus === 'social') return 'social';

  if (profile.lastBand === 'moderate' || profile.lastBand === 'high') {
    return profile.lastMoodScore != null && profile.lastMoodScore >= profile.lastAnxietyScore!
      ? 'mood'
      : 'anxiety';
  }

  return profile.dominantFocus ?? 'balanced';
}

function promptForPhq4(id: string, focus: CheckInFocus, sessionIndex: number): string {
  const focused = PHQ4_FOCUS_PROMPTS[focus]?.[id];
  if (focused) return focused;
  const variants = PHQ4_PROMPT_VARIANTS[id];
  if (variants?.length) return pickVariant(variants, sessionIndex);
  return PHQ4_QUESTIONS.find((q) => q.id === id)?.prompt ?? '';
}

function buildPhq4Set(focus: CheckInFocus, sessionIndex: number): CheckInQuestion[] {
  const order = PHQ4_ORDER_BY_FOCUS[focus];
  return order.map((id) => {
    const meta = PHQ4_META.find((m) => m.id === id)!;
    return buildPhq4Question(id, meta.dimension, promptForPhq4(id, focus, sessionIndex), meta.helper);
  });
}

function buildK10Set(focus: CheckInFocus, sessionIndex: number): CheckInQuestion[] {
  const ids = K10_BY_FOCUS[focus];
  return ids.map((id) => {
    const base = K10_QUESTIONS.find((q) => q.id === id);
    const variants = K10_VARIANTS[id];
    const prompt = variants?.length
      ? pickVariant(variants, sessionIndex)
      : (base?.prompt ?? '');
    return buildK10Question(id, prompt);
  });
}

export function personalizedOpener(mood: MoodOption, focus: CheckInFocus, profile: UserCheckInProfile): string {
  const label = mood.label.toLowerCase();

  if (profile.checkInCount === 0) {
    return `Hey ${mood.emoji} Welcome to your first chat check-in — I'm glad you're here. Today sounds ${label}; what's been on your mind?`;
  }

  const returning =
    profile.checkInCount >= 3
      ? "Good to see you again. "
      : '';

  switch (focus) {
    case 'anxiety':
      return `${returning}${mood.emoji} Worry and stress have come up before — no need to go over all of that again. How has today felt?`;
    case 'mood':
      return `${returning}${mood.emoji} I've noticed some heavier days lately. I'm here — what's today been like for you?`;
    case 'energy':
      return `${returning}${mood.emoji} Energy can really shape a day. How are you feeling right now?`;
    case 'stress':
      return `${returning}${mood.emoji} Sounds like today's been ${label}. What's been taking up space in your head?`;
    case 'social':
      return `${returning}${mood.emoji} Connection matters. How have people and relationships felt lately?`;
    case 'positive':
      return `${returning}${mood.emoji} Nice — today sounds ${label}. What's been going well, and is anything still on your mind?`;
    default:
      if (mood.value >= 3) {
        return `${returning}${mood.emoji} Today sounds ${label}. What's been going on for you?`;
      }
      if (mood.value <= 1) {
        return `${returning}${mood.emoji} I hear today's felt ${label}. I'm here with you — what's been on your mind?`;
      }
      return `${returning}${mood.emoji} Thanks for checking in. How has your day been?`;
  }
}

export function buildPersonalizedCheckInPlan(
  mood: MoodOption,
  scale: 'phq4' | 'k10',
  profile: UserCheckInProfile,
): PersonalizedCheckInPlan {
  const sessionIndex = profile.checkInCount;
  const focus = resolveFocus(mood, profile);
  const questions = scale === 'k10' ? buildK10Set(focus, sessionIndex) : buildPhq4Set(focus, sessionIndex);
  const opener = personalizedOpener(mood, focus, profile);

  return { questions, focus, opener, sessionIndex };
}

export function updateProfileAfterCheckIn(
  profile: UserCheckInProfile,
  mood: MoodOption,
  answers: RecordedAnswer[],
  band: BandLevel,
  anxietyScore?: number,
  moodScore?: number,
): UserCheckInProfile {
  const count = profile.checkInCount + 1;
  const avgMoodValue =
    profile.checkInCount === 0
      ? mood.value
      : Math.round(((profile.avgMoodValue * profile.checkInCount + mood.value) / count) * 10) / 10;

  const recentMoodIds = [mood.id, ...profile.recentMoodIds].slice(0, 5);

  let dominantFocus = profile.dominantFocus;
  if (anxietyScore != null && moodScore != null) {
    if (anxietyScore >= 3 && anxietyScore > moodScore + 1) dominantFocus = 'anxiety';
    else if (moodScore >= 3 && moodScore > anxietyScore + 1) dominantFocus = 'mood';
    else if (answers.some((a) => a.evidence && /\b(tired|sleep|exhaust)/i.test(a.evidence))) {
      dominantFocus = 'energy';
    } else if (answers.some((a) => a.evidence && /\b(work|stress|deadline)/i.test(a.evidence))) {
      dominantFocus = 'stress';
    } else if (answers.some((a) => a.evidence && /\b(friend|lonely|alone|family)/i.test(a.evidence))) {
      dominantFocus = 'social';
    } else if (avgMoodValue >= 3) dominantFocus = 'positive';
    else dominantFocus = 'balanced';
  }

  return {
    checkInCount: count,
    avgMoodValue,
    lastBand: band,
    dominantFocus,
    recentMoodIds,
    lastAnxietyScore: anxietyScore ?? profile.lastAnxietyScore,
    lastMoodScore: moodScore ?? profile.lastMoodScore,
    updatedAt: new Date().toISOString(),
  };
}
