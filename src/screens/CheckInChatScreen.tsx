import React, { useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native';

import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { SuggestionChips, type Chip } from '@/components/chat/SuggestionChips';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useCheckInChat } from '@/hooks/useCheckInChat';
import type { CheckInQuestion, MoodOption, RecordedAnswer } from '@/types/wellbeing';
import { colors, spacing } from '@/theme/colors';

interface Props {
  mood: MoodOption;
  questions: CheckInQuestion[];
  headerTitle: string;
  completeLabel: string;
  onBack: () => void;
  onComplete: (answers: RecordedAnswer[]) => void;
}

export function CheckInChatScreen({
  mood,
  questions,
  headerTitle,
  completeLabel,
  onBack,
  onComplete,
}: Props) {
  const chat = useCheckInChat(mood, questions);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(id);
  }, [chat.messages.length, chat.typing, chat.awaiting, chat.finished]);

  const chips: Chip[] = chat.answerOptions.map((opt, i) => ({
    key: `${opt.label}-${i}`,
    label: opt.label,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatHeader
          title={headerTitle}
          onBack={onBack}
          total={chat.totalQuestions}
          completed={chat.answers.length}
        />

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

          {chat.finished && !chat.typing ? (
            <View style={styles.cta}>
              <PrimaryButton
                label={completeLabel}
                onPress={() => onComplete(chat.answers)}
                style={styles.ctaButton}
              />
            </View>
          ) : null}
        </ScrollView>

        {chat.awaiting && chips.length > 0 ? (
          <SuggestionChips
            chips={chips}
            onSelect={(chip) => {
              const idx = chips.findIndex((c) => c.key === chip.key);
              if (idx >= 0) chat.selectOption(chat.answerOptions[idx]);
            }}
          />
        ) : null}

        <ChatInput onSend={chat.sendNote} disabled={chat.typing} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  messages: { padding: spacing.lg, paddingBottom: spacing.xl },
  cta: { marginTop: spacing.md, alignItems: 'center' },
  ctaButton: { alignSelf: 'center' },
});
