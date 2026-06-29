/**
 * AI-driven check-in conversation.
 * Weaves PHQ-4 topics into natural chat; falls back to local copy when no API key.
 */

const PHQ4_QUESTION_META = [
  {
    id: "phq4_anx_1",
    scale: "phq4",
    dimension: "anxiety",
    theme: "feeling nervous, on edge, or restless",
  },
  {
    id: "phq4_anx_2",
    scale: "phq4",
    dimension: "anxiety",
    theme: "worry that is hard to switch off",
  },
  {
    id: "phq4_mood_1",
    scale: "phq4",
    dimension: "mood",
    theme: "feeling down, low, or flat",
  },
  {
    id: "phq4_mood_2",
    scale: "phq4",
    dimension: "mood",
    theme: "less interest or pleasure in things you usually enjoy",
  },
];

const ACK_POOL = [
  "Thanks for sharing that — I hear you.",
  "That makes sense. Appreciate you being open.",
  "Got it. No judgment here.",
  "Thanks — that helps me understand a bit more.",
];

function pickAck(index) {
  return ACK_POOL[index % ACK_POOL.length];
}

function nextTopic(answersCount) {
  return PHQ4_QUESTION_META[answersCount] ?? null;
}

function moodOpener(mood) {
  const label = mood?.label?.toLowerCase() ?? "okay";
  const emoji = mood?.emoji ?? "🙂";
  if (mood?.value >= 3) {
    return `Hey! ${emoji} Sounds like today's been on the ${label} side — nice. I'm just here for a quick pulse-check, nothing heavy.`;
  }
  if (mood?.value <= 1) {
    return `Hey ${emoji} I can see today's felt pretty ${label}. I'm here with you — we'll keep this light and go at your pace.`;
  }
  return `Hey ${emoji} Thanks for checking in. Today sounds ${label} — mind if we chat for a minute about how you've been feeling?`;
}

function subtleQuestion(topic) {
  const prompts = {
    phq4_anx_1: "Lately, have you felt keyed up or on edge at all?",
    phq4_anx_2: "When worries show up, do they tend to stick around for a while?",
    phq4_mood_1: "Have there been moments where you felt a bit low or heavy?",
    phq4_mood_2: "Have the things you usually enjoy felt less exciting recently?",
  };
  return prompts[topic.id] ?? `How have you been with ${topic.theme}?`;
}

function fallbackReply({ mood, answers, userMessage, selectedOption, ackIndex }) {
  const topic = nextTopic(answers.length);

  if (answers.length === 0 && !userMessage && !selectedOption) {
    const first = PHQ4_QUESTION_META[0];
    return {
      message: `${moodOpener(mood)} ${subtleQuestion(first)}`,
      helper: "You can reply in your own words, or tap a quick option below.",
      answer: null,
      finished: false,
    };
  }

  if (selectedOption) {
    const current = PHQ4_QUESTION_META[answers.length];
    if (!current) {
      return {
        message: `${pickAck(ackIndex)} That's everything — tap below for your summary.`,
        helper: null,
        answer: null,
        finished: true,
      };
    }
    const recorded = {
      questionId: current.id,
      scale: current.scale,
      dimension: current.dimension,
      value: selectedOption.skip ? 0 : selectedOption.value,
      label: selectedOption.label,
      skipped: !!selectedOption.skip,
    };
    const next = nextTopic(answers.length + 1);
    if (!next) {
      return {
        message: `${pickAck(ackIndex)} That's everything — tap below for your summary whenever you're ready.`,
        helper: null,
        answer: recorded,
        finished: true,
      };
    }
    return {
      message: `${pickAck(ackIndex)} ${subtleQuestion(next)}`,
      helper: null,
      answer: recorded,
      finished: false,
    };
  }

  // Free-text: infer score from keywords
  let recorded = null;
  const inferred = inferFromText(userMessage);
  if (topic && inferred) {
    recorded = {
      questionId: topic.id,
      scale: topic.scale,
      dimension: topic.dimension,
      value: inferred.value,
      label: inferred.label,
      skipped: false,
    };
    const next = nextTopic(answers.length + 1);
    if (!next) {
      return {
        message: `${pickAck(ackIndex)} Thanks for putting that into words. That's all from me — your summary is ready when you are.`,
        helper: null,
        answer: recorded,
        finished: true,
      };
    }
    return {
      message: `${pickAck(ackIndex)} ${subtleQuestion(next)}`,
      helper: null,
      answer: recorded,
      finished: false,
    };
  }

  return {
    message: "Thanks for sharing. Could you tell me a bit more — has that been not really, a little, quite a bit, or a lot?",
    helper: "Or tap one of the quick options below.",
    answer: null,
    finished: false,
  };
}

