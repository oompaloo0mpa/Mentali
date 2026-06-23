import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (key: 'statistics' | 'settings' | 'logout') => void;
};

type Item = {
  key: 'statistics' | 'settings' | 'logout';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const ITEMS: Item[] = [
  { key: 'statistics', label: 'Statistics', icon: 'stats-chart' },
  { key: 'settings', label: 'Settings', icon: 'settings-sharp' },
  { key: 'logout', label: 'Logout', icon: 'log-out' },
];

/** Top-right dropdown: Statistics / Settings / Logout. */
export function MoreMenu({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tapping anywhere outside the card closes the menu. */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.card, { marginTop: insets.top + 56 }]}>
          <Pressable style={styles.closeRow} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={Brand.text} />
          </Pressable>
          {ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={() => {
                onSelect?.(item.key);
                onClose();
              }}>
              <Ionicons name={item.icon} size={18} color={Brand.gem} />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: Spacing.three },
  card: {
    minWidth: 180,
    backgroundColor: Brand.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    gap: 4,
  },
  closeRow: { alignSelf: 'flex-start', padding: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4 },
  pressed: { opacity: 0.6 },
  itemLabel: { color: Brand.text, fontSize: 15, fontWeight: '600' },
});
