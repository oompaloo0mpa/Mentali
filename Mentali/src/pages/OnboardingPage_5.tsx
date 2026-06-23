import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingPage_5(): React.ReactElement {
  const router = useRouter();

  const handleContinue = (): void => {
    router.push('/login');
  };

  const handleGoBack = (): void => {
    router.push('/OnboardingPage_3');
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
            <Text style={styles.mainTitle}>You're all set!</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </TouchableOpacity>
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
  header: {
    width: '100%',
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
    alignItems: 'center',
    marginBottom: 30,
    flex: 1,
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
  },
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    marginBottom: 30,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#ED95DD',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
});
