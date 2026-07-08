import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CURRENT_USER } from '@/data/mockData';
import type { ColorThemeId } from '@/data/colorThemes';
import { fetchUserPreferences, fetchUserProfile, updateUserPreferences, updateUserProfile } from '@/services/api';
import { clearAuthToken, saveAuthToken } from '@/storage/authStorage';

const STORAGE_KEY = 'mentali.user.profile.v1';

export type UserProfile = {
  userId: string | null;
  username: string;
  displayName: string;
  friendCode: string;
  points: number;
  currentTier: string;
  /** Current mood chosen on homepage; shared across profile and friends visibility. */
  currentMoodId: string;
  currentMoodEmoji: string;
  anonymousMode: boolean;
  hideMoodFromFriends: boolean;
  allowFriendRequests: boolean;
  allowNotifications: boolean;
  colorTheme: ColorThemeId;
};

const DEFAULT_PROFILE: UserProfile = {
  userId: null,
  username: CURRENT_USER.name.toLowerCase(),
  displayName: CURRENT_USER.name,
  friendCode: CURRENT_USER.friendCode,
  points: 0,
  currentTier: 'Bronze',
  currentMoodId: 'okay',
  currentMoodEmoji: '😐',
  anonymousMode: false,
  hideMoodFromFriends: false,
  allowFriendRequests: true,
  allowNotifications: true,
  colorTheme: 'pastel',
};

type PreferenceKey =
  | 'anonymousMode'
  | 'hideMoodFromFriends'
  | 'allowFriendRequests'
  | 'allowNotifications';

