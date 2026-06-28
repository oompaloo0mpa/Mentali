import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar,
  View,
} from 'react-native';
import { moods, navItems, quests, stats, type MoodItem, type QuestItem, type StatItem } from '../data/homepageData';

function StatPill({ icon, value, color }: StatItem) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

type MoodButtonProps = {
  mood: MoodItem;
  selected: boolean;
  onPress: () => void;
};

function MoodButton({ mood, selected, onPress }: MoodButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.moodButton, selected && styles.moodButtonSelected]}>
      <View style={[styles.moodCircle, { backgroundColor: mood.color }]}>
        <Text style={styles.moodFace}>{mood.face}</Text>
      </View>
    </Pressable>
  );
}

function QuestCard({ item }: { item: QuestItem }) {
  return (
    <View style={[styles.questCard, item.active ? styles.questCardActive : styles.questCardInactive]}>
      <View style={styles.questTextWrap}>
        <Text style={styles.questTitle}>{item.title}</Text>
        <Text style={styles.questSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.pointsPill}>
        <Text style={styles.pointsText}>{item.points}</Text>
      </View>
    </View>
  );
}

function BottomNavItem({ icon, active }: { icon: string; active?: boolean }) {
  return (
    <View style={[styles.navItem, active && styles.navItemActive]}>
      <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
    </View>
  );
}

