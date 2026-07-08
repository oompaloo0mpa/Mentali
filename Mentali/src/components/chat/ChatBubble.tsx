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

type Props = { message: ChatMessage } | CheckInBubbleProps;

export function ChatBubble(props: Props) {
  const isSocialMessage = 'message' in props;
  const isMe = isSocialMessage ? props.message.sender === 'me' : props.role === 'user';
  const imageUri = isSocialMessage ? resolveMediaUrl(props.message.imageUri) : undefined;
  const fileUri = isSocialMessage ? resolveMediaUrl(props.message.fileUri) : undefined;
  const hasImage = isSocialMessage ? !!imageUri : false;
  const hasFile = isSocialMessage ? !!props.message.fileName : false;
  const text = isSocialMessage ? props.message.text : props.text;
  const helper = isSocialMessage ? undefined : props.helper;

  const openFile = () => {
    if (!fileUri) return;
    void Linking.openURL(fileUri).catch(() => {});
  };

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          hasImage && styles.bubbleImage,
        ]}>
        {hasImage && imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : null}
        {hasFile && (
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
        {!!text && (
          <Text style={[styles.text, hasImage && styles.textWithImage]}>{text}</Text>
        )}
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
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
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 240 },
  filePressed: { opacity: 0.75 },
  fileName: { flex: 1, color: Brand.textOnBubble, fontSize: 14, fontWeight: '600' },
  text: { color: Brand.textOnBubble, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  textWithImage: { paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2 },
  helper: { color: Brand.textOnBubble, fontSize: 12, lineHeight: 17, opacity: 0.82, marginTop: 4 },
});
