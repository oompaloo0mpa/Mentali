import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/colors';
import { ProgressDots } from './ProgressDots';

interface Props {
  title: string;
  onBack: () => void;
  total?: number;
  completed?: number;
}

export function ChatHeader({ title, onBack, total, completed }: Props) {
  const showProgress = typeof total === 'number' && typeof completed === 'number' && total > 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>{title}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {showProgress ? (
          <View style={styles.progress}>
            <ProgressDots total={total} completed={completed} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.sm },
  caption: { ...typography.caption, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
  },
  backPressed: { opacity: 0.8 },
  backText: { fontSize: 14, fontWeight: '600', color: colors.textOnPink },
  progress: { flex: 1 },
});
