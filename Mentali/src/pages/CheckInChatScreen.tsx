import React, { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestionChips, type Chip } from '@/components/chat/SuggestionChips';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { MoodFacePicker } from '@/components/mood/MoodFacePicker';
import { useCheckInChat } from '@/hooks/useCheckInChat';
import type { CheckInQuestion, MoodOption, RecordedAnswer } from '@/logic/checkin';
import { colors, spacing } from '@/theme/colors';

interface Props {
  mood?: MoodOption | null;
  questions: CheckInQuestion[];
  sessionPlan?: { opener?: string; focus?: string };
  headerTitle: string;
  completeLabel: string;
  onBack: () => void;
  onComplete: (answers: RecordedAnswer[], mood: MoodOption) => void;
}

export function CheckInChatScreen({
  mood: initialMood = null,
  questions,
  sessionPlan,
  headerTitle,
  completeLabel,
  onBack,
  onComplete,
}: Props) {
  const chat = useCheckInChat(initialMood, questions, sessionPlan);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [chat.messages.length, chat.typing, chat.awaiting, chat.finished, chat.showMoodPicker]);

  const chips: Chip[] = chat.answerOptions.map((opt, i) => ({
    key: `opt-${i}`,
    label: opt.label,
    muted: !!opt.skip,
  }));

  const handleChip = (chip: Chip) => {
    const idx = Number(chip.key.replace('opt-', ''));
    if (!Number.isNaN(idx) && chat.answerOptions[idx]) {
      chat.selectOption(chat.answerOptions[idx]);
    }
  };

  const canType = !chat.finished && !chat.typing && !chat.showMoodPicker;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatHeader title={headerTitle} onBack={onBack} />

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {chat.messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} text={m.text} helper={m.helper} />
          ))}
          {chat.typing ? <TypingIndicator /> : null}

          {chat.showMoodPicker && !chat.typing ? (
            <View style={styles.moodSection}>
              <MoodFacePicker variant="dark" onSelect={chat.selectMood} />
            </View>
          ) : null}

          {chat.finished && !chat.typing && chat.mood ? (
            <View style={styles.cta}>
              <PrimaryButton
                label={completeLabel}
                onPress={() => onComplete(chat.answers, chat.mood!)}
                style={styles.ctaButton}
              />
            </View>
          ) : null}
        </ScrollView>

        {chat.awaiting && chat.answerOptions.length > 0 ? (
          <View style={styles.chipSection}>
            <SuggestionChips chips={chips} onSelect={handleChip} />
          </View>
        ) : null}

        <ChatInput
          onSend={chat.sendMessage}
          disabled={!canType}
          placeholder={
            canType
              ? 'Share what’s on your mind…'
              : chat.showMoodPicker
                ? 'Pick how you feel above'
                : 'One moment…'
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  messages: { padding: spacing.lg, paddingBottom: spacing.xl },
  moodSection: { marginTop: spacing.sm, marginBottom: spacing.md },
  chipSection: { paddingBottom: spacing.xs, paddingHorizontal: spacing.lg },
  cta: { marginTop: spacing.md, alignItems: 'center' },
  ctaButton: { alignSelf: 'center' },
});
