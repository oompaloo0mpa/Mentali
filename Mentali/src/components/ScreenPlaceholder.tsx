import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Spacing } from '@/constants/theme';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Placeholder for tabs not yet implemented on this branch. */
export function ScreenPlaceholder({ title, icon }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Ionicons name={icon} size={48} color={Brand.magenta} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  title: { color: Brand.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: Brand.textMuted, fontSize: 14 },
});
