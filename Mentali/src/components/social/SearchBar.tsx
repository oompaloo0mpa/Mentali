import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Brand, Radius } from '@/theme/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Brand.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search friends"
        placeholderTextColor={Brand.textSecondary}
        style={styles.input}
        accessibilityLabel="Search friends"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={Brand.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Brand.magenta,
    paddingHorizontal: 16,
  },
  input: { flex: 1, color: Brand.text, fontSize: 15, height: '100%' },
});
