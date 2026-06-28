import { useState, type ComponentProps } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { moods, navItems, quests, stats, type MoodItem, type QuestItem, type StatItem } from '../hooks/homepageData';

const bronzeTrophy = require('../../assets/images/BronzeTrophy.png') as ImageSourcePropType;
const feelings = require('../../assets/images/feelings.png') as ImageSourcePropType;
const thinkingMascot = require('../../assets/images/thinkingMascot.png') as ImageSourcePropType;

const moodStripWidth = 364;
const moodFaceWidth = moodStripWidth / moods.length;

type MoodButtonProps = {
  mood: MoodItem;
  selected: boolean;
  onPress: () => void;
};

function StatPill({ icon, value, color }: StatItem) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function MoodButton({ mood, selected, onPress }: MoodButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.moodButton, selected && styles.moodButtonSelected, { backgroundColor: mood.color }]}>
      <Image
        source={feelings}
        resizeMode="cover"
        style={[styles.moodImage, { transform: [{ translateX: -(mood.imageOffset * moodFaceWidth) }] }]}
      />
    </Pressable>
  );
}

function QuestCard({ item }: { item: QuestItem }) {
  return (
    <View style={[styles.questCard, item.active ? styles.questCardActive : styles.questCardInactive]}>
      <View style={styles.questTextWrap}>
        <Text numberOfLines={1} style={styles.questTitle}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={styles.questSubtitle}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.pointsPill}>
        <Text style={styles.pointsText}>{item.points}</Text>
      </View>
    </View>
  );
}

function BottomNavItem({ icon, active }: { icon: string; active?: boolean }) {
  const iconName = active ? icon.replace('-outline', '') : icon;

  return (
    <View style={[styles.navItem, active && styles.navItemActive]}>
      <Ionicons name={iconName as ComponentProps<typeof Ionicons>['name']} size={24} color={active ? '#111' : '#F4D5F2'} />
    </View>
  );
}

