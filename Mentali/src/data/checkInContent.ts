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
    prompt: 'Has anything been leaving you feeling wound up lately?',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_anx_2',
    prompt: 'When something is on your mind, does it tend to stick around?',
    helper: 'Like your thoughts keep circling back.',
    scale: 'phq4',
    dimension: 'anxiety',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_1',
    prompt: 'Have there been moments where things just felt heavy?',
    scale: 'phq4',
    dimension: 'mood',
    options: FREQUENCY_0_3,
  },
  {
    id: 'phq4_mood_2',
    prompt: 'Have the things you usually enjoy felt a bit flat lately?',
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
  'Have you been running on empty lately?',
  'Has your body felt tense or on edge more than usual?',
  'Have there been times when it was hard to calm down?',
  'Have hopeless moments come up at all?',
  'Has it been hard to settle or relax?',
  'Have you felt physically restless, like you cannot sit still?',
  'Have low or down moments been part of the picture?',
  'Has everything felt like more effort than it should?',
  'Have sad feelings been hard to shake?',
  'Have you been hard on yourself lately?',
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

export function greetingForUser(name: string): string {
  const first = name.trim().split(/\s+/)[0] || 'there';
  return `Hey ${first}. I am here to listen.`;
}

export const COPY = {
  greeting: greetingForUser(USER_NAME),
  intro: 'Want to talk a little about how today has been?',
  declined: 'No worries. I am here whenever you want to chat.',
  moodPrompt: 'Which face feels closest to your day?',
  moodThanks: (label: string) =>
    `Got it, today feels ${label.toLowerCase()}. Tell me what has been going on.`,
  acks: [
    'Thanks for sharing that.',
    'I appreciate you telling me.',
    'That helps me understand.',
    'Yeah, that makes sense.',
  ],
  beforeSummary:
    'Thank you for opening up. I will pull together a few thoughts and some support options if they might help.',
  k10Bridge:
    'That makes sense. Shifting a bit, how have the past few weeks felt for you overall?',
  disclaimer:
    'This chat is here to support you, not to diagnose or give medical advice. If anything worries you, please reach out to someone you trust or a support service in Singapore.',
  supportPrototypeNote:
    'Prototype demo: support requests are simulated in the app. No information is sent to helplines or organisations.',
  consentQuestion:
    'Would you like to explore Singapore helpline options?',
  consentNote:
    'You stay in control. This prototype only simulates arranging support. You choose if and when to call or message a service.',
} as const;

/** Quick replies shown as suggestion chips. */
export const QUICK_REPLIES = ['Thank you!', 'Goodbye!', 'Actually...'] as const;

/**
 * Singapore mental health support contacts for the support pathway UI.
 * Tapping call/WhatsApp opens the device dialler or WhatsApp only. No backend referral.
 */
export const SUPPORT_RESOURCES: SupportResource[] = [
  {
    label: 'National Mindline',
    description: '24/7 mental health support line in Singapore.',
    phone: '1771',
    tier: 'helpline',
  },
  {
    label: 'National Mindline (WhatsApp)',
    description: 'Chat support on WhatsApp.',
    whatsapp: 'https://wa.me/6566691771',
    tier: 'helpline',
  },
  {
    label: 'Samaritans of Singapore (SOS)',
    description: '24-hour emotional support. Confidential and free.',
    phone: '1767',
    url: 'https://www.sos.org.sg/',
    tier: 'helpline',
  },
  {
    label: 'SOS CareText (WhatsApp)',
    description: 'Text-based emotional support via WhatsApp.',
    whatsapp: 'https://wa.me/6591511767',
    tier: 'helpline',
  },
  {
    label: 'Emergency services',
    description: 'If you or someone else is in immediate danger, call 995 or go to the nearest A&E.',
    phone: '995',
    tier: 'crisis',
  },
];

export const HELPLINE_RESOURCES = SUPPORT_RESOURCES.filter((r) => r.tier === 'helpline');

export const CRISIS_RESOURCES = SUPPORT_RESOURCES.filter((r) => r.tier === 'crisis');

/** Default service shown at the end of the simulated escalation flow. */
export const SIMULATED_REFERRAL_RESOURCE = HELPLINE_RESOURCES[0];
