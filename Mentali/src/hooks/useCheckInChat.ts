import { useEffect, useReducer } from 'react';

import { COPY } from '@/data/checkInContent';
import type {
  AnswerOption,
  CheckInQuestion,
  MoodOption,
  RecordedAnswer,
} from '@/logic/checkin';

/**
 * Manages the scripted check-in conversation.
 * State transitions stay in the reducer; one effect controls reveal timing.
 */

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  helper?: string;
}

interface State {
  mood: MoodOption;
  questions: CheckInQuestion[];
  messages: ChatMessage[];
  queue: ChatMessage[];
  typing: boolean;
  step: number;
  answers: RecordedAnswer[];
  awaiting: boolean;
  pendingQuestion: boolean;
  finished: boolean;
  ackIndex: number;
  nextId: number;
}

type Action =
  | { type: 'START_TYPING' }
  | { type: 'REVEAL' }
  | { type: 'ANSWER'; option: AnswerOption }
  | { type: 'NOTE'; text: string };

const TYPING_MS = 650;

function makeMessage(state: State, role: ChatMessage['role'], text: string, helper?: string) {
  const message: ChatMessage = { id: `m${state.nextId}`, role, text, helper };
  return message;
}

function questionMessage(state: State, index: number): ChatMessage {
  const q = state.questions[index];
  return { id: `m${state.nextId}`, role: 'bot', text: q.prompt, helper: q.helper };
}

function init(args: { mood: MoodOption; questions: CheckInQuestion[] }): State {
  const base: State = {
    mood: args.mood,
    questions: args.questions,
    messages: [],
    queue: [],
    typing: false,
    step: 0,
    answers: [],
    awaiting: false,
    pendingQuestion: true,
    finished: false,
    ackIndex: 0,
    nextId: 0,
  };

  const welcome1: ChatMessage = { id: 'm0', role: 'bot', text: COPY.greeting };
  const welcome2: ChatMessage = {
    id: 'm1',
    role: 'bot',
    text: COPY.moodThanks(args.mood.label, args.mood.emoji),
  };
  const firstQuestion: ChatMessage = {
    id: 'm2',
    role: 'bot',
    text: args.questions[0].prompt,
    helper: args.questions[0].helper,
  };

  return { ...base, queue: [welcome1, welcome2, firstQuestion], nextId: 3 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_TYPING':
      return { ...state, typing: true };

    case 'REVEAL': {
      if (state.queue.length === 0) return { ...state, typing: false };
      const [head, ...rest] = state.queue;
      const drained = rest.length === 0;
      return {
        ...state,
        messages: [...state.messages, head],
        queue: rest,
        typing: false,
        awaiting: drained && state.pendingQuestion && !state.finished ? true : state.awaiting,
      };
    }

    case 'ANSWER': {
      if (!state.awaiting || state.finished) return state;
      const q = state.questions[state.step];
      const userMsg = makeMessage(state, 'user', action.option.label);

      const recorded: RecordedAnswer = {
        questionId: q.id,
        scale: q.scale,
        dimension: q.dimension,
        value: action.option.value,
        label: action.option.label,
        skipped: action.option.skip,
      };

      const isLast = state.step >= state.questions.length - 1;
      let id = state.nextId + 1;
      const nextQueue: ChatMessage[] = [];

      if (isLast) {
        nextQueue.push({ id: `m${id++}`, role: 'bot', text: COPY.beforeSummary });
      } else {
        const ack = COPY.acks[state.ackIndex % COPY.acks.length];
        nextQueue.push({ id: `m${id++}`, role: 'bot', text: ack });
        const nq = state.questions[state.step + 1];
        nextQueue.push({ id: `m${id++}`, role: 'bot', text: nq.prompt, helper: nq.helper });
      }

      return {
        ...state,
        messages: [...state.messages, userMsg],
        queue: nextQueue,
        answers: [...state.answers, recorded],
        step: isLast ? state.step : state.step + 1,
        awaiting: false,
        pendingQuestion: !isLast,
        finished: isLast,
        ackIndex: state.ackIndex + 1,
        nextId: id,
      };
    }

    case 'NOTE': {
      // Notes are acknowledged but do not affect scores.
      const userMsg = makeMessage(state, 'user', action.text);
      const nudge: ChatMessage = {
        id: `m${state.nextId + 1}`,
        role: 'bot',
        text: state.finished
          ? "Thank you for sharing. When you're ready, tap below to see your summary."
          : 'Thanks for sharing that. Whenever you feel ready, tap one of the options above.',
      };
      return {
        ...state,
        messages: [...state.messages, userMsg],
        queue: [...state.queue, nudge],
        nextId: state.nextId + 2,
      };
    }

    default:
      return state;
  }
}

export interface UseCheckInChat {
  messages: ChatMessage[];
  typing: boolean;
  awaiting: boolean;
  finished: boolean;
  answers: RecordedAnswer[];
  currentQuestion: CheckInQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  answerOptions: AnswerOption[];
  selectOption: (option: AnswerOption) => void;
  skipQuestion: () => void;
  sendNote: (text: string) => void;
}

const SKIP_OPTION: AnswerOption = { label: 'Prefer not to say', value: 0, skip: true };

export function useCheckInChat(mood: MoodOption, questions: CheckInQuestion[]): UseCheckInChat {
  const [state, dispatch] = useReducer(reducer, { mood, questions }, init);

  // Reveal queued bot messages with a short typing delay.
  useEffect(() => {
    if (state.queue.length === 0) return;
    if (!state.typing) {
      dispatch({ type: 'START_TYPING' });
      return;
    }
    const timer = setTimeout(() => dispatch({ type: 'REVEAL' }), TYPING_MS);
    return () => clearTimeout(timer);
  }, [state.queue, state.typing]);

  const currentQuestion = state.awaiting ? state.questions[state.step] : null;

  return {
    messages: state.messages,
    typing: state.typing,
    awaiting: state.awaiting,
    finished: state.finished,
    answers: state.answers,
    currentQuestion,
    questionNumber: Math.min(state.step + (state.awaiting ? 1 : 0), state.questions.length),
    totalQuestions: state.questions.length,
    answerOptions: currentQuestion ? currentQuestion.options : [],
    selectOption: (option) => dispatch({ type: 'ANSWER', option }),
    skipQuestion: () => dispatch({ type: 'ANSWER', option: SKIP_OPTION }),
    sendNote: (text) => dispatch({ type: 'NOTE', text }),
  };
}
