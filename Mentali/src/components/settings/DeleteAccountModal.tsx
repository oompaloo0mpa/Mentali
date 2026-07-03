import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/theme/theme';

const ModalColors = {
  panel: '#2A2628',
  border: '#FFFFFF',
  message: '#B02AB3',
  deleteBg: '#F4A6A0',
  deleteText: '#8B1E1E',
  cancelBg: '#F3D4F8',
  cancelText: '#B02AB3',
} as const;

type Props = {
  visible: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountModal({ visible, deleting = false, onClose, onConfirm }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Pressable style={styles.backButton} onPress={onClose} hitSlop={8} disabled={deleting}>
            <Ionicons name="arrow-back" size={28} color={ModalColors.message} />
          </Pressable>

          <Text style={styles.message}>Deleting an account is irreversible. Are you sure?</Text>

          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed, deleting && styles.disabled]}
            onPress={onConfirm}
            disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color={ModalColors.deleteText} />
            ) : (
              <Text style={styles.deleteText}>Yes I am sure, delete account.</Text>
            )}
          </Pressable>

          <View style={styles.cancelRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={onClose}
              disabled={deleting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    minHeight: 280,
    backgroundColor: ModalColors.panel,
    borderWidth: 2,
    borderColor: ModalColors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.four,
  },
  message: {
    color: ModalColors.message,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.two,
  },
  deleteButton: {
    backgroundColor: ModalColors.deleteBg,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: Spacing.four,
  },
  deleteText: {
    color: ModalColors.deleteText,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  cancelRow: {
    alignItems: 'flex-end',
  },
  cancelButton: {
    backgroundColor: ModalColors.cancelBg,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  cancelText: {
    color: ModalColors.cancelText,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.7 },
});
