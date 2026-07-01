import React from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

type LeaderboardUser = {
  id: string;
  name: string;
  streak: number;
  points: number;
};

type TrophySlot = {
  key: string;
  rank?: 'bronze' | 'silver' | 'gold';
  size: 'small' | 'large';
  label?: string;
  opacity?: number;
};

type RankKey = 'bronze' | 'silver' | 'gold';

const rankOrder: RankKey[] = ['bronze', 'silver', 'gold'];

const trophySources = {
  bronze: require('../components/BronzeTrophy.png'),
  silver: require('../components/SilverTrophy.png'),
  gold: require('../components/GoldTrophy.png'),
} as const;

const streakSource: ImageSourcePropType = require('../components/Streak logo.png');
const promotionArrowSource: ImageSourcePropType = require('../components/PromotionArrow.png');
const homeButtonSource: ImageSourcePropType = require('../components/Home button.png');
const socialsButtonSource: ImageSourcePropType = require('../components/Socials button.png');
const statisticsButtonSource: ImageSourcePropType = require('../components/Statistics button.png');
const shopButtonSource: ImageSourcePropType = require('../components/Shop button.png');
const hangerIconSource: ImageSourcePropType = require('../components/Hanger icon.png');

const users: LeaderboardUser[] = [
  { id: '1', name: 'Jayden', streak: 67, points: 210 },
  { id: '2', name: 'Matin', streak: 100, points: 190 },
  { id: '3', name: 'Xavier', streak: 87, points: 140 },
  { id: '4', name: 'Alex', streak: 67, points: 100 },
  { id: '5', name: 'Chris', streak: 60, points: 90 },
  { id: '6', name: 'Josh', streak: 19, points: 79 },
  { id: '7', name: 'Joy', streak: 50, points: 70 },
  { id: '8', name: 'Mia', streak: 48, points: 68 },
  { id: '9', name: 'Noah', streak: 46, points: 66 },
  { id: '10', name: 'Zara', streak: 44, points: 64 },
  { id: '11', name: 'Ethan', streak: 43, points: 62 },
  { id: '12', name: 'Ivy', streak: 42, points: 60 },
  { id: '13', name: 'Ava', streak: 41, points: 58 },
  { id: '14', name: 'Liam', streak: 40, points: 56 },
  { id: '15', name: 'Nina', streak: 39, points: 54 },
  { id: '16', name: 'Owen', streak: 38, points: 52 },
  { id: '17', name: 'Luna', streak: 37, points: 50 },
  { id: '18', name: 'Myles', streak: 36, points: 48 },
  { id: '19', name: 'Piper', streak: 35, points: 46 },
  { id: '20', name: 'Theo', streak: 34, points: 44 },
  { id: '21', name: 'Elena', streak: 33, points: 42 },
  { id: '22', name: 'Riley', streak: 32, points: 40 },
  { id: '23', name: 'Hannah', streak: 31, points: 38 },
  { id: '24', name: 'Arlo', streak: 30, points: 36 },
  { id: '25', name: 'Leah', streak: 29, points: 34 },
  { id: '26', name: 'Kai', streak: 28, points: 32 },
  { id: '27', name: 'Sophie', streak: 27, points: 30 },
  { id: '28', name: 'Eli', streak: 26, points: 28 },
  { id: '29', name: 'Nora', streak: 25, points: 26 },
  { id: '30', name: 'Felix', streak: 24, points: 24 },
  { id: '31', name: 'Talia', streak: 23, points: 22 },
  { id: '32', name: 'Hugo', streak: 22, points: 20 },
  { id: '33', name: 'Skye', streak: 21, points: 18 },
  { id: '34', name: 'Aiden', streak: 20, points: 16 },
  { id: '35', name: 'Cora', streak: 19, points: 14 },
  { id: '36', name: 'Miles', streak: 18, points: 12 },
  { id: '37', name: 'June', streak: 17, points: 10 },
  { id: '38', name: 'Rey', streak: 16, points: 8 },
  { id: '39', name: 'Maya', streak: 15, points: 7 },
  { id: '40', name: 'Drew', streak: 14, points: 6 },
  { id: '41', name: 'Lyla', streak: 13, points: 5 },
  { id: '42', name: 'Ezra', streak: 12, points: 4 },
  { id: '43', name: 'Nate', streak: 11, points: 4 },
  { id: '44', name: 'Iris', streak: 10, points: 3 },
  { id: '45', name: 'Logan', streak: 9, points: 3 },
  { id: '46', name: 'Ruby', streak: 8, points: 2 },
  { id: '47', name: 'Finn', streak: 7, points: 2 },
  { id: '48', name: 'Ana', streak: 6, points: 1 },
  { id: '49', name: 'Ben', streak: 5, points: 1 },
  { id: '50', name: 'Pia', streak: 4, points: 1 },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [rankIndex, setRankIndex] = React.useState(0);
  const currentRank = rankOrder[rankIndex];
  const trophyRow = getTrophySlots(currentRank);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Advance rank"
            onPress={() => setRankIndex((value) => (value + 1) % rankOrder.length)}
            style={styles.iconButton}>
            <View style={styles.circleIcon} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open rank guide"
            onPress={() => router.push('/RankGuide')}
            style={styles.iconButton}>
            <Text style={styles.iconButtonText}>?</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.trophySection}>
        <View style={styles.trophyRow}>
          {trophyRow.map((slot) => (
            <View
              key={slot.key}
              style={[
                styles.trophySlot,
                { width: slot.size === 'large' ? 114 : 76 },
              ]}>
              <Image
                source={trophySources[slot.rank ?? 'silver']}
                style={[
                  styles.trophyImage,
                  slot.size === 'large' ? styles.trophyLarge : styles.trophySmall,
                  slot.opacity !== undefined && { opacity: slot.opacity },
                ]}
                resizeMode="contain"
              />

              {slot.label ? <Text style={styles.currentRankLabel}>{slot.label}</Text> : <View style={styles.trophyLabelSpacer} />}
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index === 0 && styles.rowHighlighted]}>
            <Text style={styles.rankNumber}>{item.id}</Text>

            <View style={styles.nameBlock}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.streakRow}>
                <Image source={streakSource} style={styles.streakIcon} resizeMode="contain" />
                <Text style={styles.streak}>{item.streak}</Text>
              </View>
            </View>

            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.promotionWrapper}>
            <View style={styles.promotionRow}>
              <Image source={promotionArrowSource} style={styles.promotionArrowIcon} resizeMode="contain" />
              <Text style={styles.promotionText}>PROMOTION ZONE</Text>
              <Image source={promotionArrowSource} style={styles.promotionArrowIcon} resizeMode="contain" />
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomNav}>
        <Image source={homeButtonSource} style={styles.navIconImage} resizeMode="contain" />
        <Image source={socialsButtonSource} style={styles.navIconImage} resizeMode="contain" />
        <View style={styles.navActive}>
          <Image source={statisticsButtonSource} style={styles.navActiveImage} resizeMode="contain" />
        </View>
        <Image source={shopButtonSource} style={styles.navIconImage} resizeMode="contain" />
        <Image source={hangerIconSource} style={styles.navIconImage} resizeMode="contain" />
      </View>
    </SafeAreaView>
  );
}

