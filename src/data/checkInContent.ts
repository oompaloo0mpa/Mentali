import type { AnswerOption, CheckInQuestion, MoodOption } from '@/types/wellbeing';

/**
 * All user-facing copy + question content for the check-in flow lives here so
 * it is easy to tweak tone without touching UI code.
 *
 * The questions are *inspired* by PHQ-4 and K10 but deliberately reworded into
 * short, app-friendly language. We never present them as a medical test.
 */

export const USER_NAME = 'Jayden';

/** Today's one-tap mood picker (drives the emoji streak). */
export const MOODS: MoodOption[] = [
  { id: 'great', emoji: '😄', label: 'Great', value: 4 },
  { id: 'good', emoji: '🙂', label: 'Good', value: 3 },
  { id: 'okay', emoji: '😐', label: 'Okay', value: 2 },
  { id: 'low', emoji: '😟', label: 'Low', value: 1 },
  { id: 'rough', emoji: '😢', label: 'Rough', value: 0 },
];

/**
 * Shared 0-3 frequency scale for the brief (PHQ-4 style) daily questions.
 * Standard PHQ-4 wording is "Not at all / Several days / More than half the
 * days / Nearly every day" — softened here.
 */
const FREQUENCY_0_3: AnswerOption[] = [
  { label: 'Not really', value: 0 },
  { label: 'A little', value: 1 },
  { label: 'Quite a bit', value: 2 },
  { label: 'A lot', value: 3 },
];

/**
 * The default daily flow: 4 short questions (PHQ-4 inspired).
 * Items 1-2 lean anxiety, items 3-4 lean low mood. Total range 0-12.
 */
export const PHQ4_QUESTIONS: CheckInQuestion[] = [
  {
    id: 'phq4_anx_1',
    prompt: 'Over the last little while, have you felt nervous or on edge?',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_anx_2',
    prompt: 'Has worrying been hard to switch off?',
    helper: 'Like your mind keeps circling back to something.',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_1',
    prompt: 'Have you been feeling down or low?',
    scale: 'phq4',
    dimension: 'mood',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_2',
    prompt: 'Have things you usually enjoy felt a bit flat?',
    helper: 'Little interest or pleasure in doing things.',
    scale: 'phq4',
    dimension: 'mood',
    options: FREQUENCY_0_3,
  },
];

/**
 * Optional deeper check-in (K10 inspired): 10 items, each 1-5, total 10-50.
 * Offered only after the brief flow, never forced.
 */
const FREQUENCY_1_5: AnswerOption[] = [
  { label: 'None of the time', value: 1 },
  { label: 'A little', value: 2 },
  { label: 'Some of the time', value: 3 },
  { label: 'Most of the time', value: 4 },
  { label: 'All of the time', value: 5 },
];

export const K10_QUESTIONS: CheckInQuestion[] = [
  'tired for no clear reason',
  'nervous',
  'so nervous nothing could calm you down',
  'hopeless',
  'restless or fidgety',
  'so restless you could not sit still',
  'down or depressed',
  'that everything was an effort',
  'so sad nothing could cheer you up',
  'worthless',
].map((phrase, i) => ({
  id: `k10_${i + 1}`,
  prompt: `In the past 2 weeks, how often did you feel ${phrase}?`,
  scale: 'k10' as const,
  dimension: 'distress' as const,
  options: FREQUENCY_1_5,
}));

/** Conversational copy used to make the flow feel warm, not clinical. */
export const COPY = {
  greeting: `Hey there, ${USER_NAME}! I'm here to check in with you.`,
  intro: 'Want to talk a little about how today has been?',
  declined:
    'No worries, I am always here if you change your mind!',
  moodPrompt: 'First, which emoji feels closest to your day?',
  moodThanks: (label: string, emoji: string) =>
    `Thanks for sharing ${emoji} — let's keep it light. Just a few quick taps.`,
  // Gentle acknowledgements rotated between questions.
  acks: [
    'Thanks for being honest.',
    'Got it — no right or wrong answers here.',
    'Appreciate you sharing that.',
    'Thank you. One more after this.',
  ],
  beforeSummary: "That's everything — let me put together a gentle summary for you.",
  deeperInvite:
    'If you have another minute, we can do a slightly longer check-in. Totally optional.',
  disclaimer:
    'This is a supportive wellbeing check-in, not a diagnosis. If anything here worries you, please talk to someone you trust or a professional.',
} as const;

/** Free-text quick replies shown as chips (matches the screenshot). */
export const QUICK_REPLIES = ['Thank you!', 'Goodbye!', 'Actually...'] as const;
