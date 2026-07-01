import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useSettingsOverlay } from '@/storage/settingsOverlayStore';

type Props = {
  color?: string;
  size?: number;
};

export function SettingsAccessButton({ color = '#FFFFFF', size = 22 }: Props) {
  const { openSettings } = useSettingsOverlay();

  return (
    <Pressable
      onPress={openSettings}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Open settings">
      <Ionicons name="settings-outline" size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
