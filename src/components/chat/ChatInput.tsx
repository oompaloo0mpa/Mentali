import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "What's on your mind?", disabled }: Props) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View style={styles.bar}>
      <View style={styles.plus}>
        <Text style={styles.plusText}>+</Text>
      </View>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.75)"
        editable={!disabled}
        returnKeyType="send"
        onSubmitEditing={submit}
        multiline
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={submit}
        disabled={disabled}
        style={({ pressed }) => [styles.send, pressed && styles.sendPressed]}
      >
        <Text style={styles.sendArrow}>➤</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  plus: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { color: colors.white, fontSize: 20, lineHeight: 22, fontWeight: '600' },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 40,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    color: colors.white,
    ...typography.body,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPressed: { opacity: 0.6 },
  sendArrow: { color: colors.white, fontSize: 18 },
});
