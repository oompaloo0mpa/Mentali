import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingProgressDots from '../components/OnboardingProgressDots';

const themeColors = ['#000000', '#D8B3F3', '#E5C8F4', '#DCC9F7', '#E8C8E8'];

function ThemeSwatch({ color, selected }: { color: string; selected?: boolean }): React.ReactElement {
  return (
    <View style={[styles.swatch, selected ? styles.swatchSelected : null]}>
      {selected ? (
        <View style={styles.swatchSelectedInner}>
          <View style={styles.swatchSelectedBlack} />
          <View style={styles.swatchSelectedPink} />
        </View>
      ) : (
        <View style={[styles.swatchInner, { backgroundColor: color }]} />
      )}
    </View>
  );
}

type OnboardingPage4Props = {
  onContinue?: () => void;
  onBack?: () => void;
};

export default function OnboardingPage_4({ onContinue, onBack }: OnboardingPage4Props): React.ReactElement {
  const router = useRouter();

  const handleGoBack = (): void => {
    if (onBack) {
      onBack();
      return;
    }

    router.push('/OnboardingPage_3');
  };

  const handleContinue = (): void => {
    if (onContinue) {
      onContinue();
      return;
    }

    router.push('/OnboardingPage_5');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF0FA" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBlock}>
            <Text style={styles.title}>
              <Text style={styles.titleMain}>Make it </Text>
              <Text style={styles.titleAccent}>yours.</Text>
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your theme</Text>
            <View style={styles.swatchRow}>
              {themeColors.map((color, index) => (
                <ThemeSwatch key={color} color={color} selected={index === 0} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your mentali&apos;s style</Text>
            <View style={styles.cardShadow}>
              <View style={styles.styleCard}>
                <View style={styles.hanger}>
                  <View style={styles.hangerHook} />
                  <View style={styles.hangerStem} />
                  <View style={styles.hangerBar} />
                  <View style={styles.hangerLeftArm} />
                  <View style={styles.hangerRightArm} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.spacer} />

          <OnboardingProgressDots activeIndex={3} />

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
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
    backgroundColor: '#FDF0FA',
  },
  scrollContent: {
    flexGrow: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginLeft: -2,
  },
  backArrow: {
    fontSize: 30,
    color: '#666666',
    lineHeight: 30,
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 34,
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
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 18,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#F08BE2',
    overflow: 'hidden',
    backgroundColor: '#FAE8F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderColor: '#F25ADB',
  },
  swatchInner: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  swatchSelectedInner: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#F9D8F2',
  },
  swatchSelectedBlack: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 22,
    height: 22,
    backgroundColor: '#050505',
    transform: [{ rotate: '45deg' }],
  },
  swatchSelectedPink: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    backgroundColor: '#F6B3EE',
    transform: [{ rotate: '45deg' }],
  },
  cardShadow: {
    borderRadius: 6,
    shadowColor: '#B95BAE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 0,
    elevation: 4,
  },
  styleCard: {
    height: 118,
    borderRadius: 6,
    backgroundColor: '#F08BD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hanger: {
    width: 70,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hangerHook: {
    position: 'absolute',
    top: 2,
    width: 14,
    height: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#F8D9F3',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    transform: [{ rotate: '45deg' }],
  },
  hangerStem: {
    position: 'absolute',
    top: 12,
    width: 3,
    height: 17,
    backgroundColor: '#F8D9F3',
  },
  hangerBar: {
    position: 'absolute',
    top: 24,
    width: 42,
    height: 3,
    backgroundColor: '#F8D9F3',
    borderRadius: 2,
  },
  hangerLeftArm: {
    position: 'absolute',
    left: 16,
    top: 20,
    width: 18,
    height: 3,
    backgroundColor: '#F8D9F3',
    transform: [{ rotate: '-28deg' }],
    borderRadius: 2,
  },
  hangerRightArm: {
    position: 'absolute',
    right: 16,
    top: 20,
    width: 18,
    height: 3,
    backgroundColor: '#F8D9F3',
    transform: [{ rotate: '28deg' }],
    borderRadius: 2,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    backgroundColor: '#EF8EDD',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
