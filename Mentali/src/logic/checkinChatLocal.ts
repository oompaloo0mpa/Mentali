import {
  advanceConversation,
  bootConversation,
  signalsToRecordedAnswers,
  type CheckInConversationState,
} from '@/logic/checkinConversation';
import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import type { CheckInChatMessage } from '@/services/checkinChat';

export type LocalCheckInReply = {
  message: string;
  helper?: string | null;
  finished: boolean;
  showChips: boolean;
  chipOptions: AnswerOption[];
  showMoodPicker: boolean;
  recordedAnswers: RecordedAnswer[];
  state: CheckInConversationState;
};

export function localCheckInReply(payload: {
  mood: MoodOption | null;
  questions: CheckInQuestion[];
  conversationState: CheckInConversationState;
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
  selectedMood?: MoodOption | null;
}): LocalCheckInReply {
  const { mood, questions, conversationState, userMessage, selectedOption, selectedMood } = payload;

  const reply =
    conversationState.turnCount === 0 &&
    conversationState.phase === 'mood' &&
    !userMessage &&
    !selectedOption &&
    !selectedMood
      ? bootConversation(mood, questions, conversationState.sessionOpener, conversationState.focus)
      : advanceConversation({
          state: conversationState,
          questions,
          userMessage,
          selectedOption,
          selectedMood,
        });

  const recordedAnswers = reply.finished
    ? signalsToRecordedAnswers(questions, reply.state.signals)
    : [];

  return {
    message: reply.message,
    helper: reply.helper,
    finished: reply.finished,
    showChips: reply.showChips,
    chipOptions: reply.chipOptions,
    showMoodPicker: reply.showMoodPicker,
    recordedAnswers,
    state: reply.state,
  };
}
