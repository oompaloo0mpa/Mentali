import { localCheckInReply } from "@/logic/checkinChatLocal";
import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from "@/logic/checkin";
import { apiRequest } from "@/services/api";

export type CheckInChatMessage = {
  id: string;
  role: "bot" | "user";
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
  mood: MoodOption;
  questions: CheckInQuestion[];
  answers: RecordedAnswer[];
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
  ackIndex?: number;
}) {
  return {
    mood: payload.mood,
    questions: payload.questions,
    answers: payload.answers,
    messages: payload.messages.map((m) => ({ role: m.role, text: m.text })),
    userMessage: payload.userMessage ?? null,
    selectedOption: payload.selectedOption ?? null,
    ackIndex: payload.ackIndex ?? 0,
  };
}

async function fetchCheckInReply(payload: Parameters<typeof resolveCheckInReply>[0]): Promise<CheckInChatReply> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECKIN_API_TIMEOUT_MS);
  try {
    return await apiRequest("/checkin/chat", {
      method: "POST",
      body: JSON.stringify(toApiBody(payload)),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Local fallback when API is slow/unreachable; K10 always runs on-device. */
export async function resolveCheckInReply(payload: {
  mood: MoodOption;
  questions: CheckInQuestion[];
  answers: RecordedAnswer[];
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
  ackIndex?: number;
}): Promise<CheckInChatReply> {
  const fallback = () =>
    localCheckInReply({
      mood: payload.mood,
      questions: payload.questions,
      answers: payload.answers,
      messages: payload.messages,
      userMessage: payload.userMessage,
      selectedOption: payload.selectedOption,
      ackIndex: payload.ackIndex,
    });

  if (payload.questions[0]?.scale === "k10") {
    return fallback();
  }

  try {
    const remote = await fetchCheckInReply(payload);
    if (remote?.message) return remote;
  } catch {
    // API offline, aborted, or timed out — use on-device conversation logic.
  }

  return fallback();
}
