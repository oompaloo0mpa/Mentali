import type {
  BandLevel,
  MoodOption,
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
  const itemCount = phq.length;
  const answered = phq.filter((a) => !a.skipped);

  // Prorate over the full item set so skipped answers do not deflate the score.
  const total = prorate(answered.map((a) => a.value), itemCount);
  const anxietyScore = prorate(
    answered.filter((a) => a.dimension === 'anxiety').map((a) => a.value),
    phq.filter((a) => a.dimension === 'anxiety').length,
  );
  const moodScore = prorate(
    answered.filter((a) => a.dimension === 'mood').map((a) => a.value),
    phq.filter((a) => a.dimension === 'mood').length,
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
    answeredCount: answered.length,
    itemCount,
  };
}

/** K10 style scoring: 10 items, 1-5 each, total 10-50. */
export function scoreK10(answers: RecordedAnswer[]): WellbeingResult {
  const k10 = answers.filter((a) => a.scale === 'k10');
  const itemCount = k10.length;
  const answered = k10.filter((a) => !a.skipped);
  const total = prorate(answered.map((a) => a.value), itemCount);

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
    answeredCount: answered.length,
    itemCount,
  };
}

/** Whether the PHQ-4 result warrants strongly recommending the K10 flow. */
export function shouldRecommendDeeper(phq4: WellbeingResult): boolean {
  return phq4.suggestSupport;
}

/** A short, personalized summary line combining mood and the leading concern. */
export function reflectionLine(
  mood: MoodOption,
  phq4: WellbeingResult,
  k10: WellbeingResult | null,
): string {
  const level = (k10 ?? phq4).band.level;
  const anxiety = phq4.anxietyScore ?? 0;
  const low = phq4.moodScore ?? 0;

  let focus = '';
  if (anxiety > low && anxiety >= 3) focus = ', and worry seems to be the louder part today';
  else if (low > anxiety && low >= 3) focus = ', and low mood seems to be weighing on you';

  const suggestion: Record<BandLevel, string> = {
    calm: 'Keep doing what works — a quick check-in tomorrow keeps the momentum.',
    mild: 'A small reset, like a short walk or a chat, can help.',
    moderate: 'Sharing how you feel with someone you trust could lighten the load.',
    high: 'Please consider reaching out to someone you trust or a professional soon.',
  };

  return `You checked in feeling ${mood.label.toLowerCase()}${focus}. ${suggestion[level]}`;
}

/** Plain-language label for a 0-6 sub-score. */
export function subscaleLabel(score: number): string {
  if (score >= 5) return 'Noticeable';
  if (score >= 3) return 'Present';
  if (score >= 1) return 'A little';
  return 'Minimal';
}

/** Mean of answered values scaled to the full item count, rounded. */
function prorate(values: number[], itemCount: number): number {
  if (values.length === 0 || itemCount === 0) return 0;
  const mean = values.reduce((acc, n) => acc + n, 0) / values.length;
  return Math.round(mean * itemCount);
}
