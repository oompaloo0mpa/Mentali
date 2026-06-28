import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';
import { SUPPORT_RESOURCES } from '@/data/checkInContent';

export function SupportCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Need support?</Text>
      <Text style={styles.body}>If today feels heavy, these options can help you connect with someone.</Text>
      {SUPPORT_RESOURCES.map((resource) => (
        <View key={resource.label} style={styles.resource}>
          <Text style={styles.resourceLabel}>{resource.label}</Text>
          {resource.description ? <Text style={styles.resourceText}>{resource.description}</Text> : null}
          {resource.phone ? <Text style={styles.resourceLink}>Call {resource.phone}</Text> : null}
          {resource.url ? <Link href={resource.url} style={styles.resourceLink}>{resource.url}</Link> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Brand.surface, borderRadius: Radius.md, padding: Spacing.four, gap: Spacing.two },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800' },
  body: { color: Brand.textSecondary, fontSize: 14, lineHeight: 20 },
  resource: { gap: 3, paddingTop: 4 },
  resourceLabel: { color: Brand.text, fontSize: 14, fontWeight: '700' },
  resourceText: { color: Brand.textSecondary, fontSize: 13, lineHeight: 18 },
  resourceLink: { color: Brand.magenta, fontSize: 13, fontWeight: '700' },
});