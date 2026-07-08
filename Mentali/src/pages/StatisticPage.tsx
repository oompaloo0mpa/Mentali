import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_TODAY_MOOD_INDEX, getMoodForDate, useMoodForDate } from '../data/moodStore';
import { moodSources } from '../data/moodAssets';
import { getSingaporeTodayKey, getSingaporeTodayParts, isDateOnOrBeforeSingaporeToday, isMonthInFutureSingapore } from '../data/sgDate';

const streakSource: ImageSourcePropType = require('../components/Streak logo.png');
const brainFreezeSource: ImageSourcePropType = require('../components/BrainFreeze.png');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthOptions = monthNames.map((label, value) => ({ label, value }));

type MoodCell = {
  day: number;
  dateKey: string;
  moodIndex?: number;
};

function padMonth(monthIndex: number) {
  return String(monthIndex + 1).padStart(2, '0');
}

function padDay(day: number) {
  return String(day).padStart(2, '0');
}

function getDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${padMonth(monthIndex)}-${padDay(day)}`;
}

function buildCalendar(year: number, monthIndex: number): Array<MoodCell | null> {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const calendar: Array<MoodCell | null> = Array.from({ length: firstDay }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = getDateKey(year, monthIndex, day);
    calendar.push({
      day,
      dateKey,
      moodIndex: getMoodForDate(dateKey),
    });
  }

  return calendar;
}

type StatisticPageProps = {
  onNavigate?: (navItem: string) => void;
  onOpenEmojiChooser?: (dateKey: string) => void;
};

export default function StatisticPage({ onNavigate, onOpenEmojiChooser }: StatisticPageProps) {
  const router = useRouter();
  const todayKey = getSingaporeTodayKey();
  const singaporeToday = getSingaporeTodayParts();
  const minYear = 2024;
  const [year, setYear] = useState(Number(todayKey.slice(0, 4)));
  const [monthIndex, setMonthIndex] = useState(Number(todayKey.slice(5, 7)) - 1);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const yearOptions = useMemo(() => {
    const options: Array<{ label: string; value: number }> = [];
    for (let value = 2024; value <= singaporeToday.year; value += 1) {
      options.push({ label: String(value), value });
    }
    return options;
  }, [singaporeToday.year]);

  const calendarCells = useMemo(() => buildCalendar(year, monthIndex), [monthIndex, year]);
  const todayMoodIndex = useMoodForDate(todayKey) ?? DEFAULT_TODAY_MOOD_INDEX;

  const openChooser = (dateKey: string) => {
    if (onOpenEmojiChooser) {
      onOpenEmojiChooser(dateKey);
      return;
    }

    router.push({ pathname: '/ChooseEmoji', params: { date: dateKey } });
  };

  const selectMonth = (value: number) => {
    if (isMonthInFutureSingapore(year, value)) {
      return;
    }
    setMonthIndex(value);
    setMonthDropdownOpen(false);
  };

  const selectYear = (value: number) => {
    const nextMonth = isMonthInFutureSingapore(value, monthIndex) ? 0 : monthIndex;
    setYear(value);
    setMonthIndex(nextMonth);
    setYearDropdownOpen(false);
  };

  const goToPreviousMonth = () => {
    if (year === minYear && monthIndex === 0) {
      return;
    }

    if (monthIndex === 0) {
      setYear(year - 1);
      setMonthIndex(11);
      return;
    }

    setMonthIndex(monthIndex - 1);
  };

  const goToNextMonth = () => {
    const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;

    if (isMonthInFutureSingapore(nextYear, nextMonth)) {
      return;
    }

    setYear(nextYear);
    setMonthIndex(nextMonth);
  };

  const isAtMinimumMonth = year === minYear && monthIndex === 0;
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const isAtFutureMonth = isMonthInFutureSingapore(nextYear, nextMonth);

  const returnHome = () => {
    if (onNavigate) {
      onNavigate('home-outline');
      return;
    }

    router.replace('/HomePage');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <View style={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={returnHome}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Mood Tracker</Text>
          <Text style={styles.subtitle}>Understand yourself better, one step at a time.</Text>
        </View>

        <Pressable style={styles.moodCard} onPress={() => openChooser(todayKey)}>
          <Text style={styles.cardLabel}>Today’s Mood</Text>
          <View style={styles.moodRow}>
            <Image source={moodSources[todayMoodIndex]} style={styles.moodEmojiImage} resizeMode="contain" />
            <Text style={styles.changeText}>Change &gt;</Text>
          </View>
        </Pressable>

        <View style={styles.calendarHeaderRow}>
          <Text style={styles.sectionTitle}>Mood Calendar</Text>

          <View style={styles.dropdownRow}>
            <View style={styles.dropdownWrapper}>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => {
                  setMonthDropdownOpen((value) => !value);
                  setYearDropdownOpen(false);
                }}>
                <Text style={styles.dropdownText}>{monthNames[monthIndex]} ˅</Text>
              </Pressable>

              {monthDropdownOpen ? (
                <View style={styles.dropdownMenu}>
                  {monthOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      style={styles.dropdownMenuItem}
                      onPress={() => selectMonth(option.value)}>
                      <Text style={styles.dropdownMenuText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.dropdownWrapper}>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => {
                  setYearDropdownOpen((value) => !value);
                  setMonthDropdownOpen(false);
                }}>
                <Text style={styles.dropdownText}>{year} ˅</Text>
              </Pressable>

              {yearDropdownOpen ? (
                <View style={styles.dropdownMenu}>
                  {yearOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      style={styles.dropdownMenuItem}
                      onPress={() => selectYear(option.value)}>
                      <Text style={styles.dropdownMenuText}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarTopRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={goToPreviousMonth}
              style={({ pressed }) => [
                styles.calendarNavButton,
                isAtMinimumMonth && styles.calendarNavButtonDisabled,
                pressed && styles.calendarNavButtonPressed,
              ]}>
              <Text style={styles.calendarNavText}>{'<'}</Text>
            </Pressable>

            <Text style={styles.calendarMonthLabel}>{monthNames[monthIndex]}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={goToNextMonth}
              style={({ pressed }) => [
                styles.calendarNavButton,
                isAtFutureMonth && styles.calendarNavButtonDisabled,
                pressed && styles.calendarNavButtonPressed,
              ]}>
              <Text style={styles.calendarNavText}>{'>'}</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {calendarCells.map((cell, index) => {
              if (!cell) {
                return <View key={`blank-${index}`} style={styles.gridCell} />;
              }

              const editable = cell.dateKey === todayKey;
              const content = (
                <>
                  {typeof cell.moodIndex === 'number' ? (
                    <Image source={moodSources[cell.moodIndex]} style={styles.gridEmojiImage} resizeMode="contain" />
                  ) : null}
                  {typeof cell.moodIndex !== 'number' ? <Text style={styles.gridDay}>{cell.day}</Text> : null}
                </>
              );

              if (!editable) {
                return (
                  <View key={cell.dateKey} style={[styles.gridCell, styles.gridCellDisabled]}>
                    {content}
                  </View>
                );
              }

              return (
                <Pressable
                  key={cell.dateKey}
                  style={({ pressed }) => [styles.gridCell, pressed && styles.gridCellPressed]}
                  onPress={() => openChooser(cell.dateKey)}>
                  {content}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <View style={styles.statValueRow}>
              <Image source={streakSource} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statValue}>67</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Brainfreezes used</Text>
            <View style={styles.statValueRow}>
              <Image source={brainFreezeSource} style={styles.statIcon} resizeMode="contain" />
              <Text style={styles.statValue}>2</Text>
            </View>
          </View>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  page: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f08cc8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 18,
  },
  backButtonPressed: {
    opacity: 0.9,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  header: {
    marginBottom: 22,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  moodCard: {
    width: 154,
    backgroundColor: '#f7d9dc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d7afaf',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 22,
  },
  cardLabel: {
    color: '#b27f6f',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodEmojiImage: {
    width: 28,
    height: 28,
  },
  changeText: {
    color: '#b27f6f',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#f3d1d4',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: '#d0b0b0',
  },
  dropdownText: {
    color: '#a06f6c',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    zIndex: 20,
    backgroundColor: '#f7d9dc',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#d0b0b0',
    overflow: 'hidden',
    minWidth: 92,
  },
  dropdownMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownMenuText: {
    color: '#a06f6c',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#f7d9dc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#c8a39f',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 18,
  },
  calendarTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calendarNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3d1d4',
    borderWidth: 1.5,
    borderColor: '#d0b0b0',
  },
  calendarNavButtonDisabled: {
    opacity: 0.4,
  },
  calendarNavButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  calendarNavText: {
    color: '#a06f6c',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  calendarMonthLabel: {
    color: '#a06f6c',
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    color: '#a06f6c',
    fontSize: 13,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '14.28%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellDisabled: {
    opacity: 0.55,
  },
  gridCellPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  gridEmojiImage: {
    width: 16,
    height: 16,
    marginBottom: 1,
  },
  gridDay: {
    color: '#2d2d2d',
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f7d9dc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#c8a39f',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  statLabel: {
    color: '#b27f6f',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 30,
    height: 30,
  },
  statValue: {
    color: '#ff8b00',
    fontSize: 18,
    fontWeight: '900',
  },
});