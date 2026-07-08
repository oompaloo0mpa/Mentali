import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/nav/BottomNav';

type LeaderboardPageProps = {
  onNavigate?: (navItem: string) => void;
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  streak: number;
  points: number;
  highlighted?: boolean;
};

type RankStage = 'locked' | 'bronze' | 'silver' | 'gold';

const bronzeTrophy = require('../../assets/images/BronzeTrophy.png') as ImageSourcePropType;
const silverTrophy = require('../components/SilverTrophy.png') as ImageSourcePropType;
const goldTrophy = require('../components/GoldTrophy.png') as ImageSourcePropType;
const streakIcon = require('../../assets/images/StreakIcon.png') as ImageSourcePropType;
const diamondIcon = require('../../assets/images/DiamondIcon.png') as ImageSourcePropType;
const promotionArrow = require('../components/PromotionArrow.png') as ImageSourcePropType;
const demotionArrow = require('../components/DemotionArrow.png') as ImageSourcePropType;

const firstNames = [
  'Jayden',
  'Matin',
  'Xavier',
  'Alex',
  'Chris',
  'Josh',
  'Joy',
  'Maya',
  'Ethan',
  'Noah',
  'Liam',
  'Ava',
  'Mia',
  'Luca',
  'Aria',
  'Kai',
  'Zoe',
  'Skye',
  'Aiden',
  'Nora',
  'Levi',
  'Iris',
  'Rhea',
  'Milo',
  'Hana',
  'Owen',
  'Ruby',
  'Theo',
  'Ryan',
  'Sia',
  'Sara',
  'Eli',
  'Nate',
  'Nia',
  'Finn',
  'Dina',
  'Kira',
  'Rin',
  'Mason',
  'Ari',
  'Keira',
  'Seth',
  'Bryn',
  'Nash',
  'Ivy',
  'Lila',
  'Nova',
  'Remy',
  'Sean',
  'Holly',
];

const nextStageMap: Record<RankStage, RankStage> = {
  locked: 'bronze',
  bronze: 'silver',
  silver: 'gold',
  gold: 'locked',
};

function buildLeaderboardEntries(): LeaderboardEntry[] {
  let seed = 90210;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const entries = firstNames.map((name, index) => {
    const streak = 10 + Math.floor(random() * 160);
    const points = 120 + Math.floor(random() * 980);

    return {
      rank: index + 1,
      name,
      streak,
      points,
      highlighted: index === 0,
    };
  });

  return entries;
}

function HeaderActionButtons({ onAdvanceRank }: { onAdvanceRank: () => void }) {
  return (
    <View style={styles.headerActions}>
      <Pressable onPress={onAdvanceRank} style={({ pressed }) => [styles.simulateButton, pressed && styles.simulateButtonPressed]}>
        <View style={styles.simulateButtonInner} />
      </Pressable>

      <Pressable style={({ pressed }) => [styles.helpButton, pressed && styles.helpButtonPressed]}>
        <Text style={styles.helpButtonText}>?</Text>
      </Pressable>
    </View>
  );
}

function TrophyPodium({ stage }: { stage: RankStage }) {
  if (stage === 'locked') {
    return (
      <View style={styles.lockedWrap}>
        <Text style={styles.lockedText}>Earn more points to unlock leaderboard</Text>
      </View>
    );
  }

  const leftTrophy = stage === 'silver' ? bronzeTrophy : stage === 'gold' ? silverTrophy : null;
  const centerTrophy = stage === 'bronze' ? bronzeTrophy : stage === 'silver' ? silverTrophy : goldTrophy;
  const rightTrophy = stage === 'bronze' ? silverTrophy : stage === 'silver' ? goldTrophy : null;

  return (
    <View style={styles.podiumRow}>
      <View style={styles.sidePodiumSlot}>
        {leftTrophy ? <Image source={leftTrophy} resizeMode="contain" style={styles.sideTrophy} /> : <View style={styles.sideTrophy} />}
      </View>

      <View style={styles.centerPodiumSlot}>
        <Image source={centerTrophy} resizeMode="contain" style={styles.centerTrophy} />
        <Text style={styles.currentRankText}>Current Rank</Text>
      </View>

      <View style={styles.sidePodiumSlot}>
        {rightTrophy ? <Image source={rightTrophy} resizeMode="contain" style={styles.sideTrophy} /> : <View style={styles.sideTrophy} />}
      </View>
    </View>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View style={[styles.row, entry.highlighted && styles.rowHighlighted]}>
      <Text style={styles.rankText}>{entry.rank}</Text>

      <View style={styles.playerBlock}>
        <Text style={styles.playerName}>{entry.name}</Text>
        <View style={styles.streakRow}>
          <Image source={streakIcon} resizeMode="contain" style={styles.streakIcon} />
          <Text style={styles.streakText}>{entry.streak}</Text>
        </View>
      </View>

      <View style={styles.diamondBlock}>
        <Image source={diamondIcon} resizeMode="contain" style={styles.diamondIcon} />
        <Text style={styles.diamondText}>{entry.points}</Text>
      </View>
    </View>
  );
}

