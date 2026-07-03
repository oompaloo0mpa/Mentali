import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MOOD_OPTIONS, type MoodOptionWithImage } from '@/data/moods';
import type { MoodOption } from '@/logic/checkin';
import { colors, spacing, typography } from '@/theme/colors';

interface Props {
  selectedId?: string | null;
  onSelect: (mood: MoodOption) => void;
  disabled?: boolean;
  /** 'dark' = labels for dark page backgrounds; 'light' = labels on pale mood chips. */
  variant?: 'dark' | 'light';
  compact?: boolean;
}

export function MoodFacePicker({
  selectedId,
  onSelect,
  disabled,
  variant = 'light',
  compact = false,
}: Props) {
  const labelColor = variant === 'dark' ? '#F5F1F4' : colors.textOnPink;
  const activeLabelColor = variant === 'dark' ? '#FF9ADA' : colors.primary;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {MOOD_OPTIONS.map((mood) => {
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
              compact && styles.itemCompact,
              active && styles.itemActive,
              pressed && !disabled && styles.itemPressed,
              disabled && !active && styles.itemDim,
            ]}
          >
            <View style={[styles.faceCircle, { backgroundColor: mood.color }, active && styles.faceCircleActive]}>
              <Image source={mood.image} resizeMode="contain" style={styles.faceImage} />
            </View>
            <Text
              style={[
                styles.label,
                { color: active ? activeLabelColor : labelColor },
                active && styles.labelActive,
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { MoodOptionWithImage };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  rowCompact: { justifyContent: 'center', flexWrap: 'wrap', gap: spacing.sm },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    minWidth: 58,
  },
  itemCompact: { flex: 0, minWidth: 64 },
  itemActive: {},
  itemPressed: { transform: [{ scale: 0.96 }] },
  itemDim: { opacity: 0.55 },
  faceCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  faceCircleActive: {
    borderColor: colors.primary,
  },
  faceImage: {
    width: 46,
    height: 46,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '700',
  },
});
