import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CURRENT_USER } from '@/data/mockData';
import type { ColorThemeId } from '@/data/colorThemes';
import { fetchUserPreferences, updateUserPreferences } from '@/services/api';

const STORAGE_KEY = 'mentali.user.profile.v1';

export type UserProfile = {
  userId: string | null;
  username: string;
  displayName: string;
  friendCode: string;
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
  friendCode: CURRENT_USER.friendCode,
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
  setCurrentMood: (mood: { id: string; emoji: string }) => void;
  setWardrobeItem: (slot: WardrobeSlot, itemId: WardrobeSelection[WardrobeSlot]) => void;
  clearWardrobe: () => void;
  setAnonymousMode: (enabled: boolean) => void;
  setHideMoodFromFriends: (enabled: boolean) => void;
  setAllowFriendRequests: (enabled: boolean) => void;
  setAllowNotifications: (enabled: boolean) => void;
  setColorTheme: (theme: ColorThemeId) => void;
  applyAuthUser: (user: {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    friendCode?: string;
  }) => Promise<void>;
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
    allowNotifications: prefs?.leaderboardNotifications !== false,
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
      return { leaderboardNotifications: value, encouragementNotifications: value };
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
    async (user: {
      _id?: string;
      id?: string;
      username?: string;
      displayName?: string;
      friendCode?: string;
    }) => {
      const userId = user._id ?? user.id ?? null;
      let loadedPrefs = {
        anonymousMode: false,
        hideMoodFromFriends: false,
        allowFriendRequests: true,
        allowNotifications: true,
        colorTheme: 'pastel' as ColorThemeId,
      };

      if (userId) {
        try {
          const prefs = await fetchUserPreferences(userId);
          loadedPrefs = prefsFromApi(prefs);
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
        ...loadedPrefs,
      }));
    },
    [],
  );

  const setPreference = useCallback((key: PreferenceKey, enabled: boolean) => {
    setProfile((prev) => {
      if (prev.userId) {
        updateUserPreferences(prev.userId, prefsToApi(key, enabled)).catch(() => {});
      }
      return { ...prev, [key]: enabled };
    });
  }, []);

  const setCurrentMood = useCallback((mood: { id: string; emoji: string }) => {
    setProfile((prev) => {
      if (prev.userId) {
        updateUserPreferences(prev.userId, {
          currentMoodId: mood.id,
          currentMoodEmoji: mood.emoji,
        }).catch(() => {});
      }
      return { ...prev, currentMoodId: mood.id, currentMoodEmoji: mood.emoji };
    });
  }, []);

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
    setProfile((prev) => {
      if (prev.userId) {
        updateUserPreferences(prev.userId, { theme }).catch(() => {});
      }
      return { ...prev, colorTheme: theme };
    });
  }, []);

  const clearProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      setAnonymousMode,
      setCurrentMood,
      setWardrobeItem,
      clearWardrobe,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
      applyAuthUser,
      clearProfile,
    }),
    [
      profile,
      hydrated,
      setAnonymousMode,
      setCurrentMood,
      setWardrobeItem,
      clearWardrobe,
      setHideMoodFromFriends,
      setAllowFriendRequests,
      setAllowNotifications,
      setColorTheme,
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
