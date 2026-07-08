export const DISPLAY_NAME_CHANGE_COOLDOWN_DAYS = 3;
export const DISPLAY_NAME_CHANGE_COOLDOWN_MS =
  DISPLAY_NAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export function getDisplayNameChangeAvailability(changedAt: string | null | undefined): {
  allowed: boolean;
  daysRemaining: number;
} {
  if (!changedAt) {
    return { allowed: true, daysRemaining: 0 };
  }

  const elapsed = Date.now() - new Date(changedAt).getTime();
  if (elapsed >= DISPLAY_NAME_CHANGE_COOLDOWN_MS) {
    return { allowed: true, daysRemaining: 0 };
  }

  const daysRemaining = Math.ceil(
    (DISPLAY_NAME_CHANGE_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000),
  );
  return { allowed: false, daysRemaining };
}
