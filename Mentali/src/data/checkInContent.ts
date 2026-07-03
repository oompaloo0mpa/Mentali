import type {
  AnswerOption,
  CheckInQuestion,
  MoodOption,
  SupportResource,
} from '@/logic/checkin';

/** Centralized copy and question content for the check-in flow. */

export const USER_NAME = 'Jayden';

export { MOODS, MOOD_OPTIONS, moodFromHomeIndex, moodById } from '@/data/moods';

export const FREQUENCY_0_3_OPTIONS: AnswerOption[] = [
  { label: 'Not really', value: 0 },
  { label: 'A little', value: 1 },
  { label: 'Quite a bit', value: 2 },
  { label: 'A lot', value: 3 },
];

const FREQUENCY_0_3 = FREQUENCY_0_3_OPTIONS;

/** Default daily flow: 4 short questions, total score 0-12. */
export const PHQ4_QUESTIONS: CheckInQuestion[] = [
  {
    id: 'phq4_anx_1',
    prompt: 'Have you felt more keyed up or on edge than usual?',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_anx_2',
    prompt: 'When worries show up, do they tend to stick around for a while?',
    helper: 'Like your mind keeps circling back to something.',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_1',
    prompt: 'Have there been moments where things felt a bit heavy or low?',
    scale: 'phq4',
    dimension: 'mood',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_2',
    prompt: 'Have the things you usually enjoy felt less exciting lately?',
    helper: 'Little interest or pleasure in doing things.',
    scale: 'phq4',
    dimension: 'mood',
    options: FREQUENCY_0_3,
  },
];

/** Optional deeper flow: 10 questions, each scored 1-5 (total 10-50). */
const FREQUENCY_1_5: AnswerOption[] = [
  { label: 'None of the time', value: 1 },
  { label: 'A little', value: 2 },
  { label: 'Some of the time', value: 3 },
  { label: 'Most of the time', value: 4 },
  { label: 'All of the time', value: 5 },
];

const K10_SUBTLE_PROMPTS = [
  'Has tiredness been showing up even when you have not been doing much?',
  'Have you felt nervous or on edge more than usual?',
  'Have there been times when anxiety felt hard to calm down?',
  'Have moments of hopelessness come up at all?',
  'Have you felt restless, like it is hard to settle?',
  'Has restlessness ever made it tough to sit still?',
  'Have low or down moments been part of the picture?',
  'Has everything felt like more of an effort than usual?',
  'Have sad feelings been hard to shake?',
  'Have you had thoughts about not feeling good enough or worthless?',
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
  prompt:
    K10_SUBTLE_PROMPTS[i] ??
    `Lately, has feeling ${phrase} been part of your experience?`,
  scale: 'k10' as const,
  dimension: 'distress' as const,
  options: FREQUENCY_1_5,
}));

export const COPY = {
  greeting: `Hey there, ${USER_NAME}! I'm here to check in with you.`,
  intro: 'Want to talk a little about how today has been?',
  declined:
    'No worries, I am always here if you change your mind!',
  moodPrompt: 'First, which emoji feels closest to your day?',
  moodThanks: (label: string, emoji: string) =>
    `Thanks for sharing ${emoji} — let's chat for a minute, nice and easy.`,
  acks: [
    'Thanks for being honest.',
    'Got it — no right or wrong answers here.',
    'Appreciate you sharing that.',
    'Thank you. One more after this.',
  ],
  beforeSummary: "That's everything — let me put together a gentle summary for you.",
  deeperInvite:
    'If you have another minute, we can do a slightly longer check-in. Totally optional.',
  deeperInviteStrong:
    'A few answers stood out today. A slightly longer check-in can give a clearer picture — only if you feel up to it.',
  disclaimer:
    'This is a supportive wellbeing check-in, not a diagnosis. If anything here worries you, please talk to someone you trust or a professional in Singapore.',
} as const;

/** Quick replies shown as suggestion chips. */
export const QUICK_REPLIES = ['Thank you!', 'Goodbye!', 'Actually...'] as const;

/**
 * Crisis and support contacts for Singapore.
 */
export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    label: 'Samaritans of Singapore (SOS)',
    description: '24-hour emotional support — confidential and free.',
    phone: '1767',
  },
  {
    label: 'National Care Hotline',
    description: 'Emotional support during difficult times.',
    phone: '18002026868',
  },
  {
    label: 'IMH Mental Health Helpline',
    description: 'Institute of Mental Health — professional support.',
    phone: '63892222',
  },
  {
    label: 'Emergency (ambulance)',
    description: 'If you or someone else is in immediate danger.',
    phone: '995',
  },
];
