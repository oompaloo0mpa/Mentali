import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StatisticPage" options={{ title: 'Statistics' }} />
      <Stack.Screen name="ChooseEmoji" options={{ title: 'Choose Emoji' }} />
      <Stack.Screen name="index" options={{ title: 'Statistics' }} />
    </Stack>
  );
}