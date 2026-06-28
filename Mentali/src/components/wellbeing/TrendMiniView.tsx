import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';
import type { CheckInRecord } from '@/logic/checkin';

type Props = { history: CheckInRecord[] };

export function TrendMiniView({ history }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recent check-ins</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>Your recent check-ins will appear here.</Text>
      ) : (
        history.slice(0, 3).map((entry) => (
          <View key={entry.date} style={styles.row}>
            <Text style={styles.date}>{entry.date}</Text>
            <Text style={styles.score}>PHQ-4: {entry.phq4Total}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Spacing.four, gap: Spacing.one },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800', marginBottom: 2 },
  empty: { color: Brand.textSecondary, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  date: { color: Brand.textSecondary, fontSize: 13 },
  score: { color: Brand.text, fontSize: 13, fontWeight: '700' },
});