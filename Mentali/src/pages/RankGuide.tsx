import { Image, Pressable, StatusBar, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RankGuideProps = {
  onClose?: () => void;
};

const rankGuideImage1 = require('../components/RankGuideImage_1 (2).png') as ImageSourcePropType;
const rankGuideImage2 = require('../components/RankGuideImage_2 (2).png') as ImageSourcePropType;
const rankGuideImage3 = require('../components/RankGuideImage_3 (2).png') as ImageSourcePropType;

function ArrowDivider() {
  return <Text style={styles.arrowText}>↓</Text>;
}

export default function RankGuide({ onClose }: RankGuideProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#2D2D2D" />

      <View style={styles.content}>
        <Text style={styles.title}>RANK SYSTEM</Text>

        <Image source={rankGuideImage1} resizeMode="contain" style={styles.imageOne} />
        <Text style={styles.caption}>Complete quests and keep a constant streak!</Text>

        <ArrowDivider />

        <Image source={rankGuideImage2} resizeMode="contain" style={styles.imageTwo} />
        <Text style={styles.caption}>Earn points and climb up the ranks!</Text>

        <ArrowDivider />

        <Image source={rankGuideImage3} resizeMode="contain" style={styles.imageThree} />
        <Text style={styles.caption}>Hit certain ranks to obtain limited cosmetics and titles!</Text>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
          <Text style={styles.closeButtonText}>CLOSE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2D2D2D',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#F2F2F2',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  imageOne: {
    width: 210,
    height: 96,
  },
  imageTwo: {
    width: 220,
    height: 90,
  },
  imageThree: {
    width: 220,
    height: 78,
  },
  caption: {
    color: '#F4F4F4',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
  },
  closeButton: {
    marginBottom: 6,
    minWidth: 120,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E98ACB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    opacity: 0.85,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});