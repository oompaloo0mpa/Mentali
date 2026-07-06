import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

const welcomeMascot = require('../../assets/images/LoginMascot.png');

interface Props {
  onGetStarted: () => void;
  onAlreadyHaveAccount: () => void;
}

export default function Welcome({ onGetStarted, onAlreadyHaveAccount }: Props): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.brandName}>mentali</Text>
        </View>

        <View style={styles.mascotContainer}>
          <Image
            source={welcomeMascot}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            A safe space to understand and figure out your feelings, at your own pace.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>GET STARTED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onAlreadyHaveAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>I ALREADY HAVE AN ACCOUNT</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ED95DD',
    letterSpacing: 1,
  },
  mascotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  welcomeImage: {
    width: 200,
    height: 200,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#ED95DD',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFB6D9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ED95DD',
    letterSpacing: 0.5,
  },
});
