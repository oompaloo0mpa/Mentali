import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme/colors';

type Variant = 'solid' | 'soft' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'solid' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.label, variant === 'solid' ? styles.labelSolid : styles.labelTinted]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  label: { fontSize: 15, fontWeight: '600' },
  labelSolid: { color: colors.white },
  labelTinted: { color: colors.primarySoft },
});

const variantStyle: Record<Variant, ViewStyle> = {
  solid: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.surfaceMuted },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.chipBorder },
};
