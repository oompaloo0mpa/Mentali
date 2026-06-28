import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';

type Props = {
  title: string;
  onBack: () => void;
  total?: number;
  completed?: number;
};

export function ChatHeader({ title, onBack, total, completed }: Props) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {typeof total === 'number' && typeof completed === 'number' ? (
          <Text style={styles.progress}>{completed}/{total}</Text>
        ) : null}
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, gap: Spacing.two },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.magenta, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill },
  backText: { color: '#fff', fontWeight: '800' },
  center: { flex: 1, alignItems: 'center' },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800' },
  progress: { color: Brand.textSecondary, fontSize: 12, marginTop: 2 },
  spacer: { width: 56 },
});