function getTrophySlots(currentRank: RankKey): TrophySlot[] {
  if (currentRank === 'bronze') {
    return [
      { key: 'empty-left', size: 'small', opacity: 0 },
      { key: 'bronze', rank: 'bronze', size: 'large', label: 'Current Rank' },
      { key: 'silver', rank: 'silver', size: 'small' },
    ];
  }

  if (currentRank === 'silver') {
    return [
      { key: 'bronze', rank: 'bronze', size: 'small' },
      { key: 'silver', rank: 'silver', size: 'large', label: 'Current Rank' },
      { key: 'gold', rank: 'gold', size: 'small' },
    ];
  }

  return [
    { key: 'silver', rank: 'silver', size: 'small' },
    { key: 'gold', rank: 'gold', size: 'large', label: 'Current Rank' },
    { key: 'empty-right', size: 'small', opacity: 0 },
  ];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#202020',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f39ad0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
    marginTop: -2,
  },
  circleIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  trophySection: {
    paddingTop: 4,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#b8b8b8',
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 146,
  },
  trophySlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trophyImage: {
    marginBottom: 6,
  },
  trophyLarge: {
    width: 122,
    height: 94,
  },
  trophySmall: {
    width: 84,
    height: 66,
  },
  currentRankLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  trophyLabelSpacer: {
    height: 17,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  promotionWrapper: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  promotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  promotionText: {
    color: '#58ff58',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promotionArrow: {
    color: '#58ff58',
    fontSize: 24,
    fontWeight: '900',
  },
  promotionArrowIcon: {
    width: 24,
    height: 24,
  },
  row: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#2a2a2a',
  },
  rowHighlighted: {
    backgroundColor: '#6d6d6d',
  },
  rankNumber: {
    width: 32,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 0,
  },
  nameBlock: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 17,
  },
  streak: {
    color: '#ff9f00',
    fontSize: 12,
    fontWeight: '800',
  },
  streakRow: {
    marginTop: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakIcon: {
    width: 12,
    height: 12,
  },
  points: {
    color: '#ff4ff0',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomNav: {
    height: 48,
    backgroundColor: '#b437ba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  navIconImage: {
    width: 24,
    height: 24,
  },
  navActive: {
    width: 48,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },
  navActiveImage: {
    width: 24,
    height: 24,
  },
  navActiveIcon: {
    color: '#ff9f00',
    fontSize: 13,
    fontWeight: '900',
  },
});