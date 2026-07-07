import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'mentali.auth.token.v1';

let cachedToken: string | null = null;

export function getAuthToken(): string | null {
  return cachedToken;
}

export async function loadAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    const raw = await AsyncStorage.getItem(TOKEN_KEY);
    cachedToken = raw || null;
    return cachedToken;
  } catch {
    return null;
  }
}

export async function saveAuthToken(token: string): Promise<void> {
  cachedToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Non-fatal.
  }
}

export async function clearAuthToken(): Promise<void> {
  cachedToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Non-fatal.
  }
}
