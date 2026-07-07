import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoodFacePicker } from '@/components/mood/MoodFacePicker';
import { COLOR_THEME_OPTIONS } from '@/data/colorThemes';
import { useUserProfile } from '@/storage/userProfileStore';
import { Spacing } from '@/theme/theme';

const Screen = {
  background: '#282425',
  card: '#FFE2F8',
  cardText: '#5C2A38',
  backButton: '#FF9ADA',
  toggleOn: '#D81B9C',
  toggleOff: '#C9A8B8',
  helpIcon: '#D81B9C',
  themeSelected: '#D81B9C',
  hint: 'rgba(92, 42, 56, 0.7)',
} as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onResetPassword: () => void;
  onDeleteAccount: () => void;
};

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  helpText: string;
};

function HelpIcon({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.helpButton}>
      <Text style={styles.helpGlyph}>?</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onValueChange, helpText }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabelWrap}>
        <Text style={styles.cardText}>{label}</Text>
        <HelpIcon onPress={() => Alert.alert(label, helpText)} />
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Screen.toggleOff, true: Screen.toggleOn }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={Screen.toggleOff}
      />
    </View>
  );
}

type LinkRowProps = {
  label: string;
  subtitle?: string;
  onPress?: () => void;
};

function LinkRow({ label, subtitle, onPress }: LinkRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.linkTextWrap}>
        <Text style={styles.cardText}>{label}</Text>
        {subtitle ? <Text style={styles.linkSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Screen.cardText} />
    </Pressable>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function SettingsSection({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function SettingsScreen({ visible, onClose, onResetPassword, onDeleteAccount }: Props) {
  const insets = useSafeAreaInsets();
  const {
    profile,
    setAnonymousMode,
    setHideMoodFromFriends,
    setAllowFriendRequests,
    setAllowNotifications,
    setCurrentMood,
  } = useUserProfile();

  const persistSetting = async (
    label: string,
    setter: (value: boolean) => Promise<void>,
    value: boolean,
  ) => {
    try {
      await setter(value);
    } catch (error) {
      Alert.alert(
        'Could not save setting',
        error instanceof Error ? error.message : `Unable to update ${label}.`,
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top + Spacing.two }]}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.five }]}
          showsVerticalScrollIndicator={false}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={onClose}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>

          <Text style={styles.pageTitle}>Settings & Preferences</Text>

          <SettingsSection title="Privacy and Safety">
            <ToggleRow
              label="Anonymous mode"
              value={profile.anonymousMode}
              onValueChange={(value) => void persistSetting('Anonymous mode', setAnonymousMode, value)}
              helpText="People who are not your friends will not see your username. They can still add you with your friend code."
            />
            <ToggleRow
              label="Hide mood from friends"
              value={profile.hideMoodFromFriends}
              onValueChange={(value) =>
                void persistSetting('Hide mood from friends', setHideMoodFromFriends, value)
              }
              helpText="When enabled, friends will not see your daily mood on their friends list."
            />
            <ToggleRow
              label="Allow friend requests"
              value={profile.allowFriendRequests}
              onValueChange={(value) =>
                void persistSetting('Allow friend requests', setAllowFriendRequests, value)
              }
              helpText="When disabled, other users cannot send you new friend requests."
            />
          </SettingsSection>

          <SettingsSection title="Notifications">
            <ToggleRow
              label="Allow notifications"
              value={profile.allowNotifications}
              onValueChange={(value) =>
                void persistSetting('Allow notifications', setAllowNotifications, value)
              }
              helpText="Receive reminders, encouragement, and leaderboard updates from Mentali."
            />
          </SettingsSection>

          <SettingsSection title="Appearance">
            <View style={styles.mentalitySection}>
              <Text style={styles.mentalityTitle}>Edit your mentality</Text>
              <Text style={styles.mentalityHint}>
                Pick the mood face that matches how you feel. This is the same set shown on your homepage.
              </Text>
              <MoodFacePicker
                selectedId={profile.currentMoodId}
                onSelect={(mood) => setCurrentMood({ id: mood.id, emoji: mood.emoji })}
                variant="light"
                compact
              />
            </View>
          </SettingsSection>

          <SettingsSection title="Account Management">
            <LinkRow
              label="Reset password"
              subtitle="We'll send a verification code to your email or phone"
              onPress={onResetPassword}
            />
            <LinkRow label="Delete account" onPress={onDeleteAccount} />
          </SettingsSection>

          <View style={styles.section}>
            <View style={styles.comingSoonHeader}>
              <Text style={styles.sectionTitle}>Colour Themes</Text>
              <Text style={styles.comingSoonBadge}>Coming soon</Text>
            </View>
            <View style={[styles.card, styles.disabledCard]} pointerEvents="none">
              {COLOR_THEME_OPTIONS.map((theme) => {
                const selected = profile.colorTheme === theme.id;
                return (
                  <View
                    key={theme.id}
                    style={[styles.themeRow, selected && styles.themeRowSelected]}>
                    <View style={[styles.themeSwatch, { backgroundColor: theme.swatch }]} />
                    <Text style={[styles.cardText, styles.disabledText]}>{theme.label}</Text>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={Screen.themeSelected} />
                    ) : (
                      <View style={styles.themeRadioEmpty} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Screen.background,
  },
  content: {
    paddingHorizontal: Spacing.three,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: Screen.backButton,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.three,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: Spacing.four,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  comingSoonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  comingSoonBadge: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Screen.card,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    gap: 2,
  },
  disabledCard: {
    opacity: 0.45,
  },
  cardText: {
    color: Screen.cardText,
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    flex: 1,
  },
  disabledText: {
    opacity: 0.9,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  toggleLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  helpButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Screen.helpIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpGlyph: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  linkTextWrap: {
    flex: 1,
    gap: 4,
  },
  linkSubtitle: {
    color: Screen.hint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  mentalitySection: {
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  mentalityTitle: {
    color: Screen.cardText,
    fontSize: 16,
    fontWeight: '700',
  },
  mentalityHint: {
    color: Screen.hint,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    paddingHorizontal: Spacing.one,
  },
  themeRowSelected: {
    backgroundColor: 'rgba(216, 27, 156, 0.12)',
  },
  themeSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(92, 42, 56, 0.25)',
  },
  themeRadioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Screen.cardText,
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.8,
  },
});
