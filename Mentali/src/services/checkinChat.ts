import { createConversationState } from '@/logic/checkinConversation';
import { localCheckInReply } from '@/logic/checkinChatLocal';
import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import { apiRequest } from '@/services/api';

export type CheckInChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  helper?: string;
};

export type CheckInChatReply = {
  message: string;
  helper?: string | null;
  answer?: RecordedAnswer | null;
  finished: boolean;
};

const CHECKIN_API_TIMEOUT_MS = 5000;

function toApiBody(payload: {
  mood: MoodOption | null;
  questions: CheckInQuestion[];
  answers: RecordedAnswer[];
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
}) {
  return {
    mood: payload.mood,
    questions: payload.questions,
    answers: payload.answers,
    messages: payload.messages.map((m) => ({ role: m.role, text: m.text })),
    userMessage: payload.userMessage ?? null,
    selectedOption: payload.selectedOption ?? null,
  };
}

async function fetchCheckInReply(payload: Parameters<typeof resolveCheckInReply>[0]): Promise<CheckInChatReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECKIN_API_TIMEOUT_MS);
  try {
    return await apiRequest('/checkin/chat', {
      method: 'POST',
      body: JSON.stringify(toApiBody(payload)),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Local-first; optional API polish for PHQ-4 when reachable. */
export async function resolveCheckInReply(payload: {
  mood: MoodOption | null;
  questions: CheckInQuestion[];
  answers: RecordedAnswer[];
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
}): Promise<CheckInChatReply> {
  const convState = createConversationState(payload.questions, payload.mood);

  const fallback = () => {
    const local = localCheckInReply({
      mood: payload.mood,
      questions: payload.questions,
      conversationState: convState,
      messages: payload.messages,
      userMessage: payload.userMessage,
      selectedOption: payload.selectedOption,
    });
    return {
      message: local.message,
      helper: local.helper,
      answer: local.recordedAnswers[0] ?? null,
      finished: local.finished,
    };
  };

  if (payload.questions[0]?.scale === 'k10' || !payload.mood) {
    return fallback();
  }

  try {
    const remote = await fetchCheckInReply(payload);
    if (remote?.message) return remote;
  } catch {
    // API offline or timed out.
  }

  return fallback();
}
