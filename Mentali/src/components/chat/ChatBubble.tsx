import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveMediaUrl } from '@/services/api';
import { Brand, Radius } from '@/theme/theme';
import type { ChatMessage } from '@/data/mockData';

type CheckInBubbleProps = {
  role: 'bot' | 'user';
  text: string;
  helper?: string;
};

type SocialProps = {
  message: ChatMessage;
  onLongPress?: (message: ChatMessage) => void;
};
type Props = SocialProps | CheckInBubbleProps;

export function ChatBubble(props: Props) {
  const isSocialMessage = 'message' in props;
  const isMe = isSocialMessage ? props.message.sender === 'me' : props.role === 'user';
  const rawImageUri = isSocialMessage ? props.message.imageUri : undefined;
  const imageUri = resolveMediaUrl(rawImageUri);
  const fileUri = isSocialMessage ? resolveMediaUrl(props.message.fileUri) : undefined;
  const hasImage = !!rawImageUri;
  const hasFile = isSocialMessage ? !!props.message.fileName : false;
  const text = isSocialMessage && !props.message.deletedAt ? props.message.text : props.text;
  const helper = isSocialMessage ? undefined : props.helper;
  const isDeleted = isSocialMessage ? !!props.message.deletedAt : false;
  const replyLabel = isSocialMessage
    ? props.message.replyToSender === 'me'
      ? 'Replying to you'
      : props.message.replyToSender === 'them'
        ? 'Replying to friend'
        : null
    : null;

  const openFile = () => {
    if (!fileUri) return;
    void Linking.openURL(fileUri).catch(() => {});
  };

  const bubble = (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <Pressable
        onLongPress={isSocialMessage ? () => props.onLongPress?.(props.message) : undefined}
        delayLongPress={280}
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          hasImage && !isDeleted && styles.bubbleImage,
        ]}>
        {isSocialMessage && props.message.pinned ? (
          <View style={styles.metaRow}>
            <Ionicons name="pin" size={12} color={Brand.textOnBubble} />
            <Text style={styles.metaText}>Pinned</Text>
          </View>
        ) : null}
        {replyLabel && !!props.message.replyToText ? (
          <View style={styles.replyBox}>
            <Text style={styles.replyLabel}>{replyLabel}</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {props.message.replyToText}
            </Text>
          </View>
        ) : null}
        {isDeleted ? (
          <Text style={styles.deletedText}>Message deleted</Text>
        ) : null}
        {!isDeleted && hasImage && imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : null}
        {!isDeleted && hasFile && (
          <Pressable
            onPress={openFile}
            disabled={!fileUri}
            style={({ pressed }) => [styles.fileRow, pressed && fileUri && styles.filePressed]}
            accessibilityRole="button"
            accessibilityLabel={`Open file ${isSocialMessage ? props.message.fileName : ''}`}>
            <Ionicons name="document-text-outline" size={22} color={Brand.textOnBubble} />
            <Text style={styles.fileName} numberOfLines={2}>
              {isSocialMessage ? props.message.fileName : ''}
            </Text>
            {fileUri ? <Ionicons name="open-outline" size={16} color={Brand.textOnBubble} /> : null}
          </Pressable>
        )}
        {!isDeleted && !!text && (
          <Text style={[styles.text, hasImage && styles.textWithImage]}>{text}</Text>
        )}
        {isSocialMessage && props.message.editedAt && !isDeleted ? <Text style={styles.metaText}>Edited</Text> : null}
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </Pressable>
    </View>
  );

  return bubble;
}

const styles = StyleSheet.create({
  row: { width: '100%', marginVertical: 5 },
  rowMe: { alignItems: 'flex-end' },
  rowThem: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
  },
  bubbleImage: { padding: 4, overflow: 'hidden' },
  bubbleThem: {
    backgroundColor: Brand.pinkBubble,
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: Brand.magentaDeep,
    borderTopRightRadius: 4,
  },
  image: { width: 200, height: 200, borderRadius: Radius.sm },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 240 },
  filePressed: { opacity: 0.75 },
  fileName: { flex: 1, color: Brand.textOnBubble, fontSize: 14, fontWeight: '600' },
  text: { color: Brand.textOnBubble, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  textWithImage: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2 },
  deletedText: { color: Brand.textOnBubble, fontSize: 14, fontStyle: 'italic', opacity: 0.9 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaText: { color: Brand.textOnBubble, fontSize: 11, opacity: 0.85, marginTop: 4 },
  replyBox: { borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.5)', paddingLeft: 8, marginBottom: 6 },
  replyLabel: { color: Brand.textOnBubble, fontSize: 11, opacity: 0.9 },
  replyText: { color: Brand.textOnBubble, fontSize: 12, opacity: 0.9 },
  helper: { color: Brand.textOnBubble, fontSize: 12, lineHeight: 17, opacity: 0.82, marginTop: 4 },
});
