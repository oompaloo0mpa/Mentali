import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Brand, Radius } from '@/theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'soft' | 'ghost';
  style?: ViewStyle | ViewStyle[];
};

export function PrimaryButton({ label, onPress, disabled, variant = 'solid', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'soft' && styles.soft,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <Pressable>
        <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.pill,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  soft: { backgroundColor: Brand.surfaceElevated },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Brand.divider },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  ghostLabel: { color: Brand.text },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
});