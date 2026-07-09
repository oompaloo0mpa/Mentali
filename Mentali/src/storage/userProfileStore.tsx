import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CURRENT_USER } from '@/data/mockData';
import type { ColorThemeId } from '@/data/colorThemes';
import { getDisplayNameChangeAvailability } from '@/logic/displayName';
import { completeMoodQuests, completeThemeChangeQuests } from '@/services/dailyQuestProgress';
import { fetchUserPreferences, fetchUserProfile, updateUserPreferences, updateUserProfile } from '@/services/api';
import { clearAuthToken, saveAuthToken } from '@/storage/authStorage';

const STORAGE_KEY = 'mentali.user.profile.v1';

export type UserProfile = {
  userId: string | null;
  username: string;
  displayName: string;
  displayNameChangedAt: string | null;
  friendCode: string;
  points: number;
  currentTier: string;
  longestStreak: number;
  /** Current mood chosen on homepage; shared across profile and friends visibility. */
  currentMoodId: string;
  currentMoodEmoji: string;
  wardrobe: WardrobeSelection;
  anonymousMode: boolean;
  hideMoodFromFriends: boolean;
  allowFriendRequests: boolean;
  allowNotifications: boolean;
  colorTheme: ColorThemeId;
};

type PreferenceKey =
  | 'anonymousMode'
  | 'hideMoodFromFriends'
  | 'allowFriendRequests'
  | 'allowNotifications';

export type WardrobeSlot = 'accessory' | 'hair' | 'hat' | 'face';

export type WardrobeSelection = {
  accessory: 'necklace' | null;
  hair: 'ponytail' | 'wavvyhair' | null;
  hat: 'fedora' | null;
  face: 'cuteFace' | 'shockedFace' | null;
};

const DEFAULT_WARDROBE: WardrobeSelection = {
  accessory: null,
  hair: null,
  hat: null,
  face: null,
};

const DEFAULT_PROFILE: UserProfile = {
  userId: null,
  username: CURRENT_USER.name.toLowerCase(),
  displayName: CURRENT_USER.name,
  displayNameChangedAt: null,
  friendCode: CURRENT_USER.friendCode,
  points: 0,
  currentTier: 'Bronze',
  longestStreak: 0,
  currentMoodId: 'okay',
  currentMoodEmoji: '😐',
  wardrobe: DEFAULT_WARDROBE,
  anonymousMode: false,
  hideMoodFromFriends: false,
  allowFriendRequests: true,
  allowNotifications: true,
  colorTheme: 'pastel',
};

function normalizeWardrobe(value: Partial<WardrobeSelection> | null | undefined): WardrobeSelection {
  return {
    accessory: value?.accessory === 'necklace' ? value.accessory : null,
    hair: value?.hair === 'ponytail' || value?.hair === 'wavvyhair' ? value.hair : null,
    hat: value?.hat === 'fedora' ? value.hat : null,
    face: value?.face === 'cuteFace' || value?.face === 'shockedFace' ? value.face : null,
  };
}

