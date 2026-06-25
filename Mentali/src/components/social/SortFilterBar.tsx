import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';

export type FriendSort = 'streak' | 'recent' | 'alpha';
export type FriendFilter = 'all' | 'at-risk' | 'needs-support' | 'new';

const SORTS: { key: FriendSort; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'recent', label: 'Recent', icon: 'time-outline' },
  { key: 'streak', label: 'Streak', icon: 'flame-outline' },
  { key: 'alpha', label: 'A–Z', icon: 'text-outline' },
];

const FILTERS: { key: FriendFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'at-risk', label: 'At risk' },
  { key: 'needs-support', label: 'Needs support' },
  { key: 'new', label: 'New' },
];

type Props = {
  sort: FriendSort;
  filter: FriendFilter;
  onSortChange: (sort: FriendSort) => void;
  onFilterChange: (filter: FriendFilter) => void;
};

export function SortFilterBar({ sort, filter, onSortChange, onFilterChange }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => onFilterChange(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filter by ${f.label}`}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        {SORTS.map((s) => {
          const active = sort === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => onSortChange(s.key)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Sort by ${s.label}`}
              style={({ pressed }) => [styles.sortChip, active && styles.sortChipActive, pressed && styles.pressed]}>
              <Ionicons name={s.icon} size={13} color={active ? '#FFFFFF' : Brand.textSecondary} />
              <Text style={[styles.sortText, active && styles.sortTextActive]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  row: { gap: Spacing.one, paddingRight: Spacing.three },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Brand.divider,
  },
  chipActive: { backgroundColor: Brand.magenta, borderColor: Brand.magenta },
  chipText: { color: Brand.textSecondary, fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  sortRow: { flexDirection: 'row', gap: Spacing.one },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.one,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  sortChipActive: { backgroundColor: Brand.surfaceElevated },
  sortText: { color: Brand.textSecondary, fontSize: 12, fontWeight: '700' },
  sortTextActive: { color: '#FFFFFF' },
  pressed: { opacity: 0.7 },
});
