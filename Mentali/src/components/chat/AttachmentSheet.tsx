import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickPhotos: () => void;
  onPickFiles: () => void;
};

/** Bottom sheet shown when tapping the chat "+": Add photos or files. */
export function AttachmentSheet({ visible, onClose, onPickPhotos, onPickFiles }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add photos or files</Text>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            onPress={onPickPhotos}>
            <View style={styles.iconCircle}>
              <Ionicons name="image" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.optionLabel}>Add photos</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
            onPress={onPickFiles}>
            <View style={styles.iconCircle}>
              <Ionicons name="document" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.optionLabel}>Add files</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            onPress={onClose}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.divider,
    marginBottom: Spacing.two,
  },
  title: { color: Brand.text, fontSize: 16, fontWeight: '800', paddingVertical: Spacing.one },
  option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  pressed: { opacity: 0.65 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: { color: Brand.text, fontSize: 15, fontWeight: '600' },
  cancel: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceElevated,
  },
  cancelLabel: { color: Brand.textSecondary, fontSize: 15, fontWeight: '700' },
});
