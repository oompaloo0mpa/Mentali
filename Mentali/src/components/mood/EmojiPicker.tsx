import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MOODS } from '@/data/checkInContent';
import type { MoodOption } from '@/types/wellbeing';
import { colors, radius, spacing, typography } from '@/theme/colors';

interface Props {
  selectedId?: string | null;
  onSelect: (mood: MoodOption) => void;
  disabled?: boolean;
}

export function EmojiPicker({ selectedId, onSelect, disabled }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const active = mood.id === selectedId;
        return (
          <Pressable
            key={mood.id}
            accessibilityRole="button"
            accessibilityLabel={mood.label}
            accessibilityState={{ selected: active }}
            disabled={disabled}
            onPress={() => onSelect(mood)}
            style={({ pressed }) => [
              styles.item,
              active && styles.itemActive,
              pressed && !disabled && styles.itemPressed,
              disabled && !active && styles.itemDim,
            ]}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: 'rgba(216,30,158,0.16)' },
  itemPressed: { transform: [{ scale: 0.96 }] },
  itemDim: { opacity: 0.6 },
  emoji: { fontSize: 26 },
  label: { ...typography.caption, color: colors.textSecondary },
  labelActive: { color: colors.primarySoft, fontWeight: '700' },
});
