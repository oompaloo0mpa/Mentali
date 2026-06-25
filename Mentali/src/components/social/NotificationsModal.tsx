import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';
import type { AppNotification } from '@/constants/mockData';

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
        <Ionicons name={item.icon} size={18} color={item.read ? Brand.textSecondary : Brand.magenta} />
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
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.headerActions}>
              {hasUnread && (
                <Pressable onPress={onMarkAllRead} hitSlop={8} accessibilityRole="button" accessibilityLabel="Mark all as read">
                  <Text style={styles.action}>Mark all read</Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close notifications">
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
            <Pressable style={styles.clear} onPress={onClear} accessibilityRole="button" accessibilityLabel="Clear all notifications">
              <Ionicons name="trash-outline" size={15} color={Brand.textSecondary} />
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  action: { color: Brand.pink, fontSize: 13, fontWeight: '700' },
  list: { flexGrow: 0 },
  groupLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: Spacing.one,
    paddingBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
  itemPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: { backgroundColor: 'rgba(216,27,156,0.18)' },
  itemText: { flex: 1 },
  itemTitle: { color: Brand.textSecondary, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  itemTitleUnread: { color: Brand.text, fontWeight: '700' },
  itemTime: { color: Brand.textMuted, fontSize: 12, marginTop: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Brand.magenta },
  empty: { color: Brand.textSecondary, fontSize: 14, paddingVertical: Spacing.three, textAlign: 'center' },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Brand.divider,
  },
  clearText: { color: Brand.textSecondary, fontSize: 13, fontWeight: '700' },
});
