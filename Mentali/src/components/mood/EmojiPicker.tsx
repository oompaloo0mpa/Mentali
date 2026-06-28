import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';
import type { MoodOption } from '@/logic/checkin';

type Props = {
  selectedId?: string;
  onSelect: (mood: MoodOption) => void;
  disabled?: boolean;
};

const MOODS: MoodOption[] = [
  { id: 'great', emoji: '😄', label: 'Great', value: 4 },
  { id: 'good', emoji: '🙂', label: 'Good', value: 3 },
  { id: 'okay', emoji: '😐', label: 'Okay', value: 2 },
  { id: 'low', emoji: '😟', label: 'Low', value: 1 },
  { id: 'rough', emoji: '😢', label: 'Rough', value: 0 },
];

export function EmojiPicker({ selectedId, onSelect, disabled }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const selected = selectedId === mood.id;

        return (
          <Pressable
            key={mood.id}
            disabled={disabled}
            onPress={() => onSelect(mood)}
            style={({ pressed }) => [styles.item, selected && styles.itemSelected, pressed && styles.pressed]}>
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={styles.label}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  item: { minWidth: 78, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.two, paddingHorizontal: Spacing.one, borderRadius: Radius.md, backgroundColor: Brand.surface },
  itemSelected: { borderWidth: 1, borderColor: Brand.magenta },
  emoji: { fontSize: 24 },
  label: { color: Brand.text, fontSize: 12, marginTop: 4, fontWeight: '700' },
  pressed: { opacity: 0.78 },
});