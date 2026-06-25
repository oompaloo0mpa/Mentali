import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { Brand } from '@/constants/theme';
import type { Friend } from '@/constants/mockData';

type Props = {
  friend: Friend;
  onPress?: (friend: Friend) => void;
  onLongPress?: (friend: Friend) => void;
};

/** Tap opens chat; long-press opens friend options. */
export function FriendRow({ friend, onPress, onLongPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress?.(friend)}
      onLongPress={() => onLongPress?.(friend)}
      delayLongPress={300}>
      <Avatar size={44} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{friend.name}</Text>
          <AppIcon name="fire" size={14} />
          <Text style={styles.streak}>{friend.streak}</Text>
          <Text style={styles.mood}>{friend.mood}</Text>
        </View>
        <Text style={styles.lastSeen}>{friend.lastSeen}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Brand.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  pressed: { opacity: 0.6 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: Brand.text, fontSize: 16, fontWeight: '700' },
  streak: { color: Brand.fire, fontSize: 14, fontWeight: '700' },
  mood: { fontSize: 14 },
  lastSeen: { color: Brand.textMuted, fontSize: 13 },
});
