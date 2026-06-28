import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius } from '@/theme/theme';

type Props = {
  suggestion: string;
  onUse?: () => void;
  onRefresh?: () => void;
};

export function SuggestionBar({ suggestion, onUse, onRefresh }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
        onPress={onUse}>
        <Text style={styles.pillText} numberOfLines={1}>
          {suggestion}
        </Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}
        onPress={onRefresh}
        hitSlop={8}>
        <Ionicons name="refresh" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Brand.magenta,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  pillText: { color: Brand.text, fontSize: 13, fontWeight: '600' },
  refresh: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
