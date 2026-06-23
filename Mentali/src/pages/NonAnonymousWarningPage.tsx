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

export default function NonAnonymousWarningPage(): React.ReactElement {
  const router = useRouter();

  const handleContinue = (): void => {
    router.push('/OnboardingPage_3');
  };

  const handleSecondThought = (): void => {
    router.push('/OnboardingPage_2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>Before We</Text>
            <Text style={styles.titleText}>Continue...</Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>
              Turning off anonymous mode allows you and others to view each other's profiles and may also enable you to receive help from professionals.
            </Text>
          </View>

          {/* Question */}
          <View style={styles.questionSection}>
            <Text style={styles.questionText}>ARE YOU OK WITH YOUR CHOICE?</Text>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../components/OnboardingImage_3.png')}
              style={styles.onboardingImage}
              resizeMode="contain"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>YES</Text>
          </TouchableOpacity>

          {/* Second Thought Button */}
          <TouchableOpacity
            style={styles.secondThoughtButton}
            onPress={handleSecondThought}
            activeOpacity={0.8}
          >
            <Text style={styles.secondThoughtText}>ON SECOND THOUGHT...</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A64D9A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'space-between',
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 44,
  },
  descriptionSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  questionSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#F4A5D9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  secondThoughtButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondThoughtText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
