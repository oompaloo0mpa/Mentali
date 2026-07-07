import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { COPY, CRISIS_RESOURCES, HELPLINE_RESOURCES } from '@/data/checkInContent';
import { SupportSimulationModal } from '@/components/wellbeing/SupportSimulationModal';
import type { BandLevel, SupportResource } from '@/logic/checkin';
import { colors, radius, spacing, typography } from '@/theme/colors';

type Props = {
  distressLevel: BandLevel;
  suggestSupport: boolean;
  onReachFriend?: () => void;
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
  Alert.alert('Could not open', 'Please contact the service directly.');
}

function HelplineRow({ resource }: { resource: SupportResource }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openResource(resource)}
      style={({ pressed }) => [styles.helplineRow, pressed && styles.pressed]}
    >
      <View style={styles.helplineText}>
        <Text style={styles.helplineLabel}>{resource.label}</Text>
        {resource.description ? (
          <Text style={styles.helplineHint}>{resource.description}</Text>
        ) : null}
      </View>
      <Ionicons
        name={resource.whatsapp ? 'logo-whatsapp' : resource.phone ? 'call' : 'open-outline'}
        size={18}
        color={colors.chipText}
      />
    </Pressable>
  );
}

export function SupportPathway({ distressLevel, suggestSupport, onReachFriend }: Props) {
  const [simulationVisible, setSimulationVisible] = useState(false);
  const [showHelplines, setShowHelplines] = useState(false);
  const prominent = suggestSupport || distressLevel === 'moderate' || distressLevel === 'high';

  return (
    <>
      <View style={[styles.card, prominent && styles.cardProminent]}>
        <Text style={styles.title}>
          {prominent ? 'What would feel most helpful right now?' : 'Gentle next steps'}
        </Text>
        <Text style={styles.body}>
          {prominent
            ? 'From what you shared, here are a few ways to get support if you want it.'
            : 'Regular chats like this help you notice patterns early. You can always reach out if things shift.'}
        </Text>

        <View style={styles.choiceList}>
          {onReachFriend ? (
            <Pressable
              accessibilityRole="button"
              onPress={onReachFriend}
              style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}
            >
              <View style={[styles.choiceIcon, styles.choiceIconFriend]}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.choiceText}>
                <Text style={styles.choiceTitle}>Message a friend</Text>
                <Text style={styles.choiceBody}>
                  Reach someone you trust in Mentali. You do not need the perfect words.
                </Text>
              </View>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setSimulationVisible(true)}
            style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}
          >
            <View style={[styles.choiceIcon, styles.choiceIconHelpline]}>
              <Ionicons name="hand-left" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.choiceText}>
              <Text style={styles.choiceTitle}>Request helpline support</Text>
              <Text style={styles.choiceBody}>
                See a guided demo of how support could be arranged, then call or WhatsApp a service.
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowHelplines((v) => !v)}
            style={({ pressed }) => [styles.choiceCard, styles.choiceCardSoft, pressed && styles.pressed]}
          >
            <View style={[styles.choiceIcon, styles.choiceIconBrowse]}>
              <Ionicons name="list" size={22} color={colors.chipText} />
            </View>
            <View style={styles.choiceText}>
              <Text style={styles.choiceTitle}>Browse Singapore helplines</Text>
              <Text style={styles.choiceBody}>
                View numbers and WhatsApp options without starting the demo flow.
              </Text>
            </View>
          </Pressable>
        </View>

        {showHelplines ? (
          <View style={styles.helplineList}>
            <Text style={styles.helplineHeading}>Singapore support options</Text>
            {HELPLINE_RESOURCES.map((resource) => (
              <HelplineRow key={resource.label} resource={resource} />
            ))}
          </View>
        ) : null}

        {(distressLevel === 'high' || suggestSupport) && (
          <View style={styles.crisisBox}>
            <Text style={styles.crisisTitle}>If you need urgent help</Text>
            <Text style={styles.crisisBody}>
              Call 995 or go to the nearest A&E if you are in immediate danger.
            </Text>
            {CRISIS_RESOURCES.map((resource) => (
              <HelplineRow key={resource.label} resource={resource} />
            ))}
          </View>
        )}

        <Text style={styles.prototypeNote}>{COPY.supportPrototypeNote}</Text>
      </View>

      <SupportSimulationModal
        visible={simulationVisible}
        distressLevel={distressLevel}
        onClose={() => setSimulationVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(226,115,140,0.1)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(226,115,140,0.35)',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardProminent: {
    borderColor: 'rgba(226,115,140,0.65)',
    backgroundColor: 'rgba(226,115,140,0.16)',
  },
  title: { ...typography.subheading, color: colors.textPrimary, fontSize: 17 },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  choiceList: { gap: spacing.sm },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226,115,140,0.25)',
  },
  choiceCardSoft: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconFriend: { backgroundColor: colors.primary },
  choiceIconHelpline: { backgroundColor: '#E2738C' },
  choiceIconBrowse: { backgroundColor: 'rgba(226,115,140,0.2)' },
  choiceText: { flex: 1, gap: 4 },
  choiceTitle: { ...typography.label, color: colors.textPrimary, fontSize: 15 },
  choiceBody: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  helplineList: { gap: spacing.xs },
  helplineHeading: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(226,115,140,0.1)',
  },
  helplineText: { flex: 1, gap: 2 },
  helplineLabel: { ...typography.label, color: colors.textPrimary },
  helplineHint: { ...typography.caption, color: colors.textSecondary, lineHeight: 17 },
  crisisBox: {
    backgroundColor: 'rgba(229,57,53,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  crisisTitle: { ...typography.label, color: colors.textPrimary },
  crisisBody: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  prototypeNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  pressed: { opacity: 0.75 },
});
