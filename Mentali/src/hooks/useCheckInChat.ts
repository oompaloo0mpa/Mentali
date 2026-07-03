import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createConversationState,
  type CheckInConversationState,
} from '@/logic/checkinConversation';
import { localCheckInReply } from '@/logic/checkinChatLocal';
import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';

export type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  helper?: string;
};

const TYPING_MS = 400;

export interface UseCheckInChat {
  messages: ChatMessage[];
  typing: boolean;
  awaiting: boolean;
  finished: boolean;
  answers: RecordedAnswer[];
  mood: MoodOption | null;
  showMoodPicker: boolean;
  answerOptions: AnswerOption[];
  selectMood: (mood: MoodOption) => void;
  selectOption: (option: AnswerOption) => void;
  sendMessage: (text: string) => void;
}

export function useCheckInChat(
  initialMood: MoodOption | null,
  questions: CheckInQuestion[],
  sessionPlan?: { opener?: string; focus?: string },
): UseCheckInChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [typing, setTyping] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const [chipOptions, setChipOptions] = useState<AnswerOption[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(!initialMood);
  const [mood, setMood] = useState<MoodOption | null>(initialMood);

  const nextId = useRef(0);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const sessionPlanRef = useRef(sessionPlan);
  sessionPlanRef.current = sessionPlan;

  const convState = useRef<CheckInConversationState>(
    createConversationState(questions, initialMood, sessionPlan?.opener, sessionPlan?.focus),
  );

  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const makeId = () => `m${nextId.current++}`;

  const clearReplyTimer = () => {
    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
  };

  const applyReply = useCallback((reply: ReturnType<typeof localCheckInReply>) => {
    if (!mounted.current) return;

    convState.current = reply.state;
    if (reply.state.mood) setMood(reply.state.mood);

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: 'bot',
        text: reply.message,
        helper: reply.helper ?? undefined,
      },
    ]);

    setShowMoodPicker(reply.showMoodPicker);
    setShowChips(reply.showChips);
    setChipOptions(reply.chipOptions);
    setFinished(reply.finished);
    setAwaiting(!reply.finished);
    setTyping(false);

    if (reply.finished && reply.recordedAnswers.length > 0) {
      setAnswers(reply.recordedAnswers);
    }
  }, []);

  const deliverReply = useCallback(
    (reply: ReturnType<typeof localCheckInReply>) => {
      clearReplyTimer();
      setTyping(true);
      setAwaiting(false);
      setShowChips(false);
      setShowMoodPicker(false);
      replyTimer.current = setTimeout(() => applyReply(reply), TYPING_MS);
    },
    [applyReply],
  );

  const questionKey = `${questions.length}-${questions[0]?.scale ?? 'phq4'}-${sessionPlan?.focus ?? 'default'}-${questions[0]?.prompt?.slice(0, 12) ?? ''}`;

  useEffect(() => {
    mounted.current = true;
    clearReplyTimer();
    nextId.current = 0;
    convState.current = createConversationState(
      questionsRef.current,
      initialMood,
      sessionPlanRef.current?.opener,
      sessionPlanRef.current?.focus,
    );
    setAnswers([]);
    setFinished(false);
    setMood(initialMood);
    setShowChips(false);
    setChipOptions([]);

    if (questionsRef.current.length === 0) {
      setMessages([
        {
          id: 'm0',
          role: 'bot',
          text: 'Something went wrong loading the chat. Please go back and try again.',
        },
      ]);
      setTyping(false);
      setAwaiting(false);
      setShowMoodPicker(false);
      return () => {
        mounted.current = false;
        clearReplyTimer();
      };
    }

    const reply = localCheckInReply({
      mood: initialMood,
      questions: questionsRef.current,
      conversationState: convState.current,
      messages: [],
    });

    setMessages([
      {
        id: makeId(),
        role: 'bot',
        text: reply.message,
        helper: reply.helper ?? undefined,
      },
    ]);
    convState.current = reply.state;
    setShowMoodPicker(reply.showMoodPicker);
    setTyping(false);
    setAwaiting(!reply.finished);

    return () => {
      mounted.current = false;
      clearReplyTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMood?.id ?? 'none', questionKey, sessionPlan?.opener]);

  useEffect(
    () => () => {
      mounted.current = false;
      clearReplyTimer();
    },
    [],
  );

  const runTurn = useCallback(
    (params: {
      userMessage?: string | null;
      selectedOption?: AnswerOption | null;
      selectedMood?: MoodOption | null;
      displayText?: string;
    }) => {
      if (finished || typing) return;

      const displayText =
        params.displayText ??
        (params.selectedMood
          ? `Feeling ${params.selectedMood.label.toLowerCase()}`
          : params.selectedOption
            ? params.selectedOption.label
            : params.userMessage?.trim() ?? '');

      if (!displayText && !params.selectedMood) return;

      const snapshotMessages: ChatMessage[] = displayText
        ? [...messages, { id: makeId(), role: 'user', text: displayText }]
        : messages;

      if (displayText) setMessages(snapshotMessages);

      const localReply = localCheckInReply({
        mood: mood ?? initialMood,
        questions: questionsRef.current,
        conversationState: convState.current,
        messages: snapshotMessages,
        userMessage: params.selectedOption || params.selectedMood ? null : params.userMessage ?? null,
        selectedOption: params.selectedOption ?? null,
        selectedMood: params.selectedMood ?? null,
      });

      deliverReply(localReply);
    },
    [deliverReply, finished, initialMood, messages, mood, typing],
  );

  return {
    messages,
    typing,
    awaiting: awaiting && !finished,
    finished,
    answers,
    mood,
    showMoodPicker,
    answerOptions: showChips ? chipOptions : [],
    selectMood: (selected) => runTurn({ selectedMood: selected }),
    selectOption: (option) => runTurn({ selectedOption: option, displayText: option.label }),
    sendMessage: (text) => runTurn({ userMessage: text }),
  };
}
