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

type ChooseEmojiProps = {
  dateKey?: string;
  onDone?: (dateKey: string) => void;
  onClose?: () => void;
};

const ringSize = 292;
const emojiSize = 74;

type EmojiPosition = {
  top: number;
  left: number;
  rotate: string;
};

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

export default function ChooseEmoji({ dateKey: propDateKey, onDone, onClose }: ChooseEmojiProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = propDateKey ?? params.date ?? getSingaporeTodayKey();
  const dateLabel = useMemo(() => formatDateLabel(dateKey), [dateKey]);
  const animations = useRef(moodSources.map(() => new Animated.Value(0))).current;
  const emojiPositions = useMemo<EmojiPosition[]>(() => {
    const centerX = (ringSize + 72) / 2;
    const centerY = (ringSize + 96) / 2;
    const radius = ringSize / 2 + 6;
    const startAngle = -90;

    return moodSources.map((_, index) => {
      const angle = ((startAngle + index * (360 / moodSources.length)) * Math.PI) / 180;
      const centerOffsetX = Math.cos(angle) * radius;
      const centerOffsetY = Math.sin(angle) * radius;

      return {
        left: centerX + centerOffsetX - emojiSize / 2,
        top: centerY + centerOffsetY - emojiSize / 2,
        rotate: `${index % 2 === 0 ? -10 : 10}deg`,
      };
    });
  }, []);

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

  const handleSelect = (moodIndex: number) => {
    setMoodForDate(dateKey, moodIndex);
    if (onDone) {
      onDone(dateKey);
      return;
    }

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
            const position = emojiPositions[index];

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
          onPress={() => {
            if (onClose) {
              onClose();
              return;
            }

            router.replace('/StatisticPage');
          }}
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
    width: emojiSize,
    height: emojiSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiImage: {
    width: 68,
    height: 68,
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