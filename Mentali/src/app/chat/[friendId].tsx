import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
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
import {
  INITIAL_MESSAGES,
  MOTIVATIONAL_SUGGESTIONS,
  getFriendById,
  type ChatMessage,
} from '@/constants/mockData';

let messageCounter = 100;

export default function FriendChatScreen() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const friend = getFriendById(friendId);

  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);

  const suggestion = MOTIVATIONAL_SUGGESTIONS[suggestionIndex];

  const scrollToEnd = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const sendMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: `m${messageCounter++}`, text, sender: 'me' }]);
    scrollToEnd();
  };

  // Pick an image from the library and send it as an attachment message.
  const pickPhotos = async () => {
    setAttachVisible(false);
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
      const uri = result.assets[0].uri;
      setMessages((prev) => [...prev, { id: `m${messageCounter++}`, text: '', imageUri: uri, sender: 'me' }]);
      scrollToEnd();
    }
  };

  // Pick a document/file and send it as an attachment message.
  const pickFiles = async () => {
    setAttachVisible(false);
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setMessages((prev) => [
        ...prev,
        { id: `m${messageCounter++}`, text: '', fileName: asset.name, fileUri: asset.uri, sender: 'me' },
      ]);
      scrollToEnd();
    }
  };

  const refreshSuggestion = () => {
    setSuggestionIndex((i) => (i + 1) % MOTIVATIONAL_SUGGESTIONS.length);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          hitSlop={8}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{friend?.name ?? 'Friend'}</Text>
          {friend && (
            <>
              <AppIcon name="fire" size={16} />
              <Text style={styles.headerStreak}>{friend.streak}</Text>
              <Text style={styles.headerMood}>{friend.mood}</Text>
            </>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}
          onPress={() => setOptionsVisible(true)}
          hitSlop={8}>
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

          {/* Streak pet floats in the bottom-right corner of the chat area. */}
          {friend && (
            <View style={styles.petWrap} pointerEvents="box-none">
              <StreakPet
                streak={friend.streak}
                done={friend.streakDone}
                onPress={() => router.push('/streak-guide')}
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <SuggestionBar
            suggestion={suggestion}
            onUse={() => setDraft(suggestion)}
            onRefresh={refreshSuggestion}
          />
          <ChatInput value={draft} onChangeText={setDraft} onSend={sendMessage} onAttach={() => setAttachVisible(true)} />
        </View>
      </KeyboardAvoidingView>

      <AttachmentSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onPickPhotos={pickPhotos}
        onPickFiles={pickFiles}
      />

      <FriendOptionsModal
        visible={optionsVisible}
        friend={friend ?? null}
        onClose={() => setOptionsVisible(false)}
        onSelect={(_option) => {
          // After removing/blocking/archiving, return to the friends list.
          router.back();
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexGrow: 1,
  },
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    gap: Spacing.two,
  },
});
