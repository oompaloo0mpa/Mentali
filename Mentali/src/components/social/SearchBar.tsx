import { StyleSheet, TextInput } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchBar({ value, onChangeText }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Search"
      placeholderTextColor={Brand.textMuted}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Brand.magenta,
    paddingHorizontal: 18,
    color: Brand.text,
    fontSize: 15,
  },
});
