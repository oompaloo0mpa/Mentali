import { StyleSheet, Text, View } from 'react-native';

import { COPY } from '@/data/checkInContent';
import { Brand, Radius, Spacing } from '@/theme/theme';

export function Disclaimer() {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{COPY.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Spacing.four },
  text: { color: Brand.textMuted, fontSize: 12, lineHeight: 18 },
});