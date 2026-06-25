import { Fragment } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import type { Friend } from '@/constants/mockData';

export type FriendOption = 'remove' | 'mute' | 'block' | 'archive';

type Props = {
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
  onSelect?: (option: FriendOption, friend: Friend) => void;
};

const OPTIONS: { key: FriendOption; label: string; danger?: boolean }[] = [
  { key: 'remove', label: 'Remove as friend', danger: true },
  { key: 'mute', label: 'Mute' },
  { key: 'block', label: 'Block', danger: true },
  { key: 'archive', label: 'Archive' },
];

export function FriendOptionsModal({ visible, friend, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {OPTIONS.map((opt, index) => (
            <Fragment key={opt.key}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                onPress={() => {
                  if (friend) onSelect?.(opt.key, friend);
                  onClose();
                }}>
                <Text style={[styles.label, opt.danger && styles.danger]}>{opt.label}</Text>
              </Pressable>
            </Fragment>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  option: { paddingVertical: 16, alignItems: 'center' },
  pressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  label: { color: Brand.text, fontSize: 16, fontWeight: '600' },
  danger: { color: Brand.danger },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Brand.divider },
});