type UserProfileContextValue = {
  profile: UserProfile;
  hydrated: boolean;
  saveDisplayName: (displayName: string) => Promise<void>;
  changeDisplayName: (displayName: string) => Promise<void>;
  getDisplayNameChangeStatus: () => { allowed: boolean; daysRemaining: number };
  setCurrentMood: (mood: { id: string; emoji: string }) => void;
  setAnonymousMode: (enabled: boolean) => Promise<void>;
  setHideMoodFromFriends: (enabled: boolean) => Promise<void>;
  setAllowFriendRequests: (enabled: boolean) => Promise<void>;
  setAllowNotifications: (enabled: boolean) => Promise<void>;
  setWardrobeItem: (slot: WardrobeSlot, itemId: WardrobeSelection[WardrobeSlot]) => void;
  clearWardrobe: () => void;
  setColorTheme: (theme: ColorThemeId) => void;
  completeOnboarding: (payload: { displayName?: string; anonymousMode: boolean }) => Promise<void>;
  refreshProfileStats: () => Promise<void>;
  applyAuthUser: (user: {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    displayNameChangedAt?: string | Date | null;
    friendCode?: string;
    points?: number;
    currentTier?: string;
  }, token?: string | null) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

function parseDisplayNameChangedAt(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return null;
}

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
          const parsed = JSON.parse(raw) as Partial<UserProfile>;
          setProfile({
            ...DEFAULT_PROFILE,
            ...parsed,
            wardrobe: normalizeWardrobe(parsed.wardrobe),
          });
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
        displayNameChangedAt?: string | Date | null;
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
      let longestStreak = Number(user.longestStreak ?? 0);
      let displayNameChangedAt: string | null = parseDisplayNameChangedAt(user.displayNameChangedAt);

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
            longestStreak = Number(remoteUser.longestStreak ?? longestStreak);
            displayNameChangedAt = parseDisplayNameChangedAt(remoteUser.displayNameChangedAt);
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
        displayNameChangedAt,
        friendCode: user.friendCode ?? prev.friendCode,
        points,
        currentTier,
        longestStreak,
        ...loadedPrefs,
      }));
    },
    [],
  );

  const persistDisplayName = useCallback(async (displayName: string, enforceCooldown: boolean) => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('Display name is required');
    }

    let userId: string | null = null;
    let changedAt: string | null = null;
    let currentDisplayName = '';

    setProfile((prev) => {
      userId = prev.userId;
      changedAt = prev.displayNameChangedAt;
      currentDisplayName = prev.displayName;
      return prev;
    });

    if (enforceCooldown) {
      const status = getDisplayNameChangeAvailability(changedAt);
      if (!status.allowed) {
        throw new Error(`You can change your display name again in ${status.daysRemaining} day(s).`);
      }
      if (trimmed === currentDisplayName.trim()) {
        throw new Error('That is already your display name.');
      }
    }

    if (!userId) {
      setProfile((prev) => ({ ...prev, displayName: trimmed }));
      return;
    }

    const updated = await updateUserProfile(userId, { displayName: trimmed });
    setProfile((prev) => ({
      ...prev,
      displayName: String(updated?.displayName ?? trimmed),
      displayNameChangedAt:
        parseDisplayNameChangedAt(updated?.displayNameChangedAt) ?? prev.displayNameChangedAt,
    }));
  }, []);

  const saveDisplayName = useCallback(
    (displayName: string) => persistDisplayName(displayName, false),
    [persistDisplayName],
  );

  const changeDisplayName = useCallback(
    (displayName: string) => persistDisplayName(displayName, true),
    [persistDisplayName],
  );

  const getDisplayNameChangeStatus = useCallback(
    () => getDisplayNameChangeAvailability(profile.displayNameChangedAt),
    [profile.displayNameChangedAt],
  );

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

  const refreshProfileStats = useCallback(async () => {
    let userId: string | null = null;
    setProfile((prev) => {
      userId = prev.userId;
      return prev;
    });
    if (!userId) return;

    const remoteUser = await fetchUserProfile(userId);
    if (!remoteUser) return;

    setProfile((prev) => ({
      ...prev,
      points: Number(remoteUser.points ?? prev.points),
      currentTier: String(remoteUser.currentTier ?? prev.currentTier),
      longestStreak: Number(remoteUser.longestStreak ?? prev.longestStreak),
    }));
  }, []);

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
      completeMoodQuests(userId)
        .then(() => refreshProfileStats())
        .catch(() => {});
    }
  }, [refreshProfileStats]);

  const setWardrobeItem = useCallback((slot: WardrobeSlot, itemId: WardrobeSelection[WardrobeSlot]) => {
    setProfile((prev) => ({
      ...prev,
      wardrobe: {
        ...normalizeWardrobe(prev.wardrobe),
        [slot]: itemId,
      },
    }));
  }, []);

  const clearWardrobe = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      wardrobe: DEFAULT_WARDROBE,
    }));
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
      completeThemeChangeQuests(userId)
        .then(() => refreshProfileStats())
        .catch(() => {});
    }
  }, [refreshProfileStats]);

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
      changeDisplayName,
      getDisplayNameChangeStatus,
      setAnonymousMode,
      setCurrentMood,
      setWardrobeItem,
      clearWardrobe,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
      completeOnboarding,
      refreshProfileStats,
      applyAuthUser,
      clearProfile,
    }),
    [
      profile,
      hydrated,
      saveDisplayName,
      changeDisplayName,
      getDisplayNameChangeStatus,
      setAnonymousMode,
      setCurrentMood,
      setWardrobeItem,
      clearWardrobe,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
      completeOnboarding,
      refreshProfileStats,
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