function inferFromText(text) {
  const t = String(text || "").toLowerCase();
  if (!t.trim()) return null;
  if (/prefer not|skip|rather not|pass/i.test(t)) {
    return { value: 0, label: "Prefer not to say" };
  }
  if (/not at all|not really|never|no |nope|none|haven't|havent|0/.test(t)) {
    return { value: 0, label: "Not really" };
  }
  if (/a lot|all the time|constantly|every day|always|very much|so much|3/.test(t)) {
    return { value: 3, label: "A lot" };
  }
  if (/quite a bit|often|most days|frequently|a fair bit|2/.test(t)) {
    return { value: 2, label: "Quite a bit" };
  }
  if (/a little|sometimes|bit|occasionally|once in a while|1/.test(t)) {
    return { value: 1, label: "A little" };
  }
  if (/yes|yeah|yep|sure|kind of|sort of|little/.test(t)) {
    return { value: 1, label: "A little" };
  }
  return { value: 1, label: "A little" };
}

async function callOpenAI({ mood, answers, messages, userMessage, selectedOption }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const topic = nextTopic(answers.length);
  const system = `You are Mentali, a warm wellbeing companion for people in Singapore.
Guide a gentle mental-health check-in through natural chat — never like a survey or form.
Cover these topics one at a time in order (do not skip): ${PHQ4_QUESTION_META.map((q) => q.theme).join("; ")}.
Already covered: ${answers.length} topic(s).

User's mood today: ${mood?.label} ${mood?.emoji} (value ${mood?.value}/4).

Rules:
- Max 2 short sentences per reply. Casual, kind, Singapore-appropriate English.
- Reflect their last message before moving on.
- Never say "question", "survey", "scale", or numbered items.
- If they picked a structured option, acknowledge it naturally.
- Infer PHQ-4 score 0-3 from free text: 0=not at all, 1=a little, 2=quite a bit, 3=nearly every day.
- If unclear, ask one gentle clarifying line — do not advance the topic.

Return ONLY valid JSON:
{
  "message": "string",
  "helper": "string or null",
  "answer": null OR { "questionId", "scale": "phq4", "dimension", "value": 0-3, "label", "skipped": boolean },
  "finished": boolean
}

Current topic id: ${topic?.id ?? "done"}
${selectedOption ? `User selected option: ${selectedOption.label} (value ${selectedOption.value}, skip=${!!selectedOption.skip})` : ""}`;

  const chatMessages = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
  ];
  if (userMessage) chatMessages.push({ role: "user", content: userMessage });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: chatMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("OpenAI check-in error:", response.status, err.slice(0, 200));
    return null;
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed.message) return null;
    return {
      message: String(parsed.message),
      helper: parsed.helper ?? null,
      answer: parsed.answer ?? null,
      finished: !!parsed.finished,
    };
  } catch {
    return null;
  }
}

async function generateCheckInReply(payload) {
  const { mood, answers = [], messages = [], userMessage, selectedOption, ackIndex = 0 } = payload;

  if (selectedOption) {
    const current = PHQ4_QUESTION_META[answers.length];
    if (!current) {
      return {
        message: pickAck(ackIndex) + " That's everything — tap below for your summary.",
        helper: null,
        answer: null,
        finished: true,
      };
    }
    const recorded = {
      questionId: current.id,
      scale: current.scale,
      dimension: current.dimension,
      value: selectedOption.skip ? 0 : selectedOption.value,
      label: selectedOption.label,
      skipped: !!selectedOption.skip,
    };
    const ai = await callOpenAI({
      mood,
      answers: [...answers, recorded],
      messages,
      userMessage: selectedOption.label,
      selectedOption,
    });
    if (ai) {
      return {
        ...ai,
        answer: ai.answer ?? recorded,
        finished: ai.finished || answers.length + 1 >= PHQ4_QUESTION_META.length,
      };
    }
    return fallbackReply({
      mood,
      answers,
      userMessage: selectedOption.label,
      selectedOption,
      ackIndex,
    });
  }

  if (!userMessage && answers.length === 0 && messages.length === 0) {
    const ai = await callOpenAI({ mood, answers, messages, userMessage: null, selectedOption: null });
    if (ai) return ai;
    return fallbackReply({ mood, answers, userMessage: null, selectedOption: null, ackIndex });
  }

  const ai = await callOpenAI({ mood, answers, messages, userMessage, selectedOption: null });
  if (ai) {
    if (ai.answer && !ai.finished && answers.length + 1 >= PHQ4_QUESTION_META.length) {
      return { ...ai, finished: true };
    }
    return ai;
  }

  return fallbackReply({ mood, answers, userMessage, selectedOption: null, ackIndex });
}

module.exports = { generateCheckInReply, PHQ4_QUESTION_META };
