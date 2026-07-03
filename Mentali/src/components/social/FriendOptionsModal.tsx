import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Fragment, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/theme/theme';
import { isMuted, type MuteDuration } from '@/storage/socialStore';
import type { Friend } from '@/data/mockData';

type Props = {
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
  onTogglePin: (friend: Friend) => void;
  onMute: (friend: Friend, duration: MuteDuration) => void;
  onUnmute: (friend: Friend) => void;
  onRemove: (friend: Friend) => void;
  onBlock: (friend: Friend) => void;
  onUnblock: (friend: Friend) => void;
};

type MenuIcon =
  | { family: 'ion'; name: keyof typeof Ionicons.glyphMap }
  | { family: 'mc'; name: keyof typeof MaterialCommunityIcons.glyphMap };

type Stage = 'menu' | 'mute' | 'confirm-remove' | 'confirm-block';

const MUTE_OPTIONS: { key: MuteDuration; label: string }[] = [
  { key: '8h', label: 'For 8 hours' },
  { key: '24h', label: 'For 24 hours' },
  { key: '1w', label: 'For 1 week' },
];

export function FriendOptionsModal({
  visible,
  friend,
  onClose,
  onTogglePin,
  onMute,
  onUnmute,
  onRemove,
  onBlock,
  onUnblock,
}: Props) {
  const [stage, setStage] = useState<Stage>('menu');

  useEffect(() => {
    if (visible) setStage('menu');
  }, [visible, friend?.id]);

  if (!friend) return null;

  const muted = isMuted(friend);

  const close = () => {
    setStage('menu');
    onClose();
  };

  const menuItems: { key: string; label: string; icon: MenuIcon; danger?: boolean; onPress: () => void }[] = [
    {
      key: 'pin',
      label: friend.pinned ? 'Unpin friend' : 'Pin to top',
      icon: { family: 'mc', name: friend.pinned ? 'pin-off' : 'pin' },
      onPress: () => {
        onTogglePin(friend);
        close();
      },
    },
    {
      key: 'mute',
      label: muted ? 'Unmute' : 'Mute',
      icon: { family: 'ion', name: muted ? 'notifications' : 'notifications-off' },
      onPress: () => {
        if (muted) {
          onUnmute(friend);
          close();
        } else {
          setStage('mute');
        }
      },
    },
    friend.blocked
      ? {
          key: 'unblock',
          label: 'Unblock',
          icon: { family: 'mc', name: 'account-check' },
          onPress: () => {
            onUnblock(friend);
            close();
          },
        }
      : {
          key: 'block',
          label: 'Block',
          icon: { family: 'ion', name: 'ban' },
          danger: true,
          onPress: () => setStage('confirm-block'),
        },
    {
      key: 'remove',
      label: 'Remove as friend',
      icon: { family: 'ion', name: 'person-remove' },
      danger: true,
      onPress: () => setStage('confirm-remove'),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={() => {}}>
          {stage === 'menu' && (
            <>
              <Text style={styles.heading}>{friend.name}</Text>
              {menuItems.map((item, index) => (
                <Fragment key={item.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                    onPress={item.onPress}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}>
                    {item.icon.family === 'mc' ? (
                      <MaterialCommunityIcons
                        name={item.icon.name}
                        size={18}
                        color={item.danger ? Brand.danger : Brand.text}
                      />
                    ) : (
                      <Ionicons
                        name={item.icon.name}
                        size={18}
                        color={item.danger ? Brand.danger : Brand.text}
                      />
                    )}
                    <Text style={[styles.label, item.danger && styles.danger]}>{item.label}</Text>
                  </Pressable>
                </Fragment>
              ))}
            </>
          )}

          {stage === 'mute' && (
            <>
              <Text style={styles.heading}>Mute {friend.name}</Text>
              <Text style={styles.subheading}>You won’t get notifications for this friend.</Text>
              {MUTE_OPTIONS.map((opt, index) => (
                <Fragment key={opt.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                    onPress={() => {
                      onMute(friend, opt.key);
                      close();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Mute ${opt.label}`}>
                    <Ionicons name="time-outline" size={18} color={Brand.text} />
                    <Text style={styles.label}>{opt.label}</Text>
                  </Pressable>
                </Fragment>
              ))}
              <View style={styles.divider} />
              <Pressable style={styles.cancel} onPress={() => setStage('menu')} accessibilityRole="button">
                <Text style={styles.cancelText}>Back</Text>
              </Pressable>
            </>
          )}

          {(stage === 'confirm-remove' || stage === 'confirm-block') && (
            <View style={styles.confirm}>
              <Text style={styles.heading}>
                {stage === 'confirm-remove' ? 'Remove friend?' : 'Block friend?'}
              </Text>
              <Text style={styles.subheading}>
                {stage === 'confirm-remove'
                  ? `${friend.name} will be removed from your friends and your chat history will be cleared.`
                  : `Your chat with ${friend.name} will be disabled. They stay in your friends list and you can unblock anytime.`}
              </Text>
              <View style={styles.confirmActions}>
                <Pressable
                  style={({ pressed }) => [styles.confirmBtn, styles.confirmCancel, pressed && styles.pressed]}
                  onPress={() => setStage('menu')}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel">
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.confirmBtn, styles.confirmDanger, pressed && styles.pressed]}
                  onPress={() => {
                    if (stage === 'confirm-remove') onRemove(friend);
                    else onBlock(friend);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={stage === 'confirm-remove' ? 'Confirm remove' : 'Confirm block'}>
                  <Text style={styles.confirmDangerText}>
                    {stage === 'confirm-remove' ? 'Remove' : 'Block'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
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
    paddingVertical: Spacing.one,
  },
  heading: {
    color: Brand.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: Spacing.one,
  },
  subheading: {
    color: Brand.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
    lineHeight: 18,
  },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: Spacing.three },
  pressed: { backgroundColor: 'rgba(255,255,255,0.06)' },
  label: { color: Brand.text, fontSize: 16, fontWeight: '600' },
  danger: { color: Brand.danger },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Brand.divider },
  cancel: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { color: Brand.textSecondary, fontSize: 15, fontWeight: '700' },
  confirm: { padding: Spacing.three, gap: Spacing.two },
  confirmActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  confirmBtn: { flex: 1, height: 44, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  confirmCancel: { backgroundColor: Brand.surfaceElevated },
  confirmCancelText: { color: Brand.text, fontSize: 15, fontWeight: '700' },
  confirmDanger: { backgroundColor: Brand.danger },
  confirmDangerText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
