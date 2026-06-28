import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';
import type { AppNotification } from '@/constants/mockData';

/** Purple accent used across the notifications panel. */
const Accent = '#B02AB3';

type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: () => void;
};

function NotificationItem({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.read ? 'Read' : 'Unread'}`}>
      <View style={[styles.iconCircle, !item.read && styles.iconCircleUnread]}>
        <Ionicons name={item.icon} size={18} color={item.read ? Brand.textSecondary : Brand.magentaDeep} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>{item.title}</Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export function NotificationsModal({
  visible,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: Props) {
  const insets = useSafeAreaInsets();
  const hasUnread = notifications.some((n) => !n.read);
  const today = notifications.filter((n) => n.recent);
  const earlier = notifications.filter((n) => !n.recent);

  const groups = [
    { label: 'Today', items: today },
    { label: 'Earlier', items: earlier },
  ].filter((g) => g.items.length > 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { marginTop: insets.top + 56 }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>Notifications</Text>
            <View style={styles.headerActions}>
              {hasUnread && (
                <Pressable onPress={onMarkAllRead} hitSlop={8} accessibilityRole="button" accessibilityLabel="Mark all as read">
                  <Text style={styles.action}>Mark all read</Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close notifications">
                <Ionicons name="close" size={20} color={Brand.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <Fragment key={group.label}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                {group.items.map((n) => (
                  <NotificationItem key={n.id} item={n} onPress={() => onMarkRead(n.id)} />
                ))}
              </Fragment>
            ))}
            {notifications.length === 0 && <Text style={styles.empty}>You&apos;re all caught up!</Text>}
          </ScrollView>

          {notifications.length > 0 && (
            <Pressable style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]} onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear all notifications">
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: Spacing.three },
  card: {
    width: '88%',
    maxHeight: '64%',
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: '#FF6DEB',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  title: { flex: 1, color: Brand.text, fontSize: 20, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 0 },
  action: { color: Brand.pink, fontSize: 14, fontWeight: '800' },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flexGrow: 0 },
  groupLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  itemPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#312C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: '#FFE2F8' },
  itemText: { flex: 1 },
  itemTitle: { color: Brand.text, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  itemTitleUnread: { color: Brand.text, fontWeight: '800' },
  itemTime: { color: Brand.textMuted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5DE7' },
  empty: { color: Brand.textSecondary, fontSize: 14, paddingVertical: Spacing.three, textAlign: 'center' },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: Accent,
  },
  clearPressed: { opacity: 0.85 },
  clearText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
