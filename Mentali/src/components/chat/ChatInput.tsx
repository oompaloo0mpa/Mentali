import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

type Props = {
  onSend: (text: string) => void;
  onAttach?: () => void;
  /** Controlled value, e.g. when a suggestion is inserted. */
  value?: string;
  onChangeText?: (text: string) => void;
};

/** Bottom composer: attach (+), text field, send. Supports controlled value. */
export function ChatInput({ onSend, onAttach, value, onChangeText }: Props) {
  const [internal, setInternal] = useState('');
  const isControlled = value !== undefined;
  const text = isControlled ? value : internal;

  const setText = (next: string) => {
    if (isControlled) onChangeText?.(next);
    else setInternal(next);
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.attach, pressed && styles.pressed]} onPress={onAttach} hitSlop={6}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </Pressable>

      <View style={styles.inputWrap}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's on your mind?"
          placeholderTextColor="rgba(255,255,255,0.85)"
          style={styles.input}
          multiline
          onSubmitEditing={send}
        />
      </View>

      <Pressable style={({ pressed }) => [styles.send, pressed && styles.pressed]} onPress={send} hitSlop={6}>
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  attach: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: Radius.pill,
    backgroundColor: Brand.magenta,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', paddingVertical: 10 },
  send: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
