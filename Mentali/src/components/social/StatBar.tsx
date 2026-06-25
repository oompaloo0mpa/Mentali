import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { StatPill } from '@/components/social/StatPill';
import { Brand, Radius } from '@/constants/theme';

type Props = {
  fire: number;
  diamonds: number;
  gems: number;
  onPressNotifications?: () => void;
  onPressMenu?: () => void;
};

export function StatBar({ fire, diamonds, gems, onPressNotifications, onPressMenu }: Props) {
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
          hitSlop={8}>
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          onPress={onPressMenu}
          hitSlop={8}>
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
  pressed: { opacity: 0.75 },
});
