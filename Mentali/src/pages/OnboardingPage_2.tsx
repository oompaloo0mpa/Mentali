import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

type OnboardingPage2Props = {
  onContinue?: (isAnonymous: boolean) => void;
  onBack?: () => void;
};

export default function OnboardingPage_2({ onContinue, onBack }: OnboardingPage2Props): React.ReactElement {
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(true);

  const handleGoBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }

    router.push('/OnboardingPage_Username');
  };

  const handleContinue = (): void => {
    if (onContinue) {
      onContinue(isAnonymous);
      return;
    }

    if (isAnonymous) {
      router.push('/OnboardingPage_3');
    } else {
      router.push('/NonAnonymousWarningPage');
    }
  };

  const toggleAnonymousMode = (): void => {
    setIsAnonymous(!isAnonymous);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
          {/* Back Arrow */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Your </Text>
            <View style={styles.titleRow}>
              <Text style={styles.highlightedText}>space</Text>
              <Text style={styles.mainTitle}>,</Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>your </Text>
              <Text style={styles.highlightedText}>control</Text>
              <Text style={styles.mainTitle}>.</Text>
            </View>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleSection}>
            <Text style={styles.subtitleText}>
              stay anonymous or choose what you show to others.
            </Text>
          </View>

          {/* Anonymous Mode Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Anonymous Mode</Text>
            <Switch
              style={styles.toggle}
              trackColor={{ false: '#E0E0E0', true: '#ED95DD' }}
              thumbColor={isAnonymous ? '#FFF' : '#999'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={toggleAnonymousMode}
              value={isAnonymous}
            />
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../components/OnboardingImage_2.png')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          {/* Message */}
          <View style={styles.messageSection}>
            <Text style={styles.messageText}>
              Don't worry, you can always change your mind later!
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          <View style={styles.bottomArea}>
            <OnboardingProgressDots activeIndex={1} />

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightedText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ED95DD',
    textAlign: 'center',
  },
  subtitleSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  toggle: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  imageContainer: {
    width: '100%',
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 30,
  },
  bottomArea: {
    justifyContent: 'flex-end',
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
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
