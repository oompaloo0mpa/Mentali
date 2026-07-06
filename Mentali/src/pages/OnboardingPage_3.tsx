import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

type OnboardingPage3Props = {
  onContinue?: () => void;
  onBack?: () => void;
};

export default function OnboardingPage_3({ onContinue, onBack }: OnboardingPage3Props): React.ReactElement {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleContinue = (): void => {
    if (onContinue) {
      onContinue();
      return;
    }

    router.push('/OnboardingPage_4' as never);
  };

  const handleGoBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }

    router.push('/OnboardingPage_2');
  };

  const toggleNotifications = (): void => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Text style={styles.mainTitle}>Consistency is</Text>
            <Text style={styles.keywordText}>key.</Text>
          </View>

          {/* Subtitle */}
          <View style={styles.subtitleSection}>
            <Text style={styles.subtitleText}>
              Receive gentle reminders daily to check-in with yourself.
            </Text>
          </View>

          {/* Notifications Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Notifications</Text>
            <Switch
              style={styles.toggle}
              trackColor={{ false: '#E0E0E0', true: '#ED95DD' }}
              thumbColor={notificationsEnabled ? '#FFF' : '#999'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../components/OnboardingImage_4.png')}
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
            <OnboardingProgressDots activeIndex={2} />

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
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 15,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 38,
  },
  keywordText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ED95DD',
    textAlign: 'center',
    marginTop: 2,
  },
  subtitleSection: {
    marginBottom: 15,
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
    paddingVertical: 10,
    marginBottom: 15,
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
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
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
