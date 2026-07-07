import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { navItems } from '@/hooks/homepageData';

type Props = {
  activeIcon: string;
  onSelect: (icon: string) => void;
};

function BottomNavItem({
  icon,
  active,
  onPress,
}: {
  icon: string;
  active?: boolean;
  onPress: () => void;
}) {
  const iconName = active ? icon.replace('-outline', '') : icon;

  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      <View style={[styles.iconPill, active && styles.iconPillActive]}>
        <Ionicons
          name={iconName as ComponentProps<typeof Ionicons>['name']}
          size={22}
          color={active ? '#111' : '#F4D5F2'}
        />
      </View>
    </Pressable>
  );
}

/** Single source of truth for the bottom tab bar, used by every top-level page. */
export function BottomNav({ activeIcon, onSelect }: Props) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <BottomNavItem
            key={item.icon}
            icon={item.icon}
            active={activeIcon === item.icon}
            onPress={() => onSelect(item.icon)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#B02AB3',
  },
  bottomNav: {
    backgroundColor: '#B02AB3',
    borderTopWidth: 1,
    borderTopColor: '#CC5FD0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 48,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconPillActive: {
    backgroundColor: '#F3C1F4',
  },
});
