import { StyleSheet, Text, View } from 'react-native';

import { bandColor } from '@/components/wellbeing/bandColor';
import { Brand, Radius, Spacing } from '@/theme/theme';
import type { WellbeingResult } from '@/logic/checkin';

type Props = { result: WellbeingResult };

export function BandCard({ result }: Props) {
  const accent = bandColor(result.band.level);

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>
      <Text style={styles.title}>{result.band.title}</Text>
      <Text style={styles.message}>{result.band.message}</Text>
      <Text style={[styles.total, { color: accent }]}>Score {result.total}/{result.maxTotal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Spacing.four, borderLeftWidth: 4, gap: 6 },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800' },
  message: { color: Brand.textSecondary, fontSize: 14, lineHeight: 20 },
  total: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
});