import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttachmentSheet } from '@/components/chat/AttachmentSheet';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { FlameIcon } from '@/components/chat/FlameIcon';
import { StreakPet } from '@/components/chat/StreakPet';
import { SuggestionBar } from '@/components/chat/SuggestionBar';
import { StreakReminderBanner } from '@/components/social/StreakReminderBanner';
import { FriendOptionsModal } from '@/components/social/FriendOptionsModal';
import { SettingsAccessButton } from '@/components/settings/SettingsAccessButton';
import { Brand, MaxContentWidth, Radius, Spacing, getStreakVisuals } from '@/theme/theme';
import { MOTIVATIONAL_SUGGESTIONS, type ChatMessage } from '@/data/mockData';
import { friendMoodImage, isMessagingStreakAtRisk, useSocial } from '@/storage/socialStore';

type Props = {
  friendId: string;
  prefill?: string;
  onBack: () => void;
  onOpenStreakGuide: () => void;
};

const RAINBOW_DIGIT_COLORS = ['#FF6B6B', '#FFB347', '#FFE066', '#6DDC6D', '#4FC3F7', '#7E57C2'];

export function FriendChatScreenContent({ friendId, prefill, onBack, onOpenStreakGuide }: Props) {
  const {
    friendById,
    chatFor,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    refreshChat,
    refreshFriendsView,
    markChatRead,
    togglePin,
    muteFriend,
    unmuteFriend,
    removeFriend,
    blockFriend,
    unblockFriend,
  } = useSocial();

  const friend = friendById(friendId);
  const messages = friendId ? chatFor(friendId) : [];
  const pinnedMessages = useMemo(() => messages.filter((m) => m.pinned), [messages]);
  const isBlocked = !!friend?.blocked;
  const streakVisuals = getStreakVisuals(friend?.streak ?? 0);
  const streakAtRisk = friend ? isMessagingStreakAtRisk(friend) : false;

  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [streakUnlockVisible, setStreakUnlockVisible] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [headerRefreshing, setHeaderRefreshing] = useState(false);
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const [showPinnedBar, setShowPinnedBar] = useState(true);
  const mountedStreakRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageOffsetsRef = useRef<Record<string, number>>({});

  const suggestion = MOTIVATIONAL_SUGGESTIONS[suggestionIndex];

  const flashStreakUnlock = () => {
    setStreakUnlockVisible(true);
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => setStreakUnlockVisible(false), 3500);
  };

  const friendStreak = friend?.streak;

  useEffect(() => {
    if (friendStreak == null) return;
    if (mountedStreakRef.current === null) {
      mountedStreakRef.current = friendStreak;
      return;
    }
    if (mountedStreakRef.current === 0 && friendStreak >= 1) {
      flashStreakUnlock();
    }
    mountedStreakRef.current = friendStreak;
  }, [friendStreak]);

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (friendId) markChatRead(friendId);
  }, [friendId, markChatRead]);

  useEffect(() => {
    if (!friendId) return;
    void refreshFriendsView();
    void refreshChat(friendId);
    const timer = setInterval(() => {
      void refreshChat(friendId);
      void refreshFriendsView();
    }, 2500);
    return () => clearInterval(timer);
  }, [friendId, refreshChat, refreshFriendsView]);

  useEffect(() => {
    if (prefill) setDraft(MOTIVATIONAL_SUGGESTIONS[0]);
  }, [prefill]);

  useEffect(() => {
    if (pinnedMessages.length === 0) {
      setPinnedIndex(0);
      return;
    }
    setPinnedIndex((prev) => Math.min(prev, pinnedMessages.length - 1));
  }, [pinnedMessages]);

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const send = async (text: string) => {
    if (!friendId || isBlocked) return;
    try {
      if (editingMessage) {
        await editMessage(friendId, editingMessage.id, text);
        setEditingMessage(null);
      } else {
        await sendMessage(friendId, { text, replyToId: replyTarget?.id });
      }
      setReplyTarget(null);
      scrollToEnd();
    } catch {
      Alert.alert('Send failed', 'Could not send your message. Please try again.');
    }
  };

  const runAttachmentAction = (action: () => Promise<void>) => {
    setAttachVisible(false);
    setTimeout(() => {
      void action();
    }, 80);
  };

  const pickPhotos = async () => {
    if (!friendId) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        try {
          await sendMessage(friendId, { text: '', imageUri: asset.uri });
          scrollToEnd();
        } catch (error) {
          Alert.alert(
            'Upload failed',
            error instanceof Error ? error.message : 'Could not send your photo. Please try again.',
          );
        }
      }
    } catch (error) {
      Alert.alert('Unable to open photos', String(error ?? 'Please try again.'));
    }
  };

  const pickFiles = async () => {
    if (!friendId) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: '*/*',
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        try {
          await sendMessage(friendId, { text: '', fileName: asset.name, fileUri: asset.uri });
          scrollToEnd();
        } catch (error) {
          Alert.alert(
            'Upload failed',
            error instanceof Error ? error.message : 'Could not send your file. Please try again.',
          );
        }
      }
    } catch (error) {
      Alert.alert('Unable to open files', String(error ?? 'Please try again.'));
    }
  };

  const refreshSuggestion = () => {
    setSuggestionIndex((i) => (i + 1) % MOTIVATIONAL_SUGGESTIONS.length);
  };

  const refreshHeaderData = async () => {
    if (!friendId || headerRefreshing) return;
    setHeaderRefreshing(true);
    try {
      await Promise.all([refreshFriendsView(), refreshChat(friendId)]);
    } finally {
      setHeaderRefreshing(false);
    }
  };

  const onMessageActions = (message: ChatMessage) => {
    setActionMessage(message);
  };

  const activePinned = pinnedMessages[pinnedIndex] ?? null;
  const activePinnedLabel = activePinned?.text || activePinned?.fileName || 'Attachment';
  const renderHeaderStreak = (streak: number) => {
    if (streak < 500) return <Text style={[styles.headerStreak, { color: streakVisuals.color }]}>{streak}</Text>;
    return (
      <View style={styles.rainbowDigitsRow}>
        {String(streak).split('').map((digit, idx) => (
          <Text key={`${digit}-${idx}`} style={[styles.headerStreak, { color: RAINBOW_DIGIT_COLORS[idx % RAINBOW_DIGIT_COLORS.length] }]}>
            {digit}
          </Text>
        ))}
      </View>
    );
  };

  const handleAction = (key: 'reply' | 'pin' | 'copy' | 'edit' | 'delete') => {
    if (!actionMessage) return;
    const message = actionMessage;
    const copyValue = message.text || message.fileName || '';
    const canMutate = message.sender === 'me' && !message.deletedAt;
    setActionMessage(null);

    if (key === 'reply') {
      setReplyTarget(message);
      setEditingMessage(null);
      return;
    }
    if (key === 'pin') {
      if (!friendId) return;
      void pinMessage(friendId, message.id, !message.pinned);
      setShowPinnedBar(true);
      return;
    }
    if (key === 'copy') {
      if (!copyValue) return;
      void Clipboard.setStringAsync(copyValue);
      return;
    }
    if (key === 'edit' && canMutate) {
      setDraft(message.text || '');
      setEditingMessage(message);
      setReplyTarget(null);
      return;
    }
    if (key === 'edit' && !canMutate) {
      Alert.alert('Can’t edit', 'You can only edit messages you sent.');
      return;
    }
    if (key === 'delete' && canMutate && friendId) {
      void deleteMessage(friendId, message.id);
      return;
    }
    if (key === 'delete' && !canMutate) {
      Alert.alert('Can’t delete', 'You can only delete messages you sent.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{friend?.name ?? 'Friend'}</Text>
          {friend && friend.streak >= 1 && (
            <Pressable
              onPress={onOpenStreakGuide}
              hitSlop={6}
              style={({ pressed }) => [styles.streakBadge, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${friend.streak} day streak. Tap for streak guide.`}>
              <FlameIcon streak={friend.streak} size={20} />
              {renderHeaderStreak(friend.streak)}
            </Pressable>
          )}
          {friend && <Image source={friendMoodImage(friend)} resizeMode="contain" style={styles.headerMoodImage} />}
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [styles.menuBtn, headerRefreshing && styles.pressed, pressed && styles.pressed]}
            onPress={() => void refreshHeaderData()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Refresh chat header">
            <Ionicons name="refresh" size={19} color={Brand.text} />
          </Pressable>
          <SettingsAccessButton />
          <Pressable
            style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
            onPress={() => setOptionsVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Friend options">
            <Ionicons name="ellipsis-vertical" size={20} color={Brand.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.chatArea}>
          {streakAtRisk && friend && !isBlocked ? (
            <View style={styles.reminderWrap}>
              <StreakReminderBanner streak={friend.streak} friendName={friend.name} />
            </View>
          ) : null}
          {showPinnedBar && activePinned ? (
            <View style={styles.pinnedBannerWrap}>
              <Pressable
                style={({ pressed }) => [styles.pinnedBanner, pressed && styles.pressed]}
                onPress={() => {
                  const y = messageOffsetsRef.current[activePinned.id];
                  if (y != null) {
                    scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true });
                  }
                }}>
                <View style={styles.pinnedBannerTitleRow}>
                  <Ionicons name="pin" size={13} color={Brand.pink} />
                  <Text style={styles.pinnedBannerTitle}>Pinned message</Text>
                </View>
                <Text style={styles.pinnedBannerText} numberOfLines={1}>
                  {activePinnedLabel}
                </Text>
              </Pressable>
              {pinnedMessages.length > 1 ? (
                <View style={styles.pinnedNav}>
                  <Pressable
                    onPress={() => setPinnedIndex((i) => (i - 1 + pinnedMessages.length) % pinnedMessages.length)}
                    hitSlop={6}>
                    <Ionicons name="chevron-up" size={16} color={Brand.text} />
                  </Pressable>
                  <Text style={styles.pinnedCount}>
                    {pinnedIndex + 1}/{pinnedMessages.length}
                  </Text>
                  <Pressable
                    onPress={() => setPinnedIndex((i) => (i + 1) % pinnedMessages.length)}
                    hitSlop={6}>
                    <Ionicons name="chevron-down" size={16} color={Brand.text} />
                  </Pressable>
                </View>
              ) : null}
              <Pressable onPress={() => setShowPinnedBar(false)} hitSlop={8} style={styles.pinnedClose}>
                <Ionicons name="close" size={14} color={Brand.textMuted} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {messages.map((m) => (
              <View
                key={m.id}
                onLayout={(event) => {
                  messageOffsetsRef.current[m.id] = event.nativeEvent.layout.y;
                }}>
                <ChatBubble message={m} onLongPress={onMessageActions} />
              </View>
            ))}
          </ScrollView>

          {friend && (
            <View style={styles.petWrap} pointerEvents="box-none">
              <StreakPet streak={friend.streak} done={friend.streakDone} onPress={onOpenStreakGuide} />
            </View>
          )}

          {streakUnlockVisible && friend && (
            <View style={styles.unlockBanner} pointerEvents="none">
              <FlameIcon streak={friend.streak} size={48} />
              <Text style={styles.unlockTitle}>Streak unlocked!</Text>
              <Text style={styles.unlockSubtitle}>Keep chatting daily to grow your flame</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {replyTarget ? (
            <View style={styles.contextBar}>
              <Text style={styles.contextTitle}>Replying to {replyTarget.sender === 'me' ? 'yourself' : friend?.name}</Text>
              <Text style={styles.contextBody} numberOfLines={1}>
                {replyTarget.text || replyTarget.fileName || 'Attachment'}
              </Text>
              <Pressable onPress={() => setReplyTarget(null)} hitSlop={8}>
                <Ionicons name="close" size={16} color={Brand.text} />
              </Pressable>
            </View>
          ) : null}
          {editingMessage ? (
            <View style={styles.contextBar}>
              <Text style={styles.contextTitle}>Editing message</Text>
              <Text style={styles.contextBody} numberOfLines={1}>
                {editingMessage.text}
              </Text>
              <Pressable
                onPress={() => {
                  setEditingMessage(null);
                  setDraft('');
                }}
                hitSlop={8}>
                <Ionicons name="close" size={16} color={Brand.text} />
              </Pressable>
            </View>
          ) : null}
          {isBlocked ? (
            <View style={styles.blockedBanner}>
              <Ionicons name="ban" size={16} color={Brand.danger} />
              <Text style={styles.blockedText}>
                You blocked {friend?.name ?? 'this friend'}. Unblock from the menu to chat again.
              </Text>
            </View>
          ) : (
            <SuggestionBar suggestion={suggestion} onUse={() => setDraft(suggestion)} onRefresh={refreshSuggestion} />
          )}
          <ChatInput
            value={draft}
            onChangeText={setDraft}
            onSend={send}
            onAttach={() => setAttachVisible(true)}
            disabled={isBlocked}
          />
        </View>
      </KeyboardAvoidingView>

      <AttachmentSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onPickPhotos={() => runAttachmentAction(pickPhotos)}
        onPickFiles={() => runAttachmentAction(pickFiles)}
      />

      <Modal visible={!!actionMessage} transparent animationType="fade" onRequestClose={() => setActionMessage(null)}>
        <Pressable style={styles.actionBackdrop} onPress={() => setActionMessage(null)}>
          <Pressable style={styles.actionSheet} onPress={() => {}}>
            <Text style={styles.actionTitle}>Message options</Text>
            <Text style={styles.actionSubtitle}>Choose an action</Text>

            <Pressable style={styles.actionButton} onPress={() => handleAction('reply')}>
              <Ionicons name="arrow-undo" size={16} color="#4B1F3F" />
              <Text style={styles.actionText}>Reply</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={() => handleAction('pin')}>
              <Ionicons name={actionMessage?.pinned ? 'pin-outline' : 'pin'} size={16} color="#4B1F3F" />
              <Text style={styles.actionText}>{actionMessage?.pinned ? 'Unpin' : 'Pin'}</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={() => handleAction('copy')}>
              <Ionicons name="copy-outline" size={16} color="#4B1F3F" />
              <Text style={styles.actionText}>Copy</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                actionMessage?.sender !== 'me' || actionMessage?.deletedAt ? styles.actionButtonDisabled : null,
              ]}
              onPress={() => handleAction('edit')}>
              <Ionicons
                name={actionMessage?.sender === 'me' && !actionMessage?.deletedAt ? 'create-outline' : 'lock-closed-outline'}
                size={16}
                    color="#4B1F3F"
              />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                actionMessage?.sender !== 'me' || actionMessage?.deletedAt ? styles.actionButtonDisabled : null,
              ]}
              onPress={() => handleAction('delete')}>
              <Ionicons
                name={actionMessage?.sender === 'me' && !actionMessage?.deletedAt ? 'trash-outline' : 'lock-closed-outline'}
                size={16}
                color={Brand.danger}
              />
              <Text style={[styles.actionText, styles.destructiveText]}>Delete</Text>
            </Pressable>

            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => setActionMessage(null)}>
              <Text style={styles.actionText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <FriendOptionsModal
        visible={optionsVisible}
        friend={friend ?? null}
        onClose={() => setOptionsVisible(false)}
        onTogglePin={(f) => togglePin(f.id)}
        onMute={(f, duration) => muteFriend(f.id, duration)}
        onUnmute={(f) => unmuteFriend(f.id)}
        onRemove={(f) => {
          removeFriend(f.id);
          onBack();
        }}
        onBlock={(f) => blockFriend(f.id)}
        onUnblock={(f) => unblockFriend(f.id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.background },
  flex: { flex: 1 },
  chatArea: { flex: 1, position: 'relative' },
  petWrap: { position: 'absolute', right: Spacing.three, bottom: Spacing.three, alignItems: 'center' },
  reminderWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Brand.divider,
  },
  backBtn: {
    backgroundColor: Brand.pink,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName: { color: Brand.text, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  headerStreak: { fontSize: 14, fontWeight: '700' },
  rainbowDigitsRow: { flexDirection: 'row', alignItems: 'center' },
  headerMoodImage: { width: 22, height: 22 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  menuBtn: { padding: 4 },
  pressed: { opacity: 0.7 },
  messages: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  pinnedBannerWrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinnedBanner: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pinnedBannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedBannerTitle: { color: Brand.pink, fontSize: 12, fontWeight: '800' },
  pinnedBannerText: { color: Brand.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  pinnedNav: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.divider,
    backgroundColor: Brand.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 2,
    minWidth: 52,
  },
  pinnedCount: { color: Brand.textSecondary, fontSize: 10, fontWeight: '700' },
  pinnedClose: { padding: 4 },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  blockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(229,57,53,0.12)',
  },
  blockedText: { flex: 1, color: Brand.danger, fontSize: 13, fontWeight: '600' },
  contextBar: {
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextTitle: { color: Brand.text, fontSize: 12, fontWeight: '700' },
  contextBody: { flex: 1, color: Brand.textSecondary, fontSize: 12 },
  actionBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  actionSheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F6C4DF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F39CC9',
    padding: Spacing.three,
    gap: 8,
  },
  actionTitle: { color: '#4B1F3F', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  actionSubtitle: { color: '#6A3A59', fontSize: 13, textAlign: 'center', marginBottom: 2 },
  actionButton: {
    minHeight: 42,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionText: { color: '#4B1F3F', fontSize: 15, fontWeight: '700' },
  destructiveText: { color: '#B4233D' },
  cancelButton: { justifyContent: 'center', marginTop: 2, backgroundColor: '#FFD6EA' },
  unlockBanner: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(31,31,31,0.92)',
    borderWidth: 1,
    borderColor: Brand.pink,
  },
  unlockTitle: { color: Brand.text, fontSize: 18, fontWeight: '800' },
  unlockSubtitle: { color: Brand.textMuted, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});