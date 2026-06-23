import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { COPY } from '@/data/checkInContent';
import { colors, spacing, typography } from '@/theme/colors';

/** Persistent non-diagnostic reminder shown on summary screens. */
export function Disclaimer() {
  return <Text style={styles.text}>{COPY.disclaimer}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
