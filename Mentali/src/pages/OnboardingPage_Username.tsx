import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

type OnboardingPageUsernameProps = {
  onContinue?: (username: string) => void | Promise<void>;
  onBack?: () => void;
};

export default function OnboardingPage_Username({ onContinue, onBack }: OnboardingPageUsernameProps): React.ReactElement {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGoBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }

    router.push('/');
  };

  const handleContinue = async (): Promise<void> => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert('Username required', 'Please enter a username to continue.');
      return;
    }

    if (onContinue) {
      setSaving(true);
      try {
        await onContinue(trimmed);
      } finally {
        setSaving(false);
      }
      return;
    }

    router.push('/OnboardingPage_2');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBlock}>
            <Text style={styles.title}>
              <Text style={styles.titleMain}>Make it </Text>
              <Text style={styles.titleAccent}>yours</Text>
              <Text style={styles.titleMain}>.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Enter a username. This is how you will be seen by others.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputShell}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Enter Username"
                placeholderTextColor="#5F5F5F"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor="#EF8EDD"
                returnKeyType="done"
              />
            </View>
            <Text style={styles.helperText}>This can be changed later in settings*</Text>
          </View>

          <View style={styles.bottomArea}>
            <OnboardingProgressDots activeIndex={0} />

            <TouchableOpacity
              style={[styles.continueButton, saving && styles.continueButtonDisabled]}
              onPress={() => void handleContinue()}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>{saving ? 'SAVING...' : 'CONTINUE'}</Text>
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
    backgroundColor: '#FCEBF8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -2,
  },
  backArrow: {
    fontSize: 28,
    color: '#6B6B6B',
    lineHeight: 28,
    fontWeight: '400',
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 28,
  },
  title: {
    textAlign: 'center',
    lineHeight: 48,
  },
  titleMain: {
    fontSize: 31,
    fontWeight: '800',
    color: '#111111',
  },
  titleAccent: {
    fontSize: 31,
    fontWeight: '800',
    color: '#EF91E2',
  },
  subtitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  inputSection: {
    marginTop: 28,
  },
  inputShell: {
    height: 42,
    borderWidth: 1,
    borderColor: '#B8B8B8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 0,
    elevation: 1,
  },
  input: {
    height: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 8,
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6E6E',
  },
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 6,
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
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});