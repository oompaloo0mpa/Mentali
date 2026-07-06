import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

type OnboardingPage1Props = {
  onContinue?: () => void;
};

export default function OnboardingPage_1({ onContinue }: OnboardingPage1Props): React.ReactElement {
  const router = useRouter();

  const handleContinue = (): void => {
    if (onContinue) {
      onContinue();
      return;
    }

    router.push('/OnboardingPage_Username');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Check in with</Text>
            <Text style={styles.mainTitle}>yourself </Text>
            <Text style={styles.dailyText}>daily</Text>
          </View>

          {/* Bullet Points */}
          <View style={styles.bulletContainer}>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Track your mood</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Reflect through simple chats</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Get support whenever and wherever</Text>
            </View>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../components/OnboardingImage_1.png')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          <View style={styles.bottomArea}>
            <OnboardingProgressDots activeIndex={0} />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F7',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
  },
  dailyText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ED95DD',
    textAlign: 'center',
    marginTop: 5,
  },
  bulletContainer: {
    width: '100%',
    marginBottom: 30,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bulletDot: {
    fontSize: 24,
    color: '#000',
    marginRight: 12,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    marginBottom: 30,
  },
  bottomArea: {
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    marginTop: 16,
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
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
