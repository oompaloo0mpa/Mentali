import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { NOTIFICATIONS } from '@/constants/mockData';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationsModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { marginTop: insets.top + 56 }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color={Brand.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {NOTIFICATIONS.map((n) => (
              <View key={n.id} style={styles.item}>
                <View style={styles.iconCircle}>
                  <Ionicons name={n.icon} size={18} color={Brand.magenta} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemTime}>{n.time}</Text>
                </View>
              </View>
            ))}
            {NOTIFICATIONS.length === 0 && <Text style={styles.empty}>You're all caught up!</Text>}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: Spacing.three },
  card: {
    width: '88%',
    maxHeight: '60%',
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.one,
  },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800' },
  list: { flexGrow: 0 },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemTitle: { color: Brand.text, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  itemTime: { color: Brand.textMuted, fontSize: 12, marginTop: 2 },
  empty: { color: Brand.textMuted, fontSize: 14, paddingVertical: Spacing.three, textAlign: 'center' },
});
