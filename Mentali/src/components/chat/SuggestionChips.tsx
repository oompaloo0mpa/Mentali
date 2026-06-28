import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';

export type Chip = {
  key: string;
  label: string;
  muted?: boolean;
};

type Props = {
  chips: Chip[];
  onSelect: (chip: Chip) => void;
};

export function SuggestionChips({ chips, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {chips.map((chip) => (
        <Pressable key={chip.key} onPress={() => onSelect(chip)} style={({ pressed }) => [styles.chip, chip.muted && styles.muted, pressed && styles.pressed]}>
          <Text style={[styles.label, chip.muted && styles.mutedLabel]}>{chip.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, paddingHorizontal: Spacing.three, paddingBottom: Spacing.one },
  chip: { borderRadius: Radius.pill, borderWidth: 1, borderColor: Brand.magenta, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Brand.surface },
  label: { color: Brand.pinkBubble, fontSize: 13, fontWeight: '700' },
  muted: { borderColor: Brand.divider, backgroundColor: Brand.surfaceElevated },
  mutedLabel: { color: Brand.textSecondary },
  pressed: { opacity: 0.75 },
});