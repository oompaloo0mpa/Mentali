import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Brand, Radius, Spacing } from '@/theme/theme';
import type { Quest } from '@/data/mockData';

type Props = {
  quests: Quest[];
};

export function QuestCard({ quests }: Props) {
  if (quests.length === 0) return null;

  const completed = quests.filter((q) => q.progress >= q.goal).length;

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.header}>
        <Ionicons name="ribbon" size={18} color={Brand.happy} />
        <Text style={styles.title}>Friend Quests</Text>
        <Text style={styles.count}>
          {completed}/{quests.length}
        </Text>
      </View>

      {quests.map((quest) => {
        const done = quest.progress >= quest.goal;
        const ratio = Math.min(1, quest.progress / quest.goal);
        return (
          <View key={quest.id} style={styles.quest}>
            <View style={[styles.questIcon, done && styles.questIconDone]}>
              <Ionicons
                name={done ? 'checkmark' : (quest.icon as keyof typeof Ionicons.glyphMap)}
                size={16}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.questBody}>
              <Text style={[styles.questTitle, done && styles.questTitleDone]}>{quest.title}</Text>
              <Text style={styles.questDesc}>{quest.description}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
              </View>
            </View>
            <View style={styles.reward}>
              <AppIcon name="diamond" size={12} />
              <Text style={styles.rewardText}>{quest.rewardGems}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  title: { flex: 1, color: Brand.text, fontSize: 15, fontWeight: '800' },
  count: { color: Brand.textSecondary, fontSize: 13, fontWeight: '700' },
  quest: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  questIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.magenta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questIconDone: { backgroundColor: Brand.success },
  questBody: { flex: 1, gap: 3 },
  questTitle: { color: Brand.text, fontSize: 14, fontWeight: '700' },
  questTitleDone: { color: Brand.textSecondary, textDecorationLine: 'line-through' },
  questDesc: { color: Brand.textSecondary, fontSize: 12 },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.surfaceElevated,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: { height: '100%', borderRadius: 3, backgroundColor: Brand.pink },
  reward: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rewardText: { color: Brand.gem, fontSize: 13, fontWeight: '800' },
});
