import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { Brand, Radius, Spacing, getStreakVisuals } from '@/theme/theme';
import { friendMoodImage, highestMilestone, isMuted } from '@/storage/socialStore';
import type { Friend } from '@/data/mockData';

type Props = {
  friend: Friend | null;
  lastMotivation?: string | null;
  onClose: () => void;
  onMessage: (friend: Friend) => void;
};

function relativeTime(epoch?: number | null): string {
  if (!epoch) return 'No messages yet';
  const diff = Date.now() - epoch;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function FriendProfileSheet({ friend, lastMotivation, onClose, onMessage }: Props) {
  const milestone = friend ? highestMilestone(friend.streak) : 0;
  const streakVisuals = getStreakVisuals(friend?.streak ?? 0);

  return (
    <Modal visible={friend !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          {friend && (
            <>
              <View style={styles.headerRow}>
                <Avatar size={56} />
                <View style={styles.headerText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{friend.name}</Text>
                    <Image source={friendMoodImage(friend)} resizeMode="contain" style={styles.nameMoodImage} />
                    {friend.pinned && <Ionicons name="pin" size={14} color={Brand.pink} />}
                    {isMuted(friend) && <Ionicons name="notifications-off" size={14} color={Brand.textMuted} />}
                  </View>
                  <Text style={styles.lastSeen}>{friend.lastSeen}</Text>
                </View>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  {streakVisuals.pillGradientColors ? (
                    <LinearGradient
                      colors={[...streakVisuals.pillGradientColors]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.streakGradient}>
                      <AppIcon name="fire" size={20} />
                      <Text style={styles.statValue}>{friend.streak}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <AppIcon name="fire" size={20} />
                      <Text style={[styles.statValue, { color: streakVisuals.color }]}>{friend.streak}</Text>
                    </>
                  )}
                  <Text style={styles.statLabel}>Day streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="trophy" size={18} color={Brand.happy} />
                  <Text style={styles.statValue}>{milestone || '—'}</Text>
                  <Text style={styles.statLabel}>Top milestone</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Image source={friendMoodImage(friend)} resizeMode="contain" style={styles.statMoodImage} />
                  <Text style={styles.statLabel}>Mood today</Text>
                </View>
              </View>

              <View style={styles.lastMessage}>
                <Text style={styles.sectionLabel}>Last motivational text</Text>
                <Text style={styles.messageText} numberOfLines={2}>
                  {lastMotivation ? `“${lastMotivation}”` : 'You haven’t sent one yet today.'}
                </Text>
                <Text style={styles.messageTime}>{relativeTime(friend.lastMessagedAt)}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
                onPress={() => onMessage(friend)}
                accessibilityRole="button"
                accessibilityLabel={`Message ${friend.name}`}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
                <Text style={styles.ctaText}>Send a message</Text>
              </Pressable>
            </>
          )}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Brand.divider },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headerText: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: Brand.text, fontSize: 20, fontWeight: '800' },
  nameMoodImage: { width: 20, height: 20 },
  lastSeen: { color: Brand.textSecondary, fontSize: 13 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceElevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  streakGradient: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, height: '70%', backgroundColor: Brand.divider },
  statValue: { color: Brand.text, fontSize: 18, fontWeight: '800' },
  statMood: { fontSize: 20 },
  statMoodImage: { width: 24, height: 24 },
  statLabel: { color: Brand.textSecondary, fontSize: 11, fontWeight: '600' },
  lastMessage: { gap: 4 },
  sectionLabel: { color: Brand.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  messageText: { color: Brand.text, fontSize: 15, lineHeight: 21, fontStyle: 'italic' },
  messageTime: { color: Brand.textMuted, fontSize: 12 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Brand.magenta,
  },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
