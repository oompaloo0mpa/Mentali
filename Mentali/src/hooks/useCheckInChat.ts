import { useCallback, useEffect, useRef, useState } from 'react';

import { localCheckInReply } from '@/logic/checkinChatLocal';
import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';

export type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  helper?: string;
};

const TYPING_MS = 350;
const SKIP_OPTION: AnswerOption = { label: 'Prefer not to say', value: 0, skip: true };

export interface UseCheckInChat {
  messages: ChatMessage[];
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [typing, setTyping] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [finished, setFinished] = useState(false);

  const nextId = useRef(0);
  const ackIndex = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const moodRef = useRef(mood);
  const questionsRef = useRef(questions);
  moodRef.current = mood;
  questionsRef.current = questions;

  const totalTopics = Math.max(questions.length, 1);
  const makeId = () => `m${nextId.current++}`;

  const clearReplyTimer = () => {
    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
  };

  const currentOptions = questions[answers.length]?.options ?? [];

  const showBotReply = useCallback(
    (reply: ReturnType<typeof localCheckInReply>, priorAnswerCount: number) => {
      if (!mounted.current) return;

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'bot',
          text: reply.message,
          helper: reply.helper ?? undefined,
        },
      ]);

      const nextCount = reply.answer ? priorAnswerCount + 1 : priorAnswerCount;
      const done = reply.finished || (reply.answer != null && nextCount >= totalTopics);

      if (reply.answer) {
        setAnswers((prev) => [...prev, reply.answer as RecordedAnswer]);
      }

      setFinished(done);
      setAwaiting(!done);
      setTyping(false);
      ackIndex.current += 1;
    },
    [totalTopics],
  );

  const deliverReply = useCallback(
    (reply: ReturnType<typeof localCheckInReply>, priorAnswerCount: number) => {
      clearReplyTimer();
      setTyping(true);
      setAwaiting(false);
      replyTimer.current = setTimeout(() => showBotReply(reply, priorAnswerCount), TYPING_MS);
    },
    [showBotReply],
  );

  const moodId = mood.id;
  const questionKey = `${questions.length}-${questions[0]?.scale ?? 'phq4'}`;

  useEffect(() => {
    mounted.current = true;
    clearReplyTimer();
    nextId.current = 0;
    ackIndex.current = 0;
    setAnswers([]);
    setFinished(false);

    const bootQuestions = questionsRef.current;
    const bootMood = moodRef.current;

    if (bootQuestions.length === 0) {
      setMessages([
        {
          id: 'm0',
          role: 'bot',
          text: 'Check-in questions are not loaded. Please go back and try again.',
        },
      ]);
      setTyping(false);
      setAwaiting(false);
      return () => {
        mounted.current = false;
        clearReplyTimer();
      };
    }

    const reply = localCheckInReply({
      mood: bootMood,
      questions: bootQuestions,
      answers: [],
      messages: [],
      ackIndex: 0,
    });

    setMessages([
      {
        id: makeId(),
        role: 'bot',
        text: reply.message,
        helper: reply.helper ?? undefined,
      },
    ]);
    setTyping(false);
    setAwaiting(true);

    return () => {
      mounted.current = false;
      clearReplyTimer();
    };
    // Only re-boot when mood or question set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodId, questionKey]);

  useEffect(
    () => () => {
      mounted.current = false;
      clearReplyTimer();
    },
    [],
  );

  const respond = useCallback(
    (text: string, selectedOption?: AnswerOption) => {
      if (finished || typing) return;

      const userText = selectedOption ? selectedOption.label : text.trim();
      if (!userText) return;

      const userMsg: ChatMessage = { id: makeId(), role: 'user', text: userText };
      const snapshotMessages = [...messages, userMsg];
      const snapshotAnswers = answers;

      setMessages(snapshotMessages);

      const reply = localCheckInReply({
        mood: moodRef.current,
        questions: questionsRef.current,
        answers: snapshotAnswers,
        messages: snapshotMessages,
        userMessage: selectedOption ? null : userText,
        selectedOption: selectedOption ?? null,
        ackIndex: ackIndex.current,
      });

      deliverReply(reply, snapshotAnswers.length);
    },
    [answers, deliverReply, finished, messages, typing],
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
