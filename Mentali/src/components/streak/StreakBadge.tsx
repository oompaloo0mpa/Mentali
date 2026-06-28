import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';

type Props = {
  current: number;
  longest: number;
  checkedInToday: boolean;
  onReset: () => void;
};

export function StreakBadge({ current, longest, checkedInToday, onReset }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{current}-day streak</Text>
        <Text style={styles.subtitle}>Longest: {longest} days</Text>
        <Text style={styles.subtitle}>{checkedInToday ? 'Checked in today' : 'Check in to keep it going'}</Text>
      </View>
      <Pressable onPress={onReset} style={styles.button}>
        <Text style={styles.buttonText}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Spacing.four, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  title: { color: Brand.text, fontSize: 18, fontWeight: '800' },
  subtitle: { color: Brand.textSecondary, fontSize: 13, marginTop: 2 },
  button: { backgroundColor: Brand.magenta, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill },
  buttonText: { color: '#fff', fontWeight: '800' },
});