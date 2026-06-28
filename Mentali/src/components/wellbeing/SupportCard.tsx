import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SUPPORT_RESOURCES } from '@/data/checkInContent';
import type { SupportResource } from '@/logic/checkin';
import { colors, radius, spacing, typography } from '@/theme/colors';

async function openResource(resource: SupportResource) {
  const target = resource.phone ? `tel:${resource.phone}` : resource.url;
  if (!target) return;
  try {
    const canOpen = await Linking.canOpenURL(target);
    if (canOpen) {
      await Linking.openURL(target);
      return;
    }
  } catch {
    // Fall through to the shared failure message below.
  }
  Alert.alert('Could not open', 'Please reach out to a local support service directly.');
}

export function SupportCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>You don't have to carry this alone</Text>
      <Text style={styles.body}>
        Some of your answers suggest things have felt heavy lately. Talking to someone you
        trust — a friend, family member, or a professional — can really help.
      </Text>

      <View style={styles.actions}>
        {SUPPORT_RESOURCES.map((resource) => (
          <Pressable
            key={resource.label}
            accessibilityRole="button"
            accessibilityLabel={resource.label}
            accessibilityHint={resource.phone ? 'Starts a phone call' : 'Opens a web page'}
            hitSlop={8}
            onPress={() => openResource(resource)}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionLabel}>
              {resource.phone ? `Call ${resource.label}` : resource.label}
            </Text>
            {resource.description ? (
              <Text style={styles.actionHint}>{resource.description}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
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
  title: { ...typography.subheading, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textSecondary },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
  action: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: 'rgba(226,115,140,0.18)',
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionPressed: { opacity: 0.7 },
  actionLabel: { ...typography.label, color: colors.textPrimary },
  actionHint: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
