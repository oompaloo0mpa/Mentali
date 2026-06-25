import { StyleSheet, Text, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { Brand } from '@/constants/theme';

type Props = {
  icon: AppIconName;
  value: number | string;
  color: string;
};

export function StatPill({ icon, value, color }: Props) {
  return (
    <View style={styles.row}>
      <AppIcon name={icon} size={20} />
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 16, fontWeight: '800', color: Brand.text },
});
