import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { moodSources } from '../data/moodAssets';
import { setMoodForDate } from '../data/moodStore';
import { getSingaporeTodayKey } from '../data/sgDate';

const ringSize = 292;

function formatDateLabel(dateKey: string) {
  const [yearText, monthText, dayText] = dateKey.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);

  return `${day} ${monthNames[monthIndex].toUpperCase()} ${year}`;
}

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

export default function ChooseEmoji() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = params.date ?? getSingaporeTodayKey();
  const dateLabel = useMemo(() => formatDateLabel(dateKey), [dateKey]);
  const animations = useRef(moodSources.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      120,
      animations.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [animations]);

  const positions = [
    { top: 4, left: 112, rotate: '-18deg' },
    { top: 120, left: 222, rotate: '14deg' },
    { top: 232, left: 136, rotate: '10deg' },
    { top: 232, left: 20, rotate: '-12deg' },
    { top: 120, left: -46, rotate: '-6deg' },
  ];

  const handleSelect = (moodIndex: number) => {
    setMoodForDate(dateKey, moodIndex);
    router.replace('/StatisticPage');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.page}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        <View style={styles.circleWrap}>
          <View style={styles.ring} />
          <Text style={styles.prompt}>WHAT WAS YOUR MOOD?</Text>

          {moodSources.map((source, index) => {
            const animation = animations[index];
            const position = positions[index];

            return (
              <Animated.View
                key={`emoji-${index}`}
                style={[
                  styles.emojiButton,
                  {
                    top: position.top,
                    left: position.left,
                    opacity: animation,
                    transform: [
                      { scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) },
                      { rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ['-150deg', position.rotate] }) },
                      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
                    ],
                  },
                ]}>
                <Pressable style={styles.emojiPressable} onPress={() => handleSelect(index)}>
                  <Image source={source} style={styles.emojiImage} resizeMode="contain" />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close emoji chooser"
          onPress={() => router.replace('/StatisticPage')}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
          <Text style={styles.closeButtonText}>X</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2d2d2d',
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  dateLabel: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 26,
    textTransform: 'uppercase',
  },
  circleWrap: {
    width: ringSize + 72,
    height: ringSize + 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 44,
  },
  ring: {
    position: 'absolute',
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
    borderWidth: 4,
    borderColor: '#f5d4da',
  },
  prompt: {
    position: 'absolute',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: '#f5d4da',
    top: 182,
    width: '100%',
  },
  emojiButton: {
    position: 'absolute',
  },
  emojiPressable: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiImage: {
    width: 70,
    height: 70,
  },
  closeButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#c69e9f',
    backgroundColor: '#f6d9dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.9,
  },
  closeButtonText: {
    color: '#9f7a7a',
    fontSize: 28,
    fontWeight: '800',
  },
});