import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
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
import { MOTIVATIONAL_SUGGESTIONS } from '@/data/mockData';
import { friendMoodImage, isMessagingStreakAtRisk, useSocial } from '@/storage/socialStore';

type Props = {
  friendId: string;
  prefill?: string;
  onBack: () => void;
  onOpenStreakGuide: () => void;
};

export function FriendChatScreenContent({ friendId, prefill, onBack, onOpenStreakGuide }: Props) {
  const {
    friendById,
    chatFor,
    sendMessage,
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
  const isBlocked = !!friend?.blocked;
  const streakVisuals = getStreakVisuals(friend?.streak ?? 0);
  const streakAtRisk = friend ? isMessagingStreakAtRisk(friend) : false;

  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [streakUnlockVisible, setStreakUnlockVisible] = useState(false);
  const mountedStreakRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestion = MOTIVATIONAL_SUGGESTIONS[suggestionIndex];

  const flashStreakUnlock = () => {
    setStreakUnlockVisible(true);
    if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = setTimeout(() => setStreakUnlockVisible(false), 3500);
  };

  useEffect(() => {
    if (!friend) return;
    if (mountedStreakRef.current === null) {
      mountedStreakRef.current = friend.streak;
      return;
    }
    if (mountedStreakRef.current === 0 && friend.streak >= 1) {
      flashStreakUnlock();
    }
    mountedStreakRef.current = friend.streak;
  }, [friend?.streak]);

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
    }, 2500);
    return () => clearInterval(timer);
  }, [friendId, refreshChat, refreshFriendsView]);

  useEffect(() => {
    if (prefill) setDraft(MOTIVATIONAL_SUGGESTIONS[0]);
  }, [prefill]);

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const send = async (text: string) => {
    if (!friendId || isBlocked) return;
    try {
      await sendMessage(friendId, { text });
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
        } catch {
          Alert.alert('Upload failed', 'Could not send your photo. Please try again.');
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
        } catch {
          Alert.alert('Upload failed', 'Could not send your file. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Unable to open files', String(error ?? 'Please try again.'));
    }
  };

  const refreshSuggestion = () => {
    setSuggestionIndex((i) => (i + 1) % MOTIVATIONAL_SUGGESTIONS.length);
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
              <AppIcon name="fire" size={20} />
              <Text style={[styles.headerStreak, { color: streakVisuals.color }]}>{friend.streak}</Text>
            </Pressable>
          )}
          {friend && <Image source={friendMoodImage(friend)} resizeMode="contain" style={styles.headerMoodImage} />}
        </View>

        <View style={styles.headerActions}>
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

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
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
  petWrap: { position: 'absolute', right: Spacing.three, bottom: Spacing.three },
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