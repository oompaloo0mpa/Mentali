import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatPill } from '@/components/social/StatPill';
import { Brand, Radius } from '@/theme/theme';

type Props = {
  fire: number;
  diamonds: number;
  gems: number;
  unreadCount?: number;
  onPressNotifications?: () => void;
  onPressMenu?: () => void;
};

export function StatBar({ fire, diamonds, gems, unreadCount = 0, onPressNotifications, onPressMenu }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <StatPill icon="fire" value={fire} color={Brand.fire} />
        <StatPill icon="diamond" value={diamonds} color={Brand.diamond} />
        <StatPill icon="ice" value={gems} color={Brand.gem} />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          onPress={onPressNotifications}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          onPress={onPressMenu}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Menu">
          <Ionicons name="menu" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Brand.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Brand.background,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  pressed: { opacity: 0.75 },
});
