import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

export interface Chip {
  key: string;
  label: string;
  /** Renders a quieter, secondary style (used for "prefer not to say"). */
  muted?: boolean;
}

interface Props {
  chips: Chip[];
  onSelect: (chip: Chip) => void;
  disabled?: boolean;
}

export function SuggestionChips({ chips, onSelect, disabled }: Props) {
  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={chip.label}
          accessibilityState={{ disabled }}
          hitSlop={8}
          disabled={disabled}
          onPress={() => onSelect(chip)}
          style={({ pressed }) => [
            styles.chip,
            chip.muted && styles.chipMuted,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={[styles.label, chip.muted && styles.labelMuted]}>{chip.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.chipBorder,
    backgroundColor: 'rgba(216,30,158,0.12)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipMuted: { borderColor: colors.border, backgroundColor: 'transparent' },
  pressed: { backgroundColor: 'rgba(216,30,158,0.28)' },
  disabled: { opacity: 0.4 },
  label: { ...typography.label, color: colors.chipText },
  labelMuted: { color: colors.textMuted },
});
