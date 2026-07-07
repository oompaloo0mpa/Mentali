import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/theme/theme';

const uncertaintyMascot = require('../../../assets/images/delete-uncertainty.png');

const Screen = {
  backdrop: 'rgba(40, 36, 37, 0.92)',
  card: '#FFE2F8',
  cardText: '#5C2A38',
  hint: 'rgba(92, 42, 56, 0.72)',
  keepButton: '#FF9ADA',
  keepPressed: '#F178AE',
  deleteText: '#C62828',
} as const;

type Props = {
  visible: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountModal({ visible, deleting = false, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.panel}>
          <Image source={uncertaintyMascot} style={styles.mascot} resizeMode="contain" accessibilityIgnoresInvertColors />

          <Text style={styles.title}>Are you sure about this?</Text>
          <Text style={styles.subtitle}>
            We get it. Leaving is a big call. If you delete your account, everything tied to you goes
            away for good.
          </Text>

          <View style={styles.detailCard}>
            <Text style={styles.detailText}>
              That includes your profile, mood history, friends, chats, quests, and rewards. Once it is
              gone, there is no way to bring it back.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.keepButton,
              pressed && !deleting && styles.keepPressed,
              deleting && styles.disabled,
            ]}
            onPress={onClose}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Keep account">
            <Text style={styles.keepText}>Keep my account</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && !deleting && styles.deletePressed, deleting && styles.disabled]}
            onPress={onConfirm}
            disabled={deleting}
            accessibilityRole="button"
            accessibilityLabel="Delete account permanently">
            {deleting ? (
              <ActivityIndicator color={Screen.deleteText} />
            ) : (
              <Text style={styles.deleteText}>Yes, delete my account</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Screen.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Screen.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: Spacing.one,
  },
  title: {
    color: Screen.cardText,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Screen.hint,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  detailCard: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(216, 27, 156, 0.08)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  detailText: {
    color: Screen.cardText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    textAlign: 'center',
  },
  keepButton: {
    alignSelf: 'stretch',
    backgroundColor: Screen.keepButton,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: Spacing.one,
  },
  keepPressed: {
    backgroundColor: Screen.keepPressed,
  },
  keepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  deletePressed: {
    opacity: 0.7,
  },
  deleteText: {
    color: Screen.deleteText,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
