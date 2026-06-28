import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/theme/theme';

type Props = {
  size?: number;
};

export function Avatar({ size = 44 }: Props) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}>
      <Ionicons name="person" size={size * 0.55} color="#7A7A7A" />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#C9C9C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
