import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_Username" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_2" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_3" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_4" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_5" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="NonAnonymousWarningPage" options={{ title: 'Confirmation' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="index" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="RewardsPage" options={{ title: 'Rewards' }} />
      <Stack.Screen name="ShopPage" options={{ title: 'Shop' }} />
      <Stack.Screen name="LeaderboardPage" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="RankGuide" options={{ title: 'Rank Guide' }} />
      <Stack.Screen name="StatisticPage" options={{ title: 'Statistics' }} />
      <Stack.Screen name="ChooseEmoji" options={{ title: 'Choose Emoji' }} />
      <Stack.Screen name="index" options={{ title: 'Statistics' }} />
    </Stack>
  );
}
