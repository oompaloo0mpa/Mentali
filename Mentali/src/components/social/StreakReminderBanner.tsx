import { StyleSheet, Text, View } from 'react-native';

import { FlameIcon } from '@/components/chat/FlameIcon';
import { Brand, Radius, Spacing } from '@/theme/theme';

type Props = {
  streak: number;
  /** When set, shows a chat-specific reminder for one friend. */
  friendName?: string;
};

export function StreakReminderBanner({ streak, friendName }: Props) {
  const message = friendName
    ? `Send a message today to keep your ${streak}-day streak with ${friendName}.`
    : `You have friend streaks waiting — send a message today so they don't reset tomorrow.`;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <FlameIcon streak={streak} size={22} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 93, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 231, 0.35)',
  },
  text: {
    flex: 1,
    color: Brand.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
