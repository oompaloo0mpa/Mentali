import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgetPasswordPage from '@/pages/ForgetPasswordPage';
import VerifyCodePage from '@/pages/VerifyCodePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Welcome from '@/pages/Welcome';
import HomePage from '@/pages/HomePage';
import { SocialProvider } from '@/storage/socialStore';
import { SettingsOverlayProvider } from '@/storage/settingsOverlayStore';
import { UserProfileProvider, useUserProfile } from '@/storage/userProfileStore';
import { FriendChatScreenContent } from '@/components/chat/FriendChatScreenContent';
import { StreakGuideScreenContent } from '@/components/chat/StreakGuideScreenContent';
import { CheckInChatScreen } from '@/pages/CheckInChatScreen';
import { SummaryScreen } from '@/pages/SummaryScreen';
import { MOOD_OPTIONS, MOODS } from '@/data/moods';
import { scorePhq4, scoreK10 } from '@/logic/wellbeing';
import {
  EMPTY_PROFILE,
  buildPersonalizedCheckInPlan,
  updateProfileAfterCheckIn,
} from '@/logic/checkinPersonalization';
import { loadCheckInProfile, saveCheckInProfile } from '@/storage/checkInProfileStorage';
import type { MoodOption, RecordedAnswer, StreakState, WellbeingResult } from '@/logic/checkin';
import {
  login,
  loginWithSocial,
  registerWithEmail,
  requestResetCode,
  resetPassword,
  saveChatbotSession,
  saveDailyCheckIn,
  verifyResetCode,
} from '@/services/api';
import type { SocialAuthResult } from '@/hooks/useSocialAuth';

type ScreenState =
  | { screen: 'welcome' }
  | { screen: 'login' }
  | { screen: 'signup' }
  | { screen: 'forgot-password' }
  | { screen: 'verify-code' }
  | { screen: 'reset-password' }
  | { screen: 'home'; selectedNav?: string }
  | { screen: 'chat'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'streak-guide'; friendId: string; prefill?: boolean; returnToNav: string }
  | {
      screen: 'check-in';
      mood?: MoodOption;
      scale: 'phq4' | 'k10';
      returnPhq4?: WellbeingResult;
      returnStreak?: StreakState;
    }
  | {
      screen: 'summary';
      mood: typeof MOODS[0];
      phq4: WellbeingResult;
      k10: WellbeingResult | null;
      streak: StreakState;
    };

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProfileProvider>
        <SocialProvider>
          <AppRoot />
        </SocialProvider>
      </UserProfileProvider>
    </SafeAreaProvider>
  );
}

