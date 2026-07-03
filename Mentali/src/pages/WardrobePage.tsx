import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/nav/BottomNav';
import { WardrobeScreenContent } from '@/components/wardrobe/WardrobeScreenContent';

type Props = {
  onNavigate: (navItem: string) => void;
};

export default function WardrobePage({ onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#282425" />

      <View style={styles.content}>
        <WardrobeScreenContent onOpenShop={() => onNavigate('bag-outline')} />
      </View>

      <BottomNav activeIcon="shirt-outline" onSelect={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282425',
  },
  content: {
    flex: 1,
  },
});
