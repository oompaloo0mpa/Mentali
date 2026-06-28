import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from './src/pages/LoginPage';
import HomePage from './src/pages/HomePage';
import { SocialProvider } from './src/store/socialStore';
import { FriendChatScreenContent } from './src/components/chat/FriendChatScreenContent';
import { StreakGuideScreenContent } from './src/components/chat/StreakGuideScreenContent';

type ScreenState =
  | { screen: 'login' }
  | { screen: 'home'; selectedNav?: string }
  | { screen: 'chat'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'streak-guide'; friendId: string; prefill?: boolean; returnToNav: string };

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
