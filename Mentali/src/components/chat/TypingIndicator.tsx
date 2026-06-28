import { StyleSheet, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';

export function TypingIndicator() {
  return (
    <View style={styles.wrap}>
      <View style={styles.bubble}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotMid]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  bubble: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Brand.pinkBubble, paddingHorizontal: 14, paddingVertical: 12, borderRadius: Radius.pill },
  dot: { width: 7, height: 7, borderRadius: 999, backgroundColor: Brand.textOnBubble, opacity: 0.72 },
  dotMid: { opacity: 0.5 },
});