import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/theme/theme';

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

export function MoreMenu({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.card, { marginTop: insets.top + 56 }]}>
          <Pressable style={styles.closeRow} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={Brand.text} />
          </Pressable>
          {ITEMS.map((item, index) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.item,
                index < ITEMS.length - 1 && styles.itemDivider,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onSelect?.(item.key);
                onClose();
              }}>
              <Ionicons name={item.icon} size={20} color={MENU_ACCENT} />
              <Text style={styles.itemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const MENU_ACCENT = '#B02AB3';
const MENU_BORDER = '#FF6DEB';

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: Spacing.three },
  card: {
    minWidth: 220,
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: MENU_BORDER,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  closeRow: { alignSelf: 'flex-end', padding: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: Spacing.two },
  itemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Brand.divider },
  pressed: { opacity: 0.6 },
  itemLabel: { color: Brand.text, fontSize: 16, fontWeight: '700' },
});
