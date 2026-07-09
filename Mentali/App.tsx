import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgetPasswordPage from '@/pages/ForgetPasswordPage';
import VerifyCodePage from '@/pages/VerifyCodePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import Welcome from '@/pages/Welcome';
import OnboardingPage_1 from '@/pages/OnboardingPage_1';
import OnboardingPage_Username from '@/pages/OnboardingPage_Username';
import OnboardingPage_2 from '@/pages/OnboardingPage_2';
import OnboardingPage_3 from '@/pages/OnboardingPage_3';
import OnboardingPage_4 from '@/pages/OnboardingPage_4';
import OnboardingPage_5 from '@/pages/OnboardingPage_5';
import NonAnonymousWarningPage from '@/pages/NonAnonymousWarningPage';
import HomePage from '@/pages/HomePage';
import WardrobePage from '@/pages/WardrobePage';
import ShopPage from '@/pages/ShopPage';
import StatisticPage from '@/pages/StatisticPage';
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
import { loadStreak, saveStreak } from '@/storage/checkInStorage';
import { loadAuthToken } from '@/storage/authStorage';
import type { MoodOption, RecordedAnswer, StreakState, WellbeingResult } from '@/logic/checkin';
import {
  login,
  loginWithSocial,
  registerWithEmail,
  requestResetCode,
  resetPassword,
  saveDailyCheckIn,
  fetchWellbeingHistory,
  verifyResetCode,
  fetchUserProfile,
} from '@/services/api';
import { completeCheckInStreakQuests, completeCheckInSummaryQuests, completeDailyQuestsByTrackKey, completeReflectionCheckInAnswerQuests, completeReflectionCheckInChatQuests, completeWardrobeVisitQuests } from '@/services/dailyQuestProgress';
import { mapDailyCheckInDocs } from '@/services/wellbeingHistory';
import {
  addHistoryRecord,
  saveHistoryRecords,
  saveTodaySnapshot,
} from '@/storage/checkInStorage';
import type { SocialAuthResult } from '@/hooks/useSocialAuth';

