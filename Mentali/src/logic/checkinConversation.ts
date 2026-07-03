import type {
  AnswerOption,
  CheckInQuestion,
  Dimension,
  MoodOption,
  RecordedAnswer,
  ScaleKind,
} from '@/logic/checkin';

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
  phq4_anx_1: 'Have you felt more keyed up or on edge than usual?',
  phq4_anx_2: 'When worries show up, do they tend to stick around for a while?',
  phq4_mood_1: 'Have there been moments where things felt a bit heavy or low?',
  phq4_mood_2: 'Have the things you usually enjoy felt less exciting lately?',
};

const K10_SUBTLE: Record<string, string> = {
  k10_1: 'Has tiredness been showing up even when you have not been doing much?',
  k10_2: 'Have you felt nervous or on edge more than usual?',
  k10_3: 'Have there been times when anxiety felt hard to calm down?',
  k10_4: 'Have moments of hopelessness come up at all?',
  k10_5: 'Have you felt restless, like it is hard to settle?',
  k10_6: 'Has restlessness ever made it tough to sit still?',
  k10_7: 'Have low or down moments been part of the picture?',
  k10_8: 'Has everything felt like more of an effort than usual?',
  k10_9: 'Have sad feelings been hard to shake?',
  k10_10: 'Have you had thoughts about not feeling good enough or worthless?',
};

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
const INTENSITY_NONE = /\b(not at all|not really|never|nope|fine|good|great|okay|ok|alright|managing|better)\b/i;

