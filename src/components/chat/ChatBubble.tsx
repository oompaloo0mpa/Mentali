import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

export type BubbleRole = 'bot' | 'user';

interface Props {
  role: BubbleRole;
  text: string;
  helper?: string;
  /** Skip the entrance animation (e.g. when restoring history). */
  animate?: boolean;
}

export function ChatBubble({ role, text, helper, animate = true }: Props) {
  const isBot = role === 'bot';
  const enter = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.timing(enter, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animate, enter]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <Animated.View
      style={[
        styles.row,
        isBot ? styles.rowBot : styles.rowUser,
        { opacity: enter, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isBot ? styles.bubbleBot : styles.bubbleUser,
        ]}
      >
        <Text style={[styles.text, isBot ? styles.textBot : styles.textUser]}>{text}</Text>
        {helper ? (
          <Text style={[styles.helper, isBot ? styles.helperBot : styles.helperUser]}>
            {helper}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: spacing.md, flexDirection: 'row' },
  rowBot: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bubbleBot: {
    backgroundColor: colors.botBubble,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.userBubble,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  text: { ...typography.bubble },
  textBot: { color: colors.botBubbleText },
  textUser: { color: colors.userBubbleText },
  helper: { ...typography.caption, marginTop: spacing.xs },
  helperBot: { color: 'rgba(42,34,48,0.7)' },
  helperUser: { color: 'rgba(255,255,255,0.85)' },
});
