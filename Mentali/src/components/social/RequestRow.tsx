import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Brand, Radius } from '@/constants/theme';
import type { FriendRequest } from '@/constants/mockData';

type Props = {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
};

export function RequestRow({ request, onAccept, onReject }: Props) {
  return (
    <View style={styles.row}>
      <Avatar size={40} />
      <Text style={styles.name}>{request.name}</Text>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btn, { backgroundColor: Brand.success }, pressed && styles.pressed]}
          onPress={() => onAccept?.(request.id)}
          hitSlop={6}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, { backgroundColor: Brand.danger }, pressed && styles.pressed]}
          onPress={() => onReject?.(request.id)}
          hitSlop={6}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { flex: 1, color: Brand.text, fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
});
