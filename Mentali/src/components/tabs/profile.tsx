import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { moodById } from '@/data/moods';
import { useUserProfile } from '@/storage/userProfileStore';
import { Brand, Spacing } from '@/theme/theme';

export default function ProfileScreen() {
  const { profile } = useUserProfile();
  const mood = moodById(profile.currentMoodId) ?? moodById('okay');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.name}>{profile.displayName}</Text>
        <View style={styles.moodRow}>
          <Text style={styles.label}>Mood today</Text>
          {mood ? <Image source={mood.image} resizeMode="contain" style={styles.moodImage} /> : null}
          <Text style={styles.emoji}>{profile.currentMoodEmoji}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.background, padding: Spacing.three },
  card: {
    borderRadius: 14,
    backgroundColor: Brand.surface,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  title: { color: Brand.text, fontSize: 24, fontWeight: '800' },
  name: { color: Brand.textSecondary, fontSize: 16, fontWeight: '600' },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  label: { color: Brand.text, fontSize: 14, fontWeight: '700' },
  moodImage: { width: 24, height: 24 },
  emoji: { color: Brand.text, fontSize: 16, fontWeight: '700' },
});
