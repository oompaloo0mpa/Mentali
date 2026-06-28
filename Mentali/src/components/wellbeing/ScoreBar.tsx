import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';

type Props = {
  label: string;
  value: number;
  max: number;
  hint?: string;
  color: string;
};

export function ScoreBar({ label, value, max, hint, color }: Props) {
  const percent = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}/{max}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent * 100}%`, backgroundColor: color }]} />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Brand.text, fontSize: 14, fontWeight: '700' },
  value: { fontSize: 13, fontWeight: '800' },
  track: { height: 10, backgroundColor: Brand.divider, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  hint: { color: Brand.textSecondary, fontSize: 12 },
});