const DONE_PHRASES = /\b(that's all|thats all|i'm done|im done|enough|skip|move on|no more|stop|finish|summary)\b/i;
const SKIP_PHRASES = /\b(prefer not|rather not|don't want to|dont want to|pass|not now|maybe later)\b/i;

export function createConversationState(
  questions: CheckInQuestion[],
  mood: MoodOption | null,
  sessionOpener?: string | null,
  focus?: string | null,
): CheckInConversationState {
  const deeper = questions[0]?.scale === 'k10';
  return {
    mood,
    phase: mood ? 'opening' : 'mood',
    turnCount: 0,
    signals: {},
    clarifyingId: null,
    deeper,
    maxTurns: maxTurnsForMood(mood, deeper),
    sessionOpener: sessionOpener ?? null,
    focus: focus ?? null,
  };
}

function promptFromQuestions(questions: CheckInQuestion[], questionId: string): string | null {
  return questions.find((q) => q.id === questionId)?.prompt ?? null;
}

function maxTurnsForMood(mood: MoodOption | null, deeper: boolean): number {
  if (deeper) {
    if (!mood || mood.value <= 1) return 7;
    if (mood.value === 2) return 6;
    return 5;
  }
  if (!mood || mood.value >= 3) return 3;
  if (mood.value === 2) return 4;
  return 5;
}

function gentleClarifyPrompt(questionId: string, deeper: boolean, questions: CheckInQuestion[]): string {
  const fromPool = promptFromQuestions(questions, questionId);
  if (fromPool) return fromPool;

  const phq4: Record<string, string> = {
    phq4_anx_1:
      "When you think about feeling on edge — has that been around much lately, or more of a today thing?",
    phq4_anx_2:
      "Does your mind tend to stay on things, even when you'd rather switch off?",
    phq4_mood_1:
      'Have the heavier moments been weighing on you much, or do they come and go?',
    phq4_mood_2:
      'Have the things you usually enjoy felt less satisfying than normal?',
  };
  if (!deeper) return phq4[questionId] ?? subtlePrompt(questionId, false, questions);

  return (
    K10_SUBTLE[questionId] ??
    promptFromQuestions(questions, questionId) ??
    'How much has that been showing up for you over the past couple of weeks?'
  );
}

function subtlePrompt(questionId: string, deeper: boolean, questions: CheckInQuestion[]): string {
  const custom = promptFromQuestions(questions, questionId);
  if (custom) return custom;
  return (deeper ? K10_SUBTLE : PHQ4_SUBTLE)[questionId] ?? 'How has that been for you lately?';
}

function moodOpener(mood: MoodOption, deeper: boolean, sessionOpener?: string | null): string {
  if (sessionOpener) return sessionOpener;
  const label = mood.label.toLowerCase();
  if (deeper) {
    return `Thanks for being open to going a little deeper ${mood.emoji} We can take this slowly — tell me how the past couple of weeks have felt.`;
  }
  if (mood.value >= 3) {
    return `Hey ${mood.emoji} Sounds like today's been on the ${label} side. What's been going on for you?`;
  }
  if (mood.value <= 1) {
    return `Hey ${mood.emoji} I can hear today's felt pretty ${label}. I'm here with you — what's been on your mind?`;
  }
  return `Hey ${mood.emoji} Thanks for checking in. Today sounds ${label} — how has your day been?`;
}

function reflectUserText(text: string): string {
  const t = text.toLowerCase();
  if (/\b(work|job|school|exam|deadline|boss)\b/.test(t)) return 'Work pressure can really sit with you.';
  if (/\b(family|friend|partner|relationship|lonely|alone)\b/.test(t)) return 'Relationships and connection matter so much.';
  if (/\b(tired|exhaust|sleep|insomnia|can't sleep|cant sleep)\b/.test(t)) return 'Being worn out makes everything feel heavier.';
  if (/\b(stress|overwhelm|anxious|worry|panic)\b/.test(t)) return 'That sounds like a lot to carry.';
  if (/\b(good|great|fine|okay|ok|alright|better|happy)\b/.test(t)) return 'Good to hear some of that.';
  if (/\b(sad|down|low|depress|hopeless)\b/.test(t)) return 'Thank you for trusting me with that.';
  if (text.length > 80) return 'Thanks for putting that into words.';
  return 'I hear you.';
}

function inferIntensity(text: string, scale: ScaleKind): { value: number; label: string; confidence: number } {
  if (INTENSITY_NONE.test(text)) {
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
  return scale === 'k10'
    ? { value: 3, label: 'Some of the time', confidence: 0.45 }
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
  const uncovered = uncoveredQuestions(questions, signals);
  if (uncovered.length === 0) return null;
  return uncovered.sort((a, b) => (signals[a.id]?.confidence ?? 0) - (signals[b.id]?.confidence ?? 0))[0];
}

function embeddedFollowUp(
  lastUserText: string,
  target: CheckInQuestion,
): string | null {
  const t = lastUserText.toLowerCase();
  if (target.id === 'phq4_anx_2' && /\b(worry|stress|work|mind)\b/.test(t)) {
    return 'You mentioned that — has it been hard to switch off after?';
  }
  if (target.id === 'phq4_mood_2' && /\b(tired|flat|blah|meh)\b/.test(t)) {
    return 'Has stuff you normally enjoy felt less appealing lately?';
  }
  if (target.id === 'phq4_anx_1' && /\b(stress|nervous|tense)\b/.test(t)) {
    return 'Has that left you feeling keyed up at all?';
  }
  if (target.id === 'phq4_mood_1' && /\b(sad|down|rough|hard)\b/.test(t)) {
    return 'Have there been moments where things felt heavy or low?';
  }
  return null;
}

function closingMessage(mood: MoodOption | null): string {
  if (mood && mood.value <= 1) {
    return "Thank you for sharing all of that — it takes courage. I've put together a gentle summary whenever you're ready.";
  }
  return "Thanks for chatting with me. I've put together a gentle summary for you — tap below when you'd like to see it.";
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
      maxTurns: maxTurnsForMood(selectedMood, state.deeper),
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
      message: "Hey — before we chat, which emoji feels closest to your day?",
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
      state.phase = 'exploring';

      if (shouldFinish(state, questions)) return finishReply(state);

      const next = pickClarifyTarget(questions, state.signals);
      return {
        message: next
          ? `No worries. ${subtlePrompt(next.id, state.deeper, questions)}`
          : closingMessage(state.mood),
        helper: null,
        finished: !next,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state: next ? state : { ...state, phase: 'closing' },
      };
    }

    if (state.clarifyingId) {
      const clarifyQ = questions.find((q) => q.id === state.clarifyingId);
      if (clarifyQ) {
        const targeted = extractSignalsFromText(userMessage, [clarifyQ]);
        if (targeted.length > 0) {
          state.signals = mergeSignals(state.signals, targeted);
        } else {
          const intensity = inferIntensity(userMessage, clarifyQ.scale);
          state.signals = mergeSignal(state.signals, {
            questionId: clarifyQ.id,
            scale: clarifyQ.scale,
            dimension: clarifyQ.dimension,
            value: intensity.value,
            label: intensity.label,
            confidence: intensity.confidence,
            evidence: userMessage.slice(0, 120),
            source: 'free_text',
          });
        }
      }
      state.clarifyingId = null;
      state.phase = 'exploring';
    }

    const extracted = extractSignalsFromText(userMessage, questions);
    state.signals = mergeSignals(state.signals, extracted);
    const reflection = reflectUserText(userMessage);

    if (shouldFinish(state, questions)) {
      return {
        message: `${reflection} ${closingMessage(state.mood)}`,
        helper: null,
        finished: true,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state: { ...state, phase: 'closing' },
      };
    }

    const target = pickClarifyTarget(questions, state.signals);
    if (!target) return finishReply(state);

    const embedded = embeddedFollowUp(userMessage, target);
    const weakSignal = state.signals[target.id];
    const needsFollowUp = !embedded && (!weakSignal || weakSignal.confidence < 0.55);

    if (needsFollowUp && state.turnCount >= 2) {
      state.clarifyingId = target.id;
      state.phase = 'exploring';
      return {
        message: `${reflection} ${gentleClarifyPrompt(target.id, state.deeper, questions)}`,
        helper: null,
        finished: false,
        showChips: false,
        chipOptions: [],
        showMoodPicker: false,
        state,
      };
    }

    state.phase = 'exploring';
    return {
      message: `${reflection} ${embedded ?? subtlePrompt(target.id, state.deeper, questions)}`,
      helper: null,
      finished: false,
      showChips: false,
      chipOptions: [],
      showMoodPicker: false,
      state,
    };
  }

  return {
    message: "I'm still here — share whatever comes to mind.",
    helper: null,
    finished: false,
    showChips: false,
    chipOptions: [],
    showMoodPicker: false,
    state,
  };
}

function shouldFinish(state: CheckInConversationState, questions: CheckInQuestion[]): boolean {
  if (state.turnCount >= state.maxTurns) return true;
  const ratio = coverageRatio(questions, state.signals);
  if (state.deeper) return ratio >= 0.6 && state.turnCount >= 4;
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
    state: { ...state, phase: 'closing' },
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
