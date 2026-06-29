import { useCallback, useEffect, useRef, useState } from 'react';

import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import { resolveCheckInReply, type CheckInChatMessage } from '@/services/checkinChat';

export type { CheckInChatMessage as ChatMessage };

const TYPING_MS = 550;
const SKIP_OPTION: AnswerOption = { label: 'Prefer not to say', value: 0, skip: true };

export interface UseCheckInChat {
  messages: CheckInChatMessage[];
  typing: boolean;
  awaiting: boolean;
  finished: boolean;
  answers: RecordedAnswer[];
  answerOptions: AnswerOption[];
  selectOption: (option: AnswerOption) => void;
  skipQuestion: () => void;
  sendMessage: (text: string) => void;
  sendNote: (text: string) => void;
}

export function useCheckInChat(mood: MoodOption, questions: CheckInQuestion[]): UseCheckInChat {
  const [messages, setMessages] = useState<CheckInChatMessage[]>([]);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [typing, setTyping] = useState(true);
  const [awaiting, setAwaiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const nextId = useRef(0);
  const ackIndex = useRef(0);
  const busy = useRef(false);
  const totalTopics = questions.length;

  const makeId = () => `m${nextId.current++}`;

  const currentOptions = questions[answers.length]?.options ?? [];

  const revealBotReply = useCallback(
    async (
      reply: { message: string; helper?: string | null; answer?: RecordedAnswer | null; finished: boolean },
      priorAnswerCount: number,
    ) => {
      await new Promise((r) => setTimeout(r, TYPING_MS));

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'bot', text: reply.message, helper: reply.helper ?? undefined },
      ]);

      const done =
        reply.finished || (reply.answer != null && priorAnswerCount + 1 >= totalTopics);
      setFinished(done);
      setAwaiting(!done);
      setTyping(false);

      if (reply.answer) {
        setAnswers((prev) => [...prev, reply.answer as RecordedAnswer]);
      }

      ackIndex.current += 1;
      busy.current = false;
    },
    [totalTopics],
  );

  const callAssistant = useCallback(
    async (payload: {
      userMessage?: string | null;
      selectedOption?: AnswerOption | null;
      snapshotMessages: CheckInChatMessage[];
      snapshotAnswers: RecordedAnswer[];
    }) => {
      if (busy.current) return;
      busy.current = true;
      setTyping(true);
      setAwaiting(false);

      const requestPayload = {
        mood,
        questions,
        answers: payload.snapshotAnswers,
        messages: payload.snapshotMessages,
        userMessage: payload.userMessage ?? null,
        selectedOption: payload.selectedOption ?? null,
        ackIndex: ackIndex.current,
      };

      try {
        const reply = await resolveCheckInReply(requestPayload);
        await revealBotReply(reply, payload.snapshotAnswers.length);
      } catch {
        busy.current = false;
        setTyping(false);
        setAwaiting(true);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'bot',
            text: "Something went wrong — try typing a reply or tap a quick option below.",
          },
        ]);
      }
    },
    [mood, questions, revealBotReply],
  );

  const moodId = mood.id;
  const questionKey = `${questions.length}-${questions[0]?.scale ?? 'phq4'}`;
  const bootedKey = useRef('');

  useEffect(() => {
    const key = `${moodId}-${questionKey}`;
    if (bootedKey.current === key) return;
    bootedKey.current = key;
    void callAssistant({ snapshotMessages: [], snapshotAnswers: [] });
  }, [moodId, questionKey, callAssistant]);

  const respond = useCallback(
    (text: string, selectedOption?: AnswerOption) => {
      if (finished || busy.current) return;

      const userText = selectedOption ? selectedOption.label : text.trim();
      if (!userText) return;

      const userMsg: CheckInChatMessage = { id: makeId(), role: 'user', text: userText };
      const snapshotMessages = [...messages, userMsg];
      const snapshotAnswers = answers;

      setMessages(snapshotMessages);

      void callAssistant({
        userMessage: selectedOption ? null : userText,
        selectedOption: selectedOption ?? null,
        snapshotMessages,
        snapshotAnswers,
      });
    },
    [answers, callAssistant, finished, messages],
  );

  return {
    messages,
    typing,
    awaiting: awaiting && !finished,
    finished,
    answers,
    answerOptions: awaiting && !finished ? [...currentOptions, SKIP_OPTION] : [],
    selectOption: (option) => respond(option.label, option),
    skipQuestion: () => respond(SKIP_OPTION.label, SKIP_OPTION),
    sendMessage: (text) => respond(text),
    sendNote: (text) => respond(text),
  };
}
