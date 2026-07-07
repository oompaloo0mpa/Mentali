import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  COPY,
  HELPLINE_RESOURCES,
  SIMULATED_REFERRAL_RESOURCE,
} from '@/data/checkInContent';
import type { BandLevel, SupportResource } from '@/logic/checkin';
import { colors, radius, spacing, typography } from '@/theme/colors';

/**
 * PROTOTYPE ONLY: Simulates a support escalation UI for the school project demo.
 * No user data is transmitted to helplines, organisations, or any backend service.
 */

type SimStep = 'preparing' | 'flagged' | 'selected' | 'ready';

type Props = {
  visible: boolean;
  distressLevel: BandLevel;
  onClose: () => void;
};

const STEP_COPY: Record<SimStep, { title: string; subtitle: string }> = {
  preparing: {
    title: 'We are preparing your support request',
    subtitle: 'Looking over what you shared locally on this device.',
  },
  flagged: {
    title: 'It sounds like extra support could help',
    subtitle: 'Demo status only. Nothing has been sent outside the app.',
  },
  selected: {
    title: 'A support service has been selected',
    subtitle: 'Based on our chat, we suggest a Singapore helpline below.',
  },
  ready: {
    title: 'Suggested next step',
    subtitle: 'Contact a helpline when you feel ready. You choose what to share.',
  },
};

async function openResource(resource: SupportResource) {
  const target = resource.whatsapp ?? (resource.phone ? `tel:${resource.phone}` : resource.url);
  if (!target) return;
  try {
    const canOpen = await Linking.canOpenURL(target);
    if (canOpen) {
      await Linking.openURL(target);
      return;
    }
  } catch {
    // Fall through.
  }
  Alert.alert('Could not open', 'Please contact the service using the number shown.');
}

export function SupportSimulationModal({ visible, distressLevel, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<SimStep>('preparing');
  const suggested =
    distressLevel === 'high' ? HELPLINE_RESOURCES[2] ?? SIMULATED_REFERRAL_RESOURCE : SIMULATED_REFERRAL_RESOURCE;

  useEffect(() => {
    if (!visible) {
      setStep('preparing');
      return;
    }

    const t1 = setTimeout(() => setStep('flagged'), 1400);
    const t2 = setTimeout(() => setStep('selected'), 2800);
    const t3 = setTimeout(() => setStep('ready'), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  const copy = STEP_COPY[step];
  const isReady = step === 'ready';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.panel}>
          <View style={styles.prototypeBadge}>
            <Text style={styles.prototypeText}>Prototype demo</Text>
          </View>

          <View style={styles.iconWrap}>
            {isReady ? (
              <Ionicons name="heart-circle" size={36} color={colors.primary} />
            ) : (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>

          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
          <Text style={styles.note}>{COPY.supportPrototypeNote}</Text>

          {isReady ? (
            <View style={styles.suggestedCard}>
              <Text style={styles.suggestedLabel}>Suggested service</Text>
              <Text style={styles.suggestedName}>{suggested.label}</Text>
              {suggested.description ? (
                <Text style={styles.suggestedHint}>{suggested.description}</Text>
              ) : null}
              <View style={styles.actionRow}>
                {suggested.phone ? (
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    onPress={() => openResource(suggested)}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Call now</Text>
                  </Pressable>
                ) : null}
                {suggested.whatsapp ? (
                  <Pressable
                    style={({ pressed }) => [styles.actionBtnOutline, pressed && styles.pressed]}
                    onPress={() => openResource(suggested)}
                  >
                    <Text style={styles.actionBtnOutlineText}>WhatsApp</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {isReady ? (
            <View style={styles.moreList}>
              {HELPLINE_RESOURCES.filter((r) => r.label !== suggested.label).map((resource) => (
                <Pressable
                  key={resource.label}
                  style={({ pressed }) => [styles.moreRow, pressed && styles.pressed]}
                  onPress={() => openResource(resource)}
                >
                  <Text style={styles.moreLabel}>{resource.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>{isReady ? 'Done' : 'Cancel'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226,115,140,0.35)',
  },
  prototypeBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(226,115,140,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  prototypeText: {
    ...typography.caption,
    color: colors.chipText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: spacing.xs,
  },
  suggestedCard: {
    backgroundColor: 'rgba(226,115,140,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  suggestedLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  suggestedName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  suggestedHint: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  actionBtnText: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBtnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBtnOutlineText: {
    ...typography.label,
    color: colors.chipText,
    fontWeight: '700',
  },
  moreList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  moreLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  closeBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  closeBtnText: {
    ...typography.label,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pressed: { opacity: 0.75 },
});
