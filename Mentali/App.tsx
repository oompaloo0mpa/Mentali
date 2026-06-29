import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgetPasswordPage from '@/pages/ForgetPasswordPage';
import HomePage from '@/pages/HomePage';
import { SocialProvider } from '@/storage/socialStore';
import { FriendChatScreenContent } from '@/components/chat/FriendChatScreenContent';
import { StreakGuideScreenContent } from '@/components/chat/StreakGuideScreenContent';
import { CheckInChatScreen } from '@/pages/CheckInChatScreen';
import { SummaryScreen } from '@/pages/SummaryScreen';
import { MOODS, PHQ4_QUESTIONS } from '@/data/checkInContent';
import { scorePhq4, scoreK10 } from '@/logic/wellbeing';
import type { RecordedAnswer, StreakState, WellbeingResult } from '@/logic/checkin';

type ScreenState =
  | { screen: 'login' }
  | { screen: 'signup' }
  | { screen: 'forgot-password' }
  | { screen: 'home'; selectedNav?: string }
  | { screen: 'chat'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'streak-guide'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'check-in' }
  | {
      screen: 'summary';
      mood: typeof MOODS[0];
      phq4: WellbeingResult;
      k10: WellbeingResult | null;
      streak: StreakState;
    };

export default function App() {
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'login' });
  const [homeNav, setHomeNav] = useState('home-outline');
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastCheckInDate: null,
  });

  const openChat = (friendId: string, prefill?: boolean) => {
    setScreenState({ screen: 'chat', friendId, prefill, returnToNav: homeNav });
  };

  const handleCheckInComplete = (answers: RecordedAnswer[], selectedMood: typeof MOODS[0]) => {
    const phq4 = scorePhq4(answers);
    const k10 = answers.some((a) => a.scale === 'k10') ? scoreK10(answers) : null;

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const newStreak = { ...streak };
    if (streak.lastCheckInDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streak.lastCheckInDate === yesterdayStr) {
        newStreak.current = (streak.current || 0) + 1;
        newStreak.longest = Math.max(newStreak.current, streak.longest || 0);
      } else {
        newStreak.current = 1;
        newStreak.longest = Math.max(1, streak.longest || 0);
      }
    }
    newStreak.lastCheckInDate = today;
    setStreak(newStreak);

    setScreenState({
      screen: 'summary',
      mood: selectedMood,
      phq4,
      k10,
      streak: newStreak,
    });
  };

  const handleAuthSuccess = () => {
    setScreenState({ screen: 'home', selectedNav: homeNav });
  };

  return (
    <SafeAreaProvider>
      <SocialProvider>
        {screenState.screen === 'login' ? (
          <LoginPage
            mode="phone"
            onToggleMode={() => {}}
            onSignupPress={() => setScreenState({ screen: 'signup' })}
            onForgotPasswordPress={() => setScreenState({ screen: 'forgot-password' })}
            onLoginPress={handleAuthSuccess}
            onSocialAuthSuccess={handleAuthSuccess}
          />
        ) : screenState.screen === 'signup' ? (
          <SignupPage
            onBackPress={() => setScreenState({ screen: 'login' })}
            onSignInPress={() => setScreenState({ screen: 'login' })}
            onRegisterPress={handleAuthSuccess}
            onSocialAuthSuccess={handleAuthSuccess}
          />
        ) : screenState.screen === 'forgot-password' ? (
          <ForgetPasswordPage
            mode="phone"
            onToggleMode={() => {}}
            onNextPress={() => setScreenState({ screen: 'login' })}
            onBackPress={() => setScreenState({ screen: 'login' })}
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
            onComplete={(answers) => handleCheckInComplete(answers, MOODS[2])}
          />
        ) : screenState.screen === 'summary' ? (
          <SummaryScreen
            mood={screenState.mood}
            streak={screenState.streak}
            phq4={screenState.phq4}
            k10={screenState.k10}
            onDeeper={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
            onDone={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
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
