import type {
  BandLevel,
  MoodOption,
  RecordedAnswer,
  WellbeingBand,
  WellbeingResult,
} from '@/logic/checkin';

/**
 * Scoring helpers for check-in summaries.
 * Thresholds are used only for supportive messaging and guidance.
 */

const PHQ4_BANDS: Record<BandLevel, WellbeingBand> = {
  calm: {
    level: 'calm',
    title: 'A fairly steady day',
    message:
      'From what you shared, today sounds manageable overall. Small habits and staying connected can help keep it that way.',
  },
  mild: {
    level: 'mild',
    title: 'A few bumps today',
    message:
      'Some stress or low moments came through. That happens. A walk, a rest, or a chat with someone you trust can help.',
  },
  moderate: {
    level: 'moderate',
    title: 'Today felt heavier than usual',
    message:
      'It sounds like you have been carrying a fair bit. Reaching out to someone you trust, or a support service in Singapore, could help.',
  },
  high: {
    level: 'high',
    title: 'Please take yourself seriously today',
    message:
      'You shared that things have been really hard. You deserve support. Consider talking to someone you trust or a helpline soon.',
  },
};

const K10_BANDS: Record<BandLevel, WellbeingBand> = {
  calm: {
    level: 'calm',
    title: 'The past few weeks sound steadier',
    message: 'From our chat, the past few weeks seem generally settled. Keep noticing what helps you feel okay.',
  },
  mild: {
    level: 'mild',
    title: 'Some tough patches lately',
    message: 'Stress has shown up here and there, but it may feel manageable. Stay connected with people who care about you.',
  },
  moderate: {
    level: 'moderate',
    title: 'The past few weeks have been a lot',
    message:
      'It sounds like recent weeks have taken a toll. Talking to a trusted person or a Singapore support service could lighten the load.',
  },
  high: {
    level: 'high',
    title: 'You have been going through a lot',
    message:
      'From what you shared, the past while has been really heavy. Please consider speaking with someone you trust or a helpline soon.',
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
  if (anxiety > low && anxiety >= 3) focus = ', and stress seemed to be a big part of that';
  else if (low > anxiety && low >= 3) focus = ', and things feeling low seemed to weigh on you';

  const suggestion: Record<BandLevel, string> = {
    calm: 'Small moments like this help you notice how you are doing. Come back tomorrow if you can.',
    mild: 'If anything lingers, a message to a friend or a short reset can help.',
    moderate: 'This might be a good moment to reach out to someone you trust or explore support options below.',
    high: 'Please look at the support options below. You do not have to go through this alone.',
  };

  return `You came in feeling ${mood.label.toLowerCase()}${focus}. ${suggestion[level]}`;
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
