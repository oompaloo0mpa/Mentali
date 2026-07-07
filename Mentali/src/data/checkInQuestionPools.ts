import type { CheckInQuestion } from '@/logic/checkin';
import { FREQUENCY_0_3_OPTIONS } from '@/data/checkInContent';

const F = FREQUENCY_0_3_OPTIONS;

/** Alternate conversational prompts per dimension — scoring IDs stay the same. */
export const PHQ4_PROMPT_VARIANTS: Record<string, string[]> = {
  phq4_anx_1: [
    'Has anything been leaving you feeling wound up lately?',
    'Has tension been showing up in your body or mind lately?',
    'Have you felt restless or on edge at all recently?',
  ],
  phq4_anx_2: [
    'When something is on your mind, does it tend to stick around?',
    'Does your mind keep circling back to things you wish you could let go of?',
    'Have you found it hard to quiet your thoughts once they start?',
  ],
  phq4_mood_1: [
    'Have there been moments where things just felt heavy?',
    'Have low or flat moments been part of your week?',
    'Has your mood felt heavier than you would like lately?',
  ],
  phq4_mood_2: [
    'Have the things you usually enjoy felt a bit flat lately?',
    'Has motivation or interest in things you like dipped at all?',
    'Have fun or relaxing activities felt harder to get into?',
  ],
};

/** Focus-specific prompt overrides (used when we know what tends to matter for this person). */
export const PHQ4_FOCUS_PROMPTS: Record<string, Partial<Record<string, string>>> = {
  anxiety: {
    phq4_anx_1: 'Worry has come up for you before. Has that been around much lately?',
    phq4_anx_2: 'When your mind gets going, does it stay on things for a while?',
  },
  mood: {
    phq4_mood_1: 'Heavier days have been part of the picture for you. How has that been lately?',
    phq4_mood_2: 'Have things you usually care about felt harder to enjoy recently?',
  },
  energy: {
    phq4_anx_1: 'When you are running low on energy, do you also feel more on edge?',
    phq4_mood_1: 'Has tiredness been dragging your mood down at all?',
  },
  stress: {
    phq4_anx_1: 'Has pressure or stress left you feeling wound up?',
    phq4_anx_2: 'After a stressful moment, is it hard to switch off?',
  },
  social: {
    phq4_mood_1: 'Have connection or loneliness been affecting how you feel?',
    phq4_mood_2: 'Have social things or time with people felt less appealing lately?',
  },
  positive: {
    phq4_mood_2: "What's been bringing you joy or energy lately? Has that stayed steady?",
    phq4_anx_1: 'Even on good days, does worry still creep in sometimes?',
  },
};

const K10_VARIANTS: Record<string, string[]> = {
  k10_1: [
    'Have you been running on empty lately?',
    'Have you felt drained without a clear reason?',
  ],
  k10_2: [
    'Has your body felt tense or on edge more than usual?',
    'Has a sense of unease been around more than normal?',
  ],
  k10_3: [
    'Have there been times when it was hard to calm down?',
    'Has nervousness ever felt like it would not settle?',
  ],
  k10_4: [
    'Have hopeless moments come up at all?',
    'Have you had stretches where things felt pretty bleak?',
  ],
  k10_5: [
    'Has it been hard to settle or relax?',
    'Has it been difficult to feel at ease in your body?',
  ],
  k10_6: [
    'Have you felt physically restless, like you cannot sit still?',
    'Have you felt physically agitated or fidgety?',
  ],
  k10_7: [
    'Have low or down moments been part of the picture?',
    'Has sadness or low mood been showing up for you?',
  ],
  k10_8: [
    'Has everything felt like more effort than it should?',
    'Have daily tasks felt heavier or harder to start?',
  ],
  k10_9: [
    'Have sad feelings been hard to shake?',
    'Has low mood lingered even when you tried to lift it?',
  ],
  k10_10: [
    'Have you been hard on yourself lately?',
    'Have you been feeling not good enough in your own eyes?',
  ],
};

const K10_PHRASES = [
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
];

const FREQUENCY_1_5 = [
  { label: 'None of the time', value: 1 },
  { label: 'A little', value: 2 },
  { label: 'Some of the time', value: 3 },
  { label: 'Most of the time', value: 4 },
  { label: 'All of the time', value: 5 },
];

export function buildPhq4Question(
  id: string,
  dimension: 'anxiety' | 'mood',
  prompt: string,
  helper?: string,
): CheckInQuestion {
  return {
    id,
    prompt,
    helper,
    scale: 'phq4',
    dimension,
    options: F,
  };
}

export function buildK10Question(id: string, prompt: string): CheckInQuestion {
  return {
    id,
    prompt,
    scale: 'k10',
    dimension: 'distress',
    options: FREQUENCY_1_5,
  };
}

export function pickVariant(variants: string[], sessionIndex: number): string {
  if (variants.length === 0) return '';
  return variants[sessionIndex % variants.length];
}

export { K10_PHRASES, K10_VARIANTS, FREQUENCY_1_5 };