type ScreenState =
  | { screen: 'welcome' }
  | { screen: 'login' }
  | { screen: 'signup' }
  | { screen: 'forgot-password' }
  | { screen: 'verify-code' }
  | { screen: 'reset-password' }
  | { screen: 'onboarding-1' }
  | { screen: 'onboarding-username' }
  | { screen: 'onboarding-2' }
  | { screen: 'onboarding-warning' }
  | { screen: 'onboarding-3' }
  | { screen: 'onboarding-4' }
  | { screen: 'onboarding-5' }
  | { screen: 'home'; selectedNav?: string }
  | { screen: 'chat'; friendId: string; prefill?: boolean; returnToNav: string }
  | { screen: 'streak-guide'; friendId: string; prefill?: boolean; returnToNav: string }
  | {
      screen: 'check-in';
      mood?: MoodOption;
    }
  | {
      screen: 'summary';
      mood: typeof MOODS[0];
      phq4: WellbeingResult;
      k10: WellbeingResult | null;
      streak: StreakState;
    }
  | { screen: 'shop' }
  | { screen: 'rewards' }
  | { screen: 'wardrobe'; returnToNav: string };

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
  const {
    applyAuthUser,
    clearProfile,
    completeOnboarding,
    profile,
    hydrated,
    saveDisplayName,
    setAnonymousMode,
    refreshProfileStats,
  } = useUserProfile();
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'welcome' });
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('email');
  const [recoveryMode, setRecoveryMode] = useState<'phone' | 'email'>('email');
  const [recoveryValue, setRecoveryValue] = useState('');
  const [verifiedResetCode, setVerifiedResetCode] = useState('');
  const [passwordResetReturn, setPasswordResetReturn] = useState<'login' | 'home'>('login');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [homeNav, setHomeNav] = useState('home-outline');
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastCheckInDate: null,
  });
  const [checkInProfile, setCheckInProfile] = useState(EMPTY_PROFILE);
  const [onboardingDisplayName, setOnboardingDisplayName] = useState('');
  const [onboardingAnonymous, setOnboardingAnonymous] = useState(true);

  useEffect(() => {
    loadCheckInProfile().then(setCheckInProfile);
    loadStreak().then(setStreak);
    loadAuthToken().catch(() => {});
  }, []);

  const syncWellbeingHistory = useCallback(async (userId: string) => {
    try {
      const docs = await fetchWellbeingHistory(userId);
      const records = mapDailyCheckInDocs(docs);
      if (records.length > 0) {
        await saveHistoryRecords(records);
      }
    } catch {
      // Non-blocking: local history remains available offline.
    }
  }, []);

  const syncUserFromServer = useCallback(async (userId: string) => {
    try {
      const user = await fetchUserProfile(userId);
      if (!user) return;
      const lastDate = user.lastCheckInDate
        ? new Date(user.lastCheckInDate).toISOString().slice(0, 10)
        : null;
      if (user.currentStreak != null) {
        const nextStreak = {
          current: Number(user.currentStreak) || 0,
          longest: Number(user.longestStreak ?? user.currentStreak) || 0,
          lastCheckInDate: lastDate,
        };
        setStreak(nextStreak);
        await saveStreak(nextStreak);
      }
    } catch {
      // Keep local streak when offline.
    }
  }, []);

  const needsOnboarding = (user: { onboardingCompleted?: boolean } | null | undefined, isNewUser = false) =>
    isNewUser || user?.onboardingCompleted === false;

  useEffect(() => {
    if (!hydrated || authBootstrapped) return;

    let active = true;
    (async () => {
      try {
        const token = await loadAuthToken();
        const userId = profile.userId;
        if (!token || !userId) return;

        const user = await fetchUserProfile(userId);
        if (!active || !user) return;

        await applyAuthUser(user, token);
        setCurrentUserId(userId);
        syncUserFromServer(userId).catch(() => {});
        syncWellbeingHistory(userId).catch(() => {});

        if (needsOnboarding(user)) {
          setScreenState({ screen: 'onboarding-1' });
        } else {
          setScreenState({ screen: 'home', selectedNav: homeNav });
        }
      } catch {
        await clearProfile().catch(() => {});
        setCurrentUserId(null);
        setScreenState({ screen: 'welcome' });
      } finally {
        if (active) setAuthBootstrapped(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [
    hydrated,
    authBootstrapped,
    profile.userId,
    applyAuthUser,
    clearProfile,
    homeNav,
    syncUserFromServer,
    syncWellbeingHistory,
  ]);

  useEffect(() => {
    if (hydrated && !profile.userId) {
      setAuthBootstrapped(true);
    }
  }, [hydrated, profile.userId]);

  useEffect(() => {
    if (!currentUserId) return;
    syncWellbeingHistory(currentUserId).catch(() => {});
    syncUserFromServer(currentUserId).catch(() => {});
  }, [currentUserId, syncWellbeingHistory, syncUserFromServer]);

  useEffect(() => {
    if (!currentUserId) return;
    const timer = setInterval(() => {
      syncUserFromServer(currentUserId).catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [currentUserId, syncUserFromServer]);

  useEffect(() => {
    if (screenState.screen !== 'summary') return;
    const userId = currentUserId ?? profile.userId;
    if (!userId) return;
    completeCheckInSummaryQuests(userId)
      .then(() => refreshProfileStats())
      .catch(() => {});
  }, [screenState.screen, currentUserId, profile.userId, refreshProfileStats]);

  useEffect(() => {
    if (screenState.screen !== 'wardrobe') return;
    const userId = currentUserId ?? profile.userId;
    if (!userId) return;
    completeWardrobeVisitQuests(userId)
      .then(() => refreshProfileStats())
      .catch(() => {});
  }, [screenState.screen, currentUserId, profile.userId, refreshProfileStats]);

  const activeCheckInPlan = useMemo(() => {
    if (screenState.screen !== 'check-in') return null;
    const mood = screenState.mood ?? MOOD_OPTIONS[2];
    return buildPersonalizedCheckInPlan(mood, 'unified', checkInProfile);
  }, [screenState, checkInProfile]);

  const openChat = (friendId: string, prefill?: boolean) => {
    setScreenState({ screen: 'chat', friendId, prefill, returnToNav: homeNav });
  };

  const persistCheckInData = async (
    answers: RecordedAnswer[],
    selectedMood: MoodOption,
    phq4: WellbeingResult,
    k10: WellbeingResult | null,
  ) => {
    if (!currentUserId && !profile.userId) return null;
    const userId = currentUserId ?? profile.userId;
    if (!userId) return null;
    const checkInDate = new Date().toISOString().slice(0, 10);

    return saveDailyCheckIn({
      userId,
      moodId: selectedMood.id,
      moodEmoji: selectedMood.emoji,
      moodScore: selectedMood.value,
      checkInDate,
      reflectionText: null,
      phq4: {
        total: phq4.total,
        anxietyScore: phq4.anxietyScore ?? 0,
        moodScore: phq4.moodScore ?? 0,
        band: phq4.band.level,
        suggestSupport: phq4.suggestSupport,
        answeredCount: phq4.answeredCount,
        itemCount: phq4.itemCount,
      },
      k10: k10
        ? {
            total: k10.total,
            band: k10.band.level,
            suggestSupport: k10.suggestSupport,
            answeredCount: k10.answeredCount,
            itemCount: k10.itemCount,
          }
        : null,
      responses: answers.map((answer) => ({
        questionId: answer.questionId,
        scale: answer.scale,
        dimension: answer.dimension,
        value: answer.value,
        label: answer.label,
        skipped: answer.skipped,
        confidence: answer.confidence,
        source: answer.source,
      })),
    });
  };

  const handleCheckInComplete = (answers: RecordedAnswer[], selectedMood: MoodOption) => {
    const phq4 = scorePhq4(answers);
    const k10 = answers.some((a) => a.scale === 'k10') ? scoreK10(answers) : null;
    const today = new Date().toISOString().split('T')[0];

    persistCheckInData(answers, selectedMood, phq4, k10)
      .then((result) => {
        if (result?.streak) {
          const serverStreak = {
            current: Number(result.streak.current) || 0,
            longest: Number(result.streak.longest) || 0,
            lastCheckInDate: today,
          };
          setStreak(serverStreak);
          saveStreak(serverStreak).catch(() => {});
        }
        const userId = currentUserId ?? profile.userId;
        if (userId) {
          const questKeys: string[] = ['checkin.complete'];
          if (answers.some((a) => !a.skipped)) {
            questKeys.push('reflection.checkin_answer');
          }
          completeDailyQuestsByTrackKey(userId, questKeys)
            .then(() => refreshProfileStats())
            .catch(() => {});
        }
      })
      .catch(() => {
        // Non-blocking persistence: keep check-in UX responsive even if API is unreachable.
      });

    addHistoryRecord({
      date: today,
      moodId: selectedMood.id,
      moodValue: selectedMood.value,
      phq4Total: phq4.total,
      band: phq4.band.level,
      k10Total: k10?.total,
    }).catch(() => {});

    saveTodaySnapshot({
      date: today,
      mood: selectedMood,
      phq4,
      k10,
    }).catch(() => {});

    // Update streak
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
    saveStreak(newStreak).catch(() => {});

    const userId = currentUserId ?? profile.userId;
    if (userId && newStreak.current > 1) {
      completeCheckInStreakQuests(userId)
        .then(() => refreshProfileStats())
        .catch(() => {});
    }

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

  const handleAuthSuccess = () => {
    setScreenState({ screen: 'home', selectedNav: homeNav });
  };

  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding({
        displayName: onboardingDisplayName,
        anonymousMode: onboardingAnonymous,
      });
      handleAuthSuccess();
    } catch (error) {
      Alert.alert(
        'Could not finish setup',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
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
      await applyAuthUser(result.user, result.token);
      syncUserFromServer(result?.user?._id).catch(() => {});
      if (needsOnboarding(result.user, !!result.isNewUser)) {
        setScreenState({ screen: 'onboarding-1' });
        return;
      }
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
      await applyAuthUser(result.user, result.token);
      setScreenState({ screen: 'onboarding-1' });
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
      await applyAuthUser(result.user, result.token);
      syncUserFromServer(result?.user?._id).catch(() => {});
      if (needsOnboarding(result.user)) {
        setScreenState({ screen: 'onboarding-1' });
        return;
      }
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
      onResetPassword: () => {
        setPasswordResetReturn('home');
        setRecoveryMode('email');
        setScreenState({ screen: 'forgot-password' });
      },
      onOpenWardrobe: () => {
        setScreenState({ screen: 'wardrobe', returnToNav: homeNav });
      },
    }),
    [handleLogout, homeNav],
  );

  if (!authBootstrapped) {
    return null;
  }

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
              setPasswordResetReturn('login');
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
            onBackPress={() =>
              setScreenState(
                passwordResetReturn === 'home'
                  ? { screen: 'home', selectedNav: homeNav }
                  : { screen: 'login' },
              )
            }
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
        ) : screenState.screen === 'onboarding-1' ? (
          <OnboardingPage_1 onContinue={() => setScreenState({ screen: 'onboarding-username' })} />
        ) : screenState.screen === 'onboarding-username' ? (
          <OnboardingPage_Username
            onContinue={async (displayName) => {
              setOnboardingDisplayName(displayName);
              try {
                await saveDisplayName(displayName);
                setScreenState({ screen: 'onboarding-2' });
              } catch (error) {
                Alert.alert(
                  'Could not save display name',
                  error instanceof Error ? error.message : 'Please try again.',
                );
              }
            }}
            onBack={() => setScreenState({ screen: 'onboarding-1' })}
          />
        ) : screenState.screen === 'onboarding-2' ? (
          <OnboardingPage_2
            onContinue={async (isAnonymous) => {
              setOnboardingAnonymous(isAnonymous);
              try {
                await setAnonymousMode(isAnonymous);
                setScreenState({ screen: isAnonymous ? 'onboarding-3' : 'onboarding-warning' });
              } catch (error) {
                Alert.alert(
                  'Could not save preference',
                  error instanceof Error ? error.message : 'Please try again.',
                );
              }
            }}
            onBack={() => setScreenState({ screen: 'onboarding-username' })}
          />
        ) : screenState.screen === 'onboarding-warning' ? (
          <NonAnonymousWarningPage
            onConfirm={() => setScreenState({ screen: 'onboarding-3' })}
            onCancel={() => setScreenState({ screen: 'onboarding-2' })}
          />
        ) : screenState.screen === 'onboarding-3' ? (
          <OnboardingPage_3
            onContinue={() => setScreenState({ screen: 'onboarding-4' })}
            onBack={() => setScreenState({ screen: 'onboarding-2' })}
          />
        ) : screenState.screen === 'onboarding-4' ? (
          <OnboardingPage_4
            onContinue={() => setScreenState({ screen: 'onboarding-5' })}
            onBack={() => setScreenState({ screen: 'onboarding-3' })}
          />
        ) : screenState.screen === 'onboarding-5' ? (
          <OnboardingPage_5
            onContinue={handleOnboardingComplete}
            onBack={() => setScreenState({ screen: 'onboarding-4' })}
          />
        ) : screenState.screen === 'home' ? (
          <HomePage
            initialSelectedNav={screenState.selectedNav ?? homeNav}
            onSelectedNavChange={setHomeNav}
            checkInStreak={streak.current}
            userPoints={profile.points}
            userTier={profile.currentTier}
            onOpenChat={(friend, prefill) => openChat(friend.id, prefill)}
            onOpenCheckIn={(mood) => setScreenState({ screen: 'check-in', mood })}
            onOpenWardrobe={() => setScreenState({ screen: 'wardrobe', returnToNav: homeNav })}
            onOpenShop={() => setScreenState({ screen: 'shop' })}
            onOpenRewards={() => setScreenState({ screen: 'rewards' })}
          />
        ) : screenState.screen === 'shop' ? (
          <ShopPage />
        ) : screenState.screen === 'rewards' ? (
          <StatisticPage />
        ) : screenState.screen === 'wardrobe' ? (
          <WardrobePage
            onNavigate={(navItem) => {
              if (navItem === 'shirt-outline') return;
              if (navItem === 'bag-outline') {
                setScreenState({ screen: 'shop' });
                return;
              }
              if (navItem === 'trophy-outline') {
                setScreenState({ screen: 'rewards' });
                return;
              }
              setScreenState({ screen: 'home', selectedNav: navItem });
            }}
          />
        ) : screenState.screen === 'check-in' ? (
          <CheckInChatScreen
            key={`check-in-${checkInProfile.checkInCount}-${activeCheckInPlan?.focus ?? 'balanced'}`}
            mood={screenState.mood}
            questions={activeCheckInPlan?.questions ?? []}
            sessionPlan={
              activeCheckInPlan
                ? {
                    opener: activeCheckInPlan.opener,
                    focus: activeCheckInPlan.focus,
                    displayName: profile.displayName,
                  }
                : undefined
            }
            headerTitle="Wellbeing chat"
            completeLabel="See my summary"
            onBack={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
            onComplete={(answers, mood) => handleCheckInComplete(answers, mood)}
            onUserMessage={() => {
              const userId = currentUserId ?? profile.userId;
              if (!userId) return;
              completeReflectionCheckInChatQuests(userId)
                .then(() => refreshProfileStats())
                .catch(() => {});
            }}
          />
        ) : screenState.screen === 'summary' ? (
          <SummaryScreen
            mood={screenState.mood}
            streak={screenState.streak}
            phq4={screenState.phq4}
            k10={screenState.k10}
            onDone={() => setScreenState({ screen: 'home', selectedNav: homeNav })}
            onOpenFriends={() => setScreenState({ screen: 'home', selectedNav: 'people-outline' })}
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
