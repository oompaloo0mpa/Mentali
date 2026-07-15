import type {
  AnswerOption,
  CheckInQuestion,
  Dimension,
  MoodOption,
  RecordedAnswer,
  ScaleKind,
} from '@/logic/checkin';
import { COPY } from '@/data/checkInContent';

export type ConversationPhase = 'mood' | 'opening' | 'exploring' | 'clarifying' | 'closing';

export type SignalSource = 'free_text' | 'chip' | 'inferred' | 'skipped';

export interface DimensionSignal {
  questionId: string;
  scale: ScaleKind;
  dimension: Dimension;
  value: number;
  label: string;
  confidence: number;
  evidence?: string;
  source: SignalSource;
  skipped?: boolean;
}

export interface CheckInConversationState {
  mood: MoodOption | null;
  phase: ConversationPhase;
  turnCount: number;
  signals: Record<string, DimensionSignal>;
  clarifyingId: string | null;
  /** Last topic question the bot asked — used to interpret short replies like "yes". */
  lastAskedQuestionId: string | null;
  deeper: boolean;
  maxTurns: number;
  sessionOpener?: string | null;
  focus?: string | null;
}

export type ConversationReply = {
  message: string;
  helper?: string | null;
  finished: boolean;
  showChips: boolean;
  chipOptions: AnswerOption[];
  showMoodPicker: boolean;
  state: CheckInConversationState;
};

const PHQ4_SUBTLE: Record<string, string> = {
  phq4_anx_1: 'Has anything been leaving you feeling wound up lately?',
  phq4_anx_2: 'When something is on your mind, does it tend to stick around?',
  phq4_mood_1: 'Have there been moments where things just felt heavy?',
  phq4_mood_2: 'Have the things you usually enjoy felt a bit flat lately?',
};

const K10_SUBTLE: Record<string, string> = {
  k10_1: 'Have you been running on empty lately?',
  k10_2: 'Has your body felt tense or on edge more than usual?',
  k10_3: 'Have there been times when it was hard to calm down?',
  k10_4: 'Have hopeless moments come up at all?',
  k10_5: 'Has it been hard to settle or relax?',
  k10_6: 'Have you felt physically restless, like you cannot sit still?',
  k10_7: 'Have low or down moments been part of the picture?',
  k10_8: 'Has everything felt like more effort than it should?',
  k10_9: 'Have sad feelings been hard to shake?',
  k10_10: 'Have you been hard on yourself lately?',
};

const OPEN_CURIOSITY = [
  "What's been taking up most of your headspace lately?",
  'Tell me a bit more about what that has been like for you.',
  'What part of that has felt hardest?',
  'Is there more you want to get off your chest?',
  'How has that been affecting the rest of your day?',
];

const ORGANIC_FOLLOWUPS = [
  'What else has been sitting with you?',
  'Has anything helped, even a little?',
  'How have the people around you been through all this?',
  'What would a slightly better day look like for you?',
];

