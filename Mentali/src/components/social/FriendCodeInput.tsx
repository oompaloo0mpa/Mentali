import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Brand, Radius } from '@/theme/theme';

type Props = {
  onSubmit?: (code: string) => void;
};

export function FriendCodeInput({ onSubmit }: Props) {
  const [code, setCode] = useState('');

  const submit = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setCode('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Friend code"
        placeholderTextColor={Brand.textMuted}
        style={styles.input}
        autoCapitalize="characters"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <Pressable
        style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
        onPress={submit}
        hitSlop={8}>
        <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Brand.magenta,
    paddingHorizontal: 18,
    color: Brand.text,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
