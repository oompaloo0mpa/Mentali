import type {
  BandLevel,
  RecordedAnswer,
  WellbeingBand,
  WellbeingResult,
} from '@/types/wellbeing';

/**
 * Scoring helpers for check-in summaries.
 * Thresholds are used only for supportive messaging and guidance.
 */

const PHQ4_BANDS: Record<BandLevel, WellbeingBand> = {
  calm: {
    level: 'calm',
    title: "You're in a steady place",
    message:
      'Your answers point to a calm day overall. Nice — small daily check-ins help keep it that way.',
  },
  mild: {
    level: 'mild',
    title: 'A few things on your mind',
    message:
      'Sounds like some mild ups and downs lately. That is completely normal. Be kind to yourself today.',
  },
  moderate: {
    level: 'moderate',
    title: "You're carrying a fair bit",
    message:
      'It looks like things have felt heavier recently. It can really help to share how you feel with someone you trust.',
  },
  high: {
    level: 'high',
    title: "You're carrying a lot right now",
    message:
      'Your answers suggest you have been going through a tough stretch. You do not have to handle it alone.',
  },
};

const K10_BANDS: Record<BandLevel, WellbeingBand> = {
  calm: {
    level: 'calm',
    title: 'Low distress',
    message: 'This longer check-in points to a generally settled couple of weeks.',
  },
  mild: {
    level: 'mild',
    title: 'Mild distress',
    message: 'Some stress has been around, but it looks manageable. Keep checking in.',
  },
  moderate: {
    level: 'moderate',
    title: 'Moderate distress',
    message:
      'These past weeks seem to have taken a toll. Reaching out to someone could lighten the load.',
  },
  high: {
    level: 'high',
    title: 'High distress',
    message:
      'This points to a lot of distress lately. Please consider talking to a professional or someone you trust soon.',
  },
};

/** PHQ-4 style scoring: 4 items, 0-3 each, total 0-12. */
export function scorePhq4(answers: RecordedAnswer[]): WellbeingResult {
  const phq = answers.filter((a) => a.scale === 'phq4');
  const total = sum(phq.map((a) => a.value));
  const anxietyScore = sum(
    phq.filter((a) => a.dimension === 'anxiety').map((a) => a.value),
  );
  const moodScore = sum(
    phq.filter((a) => a.dimension === 'mood').map((a) => a.value),
  );

  // PHQ-4 cut points: 0-2, 3-5, 6-8, 9-12.
  let level: BandLevel = 'calm';
  if (total >= 9) level = 'high';
  else if (total >= 6) level = 'moderate';
  else if (total >= 3) level = 'mild';

  // A sub-score of 3+ is the standard screening flag.
  const subscaleFlag = anxietyScore >= 3 || moodScore >= 3;
  const suggestSupport = level === 'moderate' || level === 'high' || subscaleFlag;

  return {
    scale: 'phq4',
    total,
    maxTotal: 12,
    band: PHQ4_BANDS[level],
    anxietyScore,
    moodScore,
    suggestSupport,
  };
}

/** K10 style scoring: 10 items, 1-5 each, total 10-50. */
export function scoreK10(answers: RecordedAnswer[]): WellbeingResult {
  const k10 = answers.filter((a) => a.scale === 'k10');
  const total = sum(k10.map((a) => a.value));

  // Common K10 bands: 10-19, 20-24, 25-29, 30-50.
  let level: BandLevel = 'calm';
  if (total >= 30) level = 'high';
  else if (total >= 25) level = 'moderate';
  else if (total >= 20) level = 'mild';

  return {
    scale: 'k10',
    total,
    maxTotal: 50,
    band: K10_BANDS[level],
    suggestSupport: level === 'moderate' || level === 'high',
  };
}

/** Plain-language label for a 0-6 sub-score. */
export function subscaleLabel(score: number): string {
  if (score >= 5) return 'Noticeable';
  if (score >= 3) return 'Present';
  if (score >= 1) return 'A little';
  return 'Minimal';
}

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}