function MascotArt() {
  return <Image source={thinkingMascot} resizeMode="contain" style={styles.mascotImage} />;
}

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState(0);
  const completedCount = 2;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#282425" />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.statGroup}>
            {stats.map((item) => (
              <StatPill key={item.value} {...item} />
            ))}
          </View>

          <View style={styles.actionGroup}>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>✉</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>≡</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.quoteBubble}>
            <Text style={styles.quoteText}>{'“Small steps every day lead to\nbig changes.”'}</Text>
            <View style={styles.quoteTail} />
          </View>

          <MascotArt />
        </View>

        <View style={styles.moodsRow}>
          {moods.map((mood, index) => (
            <MoodButton
              key={mood.label}
              mood={mood}
              selected={selectedMood === index}
              onPress={() => setSelectedMood(index)}
            />
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Quest</Text>
          <Text style={styles.sectionMeta}>
            <Text style={styles.sectionMetaHighlight}>{completedCount}/3</Text> Completed
          </Text>
        </View>

        <View style={styles.questList}>
          {quests.map((item) => (
            <QuestCard key={item.title} item={item} />
          ))}
        </View>

        <View style={styles.ctaCard}>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>{'Lets do a quick\nCheck-in today!'}</Text>
            <Text style={styles.ctaSubtitle}>It only takes a minute.</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Check-in</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rankRow}>
          <View style={styles.rankCardLeft}>
            <Text style={styles.rankLabel}>Current Rank</Text>
            <View style={styles.rankBody}>
              <Image source={bronzeTrophy} resizeMode="contain" style={styles.trophyImage} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>Bronze</Text>
                <View style={styles.progressBarTrack}>
                  <View style={styles.progressBarFill} />
                </View>
                <Text style={styles.rankPoints}>210 pts</Text>
              </View>
              <Text style={styles.rankPosition}>#10</Text>
            </View>
          </View>

          <View style={styles.rankCardRight}>
            <View style={styles.rankStatItem}>
              <Text style={styles.rankStatIcon}>📊</Text>
              <View>
                <Text style={styles.rankStatValue}>#10</Text>
                <Text style={styles.rankStatLabel}>Current Position</Text>
              </View>
            </View>
            <View style={styles.rankDivider} />
            <View style={styles.rankStatItem}>
              <Text style={[styles.rankStatIcon, { color: '#C86BFF' }]}>🔷</Text>
              <View>
                <Text style={[styles.rankStatValue, { color: '#C86BFF' }]}>15</Text>
                <Text style={styles.rankStatLabel}>Points this week</Text>
              </View>
            </View>
            <View style={styles.rankDivider} />
            <View style={styles.rankStatItem}>
              <Text style={[styles.rankStatIcon, { color: '#59C66A' }]}>⬆</Text>
              <View>
                <Text style={styles.rankStatValue}>20</Text>
                <Text style={styles.rankStatLabel}>Positions</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <BottomNavItem key={item.icon} icon={item.icon} active={item.active} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282425',
  },
  content: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FF9ADA',
    borderWidth: 1,
    borderColor: '#FFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  actionIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quoteBubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FF8DED',
    minHeight: 88,
    justifyContent: 'center',
  },
  quoteText: {
    color: '#F59AD3',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
  },
  quoteTail: {
    position: 'absolute',
    right: 40,
    bottom: -10,
    width: 18,
    height: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF8DED',
    transform: [{ rotate: '45deg' }],
  },
  mascotImage: {
    width: 126,
    height: 110,
    marginRight: -2,
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  moodButtonSelected: {
    borderWidth: 3,
    borderColor: '#FF5DE7',
  },
  moodImage: {
    width: moodStripWidth,
    height: 58,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionMetaHighlight: {
    color: '#E56AE5',
    fontWeight: '800',
  },
  questList: {
    marginBottom: 10,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#FF4DEA',
    borderRadius: 12,
    backgroundColor: '#F7C7F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    minHeight: 44,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  questCardInactive: {
    backgroundColor: '#fff',
    borderColor: '#F2D5F0',
  },
  questCardActive: {
    backgroundColor: '#F7C7F3',
  },
  questTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  questTitle: {
    color: '#111',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 1,
  },
  questSubtitle: {
    color: '#6E6E6E',
    fontSize: 9,
    fontWeight: '700',
  },
  pointsPill: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F48FD4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pointsText: {
    color: '#8F2A86',
    fontSize: 10,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: '#F8C9FA',
    borderWidth: 2,
    borderColor: '#FF49EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ctaTextWrap: {
    marginBottom: 10,
  },
  ctaTitle: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: '#7E6679',
    fontSize: 11,
    fontWeight: '700',
  },
  ctaButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B03AB4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 10,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  rankCardLeft: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
  },
  rankLabel: {
    color: '#C150D2',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  rankBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyImage: {
    width: 52,
    height: 52,
    marginRight: 8,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: '#8B5C35',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#D8D8D8',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    width: '78%',
    height: '100%',
    backgroundColor: '#F47DF1',
    borderRadius: 6,
  },
  rankPoints: {
    color: '#C150D2',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    paddingRight: 6,
  },
  rankPosition: {
    color: '#8B5C35',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  rankCardRight: {
    width: 132,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    overflow: 'hidden',
  },
  rankStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  rankStatIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#74B7FF',
  },
  rankStatValue: {
    color: '#111',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 1,
  },
  rankStatLabel: {
    color: '#6E6E6E',
    fontSize: 10,
    fontWeight: '700',
  },
  rankDivider: {
    height: 2,
    backgroundColor: '#FF49EA',
  },
  bottomNav: {
    height: 72,
    backgroundColor: '#B02AB3',
    borderTopWidth: 1,
    borderTopColor: '#CC5FD0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  navItem: {
    width: 54,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  navItemActive: {
    backgroundColor: '#F3C1F4',
  },
});