type UserProfileContextValue = {
  profile: UserProfile;
  hydrated: boolean;
  saveDisplayName: (displayName: string) => Promise<void>;
  setCurrentMood: (mood: { id: string; emoji: string }) => void;
  setAnonymousMode: (enabled: boolean) => Promise<void>;
  setHideMoodFromFriends: (enabled: boolean) => Promise<void>;
  setAllowFriendRequests: (enabled: boolean) => Promise<void>;
  setAllowNotifications: (enabled: boolean) => Promise<void>;
  setColorTheme: (theme: ColorThemeId) => void;
  completeOnboarding: (payload: { displayName?: string; anonymousMode: boolean }) => Promise<void>;
  applyAuthUser: (user: {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    friendCode?: string;
    points?: number;
    currentTier?: string;
  }, token?: string | null) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

function prefsFromApi(prefs: Record<string, unknown> | null | undefined): Pick<
  UserProfile,
  | 'anonymousMode'
  | 'hideMoodFromFriends'
  | 'allowFriendRequests'
  | 'allowNotifications'
  | 'colorTheme'
  | 'currentMoodId'
  | 'currentMoodEmoji'
> {
  const theme = prefs?.theme;
  const colorTheme: ColorThemeId =
    theme === 'midnight' || theme === 'blossom' || theme === 'pastel' ? theme : 'pastel';

  return {
    anonymousMode: !!prefs?.anonymousMode,
    hideMoodFromFriends: prefs?.showMoodToFriends === undefined ? false : !prefs.showMoodToFriends,
    allowFriendRequests: prefs?.allowFriendRequests !== false,
    allowNotifications:
      prefs?.leaderboardNotifications !== false &&
      prefs?.encouragementNotifications !== false &&
      prefs?.dailyReminderEnabled !== false,
    colorTheme,
    currentMoodId: typeof prefs?.currentMoodId === 'string' ? prefs.currentMoodId : DEFAULT_PROFILE.currentMoodId,
    currentMoodEmoji:
      typeof prefs?.currentMoodEmoji === 'string' ? prefs.currentMoodEmoji : DEFAULT_PROFILE.currentMoodEmoji,
  };
}

function prefsToApi(key: PreferenceKey, value: boolean): Record<string, boolean> {
  switch (key) {
    case 'anonymousMode':
      return { anonymousMode: value };
    case 'hideMoodFromFriends':
      return { showMoodToFriends: !value };
    case 'allowFriendRequests':
      return { allowFriendRequests: value };
    case 'allowNotifications':
      return {
        leaderboardNotifications: value,
        encouragementNotifications: value,
        dailyReminderEnabled: value,
      };
    default:
      return {};
  }
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          setProfile({ ...DEFAULT_PROFILE, ...(JSON.parse(raw) as UserProfile) });
        }
      } catch {
        // Ignore corrupt storage.
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
  }, [profile, hydrated]);

  const applyAuthUser = useCallback(
    async (
      user: {
        _id?: string;
        id?: string;
        username?: string;
        displayName?: string;
        friendCode?: string;
        points?: number;
        currentTier?: string;
      },
      token?: string | null,
    ) => {
      const userId = user._id ?? user.id ?? null;
      if (token) await saveAuthToken(token);

      let loadedPrefs = {
        anonymousMode: false,
        hideMoodFromFriends: false,
        allowFriendRequests: true,
        allowNotifications: true,
        colorTheme: 'pastel' as ColorThemeId,
        currentMoodId: DEFAULT_PROFILE.currentMoodId,
        currentMoodEmoji: DEFAULT_PROFILE.currentMoodEmoji,
      };
      let points = user.points ?? 0;
      let currentTier = user.currentTier ?? 'Bronze';

      if (userId) {
        try {
          const [prefs, remoteUser] = await Promise.all([
            fetchUserPreferences(userId),
            fetchUserProfile(userId),
          ]);
          loadedPrefs = { ...loadedPrefs, ...prefsFromApi(prefs) };
          if (remoteUser) {
            points = Number(remoteUser.points ?? points);
            currentTier = String(remoteUser.currentTier ?? currentTier);
          }
        } catch {
          // Offline or API unavailable — keep local default.
        }
      }

      setProfile((prev) => ({
        ...prev,
        userId,
        username: user.username ?? prev.username,
        displayName: user.displayName ?? prev.displayName,
        friendCode: user.friendCode ?? prev.friendCode,
        points,
        currentTier,
        ...loadedPrefs,
      }));
    },
    [],
  );

  const saveDisplayName = useCallback(async (displayName: string) => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('Display name is required');
    }

    let userId: string | null = null;
    setProfile((prev) => {
      userId = prev.userId;
      return { ...prev, displayName: trimmed };
    });

    if (userId) {
      await updateUserProfile(userId, { displayName: trimmed });
    }
  }, []);

  const setPreference = useCallback(async (key: PreferenceKey, enabled: boolean) => {
    let userId: string | null = null;
    let previousValue = !enabled;
    setProfile((prev) => {
      userId = prev.userId;
      previousValue = prev[key] as boolean;
      return { ...prev, [key]: enabled };
    });

    if (!userId) return;

    try {
      await updateUserPreferences(userId, prefsToApi(key, enabled));
    } catch (error) {
      setProfile((prev) => ({ ...prev, [key]: previousValue }));
      throw error;
    }
  }, []);

  const completeOnboarding = useCallback(
    async (payload: { displayName?: string; anonymousMode: boolean }) => {
      let userId: string | null = null;
      setProfile((prev) => {
        userId = prev.userId;
        return prev;
      });

      if (payload.displayName?.trim()) {
        await saveDisplayName(payload.displayName);
      }
      await setPreference('anonymousMode', payload.anonymousMode);
      if (userId) {
        await updateUserProfile(userId, { onboardingCompleted: true });
      }
    },
    [saveDisplayName, setPreference],
  );

  const setCurrentMood = useCallback((mood: { id: string; emoji: string }) => {
    let userId: string | null = null;
    setProfile((prev) => {
      userId = prev.userId;
      return { ...prev, currentMoodId: mood.id, currentMoodEmoji: mood.emoji };
    });
    if (userId) {
      updateUserPreferences(userId, {
        currentMoodId: mood.id,
        currentMoodEmoji: mood.emoji,
      }).catch(() => {});
    }
  }, []);

  const setAnonymousMode = useCallback(
    (enabled: boolean) => setPreference('anonymousMode', enabled),
    [setPreference],
  );
  const setHideMoodFromFriends = useCallback(
    (enabled: boolean) => setPreference('hideMoodFromFriends', enabled),
    [setPreference],
  );
  const setAllowFriendRequests = useCallback(
    (enabled: boolean) => setPreference('allowFriendRequests', enabled),
    [setPreference],
  );
  const setAllowNotifications = useCallback(
    (enabled: boolean) => setPreference('allowNotifications', enabled),
    [setPreference],
  );

  const setColorTheme = useCallback((theme: ColorThemeId) => {
    let userId: string | null = null;
    setProfile((prev) => {
      userId = prev.userId;
      return { ...prev, colorTheme: theme };
    });
    if (userId) {
      updateUserPreferences(userId, { theme }).catch(() => {});
    }
  }, []);

  const clearProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {}),
      clearAuthToken(),
    ]);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      saveDisplayName,
      setAnonymousMode,
      setCurrentMood,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
      completeOnboarding,
      applyAuthUser,
      clearProfile,
    }),
    [
      profile,
      hydrated,
      saveDisplayName,
      setAnonymousMode,
      setCurrentMood,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
      completeOnboarding,
      applyAuthUser,
      clearProfile,
    ],
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}
