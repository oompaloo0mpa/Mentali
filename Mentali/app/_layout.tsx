import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="LeaderboardPage" options={{ title: 'Leaderboard' }} />
    </Stack>
  );
}
