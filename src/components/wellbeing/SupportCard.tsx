import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';

export function SupportCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>💛</Text>
      <Text style={styles.title}>You don't have to carry this alone</Text>
      <Text style={styles.body}>
        Some of your answers suggest things have felt heavy lately. Talking to someone you
        trust — a friend, family member, or a professional — can really help.
      </Text>
      <Text style={styles.body}>
        If you ever feel unsafe or in crisis, please reach out to a local helpline or
        emergency services right away.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(226,115,140,0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(226,115,140,0.5)',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emoji: { fontSize: 26 },
  title: { ...typography.subheading, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
});
