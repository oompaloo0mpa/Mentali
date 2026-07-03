import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

const emojiImages = [
  require('../components/Emoji 1.png'),
  require('../components/Emoji 2.png'),
  require('../components/Emoji 3.png'),
  require('../components/Emoji 4.png'),
  require('../components/Emoji 5.png'),
];

const emojiBackgrounds = ['#8CCF5A', '#F9DA63', '#FF9438', '#C7DDF4', '#C0CFC2'];

function EmojiOption({
  source,
  backgroundColor,
  selected,
  onPress,
}: {
  source: { uri?: string } | number;
  backgroundColor: string;
  selected?: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.emojiCircle,
        { backgroundColor: selected ? '#8CCF5A' : backgroundColor },
        selected ? styles.emojiCircleSelected : styles.emojiCircleIdle,
      ]}
    >
      <Image source={source} style={styles.emojiImage} resizeMode="contain" />
    </TouchableOpacity>
  );
}

export default function OnboardingPage_5(): React.ReactElement {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState(0);

  const handleContinue = (): void => {
    router.push('/HomePage' as never);
  };

  const handleGoBack = (): void => {
    router.replace('/OnboardingPage_4');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCEBF8" />
      <View style={styles.content}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.titleLine}>
            <Text style={styles.titleMain}>Before we </Text>
            <Text style={styles.titleAccent}>begin,</Text>
          </Text>
          <Text style={styles.subtitleLine}>
            <Text style={styles.subtitleMain}>How are you feeling </Text>
            <Text style={styles.subtitleAccent}>today?</Text>
          </Text>
        </View>

        <View style={styles.emojisRow}>
          {emojiImages.map((source, index) => (
            <EmojiOption
              key={index}
              source={source}
              backgroundColor={emojiBackgrounds[index]}
              selected={selectedMood === index}
              onPress={() => setSelectedMood(index)}
            />
          ))}
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={require('../components/OnboardingImage_5.png')}
            style={styles.brainImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomArea}>
          <OnboardingProgressDots activeIndex={4} />

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>GET STARTED!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCEBF8',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  backArrow: {
    fontSize: 30,
    color: '#6B6B6B',
    lineHeight: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  titleLine: {
    textAlign: 'center',
    lineHeight: 40,
  },
  titleMain: {
    fontSize: 31,
    fontWeight: '800',
    color: '#111111',
  },
  titleAccent: {
    fontSize: 31,
    fontWeight: '800',
    color: '#EE94E4',
  },
  subtitleLine: {
    textAlign: 'center',
    lineHeight: 34,
    marginTop: 10,
  },
  subtitleMain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  subtitleAccent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EE94E4',
  },
  emojisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
    paddingHorizontal: 0,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCircleSelected: {
    borderWidth: 4,
    borderColor: '#FF4FE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  emojiCircleIdle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  emojiImage: {
    width: 30,
    height: 30,
  },
  imageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 210,
    marginTop: 4,
  },
  brainImage: {
    width: '100%',
    maxWidth: 240,
    height: '100%',
    maxHeight: 260,
  },
  bottomArea: {
    paddingTop: 10,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#EF8EDD',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A24C9C',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
