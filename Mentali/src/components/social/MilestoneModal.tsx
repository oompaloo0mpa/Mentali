import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FlameIcon } from '@/components/chat/FlameIcon';
import { Brand, Radius, Spacing, getStreakColor } from '@/theme/theme';

type Props = {
  visible: boolean;
  friendName: string;
  milestone: number;
  onClose: () => void;
};

export function MilestoneModal({ visible, friendName, milestone, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.8);
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    }
  }, [visible, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={[styles.glow, { shadowColor: getStreakColor(milestone) }]}>
            <FlameIcon streak={milestone} size={96} />
          </View>
          <Text style={styles.kicker}>Milestone unlocked</Text>
          <Text style={styles.title}>{milestone}-day streak!</Text>
          <Text style={styles.subtitle}>
            You and {friendName} have kept your streak alive for {milestone} days. Keep showing up for each other.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Celebrate and close">
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Nice!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#2B2B2B',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  glow: {
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: Spacing.one,
  },
  kicker: { color: Brand.happy, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: Brand.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: Brand.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.two,
    backgroundColor: Brand.pink,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
