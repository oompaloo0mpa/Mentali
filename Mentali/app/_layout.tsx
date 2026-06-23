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
      <Stack.Screen name="OnboardingPage_2" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_3" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="OnboardingPage_5" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="NonAnonymousWarningPage" options={{ title: 'Confirmation' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
    </Stack>
  );
}