function AppRoot() {
  const { applyAuthUser, clearProfile } = useUserProfile();
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'welcome' });
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
  const [checkInProfile, setCheckInProfile] = useState(EMPTY_PROFILE);

  useEffect(() => {
    loadCheckInProfile().then(setCheckInProfile);
  }, []);

  const activeCheckInPlan = useMemo(() => {
    if (screenState.screen !== 'check-in') return null;
    const mood = screenState.mood ?? MOOD_OPTIONS[2];
    return buildPersonalizedCheckInPlan(mood, screenState.scale, checkInProfile);
  }, [screenState, checkInProfile]);

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

  const handleCheckInComplete = (answers: RecordedAnswer[], selectedMood: MoodOption) => {
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

    const updatedProfile = updateProfileAfterCheckIn(
      checkInProfile,
      selectedMood,
      answers,
      phq4.band.level,
      phq4.anxietyScore,
      phq4.moodScore,
    );
    setCheckInProfile(updatedProfile);
    saveCheckInProfile(updatedProfile).catch(() => {});

    setScreenState({
      screen: 'summary',
      mood: selectedMood,
      phq4,
      k10,
      streak: newStreak,
    });
  };

  const handleK10Complete = (
    answers: RecordedAnswer[],
    mood: MoodOption,
    phq4: WellbeingResult,
    streakState: StreakState,
  ) => {
    const k10 = scoreK10(answers);
    if (currentUserId) {
      saveChatbotSession({
        userId: currentUserId,
        sessionDate: new Date().toISOString(),
        responses: answers.map((a) => ({
          questionId: a.questionId,
          value: a.value,
          scale: a.scale,
        })),
        overallWellbeingLevel: k10.band.level === 'calm' ? 'high' : k10.band.level === 'mild' ? 'moderate' : 'low',
        generatedInsight: `K10 level ${k10.band.level} after deeper check-in`,
      }).catch(() => {});
    }

    setScreenState({
      screen: 'summary',
      mood,
      phq4,
      k10,
      streak: streakState,
    });
  };

  const handleAuthSuccess = () => {
    setScreenState({ screen: 'home', selectedNav: homeNav });
  };

  const handleSocialAuthSuccess = async (session: SocialAuthResult) => {
    try {
      const result = await loginWithSocial({
        provider: session.provider,
        email: session.email,
        fullName: session.fullName,
        identityToken: session.identityToken,
        authorizationCode: session.authorizationCode,
        accessToken: session.accessToken,
      });
      setCurrentUserId(result?.user?._id ?? null);
      await applyAuthUser(result.user);
      handleAuthSuccess();
    } catch (error) {
      Alert.alert(
        `${session.provider === 'apple' ? 'Apple' : 'Google'} sign-in failed`,
        error instanceof Error ? error.message : 'Unable to complete social sign-in.',
      );
    }
  };

  const handleRegister = async (payload: {
    email: string;
    username: string;
    displayName: string;
    password: string;
    phone: string;
  }) => {
    try {
      const result = await registerWithEmail(payload);
      setCurrentUserId(result?.user?._id ?? null);
      await applyAuthUser(result.user);
      handleAuthSuccess();
    } catch (error) {
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'Unable to register user.');
    }
  };

  const handleLogin = async (payload: { mode: 'phone' | 'email'; identifier: string; password: string }) => {
    try {
      const result = await login({
        mode: payload.mode,
        identifier: payload.identifier,
        password: payload.password,
      });
      setCurrentUserId(result?.user?._id ?? null);
      await applyAuthUser(result.user);
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

  const handleLogout = useCallback(() => {
    clearProfile();
    setCurrentUserId(null);
    setScreenState({ screen: 'welcome' });
  }, [clearProfile]);

  const settingsActions = useMemo(
    () => ({
      onLogout: handleLogout,
      onChangePassword: () => setScreenState({ screen: 'forgot-password' }),
      onOpenWardrobe: () => setScreenState({ screen: 'home', selectedNav: 'shirt-outline' }),
    }),
    [handleLogout],
  );

  return (
    <SettingsOverlayProvider actions={settingsActions}>
      <>
        {screenState.screen === 'welcome' ? (
          <Welcome
            onGetStarted={() => setScreenState({ screen: 'signup' })}
            onAlreadyHaveAccount={() => setScreenState({ screen: 'login' })}
          />
        ) : screenState.screen === 'login' ? (
          <LoginPage
            mode={loginMode}
            onToggleMode={() => setLoginMode((current) => (current === 'phone' ? 'email' : 'phone'))}
            onSignupPress={() => setScreenState({ screen: 'signup' })}
            onForgotPasswordPress={() => {
              setRecoveryMode(loginMode);
              setScreenState({ screen: 'forgot-password' });
            }}
            onLoginPress={handleLogin}
            onSocialAuthSuccess={handleSocialAuthSuccess}
          />
        ) : screenState.screen === 'signup' ? (
          <SignupPage
            onBackPress={() => setScreenState({ screen: 'welcome' })}
            onSignInPress={() => setScreenState({ screen: 'login' })}
            onRegisterPress={handleRegister}
            onSocialAuthSuccess={handleSocialAuthSuccess}
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
            onOpenCheckIn={(mood) => setScreenState({ screen: 'check-in', scale: 'phq4', mood })}
          />
        ) : screenState.screen === 'check-in' ? (
          <CheckInChatScreen
            key={`check-in-${screenState.scale}-${checkInProfile.checkInCount}-${activeCheckInPlan?.focus ?? 'balanced'}`}
            mood={screenState.mood}
            questions={activeCheckInPlan?.questions ?? []}
            sessionPlan={
              activeCheckInPlan
                ? { opener: activeCheckInPlan.opener, focus: activeCheckInPlan.focus }
                : undefined
            }
            headerTitle={screenState.scale === 'k10' ? 'A little longer' : 'Chat'}
            completeLabel="See my summary"
            onBack={() => {
              if (screenState.scale === 'k10' && screenState.returnPhq4 && screenState.returnStreak) {
                setScreenState({
                  screen: 'summary',
                  mood: screenState.mood ?? MOODS[2],
                  phq4: screenState.returnPhq4,
                  k10: null,
                  streak: screenState.returnStreak,
                });
              } else {
                setScreenState({ screen: 'home', selectedNav: homeNav });
              }
            }}
            onComplete={(answers, mood) => {
              if (screenState.scale === 'k10' && screenState.returnPhq4 && screenState.returnStreak) {
                handleK10Complete(answers, mood, screenState.returnPhq4, screenState.returnStreak);
              } else {
                handleCheckInComplete(answers, mood);
              }
            }}
          />
        ) : screenState.screen === 'summary' ? (
          <SummaryScreen
            mood={screenState.mood}
            streak={screenState.streak}
            phq4={screenState.phq4}
            k10={screenState.k10}
            onDeeper={() =>
              setScreenState({
                screen: 'check-in',
                mood: screenState.mood,
                scale: 'k10',
                returnPhq4: screenState.phq4,
                returnStreak: screenState.streak,
              })
            }
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
      </>
    </SettingsOverlayProvider>
  );
}
