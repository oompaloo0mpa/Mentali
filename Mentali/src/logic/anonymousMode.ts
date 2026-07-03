export const ANONYMOUS_LABEL = 'Anonymous user';

export type PublicIdentity = {
  displayName: string;
  username: string;
  friendCode?: string;
  anonymousMode?: boolean;
};

/** Name shown to someone who is not on the viewer's friends list. */
export function publicDisplayName(
  identity: PublicIdentity,
  options: { isFriend: boolean },
): string {
  if (options.isFriend || !identity.anonymousMode) {
    return identity.displayName || identity.username;
  }
  return ANONYMOUS_LABEL;
}

export function publicUsername(
  identity: PublicIdentity,
  options: { isFriend: boolean },
): string {
  if (options.isFriend || !identity.anonymousMode) {
    return identity.username;
  }
  return 'hidden';
}
