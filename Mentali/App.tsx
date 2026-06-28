import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import { SocialProvider } from '@/storage/socialStore';
import { FriendChatScreenContent } from '@/components/chat/FriendChatScreenContent';
import { StreakGuideScreenContent } from '@/components/chat/StreakGuideScreenContent';
import { CheckInChatScreen } from '@/pages/CheckInChatScreen';
import { MOODS, PHQ4_QUESTIONS } from '@/data/checkInContent';

type ScreenState =
  | { screen: 'login' }
  | { screen: 'home'; selectedNav?: string }
  | { screen: 'chat'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'streak-guide'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'check-in' };

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'login' });
  const [homeNav, setHomeNav] = useState('home-outline');

  const openChat = (friendId: string, prefill?: boolean) => {
    setScreenState({ screen: 'chat', friendId, prefill, returnToNav: homeNav });
  };

  return (
    <SafeAreaProvider>
      <SocialProvider>
        {screenState.screen === 'login' ? (
          <LoginPage
            mode="phone"
            onToggleMode={() => {}}
            onSignupPress={() => {}}
            onForgotPasswordPress={() => {}}
            onLoginPress={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
            onSocialAuthSuccess={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
          />
        ) : screenState.screen === 'home' ? (
          <HomePage
            initialSelectedNav={screenState.selectedNav ?? homeNav}
            onSelectedNavChange={setHomeNav}
            onOpenChat={(friend, prefill) => openChat(friend.id, prefill)}
            onOpenCheckIn={() => setScreenState({ screen: 'check-in' })}
          />
        ) : screenState.screen === 'check-in' ? (
          <CheckInChatScreen
            mood={MOODS[2]}
            questions={PHQ4_QUESTIONS}
            headerTitle="Check-in"
            completeLabel="Complete"
            onBack={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
            onComplete={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
          />
        ) : screenState.screen === 'chat' ? (
          <FriendChatScreenContent
            friendId={screenState.friendId}
            prefill={screenState.prefill ? '1' : undefined}
            onBack={() => setScreenState({ screen: 'home', selectedNav: screenState.returnToNav })}
            onOpenStreakGuide={() =>
              setScreenState({
                screen: 'streak-guide',
                friendId: screenState.friendId,
                prefill: screenState.prefill,
                returnToNav: screenState.returnToNav,
              })
            }
          />
        ) : (
          <StreakGuideScreenContent
            onClose={() =>
              setScreenState({
                screen: 'chat',
                friendId: screenState.friendId,
                prefill: screenState.prefill,
                returnToNav: screenState.returnToNav,
              })
            }
          />
        )}
      </SocialProvider>
    </SafeAreaProvider>
  );
}
