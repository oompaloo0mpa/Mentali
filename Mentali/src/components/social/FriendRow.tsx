import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { Brand, Radius } from '@/theme/theme';
import { friendMood, isMuted, type FriendBadge } from '@/storage/socialStore';
import type { Friend } from '@/data/mockData';

type Props = {
  friend: Friend;
  badges?: FriendBadge[];
  onPress?: (friend: Friend) => void;
  onLongPress?: (friend: Friend) => void;
  onPressProfile?: (friend: Friend) => void;
  onSendMotivation?: (friend: Friend) => void;
};

const BADGE_STYLES = {
  info: { backgroundColor: 'rgba(52,183,241,0.18)', color: Brand.gem },
  warning: { backgroundColor: 'rgba(229,57,53,0.18)', color: '#FF8A85' },
  quest: { backgroundColor: 'rgba(241,196,15,0.18)', color: Brand.happy },
} as const;

/** Tap opens chat; tap avatar opens the profile sheet; long-press opens friend options. */
export function FriendRow({ friend, badges = [], onPress, onLongPress, onPressProfile, onSendMotivation }: Props) {
  const muted = isMuted(friend);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress?.(friend)}
      onLongPress={() => onLongPress?.(friend)}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${friend.name}`}>
      <Pressable
        onPress={() => onPressProfile?.(friend)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`View ${friend.name}'s profile`}>
        <Avatar size={44} />
        {friend.hasUnread && <View style={styles.unreadDot} />}
      </Pressable>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {friend.name}
          </Text>
          {friend.pinned && <Ionicons name="pin" size={13} color={Brand.pink} />}
          {muted && <Ionicons name="notifications-off" size={13} color={Brand.textMuted} />}
          <AppIcon name="fire" size={14} />
          <Text style={styles.streak}>{friend.streak}</Text>
          <Text style={styles.mood}>{friendMood(friend)}</Text>
        </View>

        {badges.length > 0 ? (
          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <View key={badge.label} style={[styles.badge, { backgroundColor: BADGE_STYLES[badge.tone].backgroundColor }]}>
                <Text style={[styles.badgeText, { color: BADGE_STYLES[badge.tone].color }]}>{badge.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.lastSeen}>{friend.lastSeen}</Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.motivate, pressed && styles.motivatePressed]}
        onPress={() => onSendMotivation?.(friend)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Send motivation to ${friend.name}`}>
        <Ionicons name="heart" size={16} color="#FFFFFF" />
      </Pressable>

      <Ionicons name="chevron-forward" size={20} color={Brand.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pressed: { opacity: 0.6 },
  unreadDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Brand.gem,
    borderWidth: 2,
    borderColor: Brand.background,
  },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: Brand.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  streak: { color: Brand.fire, fontSize: 14, fontWeight: '700' },
  mood: { fontSize: 14 },
  lastSeen: { color: Brand.textSecondary, fontSize: 13 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  badgeText: { fontSize: 11, fontWeight: '700' },
  motivate: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivatePressed: { opacity: 0.7 },
});