const THEME_KEYWORDS: Record<string, RegExp> = {
  phq4_anx_1: /\b(anxious|anxiety|nervous|on edge|keyed up|tense|stress|stressed|panic|worried|worry|restless)\b/i,
  phq4_anx_2: /\b(worry|worries|ruminat|overthink|can't stop|cannot stop|mind (won't|wont)|racing thoughts|spiral|switch off|switching off|stuck in my head)\b/i,
  phq4_mood_1: /\b(down|low|sad|depress|heavy|empty|hopeless|miserable|unhappy|blue|flat mood|gloomy)\b/i,
  phq4_mood_2: /\b(don't enjoy|dont enjoy|no interest|lost interest|unmotivated|can't be bothered|nothing fun|flat|blah|meh|don't care)\b/i,
  k10_1: /\b(tired|exhaust|fatigue|drained|no energy|worn out|sleepy)\b/i,
  k10_2: /\b(nervous|anxious|on edge|uneasy|tense)\b/i,
  k10_3: /\b(panic|can't calm|cannot calm|overwhelm|freaking out|nothing helps)\b/i,
  k10_4: /\b(hopeless|no hope|what's the point|whats the point|give up)\b/i,
  k10_5: /\b(restless|fidget|agitated|can't relax|cannot relax)\b/i,
  k10_6: /\b(sit still|can't sit|cannot sit|pacing|antsy)\b/i,
  k10_7: /\b(down|depress|low mood|sad|miserable)\b/i,
  k10_8: /\b(effort|exhausting|hard to do|everything feels hard|draining)\b/i,
  k10_9: /\b(sad|cheer up|nothing cheers|cry|crying|unhappy)\b/i,
  k10_10: /\b(worthless|not good enough|failure|useless|hate myself)\b/i,
};

const INTENSITY_HIGH = /\b(a lot|all the time|constantly|every day|always|very much|really|so much|nonstop|can't cope)\b/i;
const INTENSITY_MID = /\b(often|most days|frequently|quite a bit|pretty|fair bit|sometimes|some days)\b/i;
const INTENSITY_LOW = /\b(a little|occasionally|once in a while|not much|barely|rarely|bit)\b/i;
const INTENSITY_NONE = /\b(not at all|not really|never|nope|none|no problem|no issues)\b/i;

/** Words that signal the person is doing well — treated as low distress. */
const POSITIVE_SENTIMENT =
  /\b(fine|good|great|okay|ok|alright|all right|managing|better|best|happy|glad|calm|relaxed|relaxing|peaceful|content|grateful|thankful|productive|motivated|energ\w*|excited|exciting|fun|wonderful|amazing|awesome|hopeful|proud|confident|refreshed|rested|positive|chill|nice|lovely|enjoy\w*|smil\w*|joy\w*)\b/i;
const NEGATION_NEARBY =
  /\b(not|never|no|hardly|barely|isn't|isnt|wasn't|wasnt|aren't|arent|don't|dont|didn't|didnt|can't|cant|couldn't|couldnt|won't|wont|wouldn't|wouldnt)\b/i;

/** True when the reply reads as genuinely positive (and is not negated). */
function hasPositiveSentiment(text: string): boolean {
  return POSITIVE_SENTIMENT.test(text) && !NEGATION_NEARBY.test(text);
}

const DONE_PHRASES = /\b(that's all|thats all|i'm done|im done|enough|skip|move on|no more|stop|finish|summary)\b/i;
const SKIP_PHRASES = /\b(prefer not|rather not|don't want to|dont want to|pass|not now|maybe later)\b/i;

export function createConversationState(
  questions: CheckInQuestion[],
  mood: MoodOption | null,
  sessionOpener?: string | null,
  focus?: string | null,
): CheckInConversationState {
  const hasK10 = questions.some((q) => q.scale === 'k10');
  const deeper = hasK10 && !questions.some((q) => q.scale === 'phq4');
  return {
    mood,
    phase: mood ? 'opening' : 'mood',
    turnCount: 0,
    signals: {},
    clarifyingId: null,
    lastAskedQuestionId: null,
    deeper,
    maxTurns: maxTurnsForMood(mood, questions),
    sessionOpener: sessionOpener ?? null,
    focus: focus ?? null,
  };
}

function promptFromQuestions(questions: CheckInQuestion[], questionId: string): string | null {
  return questions.find((q) => q.id === questionId)?.prompt ?? null;
}

function maxTurnsForMood(mood: MoodOption | null, questions: CheckInQuestion[]): number {
  const hasK10 = questions.some((q) => q.scale === 'k10');
  const hasPhq4 = questions.some((q) => q.scale === 'phq4');
  const unified = hasK10 && hasPhq4;

  if (unified) {
    if (!mood || mood.value <= 1) return Math.max(10, questions.length);
    if (mood.value === 2) return Math.max(9, questions.length);
    return Math.max(8, questions.length);
  }

  if (hasK10) {
    if (!mood || mood.value <= 1) return 7;
    if (mood.value === 2) return 6;
    return 5;
  }

  if (!mood || mood.value >= 3) return 3;
  if (mood.value === 2) return 4;
  return 5;
}

function questionCovered(signals: Record<string, DimensionSignal>, questionId: string): boolean {
  const s = signals[questionId];
  return !!s && (s.confidence >= 0.55 || !!s.skipped);
}

function isFirstK10Target(
  questions: CheckInQuestion[],
  signals: Record<string, DimensionSignal>,
  target: CheckInQuestion,
): boolean {
  if (target.scale !== 'k10') return false;
  const phq4Qs = questions.filter((q) => q.scale === 'phq4');
  const phq4Complete = phq4Qs.length === 0 || phq4Qs.every((q) => questionCovered(signals, q.id));
  if (!phq4Complete) return false;
  const firstK10 = questions.find((q) => q.scale === 'k10' && !questionCovered(signals, q.id));
  return firstK10?.id === target.id;
}

function gentleClarifyPrompt(questionId: string, deeper: boolean, questions: CheckInQuestion[]): string {
  const phq4: Record<string, string> = {
    phq4_anx_1: 'Has that wound-up feeling been around much, or more of a today thing?',
    phq4_anx_2: 'Does your mind tend to stay on things even when you want a break from them?',
    phq4_mood_1: 'Have the heavier moments been weighing on you, or do they come and go?',
    phq4_mood_2: 'Have the things you usually enjoy felt less satisfying than normal?',
  };
  if (!deeper) return phq4[questionId] ?? subtlePrompt(questionId, false, questions);

  return (
    K10_SUBTLE[questionId] ??
    promptFromQuestions(questions, questionId) ??
    'How has that been for you over the past couple of weeks?'
  );
}

function subtlePrompt(questionId: string, _deeper: boolean, questions: CheckInQuestion[]): string {
  const custom = promptFromQuestions(questions, questionId);
  if (custom) return custom;
  const scale = questions.find((q) => q.id === questionId)?.scale;
  if (scale === 'k10' || questionId.startsWith('k10_')) {
    return K10_SUBTLE[questionId] ?? 'How has that been for you over the past couple of weeks?';
  }
  return PHQ4_SUBTLE[questionId] ?? 'How has that been for you lately?';
}

function moodOpener(mood: MoodOption, deeper: boolean, sessionOpener?: string | null): string {
  if (sessionOpener) return sessionOpener;
  const label = mood.label.toLowerCase();
  if (deeper) {
    return `We can take this slowly. Tell me how the past couple of weeks have felt.`;
  }
  if (mood.value >= 3) {
    return `Sounds like today has been on the ${label} side. What has been going on for you?`;
  }
  if (mood.value <= 1) {
    return `I can hear today has felt pretty ${label}. I am here with you. What has been on your mind?`;
  }
  return `Thanks for sharing. Today sounds ${label}. How has your day been?`;
}

function reflectUserText(text: string): string {
  const t = text.toLowerCase();
  // Reflect the strongest theme in what they said. Distress topics are checked
  // before positivity so a mixed message ("work is rough but...") is met with care.
  if (/\b(sad|down|low|depress|hopeless|cry|crying|miserable)\b/.test(t)) return 'Thank you for trusting me with that.';
  if (/\b(stress|overwhelm|anxious|worry|worried|panic)\b/.test(t)) return 'That sounds like a lot to carry.';
  if (/\b(tired|exhaust|sleep|insomnia|can't sleep|cant sleep|drained)\b/.test(t)) return 'Being worn out makes everything feel heavier.';
  if (/\b(work|job|school|exam|deadline|boss)\b/.test(t)) return 'Work pressure can really sit with you.';
  if (/\b(family|friend|partner|relationship|lonely|alone)\b/.test(t)) return 'Relationships and connection matter so much.';
  if (hasPositiveSentiment(t)) return "That's really good to hear.";
  if (text.trim().length < 8) return '';
  return 'Thanks for sharing that with me.';
}

function conversationalMessage(parts: Array<string | null | undefined>): string {
  return parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function promptForTurn(
  state: CheckInConversationState,
  questions: CheckInQuestion[],
  target: CheckInQuestion,
  userMessage: string,
  extracted: DimensionSignal[],
  embedded: string | null,
): string {
  if (embedded) return embedded;

  const trimmed = userMessage.trim();
  const richReply = trimmed.length > 60;
  const strongSignals = extracted.filter((s) => s.confidence >= 0.65).length;

  if (state.turnCount <= 3 && trimmed.length < 28 && strongSignals === 0) {
    return OPEN_CURIOSITY[state.turnCount % OPEN_CURIOSITY.length];
  }

  if ((richReply || strongSignals >= 2) && state.turnCount < state.maxTurns - 1) {
    return ORGANIC_FOLLOWUPS[state.turnCount % ORGANIC_FOLLOWUPS.length];
  }

  if (state.turnCount <= 2 && strongSignals === 0) {
    return OPEN_CURIOSITY[state.turnCount % OPEN_CURIOSITY.length];
  }

  return softenPrompt(subtlePrompt(target.id, state.deeper, questions), state.turnCount);
}

const SOFT_PREFIXES = ['', '', 'I have been wondering, ', 'If it is okay to ask, '];

function softenPrompt(prompt: string, turnCount = 0): string {
  const prefix = SOFT_PREFIXES[turnCount % SOFT_PREFIXES.length];
  if (!prefix) return prompt;
  return `${prefix}${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`;
}

function pickOrganicFollowUp(
  state: CheckInConversationState,
  userMessage: string,
  target: CheckInQuestion | null,
  questions: CheckInQuestion[],
): string {
  const embedded = target ? embeddedFollowUp(userMessage, target) : null;
  if (embedded) return embedded;

  if (state.turnCount <= 4) {
    return ORGANIC_FOLLOWUPS[state.turnCount % ORGANIC_FOLLOWUPS.length];
  }

  if (target) {
    return softenPrompt(subtlePrompt(target.id, state.deeper, questions), state.turnCount);
  }

  return ORGANIC_FOLLOWUPS[state.turnCount % ORGANIC_FOLLOWUPS.length];
}

const AFFIRMATIVE_REPLY = /^\s*(yes|yeah|yep|yup|sure|definitely|absolutely|true|correct|i have|i do)\s*[.!]?$/i;
const NEGATIVE_REPLY = /^\s*(no|nah|nope|not really|not much|none|never)\s*[.!]?$/i;

function isShortDirectReply(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > 32) return false;
  return AFFIRMATIVE_REPLY.test(trimmed) || NEGATIVE_REPLY.test(trimmed);
}

function recordAnswerForQuestion(
  question: CheckInQuestion,
  text: string,
  source: SignalSource = 'free_text',
): DimensionSignal {
  const intensity = inferIntensity(text, question.scale);
  return {
    questionId: question.id,
    scale: question.scale,
    dimension: question.dimension,
    value: intensity.value,
    label: intensity.label,
    // Enough to count the item as covered, but low enough that a clearer signal
    // later (or a keyword match) can still override it.
    confidence: Math.max(intensity.confidence, 0.7),
    evidence: text.slice(0, 120),
    source,
  };
}

function inferIntensity(text: string, scale: ScaleKind): { value: number; label: string; confidence: number } {
  const trimmed = text.trim();
  if (AFFIRMATIVE_REPLY.test(trimmed)) {
    return scale === 'k10'
      ? { value: 4, label: 'Most of the time', confidence: 0.9 }
      : { value: 2, label: 'Quite a bit', confidence: 0.9 };
  }
  if (NEGATIVE_REPLY.test(trimmed)) {
    return scale === 'k10'
      ? { value: 1, label: 'None of the time', confidence: 0.9 }
      : { value: 0, label: 'Not really', confidence: 0.9 };
  }
  // Positive/settled language, or an explicit "not at all", reads as low distress.
  if (INTENSITY_NONE.test(text) || hasPositiveSentiment(text)) {
    return scale === 'k10'
      ? { value: 1, label: 'None of the time', confidence: 0.75 }
      : { value: 0, label: 'Not really', confidence: 0.75 };
  }
  if (INTENSITY_HIGH.test(text)) {
    return scale === 'k10'
      ? { value: 5, label: 'All of the time', confidence: 0.85 }
      : { value: 3, label: 'A lot', confidence: 0.85 };
  }
  if (INTENSITY_MID.test(text)) {
    return scale === 'k10'
      ? { value: 4, label: 'Most of the time', confidence: 0.7 }
      : { value: 2, label: 'Quite a bit', confidence: 0.7 };
  }
  if (INTENSITY_LOW.test(text)) {
    return scale === 'k10'
      ? { value: 2, label: 'A little', confidence: 0.65 }
      : { value: 1, label: 'A little', confidence: 0.65 };
  }
  // No clear signal: lean mild rather than moderate so vague or neutral replies
  // do not quietly inflate the wellbeing score.
  return scale === 'k10'
    ? { value: 2, label: 'A little', confidence: 0.45 }
    : { value: 1, label: 'A little', confidence: 0.45 };
}

function extractSignalsFromText(
  text: string,
  questions: CheckInQuestion[],
): DimensionSignal[] {
  const found: DimensionSignal[] = [];
  for (const q of questions) {
    const pattern = THEME_KEYWORDS[q.id];
    if (!pattern?.test(text)) continue;
    const intensity = inferIntensity(text, q.scale);
    found.push({
      questionId: q.id,
      scale: q.scale,
      dimension: q.dimension,
      value: intensity.value,
      label: intensity.label,
      confidence: intensity.confidence,
      evidence: text.slice(0, 120),
      source: 'free_text',
    });
  }
  return found;
}

function mergeSignal(
  signals: Record<string, DimensionSignal>,
  incoming: DimensionSignal,
): Record<string, DimensionSignal> {
  const existing = signals[incoming.questionId];
  if (!existing || incoming.confidence >= existing.confidence) {
    return { ...signals, [incoming.questionId]: incoming };
  }
  return signals;
}

function mergeSignals(
  signals: Record<string, DimensionSignal>,
  incoming: DimensionSignal[],
): Record<string, DimensionSignal> {
  return incoming.reduce((acc, s) => mergeSignal(acc, s), signals);
}

function uncoveredQuestions(questions: CheckInQuestion[], signals: Record<string, DimensionSignal>): CheckInQuestion[] {
  return questions.filter((q) => {
    const s = signals[q.id];
    return !s || (s.confidence < 0.55 && !s.skipped);
  });
}

function coverageRatio(questions: CheckInQuestion[], signals: Record<string, DimensionSignal>): number {
  const covered = questions.filter((q) => {
    const s = signals[q.id];
    return s && (s.confidence >= 0.55 || s.skipped);
  }).length;
  return questions.length === 0 ? 1 : covered / questions.length;
}

function pickClarifyTarget(questions: CheckInQuestion[], signals: Record<string, DimensionSignal>): CheckInQuestion | null {
  const phq4Qs = questions.filter((q) => q.scale === 'phq4');
  const phq4Uncovered = uncoveredQuestions(phq4Qs, signals);
  if (phq4Uncovered.length > 0) {
    return phq4Uncovered.sort(
      (a, b) => (signals[a.id]?.confidence ?? 0) - (signals[b.id]?.confidence ?? 0),
    )[0];
  }

  const k10Qs = questions.filter((q) => q.scale === 'k10');
  const k10Uncovered = uncoveredQuestions(k10Qs, signals);
  if (k10Uncovered.length > 0) {
    return k10Uncovered.sort(
      (a, b) => (signals[a.id]?.confidence ?? 0) - (signals[b.id]?.confidence ?? 0),
    )[0];
  }

  return null;
}

function embeddedFollowUp(
  lastUserText: string,
  target: CheckInQuestion,
): string | null {
  const t = lastUserText.toLowerCase();
  if (target.id === 'phq4_anx_2' && /\b(worry|stress|work|mind)\b/.test(t)) {
    return 'You mentioned that. Is it hard to switch off after?';
  }
  if (target.id === 'phq4_mood_2' && /\b(tired|flat|blah|meh)\b/.test(t)) {
    return 'Has stuff you normally enjoy felt less appealing lately?';
  }
  if (target.id === 'phq4_anx_1' && /\b(stress|nervous|tense)\b/.test(t)) {
    return 'Sounds like that has left you pretty wound up.';
  }
  if (target.id === 'phq4_mood_1' && /\b(sad|down|rough|hard)\b/.test(t)) {
    return 'Those heavier moments can really linger.';
  }
  return null;
}

function closingMessage(mood: MoodOption | null): string {
  if (mood && mood.value <= 1) {
    return 'Thank you for sharing all of that. It takes courage. Whenever you are ready, I can show you a summary with a few support ideas.';
  }
  return 'Thanks for chatting with me. Whenever you are ready, tap below and I will share a summary with some next steps.';
}

export function signalsToRecordedAnswers(
  questions: CheckInQuestion[],
  signals: Record<string, DimensionSignal>,
): RecordedAnswer[] {
  return questions.map((q) => {
    const s = signals[q.id];
    if (!s) {
      return {
        questionId: q.id,
        scale: q.scale,
        dimension: q.dimension,
        value: q.scale === 'k10' ? 1 : 0,
        label: 'Prefer not to say',
        skipped: true,
        confidence: 0,
        source: 'skipped',
      };
    }
    return {
      questionId: s.questionId,
      scale: s.scale,
      dimension: s.dimension,
      value: s.value,
      label: s.label,
      skipped: s.skipped,
      confidence: s.confidence,
      evidence: s.evidence,
      source: s.source,
    };
  });
}

export function advanceConversation(payload: {
  state: CheckInConversationState;
  questions: CheckInQuestion[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
  selectedMood?: MoodOption | null;
}): ConversationReply {
  const { questions } = payload;
  let state = { ...payload.state, signals: { ...payload.state.signals } };
  const { userMessage, selectedOption, selectedMood } = payload;

  if (state.phase === 'mood' && selectedMood) {
    state = {
      ...state,
      mood: selectedMood,
      phase: 'exploring',
      maxTurns: maxTurnsForMood(selectedMood, questions),
    };
    return {
      message: moodOpener(selectedMood, state.deeper, state.sessionOpener),
      helper: null,
      finished: false,
      showChips: false,
      chipOptions: [],
      showMoodPicker: false,
      state,
    };
  }

  if (state.phase === 'mood') {
    return {
      message: COPY.moodPrompt,
      helper: null,
      finished: false,
      showChips: false,
      chipOptions: [],
      showMoodPicker: true,
      state,
    };
  }

  if (state.phase === 'opening' && !userMessage && !selectedOption) {
    const mood = state.mood!;
    return {
      message: moodOpener(mood, state.deeper, state.sessionOpener),
      helper: null,
      finished: false,
      showChips: false,
      chipOptions: [],
      showMoodPicker: false,
      state: { ...state, phase: 'exploring' },
    };
  }

  if (userMessage && DONE_PHRASES.test(userMessage) && state.turnCount > 0) {
    return {
      message: closingMessage(state.mood),
      helper: null,
      finished: true,
      showChips: false,
      chipOptions: [],
      showMoodPicker: false,
      state: { ...state, phase: 'closing' },
    };
  }

  if (userMessage) {
    state.turnCount += 1;
    const activeClarify = state.clarifyingId
      ? questions.find((q) => q.id === state.clarifyingId)
      : state.lastAskedQuestionId
        ? questions.find((q) => q.id === state.lastAskedQuestionId)
        : null;

    if (SKIP_PHRASES.test(userMessage) && activeClarify) {
      const skipSignal: DimensionSignal = {
        questionId: activeClarify.id,
        scale: activeClarify.scale,
        dimension: activeClarify.dimension,
        value: activeClarify.scale === 'k10' ? 1 : 0,
        label: 'Prefer not to say',
        confidence: 0.9,
        source: 'skipped',
        skipped: true,
      };
      state.signals = mergeSignal(state.signals, skipSignal);
      state.clarifyingId = null;
      state.lastAskedQuestionId = null;
      state.phase = 'exploring';

      if (shouldFinish(state, questions)) return finishReply(state);

      const next = pickClarifyTarget(questions, state.signals);
      return askNextQuestion(state, questions, 'No worries.', next);
    }

    const pendingId =
      state.clarifyingId ?? (isShortDirectReply(userMessage) ? state.lastAskedQuestionId : null);
    if (pendingId) {
      const pendingQ = questions.find((q) => q.id === pendingId);
      if (pendingQ) {
        const targeted = extractSignalsFromText(userMessage, [pendingQ]);
        if (targeted.length > 0) {
          state.signals = mergeSignals(state.signals, targeted);
        } else {
          state.signals = mergeSignal(state.signals, recordAnswerForQuestion(pendingQ, userMessage));
        }
      }
      state.clarifyingId = null;
      state.lastAskedQuestionId = null;
      state.phase = 'exploring';
    }

    const extracted = extractSignalsFromText(userMessage, questions);
    state.signals = mergeSignals(state.signals, extracted);
    const reflection = reflectUserText(userMessage);
    const richReply = userMessage.trim().length > 60;
    const strongExtraction = extracted.some((s) => s.confidence >= 0.65) || extracted.length >= 2;

    if (shouldFinish(state, questions)) {
      return {
        message: conversationalMessage([reflection, closingMessage(state.mood)]),
        helper: null,
        finished: true,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state: { ...state, phase: 'closing', lastAskedQuestionId: null },
      };
    }

    const target = pickClarifyTarget(questions, state.signals);
    if (!target) return finishReply(state);

    const embedded = embeddedFollowUp(userMessage, target);
    const weakSignal = state.signals[target.id];
    const needsFollowUp = !embedded && (!weakSignal || weakSignal.confidence < 0.55);

    if ((richReply || strongExtraction) && state.turnCount < state.maxTurns - 1 && !needsFollowUp) {
      state.phase = 'exploring';
      return {
        message: conversationalMessage([
          reflection,
          pickOrganicFollowUp(state, userMessage, pickClarifyTarget(questions, state.signals), questions),
        ]),
        helper: null,
        finished: false,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state: { ...state, lastAskedQuestionId: null },
      };
    }

    if (needsFollowUp && state.turnCount >= 5) {
      state.clarifyingId = target.id;
      state.lastAskedQuestionId = target.id;
      state.phase = 'exploring';
      return {
        message: conversationalMessage([
          reflection,
          gentleClarifyPrompt(target.id, state.deeper, questions),
        ]),
        helper: null,
        finished: false,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state,
      };
    }

    state.phase = 'exploring';
    const prompt = promptForTurn(state, questions, target, userMessage, extracted, embedded);
    return askNextQuestion(state, questions, reflection, target, prompt);
  }

  return {
    message: 'I am still here. Share whatever comes to mind.',
    helper: null,
    finished: false,
    showChips: false,
    chipOptions: [],
    showMoodPicker: false,
    state,
  };
}

function askNextQuestion(
  state: CheckInConversationState,
  questions: CheckInQuestion[],
  reflection: string,
  target: CheckInQuestion | null,
  promptOverride?: string,
): ConversationReply {
  if (!target) {
    return finishReply(state);
  }
  const prompt = promptOverride ?? subtlePrompt(target.id, state.deeper, questions);
  const bridge = isFirstK10Target(questions, state.signals, target) ? COPY.k10Bridge : null;
  const outgoing = conversationalMessage([reflection, bridge, softenPrompt(prompt, state.turnCount)]);

  return {
    message: outgoing,
    helper: null,
    finished: false,
    showChips: false,
    chipOptions: [],
    showMoodPicker: false,
    state: { ...state, lastAskedQuestionId: target.id, clarifyingId: null },
  };
}

function shouldFinish(state: CheckInConversationState, questions: CheckInQuestion[]): boolean {
  if (state.turnCount >= state.maxTurns) return true;

  const phq4Qs = questions.filter((q) => q.scale === 'phq4');
  const k10Qs = questions.filter((q) => q.scale === 'k10');

  if (phq4Qs.length > 0 && k10Qs.length > 0) {
    const phq4Done = coverageRatio(phq4Qs, state.signals) >= 0.75;
    const k10Done = coverageRatio(k10Qs, state.signals) >= 0.6;
    return phq4Done && k10Done && state.turnCount >= phq4Qs.length + 2;
  }

  const ratio = coverageRatio(questions, state.signals);
  if (state.deeper || k10Qs.length > 0) return ratio >= 0.6 && state.turnCount >= 4;
  return ratio >= 0.75 || (ratio >= 0.5 && state.turnCount >= 3);
}

function finishReply(state: CheckInConversationState): ConversationReply {
  return {
    message: closingMessage(state.mood),
    helper: null,
    finished: true,
    showChips: false,
    chipOptions: [],
    showMoodPicker: false,
    state: { ...state, phase: 'closing', lastAskedQuestionId: null, clarifyingId: null },
  };
}

export function bootConversation(
  mood: MoodOption | null,
  questions: CheckInQuestion[],
  sessionOpener?: string | null,
  focus?: string | null,
): ConversationReply {
  const state = createConversationState(questions, mood, sessionOpener, focus);
  if (!mood) {
    return advanceConversation({ state, questions });
  }
  return advanceConversation({ state: { ...state, phase: 'opening' }, questions });
}
