import type { AnswerOption, CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import type { CheckInChatMessage } from '@/services/checkinChat';

const ACKS = [
  'Thanks for sharing that — I hear you.',
  'That makes sense. Appreciate you being open.',
  'Got it. No judgment here.',
  'Thanks — that helps me understand a bit more.',
];

function moodOpener(mood: MoodOption, deeper: boolean) {
  if (deeper) {
    return `Let's go a little deeper — still at your pace. ${mood.emoji} I'll ask about how the past couple of weeks have felt.`;
  }
  const label = mood.label.toLowerCase();
  if (mood.value >= 3) {
    return `Hey! ${mood.emoji} Sounds like today's been on the ${label} side — nice. I'm just here for a quick pulse-check, nothing heavy.`;
  }
  if (mood.value <= 1) {
    return `Hey ${mood.emoji} I can see today's felt pretty ${label}. I'm here with you — we'll keep this light and go at your pace.`;
  }
  return `Hey ${mood.emoji} Thanks for checking in. Today sounds ${label} — mind if we chat for a minute about how you've been feeling?`;
}

function inferFromText(text: string, scale: 'phq4' | 'k10') {
  const t = text.toLowerCase();
  if (!t.trim()) return null;
  if (/prefer not|skip|rather not|pass/i.test(t)) {
    return { value: scale === 'k10' ? 1 : 0, label: 'Prefer not to say', skip: true };
  }
  if (scale === 'k10') {
    if (/none of the time|never|not at all|not really/.test(t)) return { value: 1, label: 'None of the time' };
    if (/all of the time|always|constantly|every day/.test(t)) return { value: 5, label: 'All of the time' };
    if (/most of the time|often|frequently/.test(t)) return { value: 4, label: 'Most of the time' };
    if (/some of the time|sometimes|quite a bit/.test(t)) return { value: 3, label: 'Some of the time' };
    if (/a little|occasionally/.test(t)) return { value: 2, label: 'A little' };
    return { value: 3, label: 'Some of the time' };
  }
  if (/not at all|not really|never|nope|none|haven't|havent/.test(t)) return { value: 0, label: 'Not really' };
  if (/a lot|all the time|constantly|every day|always|very much/.test(t)) return { value: 3, label: 'A lot' };
  if (/quite a bit|often|most days|frequently|a fair bit/.test(t)) return { value: 2, label: 'Quite a bit' };
  if (/a little|sometimes|occasionally|once in a while|yeah|yes|yep/.test(t)) return { value: 1, label: 'A little' };
  return { value: 1, label: 'A little' };
}

export type LocalCheckInReply = {
  message: string;
  helper?: string | null;
  answer?: RecordedAnswer | null;
  finished: boolean;
};

/** Runs on-device when the API is unreachable. */
export function localCheckInReply(payload: {
  mood: MoodOption;
  questions: CheckInQuestion[];
  answers: RecordedAnswer[];
  messages: CheckInChatMessage[];
  userMessage?: string | null;
  selectedOption?: AnswerOption | null;
  ackIndex?: number;
}): LocalCheckInReply {
  const { mood, questions, answers, userMessage, selectedOption, ackIndex = 0 } = payload;
  const ack = ACKS[ackIndex % ACKS.length];
  const topic = questions[answers.length];
  const deeper = questions[0]?.scale === 'k10';

  if (answers.length === 0 && !userMessage && !selectedOption && questions[0]) {
    const first = questions[0];
    return {
      message: `${moodOpener(mood, deeper)} ${first.prompt}`,
      helper: first.helper ?? 'You can reply in your own words, or tap a quick option below.',
      answer: null,
      finished: false,
    };
  }

  if (selectedOption && topic) {
    const recorded: RecordedAnswer = {
      questionId: topic.id,
      scale: topic.scale,
      dimension: topic.dimension,
      value: selectedOption.skip ? (topic.scale === 'k10' ? 1 : 0) : selectedOption.value,
      label: selectedOption.label,
      skipped: !!selectedOption.skip,
    };
    const next = questions[answers.length + 1];
    if (!next) {
      return {
        message: `${ack} That's everything — tap below for your summary whenever you're ready.`,
        helper: null,
        answer: recorded,
        finished: true,
      };
    }
    return {
      message: `${ack} ${next.prompt}`,
      helper: next.helper ?? null,
      answer: recorded,
      finished: false,
    };
  }

  if (userMessage && topic) {
    const inferred = inferFromText(userMessage, topic.scale);
    if (inferred) {
      const recorded: RecordedAnswer = {
        questionId: topic.id,
        scale: topic.scale,
        dimension: topic.dimension,
        value: inferred.skip ? (topic.scale === 'k10' ? 1 : 0) : inferred.value,
        label: inferred.label,
        skipped: !!inferred.skip,
      };
      const next = questions[answers.length + 1];
      if (!next) {
        return {
          message: `${ack} Thanks for putting that into words. Your summary is ready when you are.`,
          helper: null,
          answer: recorded,
          finished: true,
        };
      }
      return {
        message: `${ack} ${next.prompt}`,
        helper: next.helper ?? null,
        answer: recorded,
        finished: false,
      };
    }
  }

  const hint =
    topic?.scale === 'k10'
      ? 'Has that been none of the time, a little, some of the time, most of the time, or all of the time?'
      : 'Has that been not really, a little, quite a bit, or a lot?';

  return {
    message: `Thanks for sharing. ${hint}`,
    helper: 'Or tap one of the quick options below.',
    answer: null,
    finished: false,
  };
}
