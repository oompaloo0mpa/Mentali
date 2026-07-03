import type { CheckInQuestion } from '@/logic/checkin';
import { FREQUENCY_0_3_OPTIONS } from '@/data/checkInContent';

const F = FREQUENCY_0_3_OPTIONS;

/** Alternate conversational prompts per dimension — scoring IDs stay the same. */
export const PHQ4_PROMPT_VARIANTS: Record<string, string[]> = {
  phq4_anx_1: [
    'Have you felt more keyed up or on edge than usual?',
    'Has tension been showing up in your body or mind lately?',
    'Have you felt wound up or restless at all recently?',
  ],
  phq4_anx_2: [
    'When worries show up, do they tend to stick around for a while?',
    'Does your mind keep circling back to things you wish you could let go of?',
    'Have you found it hard to quiet your thoughts once they start?',
  ],
  phq4_mood_1: [
    'Have there been moments where things felt a bit heavy or low?',
    'Have low or flat moments been part of your week?',
    'Has your mood felt heavier than you would like lately?',
  ],
  phq4_mood_2: [
    'Have the things you usually enjoy felt less exciting lately?',
    'Has motivation or interest in things you like dipped at all?',
    'Have fun or relaxing activities felt harder to get into?',
  ],
};

/** Focus-specific prompt overrides (used when we know what tends to matter for this person). */
export const PHQ4_FOCUS_PROMPTS: Record<string, Partial<Record<string, string>>> = {
  anxiety: {
    phq4_anx_1: 'Stress and worry have come up for you before — has that been around today?',
    phq4_anx_2: 'When your mind gets going, does it stay on things for a while?',
  },
  mood: {
    phq4_mood_1: 'Low moments have been part of the picture for you — how has that been lately?',
    phq4_mood_2: 'Have things you usually care about felt harder to enjoy recently?',
  },
  energy: {
    phq4_anx_1: 'When you are running low on energy, do you also feel more on edge?',
    phq4_mood_1: 'Has tiredness been dragging your mood down at all?',
  },
  stress: {
    phq4_anx_1: 'Has pressure or stress left you feeling keyed up?',
    phq4_anx_2: 'After a stressful moment, is it hard to switch off?',
  },
  social: {
    phq4_mood_1: 'Have connection or loneliness been affecting how you feel?',
    phq4_mood_2: 'Have social things or time with people felt less appealing lately?',
  },
  positive: {
    phq4_mood_2: "What's been bringing you joy or energy lately — has that stayed steady?",
    phq4_anx_1: 'Even on good days, does worry still creep in sometimes?',
  },
};

const K10_VARIANTS: Record<string, string[]> = {
  k10_1: [
    'Has tiredness been showing up even when you have not been doing much?',
    'Have you felt drained without a clear reason?',
  ],
  k10_2: [
    'Have you felt nervous or on edge more than usual?',
    'Has a sense of unease been around more than normal?',
  ],
  k10_3: [
    'Have there been times when anxiety felt hard to calm down?',
    'Has nervousness ever felt like it would not settle?',
  ],
  k10_4: [
    'Have moments of hopelessness come up at all?',
    'Have you had stretches where things felt pretty bleak?',
  ],
  k10_5: [
    'Have you felt restless, like it is hard to settle?',
    'Has it been difficult to feel at ease in your body?',
  ],
  k10_6: [
    'Has restlessness ever made it tough to sit still?',
    'Have you felt physically agitated or fidgety?',
  ],
  k10_7: [
    'Have low or down moments been part of the picture?',
    'Has sadness or low mood been showing up for you?',
  ],
  k10_8: [
    'Has everything felt like more of an effort than usual?',
    'Have daily tasks felt heavier or harder to start?',
  ],
  k10_9: [
    'Have sad feelings been hard to shake?',
    'Has low mood lingered even when you tried to lift it?',
  ],
  k10_10: [
    'Have you had thoughts about not feeling good enough or worthless?',
    'Have you been hard on yourself or feeling not good enough?',
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
