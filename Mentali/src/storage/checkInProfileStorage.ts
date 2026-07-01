import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_PROFILE, type UserCheckInProfile } from '@/logic/checkinPersonalization';

const PROFILE_KEY = 'mentali.checkin.profile.v1';

export async function loadCheckInProfile(): Promise<UserCheckInProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? ({ ...EMPTY_PROFILE, ...(JSON.parse(raw) as UserCheckInProfile) }) : { ...EMPTY_PROFILE };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

export async function saveCheckInProfile(profile: UserCheckInProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Non-fatal.
  }
}