function BrainMascot() {
  return (
    <View style={styles.mascotWrap}>
      <View style={styles.lightBulbWrap}>
        <Text style={styles.lightBulb}>💡</Text>
      </View>
      <View style={styles.brainBody}>
        <View style={styles.brainLobeOne} />
        <View style={styles.brainLobeTwo} />
        <View style={styles.brainLobeThree} />
        <View style={styles.brainFace}>
          <View style={styles.glassesLeft} />
          <View style={styles.glassesRight} />
          <View style={styles.glassesBridge} />
          <View style={styles.eyeLeft} />
          <View style={styles.eyeRight} />
          <View style={styles.smile} />
        </View>
      </View>
      <View style={styles.bookWrap}>
        <View style={styles.bookLeft} />
        <View style={styles.bookRight} />
      </View>
      <View style={styles.legsWrap}>
        <View style={styles.legLeft} />
        <View style={styles.legRight} />
      </View>
      <View style={styles.shoesWrap}>
        <View style={styles.shoeLeft} />
        <View style={styles.shoeRight} />
      </View>
    </View>
  );
}

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState(0);
  const completedCount = 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#282425" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          <BrainMascot />
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
              <Text style={styles.trophy}>🏆</Text>
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
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <BottomNavItem key={item.icon} icon={item.icon} active={item.active} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282425',
  },
  scrollContent: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 108,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FF9ADA',
    borderWidth: 1,
    borderColor: '#FFF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionIcon: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '700',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  quoteBubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FF8DED',
    minHeight: 132,
    justifyContent: 'center',
  },
  quoteText: {
    color: '#F59AD3',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 30,
  },
  quoteTail: {
    position: 'absolute',
    right: 52,
    bottom: -12,
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF8DED',
    transform: [{ rotate: '45deg' }],
  },
  mascotWrap: {
    width: 146,
    height: 166,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lightBulbWrap: {
    position: 'absolute',
    right: -2,
    top: 2,
  },
  lightBulb: {
    fontSize: 34,
  },
  brainBody: {
    width: 118,
    height: 98,
    backgroundColor: '#F7A6B0',
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  brainLobeOne: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F6B3BC',
    left: 10,
    top: -4,
  },
  brainLobeTwo: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3A1AB',
    right: 10,
    top: -8,
  },
  brainLobeThree: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8C2C9',
    left: 34,
    top: -12,
  },
  brainFace: {
    width: 74,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassesLeft: {
    position: 'absolute',
    left: 4,
    top: 16,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 4,
    borderColor: '#2E2E2E',
  },
  glassesRight: {
    position: 'absolute',
    right: 4,
    top: 16,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 4,
    borderColor: '#2E2E2E',
  },
  glassesBridge: {
    position: 'absolute',
    top: 28,
    left: 29,
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2E2E2E',
  },
  eyeLeft: {
    position: 'absolute',
    left: 15,
    top: 26,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C9D0DA',
  },
  eyeRight: {
    position: 'absolute',
    right: 15,
    top: 26,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#C9D0DA',
  },
  smile: {
    position: 'absolute',
    bottom: 10,
    width: 16,
    height: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#2E2E2E',
    borderRadius: 10,
  },
  bookWrap: {
    position: 'absolute',
    left: -6,
    top: 62,
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  bookLeft: {
    width: 26,
    height: 46,
    backgroundColor: '#6A8A6B',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 2,
    borderColor: '#D9E3B1',
  },
  bookRight: {
    width: 18,
    height: 46,
    backgroundColor: '#48614A',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  legsWrap: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    gap: 10,
  },
  legLeft: {
    width: 14,
    height: 22,
    backgroundColor: '#6EC1FF',
    borderRadius: 6,
  },
  legRight: {
    width: 14,
    height: 22,
    backgroundColor: '#6EC1FF',
    borderRadius: 6,
  },
  shoesWrap: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 14,
  },
  shoeLeft: {
    width: 22,
    height: 10,
    backgroundColor: '#4D7FAE',
    borderRadius: 6,
  },
  shoeRight: {
    width: 22,
    height: 10,
    backgroundColor: '#4D7FAE',
    borderRadius: 6,
  },
  moodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  moodButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  moodButtonSelected: {
    borderWidth: 4,
    borderColor: '#FF5DE7',
    backgroundColor: '#D6D2D5',
  },
  moodCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodFace: {
    fontSize: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionMeta: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionMetaHighlight: {
    color: '#E56AE5',
    fontWeight: '800',
  },
  questList: {
    marginBottom: 18,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#FF4DEA',
    borderRadius: 12,
    backgroundColor: '#F7C7F3',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    paddingRight: 12,
  },
  questTitle: {
    color: '#111',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  questSubtitle: {
    color: '#6E6E6E',
    fontSize: 14,
    fontWeight: '700',
  },
  pointsPill: {
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F48FD4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pointsText: {
    color: '#8F2A86',
    fontSize: 16,
    fontWeight: '800',
  },
  ctaCard: {
    backgroundColor: '#F8C9FA',
    borderWidth: 2,
    borderColor: '#FF49EA',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ctaTextWrap: {
    marginBottom: 18,
  },
  ctaTitle: {
    color: '#111',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 6,
  },
  ctaSubtitle: {
    color: '#7E6679',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#B03AB4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 14,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rankCardLeft: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    marginRight: 14,
  },
  rankLabel: {
    color: '#C150D2',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  rankBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophy: {
    fontSize: 70,
    marginRight: 12,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: '#8B5C35',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#D8D8D8',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    width: '78%',
    height: '100%',
    backgroundColor: '#F47DF1',
    borderRadius: 8,
  },
  rankPoints: {
    color: '#C150D2',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
    paddingRight: 12,
  },
  rankPosition: {
    color: '#8B5C35',
    fontSize: 30,
    fontWeight: '800',
    marginLeft: 10,
  },
  rankCardRight: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF49EA',
    overflow: 'hidden',
  },
  rankStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  rankStatIcon: {
    fontSize: 22,
    marginRight: 10,
    color: '#74B7FF',
  },
  rankStatValue: {
    color: '#111',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  rankStatLabel: {
    color: '#6E6E6E',
    fontSize: 12,
    fontWeight: '700',
  },
  rankDivider: {
    height: 2,
    backgroundColor: '#FF49EA',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
    backgroundColor: '#B02AB3',
    borderTopWidth: 1,
    borderTopColor: '#CC5FD0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navItem: {
    width: 80,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  navItemActive: {
    backgroundColor: '#F3C1F4',
  },
  navIcon: {
    color: '#111',
    fontSize: 30,
    fontWeight: '900',
  },
  navIconActive: {
    color: '#111',
  },
});
