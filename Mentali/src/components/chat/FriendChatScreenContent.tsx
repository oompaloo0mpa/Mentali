import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { StreakPet } from '@/components/chat/StreakPet';
import { SuggestionBar } from '@/components/chat/SuggestionBar';
import { FriendOptionsModal } from '@/components/social/FriendOptionsModal';
import { Brand, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { MOTIVATIONAL_SUGGESTIONS } from '@/constants/mockData';
import { friendMood, useSocial } from '@/store/socialStore';

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
    markChatRead,
    togglePin,
    muteFriend,
    unmuteFriend,
    removeFriend,
  } = useSocial();

  const friend = friendById(friendId);
  const messages = friendId ? chatFor(friendId) : [];

  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);

  const suggestion = MOTIVATIONAL_SUGGESTIONS[suggestionIndex];

  useEffect(() => {
    if (friendId) markChatRead(friendId);
  }, [friendId, markChatRead]);

  useEffect(() => {
    if (prefill) setDraft(MOTIVATIONAL_SUGGESTIONS[0]);
  }, [prefill]);

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const send = (text: string) => {
    if (!friendId) return;
    sendMessage(friendId, { text });
    scrollToEnd();
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
        sendMessage(friendId, { text: '', imageUri: result.assets[0].uri });
        scrollToEnd();
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
        sendMessage(friendId, { text: '', fileName: asset.name, fileUri: asset.uri });
        scrollToEnd();
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
          {friend && (
            <>
              <AppIcon name="fire" size={16} />
              <Text style={styles.headerStreak}>{friend.streak}</Text>
              <Text style={styles.headerMood}>{friendMood(friend)}</Text>
            </>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
          onPress={() => setOptionsVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Friend options">
          <Ionicons name="ellipsis-vertical" size={20} color={Brand.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.chatArea}>
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
        </View>

        <View style={styles.footer}>
          <SuggestionBar suggestion={suggestion} onUse={() => setDraft(suggestion)} onRefresh={refreshSuggestion} />
          <ChatInput value={draft} onChangeText={setDraft} onSend={send} onAttach={() => setAttachVisible(true)} />
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
        onBlock={(f) => {
          removeFriend(f.id);
          onBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.background },
  flex: { flex: 1 },
  chatArea: { flex: 1, position: 'relative' },
  petWrap: { position: 'absolute', right: Spacing.three, bottom: Spacing.three },
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
  headerName: { color: Brand.text, fontSize: 17, fontWeight: '700' },
  headerStreak: { color: Brand.fire, fontSize: 14, fontWeight: '700' },
  headerMood: { fontSize: 14 },
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
});