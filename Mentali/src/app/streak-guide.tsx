import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon } from '@/components/chat/FlameIcon';
import { Brand, Radius, Spacing } from '@/constants/theme';

const TIERS = [
  { streak: 150, label: '100 - 249' },
  { streak: 300, label: '250-499' },
  { streak: 600, label: '500+' },
];

export default function StreakGuideScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.card}>
        <Text style={styles.title}>STREAK PET!</Text>
        <Text style={styles.subtitle}>
          Maintain at least a 10-day streak with your friend to grow a pet together!
        </Text>

        <View style={styles.hero}>
          <FlameIcon streak={50} size={120} />
        </View>

        <Ionicons name="arrow-down-outline" size={28} color={Brand.textSecondary} style={styles.arrowDown} />

        <View style={styles.tiers}>
          {TIERS.map((tier, i) => (
            <View key={tier.label} style={styles.tierRow}>
              <View style={styles.tier}>
                <FlameIcon streak={tier.streak} size={44} />
                <Text style={styles.tierLabel}>{tier.label}</Text>
              </View>
              {i < TIERS.length - 1 && (
                <Ionicons name="arrow-forward" size={18} color={Brand.textSecondary} style={styles.tierArrow} />
              )}
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          onPress={() => router.back()}>
          <Text style={styles.closeText}>CLOSE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: Spacing.four },
  card: {
    backgroundColor: '#2B2B2B',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
  },
  title: { color: Brand.text, fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: Brand.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: Spacing.two },
  hero: { paddingVertical: Spacing.two },
  arrowDown: { transform: [{ rotate: '35deg' }] },
  tiers: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  tierRow: { flexDirection: 'row', alignItems: 'center' },
  tier: { alignItems: 'center', gap: 6, width: 78 },
  tierLabel: { color: Brand.text, fontSize: 12, fontWeight: '700' },
  tierArrow: { marginTop: 14 },
  closeBtn: {
    marginTop: Spacing.two,
    backgroundColor: Brand.pink,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  closeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  pressed: { opacity: 0.8 },
});
