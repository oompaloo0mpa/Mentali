import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { SocialProvider } from '@/store/socialStore';

// Dark-first: align the navigation theme with our background.
const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Brand.background, card: Brand.background },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SocialProvider>
          <ThemeProvider value={navTheme}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Brand.background } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="chat/[friendId]" />
              <Stack.Screen
                name="streak-guide"
                options={{ presentation: 'transparentModal', animation: 'fade' }}
              />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </SocialProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
