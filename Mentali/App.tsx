import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgetPasswordPage from '@/pages/ForgetPasswordPage';
import VerifyCodePage from '@/pages/VerifyCodePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import HomePage from '@/pages/HomePage';
import { SocialProvider } from '@/storage/socialStore';
import { FriendChatScreenContent } from '@/components/chat/FriendChatScreenContent';
import { StreakGuideScreenContent } from '@/components/chat/StreakGuideScreenContent';
import { CheckInChatScreen } from '@/pages/CheckInChatScreen';
import { SummaryScreen } from '@/pages/SummaryScreen';
import { MOODS, PHQ4_QUESTIONS } from '@/data/checkInContent';
import { scorePhq4, scoreK10 } from '@/logic/wellbeing';
import type { RecordedAnswer, StreakState, WellbeingResult } from '@/logic/checkin';
import {
  loginWithEmail,
  registerWithEmail,
  requestResetCode,
  resetPassword,
  saveChatbotSession,
  saveDailyCheckIn,
  verifyResetCode,
} from '@/services/api';

type ScreenState =
  | { screen: 'login' }
  | { screen: 'signup' }
  | { screen: 'forgot-password' }
  | { screen: 'verify-code' }
  | { screen: 'reset-password' }
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
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('email');
  const [recoveryMode, setRecoveryMode] = useState<'phone' | 'email'>('email');
  const [recoveryValue, setRecoveryValue] = useState('');
  const [verifiedResetCode, setVerifiedResetCode] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [homeNav, setHomeNav] = useState('home-outline');
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastCheckInDate: null,
  });

  const openChat = (friendId: string, prefill?: boolean) => {
    setScreenState({ screen: 'chat', friendId, prefill, returnToNav: homeNav });
  };

  const persistCheckInData = async (answers: RecordedAnswer[], selectedMood: typeof MOODS[0]) => {
    if (!currentUserId) return;
    const phq4 = scorePhq4(answers);
    const overall = phq4.band.level === 'calm' ? 'high' : phq4.band.level === 'mild' ? 'moderate' : 'low';

    await Promise.all([
      saveDailyCheckIn({
        userId: currentUserId,
        moodEmoji: selectedMood.emoji,
        moodScore: selectedMood.value,
        checkInDate: new Date().toISOString().slice(0, 10),
        reflectionText: null,
      }),
      saveChatbotSession({
        userId: currentUserId,
        sessionDate: new Date().toISOString(),
        responses: answers.map((a) => ({
          questionId: a.questionId,
          value: a.value,
          scale: a.scale,
        })),
        overallWellbeingLevel: overall,
        generatedInsight: `Mood ${selectedMood.label}, PHQ4 level ${phq4.band.level}`,
      }),
    ]);
  };

  const handleCheckInComplete = (answers: RecordedAnswer[], selectedMood: typeof MOODS[0]) => {
    const phq4 = scorePhq4(answers);
    const k10 = answers.some((a) => a.scale === 'k10') ? scoreK10(answers) : null;
    persistCheckInData(answers, selectedMood).catch(() => {
      // Non-blocking persistence: keep check-in UX responsive even if API is unreachable.
    });

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

  const handleRegister = async (payload: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }) => {
    try {
      const result = await registerWithEmail(payload);
      setCurrentUserId(result?.user?._id ?? null);
      handleAuthSuccess();
    } catch (error) {
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'Unable to register user.');
    }
  };

  const handleLogin = async (payload: { mode: 'phone' | 'email'; identifier: string; password: string }) => {
    if (payload.mode !== 'email') {
      setLoginMode('email');
      Alert.alert('Phone login not connected yet', 'Switched to email login. Sign in with your email and password.');
      return;
    }
    try {
      const result = await loginWithEmail({ identifier: payload.identifier, password: payload.password });
      setCurrentUserId(result?.user?._id ?? null);
      handleAuthSuccess();
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Unable to login.');
    }
  };

  const handleRequestReset = async (payload: { mode: 'phone' | 'email'; value: string }) => {
    try {
      await requestResetCode(payload);
      setRecoveryMode(payload.mode);
      setRecoveryValue(payload.value);
      setScreenState({ screen: 'verify-code' });
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Unable to send code.');
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      await verifyResetCode({
        mode: recoveryMode,
        value: recoveryValue,
        code,
      });
      setVerifiedResetCode(code);
      setScreenState({ screen: 'reset-password' });
    } catch (error) {
      Alert.alert('Invalid code', error instanceof Error ? error.message : 'Unable to verify code.');
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    try {
      await resetPassword({
        mode: recoveryMode,
        value: recoveryValue,
        code: verifiedResetCode,
        newPassword,
      });
      setLoginMode(recoveryMode);
      setRecoveryValue('');
      setVerifiedResetCode('');
      setScreenState({ screen: 'login' });
    } catch (error) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Unable to reset password.');
    }
  };

  return (
    <SafeAreaProvider>
      <SocialProvider>
        {screenState.screen === 'login' ? (
          <LoginPage
            mode={loginMode}
            onToggleMode={() => setLoginMode((current) => (current === 'phone' ? 'email' : 'phone'))}
            onSignupPress={() => setScreenState({ screen: 'signup' })}
            onForgotPasswordPress={() => {
              setRecoveryMode(loginMode);
              setScreenState({ screen: 'forgot-password' });
            }}
            onLoginPress={handleLogin}
            onSocialAuthSuccess={handleAuthSuccess}
          />
        ) : screenState.screen === 'signup' ? (
          <SignupPage
            onBackPress={() => setScreenState({ screen: 'login' })}
            onSignInPress={() => setScreenState({ screen: 'login' })}
            onRegisterPress={handleRegister}
            onSocialAuthSuccess={handleAuthSuccess}
          />
        ) : screenState.screen === 'forgot-password' ? (
          <ForgetPasswordPage
            mode={recoveryMode}
            onToggleMode={() => setRecoveryMode((current) => (current === 'phone' ? 'email' : 'phone'))}
            onNextPress={handleRequestReset}
            onBackPress={() => setScreenState({ screen: 'login' })}
          />
        ) : screenState.screen === 'verify-code' ? (
          <VerifyCodePage
            mode={recoveryMode}
            onNextPress={handleVerifyCode}
            onBackPress={() => setScreenState({ screen: 'forgot-password' })}
          />
        ) : screenState.screen === 'reset-password' ? (
          <ResetPasswordPage
            onDonePress={handleResetPassword}
            onBackPress={() => setScreenState({ screen: 'verify-code' })}
          />
        ) : screenState.screen === 'home' ? (
          <HomePage
            initialSelectedNav={screenState.selectedNav ?? homeNav}
            onSelectedNavChange={setHomeNav}
            onOpenChat={(friend, prefill) => openChat(friend.id, prefill)}
            onOpenCheckIn={() => setScreenState({ screen: 'check-in' })}
            onLogout={() => {
              setCurrentUserId(null);
              setScreenState({ screen: 'login' });
            }}
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