function PromotionZone() {
  return (
    <View style={styles.promotionRow}>
      <Image source={promotionArrow} resizeMode="contain" style={styles.promotionArrow} />
      <Text style={styles.promotionText}>PROMOTION ZONE</Text>
      <Image source={promotionArrow} resizeMode="contain" style={styles.promotionArrow} />
    </View>
  );
}

function DemotionZone() {
  return (
    <View style={styles.demotionRow}>
      <Image source={demotionArrow} resizeMode="contain" style={styles.demotionArrow} />
      <Text style={styles.demotionText}>DEMOTION ZONE</Text>
      <Image source={demotionArrow} resizeMode="contain" style={styles.demotionArrow} />
    </View>
  );
}

export default function LeaderboardPage({ onNavigate }: LeaderboardPageProps) {
  const [rankStage, setRankStage] = useState<RankStage>('locked');
  const leaderboardEntries = useMemo(() => buildLeaderboardEntries(), []);
  const promotionEntries = leaderboardEntries.slice(0, 5);
  const middleEntries = leaderboardEntries.slice(5, 35);
  const demotionEntries = leaderboardEntries.slice(35);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#2D2D2D" />

      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <HeaderActionButtons onAdvanceRank={() => setRankStage((current) => nextStageMap[current])} />
      </View>

      <TrophyPodium stage={rankStage} />
      <View style={styles.divider} />

      <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {promotionEntries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
        <PromotionZone />
        {middleEntries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
        <DemotionZone />
        {demotionEntries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </ScrollView>

      <BottomNav
        activeIcon="trophy-outline"
        onSelect={(icon) => {
          if (icon === 'trophy-outline') {
            return;
          }
          onNavigate?.(icon);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2D2D2D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 26,
    paddingRight: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simulateButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F08BD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateButtonPressed: {
    opacity: 0.85,
  },
  simulateButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D6D7DA',
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#F08BD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonPressed: {
    opacity: 0.85,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  lockedWrap: {
    minHeight: 134,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  lockedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 2,
    paddingBottom: 18,
  },
  sidePodiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  centerPodiumSlot: {
    width: 130,
    alignItems: 'center',
  },
  sideTrophy: {
    width: 68,
    height: 68,
  },
  centerTrophy: {
    width: 116,
    height: 116,
  },
  currentRankText: {
    marginTop: -2,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 3,
    backgroundColor: '#E3E3E3',
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 12,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 12,
  },
  rowHighlighted: {
    backgroundColor: '#747474',
  },
  rankText: {
    width: 28,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  playerBlock: {
    flex: 1,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakIcon: {
    width: 10,
    height: 10,
  },
  streakText: {
    color: '#FFAA14',
    fontSize: 12,
    fontWeight: '800',
  },
  diamondBlock: {
    width: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  diamondIcon: {
    width: 13,
    height: 24,
  },
  diamondText: {
    color: '#D85CFB',
    fontSize: 14,
    fontWeight: '800',
  },
  promotionRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  promotionArrow: {
    width: 19,
    height: 19,
  },
  promotionText: {
    color: '#69FF57',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  demotionRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  demotionArrow: {
    width: 19,
    height: 19,
  },
  demotionText: {
    color: '#FF6A63',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});