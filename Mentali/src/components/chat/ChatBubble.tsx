import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import type { ChatMessage } from '@/constants/mockData';

type Props = {
  message: ChatMessage;
};

/** Chat bubble: incoming (pink, left) or outgoing (magenta, right). Supports image + file attachments. */
export function ChatBubble({ message }: Props) {
  const isMe = message.sender === 'me';
  const hasImage = !!message.imageUri;
  const hasFile = !!message.fileName;

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          hasImage && styles.bubbleImage,
        ]}>
        {hasImage && (
          <Image source={{ uri: message.imageUri }} style={styles.image} contentFit="cover" transition={150} />
        )}
        {hasFile && (
          <View style={styles.fileRow}>
            <Ionicons name="document-text" size={22} color="#FFFFFF" />
            <Text style={styles.fileName} numberOfLines={1}>
              {message.fileName}
            </Text>
          </View>
        )}
        {!!message.text && (
          <Text style={[styles.text, hasImage && styles.textWithImage]}>{message.text}</Text>
        )}
      </View>
    </View>
  );
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
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220 },
  fileName: { flex: 1, color: Brand.textOnBubble, fontSize: 14, fontWeight: '600' },
  text: { color: Brand.textOnBubble, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  textWithImage: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2 },
});
