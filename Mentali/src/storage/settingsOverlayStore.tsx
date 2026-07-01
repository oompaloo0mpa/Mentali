import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { DeleteAccountModal } from '@/components/settings/DeleteAccountModal';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { deleteAccount } from '@/services/api';
import { useUserProfile } from '@/storage/userProfileStore';

export type SettingsHostActions = {
  onLogout: () => void;
  onChangePassword: () => void;
  onOpenWardrobe: () => void;
};

type SettingsOverlayContextValue = {
  openSettings: () => void;
  closeSettings: () => void;
  requestLogout: () => void;
};

const SettingsOverlayContext = createContext<SettingsOverlayContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  actions: SettingsHostActions;
};

export function SettingsOverlayProvider({ children, actions }: ProviderProps) {
  const { profile, clearProfile } = useUserProfile();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openSettings = useCallback(() => setSettingsVisible(true), []);
  const closeSettings = useCallback(() => setSettingsVisible(false), []);

  const requestLogout = useCallback(() => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: actions.onLogout },
    ]);
  }, [actions]);

  const handleChangePassword = useCallback(() => {
    closeSettings();
    actions.onChangePassword();
  }, [actions, closeSettings]);

  const handleOpenWardrobe = useCallback(() => {
    closeSettings();
    actions.onOpenWardrobe();
  }, [actions, closeSettings]);

  const handleDeleteRequest = useCallback(() => {
    closeSettings();
    setDeleteVisible(true);
  }, [closeSettings]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      if (profile.userId) {
        await deleteAccount(profile.userId);
      }
      await clearProfile();
      setDeleteVisible(false);
      actions.onLogout();
    } catch (error) {
      Alert.alert(
        'Delete failed',
        error instanceof Error ? error.message : 'Unable to delete your account. Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  }, [actions, clearProfile, profile.userId]);

  const value = useMemo(
    () => ({ openSettings, closeSettings, requestLogout }),
    [openSettings, closeSettings, requestLogout],
  );

  return (
    <SettingsOverlayContext.Provider value={value}>
      {children}
      <SettingsScreen
        visible={settingsVisible}
        onClose={closeSettings}
        onChangePassword={handleChangePassword}
        onDeleteAccount={handleDeleteRequest}
        onOpenWardrobe={handleOpenWardrobe}
      />
      <DeleteAccountModal
        visible={deleteVisible}
        deleting={deleting}
        onClose={() => setDeleteVisible(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </SettingsOverlayContext.Provider>
  );
}

export function useSettingsOverlay(): SettingsOverlayContextValue {
  const ctx = useContext(SettingsOverlayContext);
  if (!ctx) throw new Error('useSettingsOverlay must be used within SettingsOverlayProvider');
  return ctx;
}
