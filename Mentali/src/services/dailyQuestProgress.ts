import {
  completeUserQuest,
  fetchDailyQuests,
  type DailyQuestRow,
} from '@/services/api';

type QuestMatcher = {
  trackKeys?: string[];
  categories?: DailyQuestRow['category'][];
  titleIncludes?: string[];
};

function matchesQuest(row: DailyQuestRow, matcher: QuestMatcher): boolean {
  if (row.completed) return false;

  if (matcher.trackKeys?.length) {
    return !!row.trackKey && matcher.trackKeys.includes(row.trackKey);
  }

  if (matcher.categories?.length && !matcher.categories.includes(row.category)) {
    return false;
  }
  if (matcher.titleIncludes?.length) {
    const title = row.title.toLowerCase();
    return matcher.titleIncludes.some((part) => title.includes(part.toLowerCase()));
  }
  return true;
}

export async function completeMatchingDailyQuests(
  userId: string,
  matcher: QuestMatcher,
): Promise<number> {
  const rows = await fetchDailyQuests(userId);
  let awarded = 0;

  for (const row of rows) {
    if (!matchesQuest(row, matcher)) continue;
    const result = await completeUserQuest(row.id);
    awarded += Number(result?.pointsAwarded ?? 0);
  }

  return awarded;
}

export async function completeDailyQuestsByTrackKey(
  userId: string,
  trackKeys: string | string[],
): Promise<number> {
  const keys = Array.isArray(trackKeys) ? trackKeys : [trackKeys];
  return completeMatchingDailyQuests(userId, { trackKeys: keys });
}

export async function completeCheckInQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'checkin.complete');
}

export async function completeCheckInSummaryQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'checkin.summary');
}

export async function completeCheckInStreakQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'checkin.streak');
}

export async function completeMoodQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'mood.select');
}

export async function completeSocialMessageQuests(
  userId: string,
  options?: { reply?: boolean; streakAtRisk?: boolean },
): Promise<number> {
  const keys = ['social.message'];
  if (options?.reply) keys.push('social.reply');
  if (options?.streakAtRisk) keys.push('social.streak.keep');
  return completeDailyQuestsByTrackKey(userId, keys);
}

export async function completeSocialFriendAddQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'social.friend.add');
}

export async function completeSocialFriendAcceptQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'social.friend.accept');
}

export async function completeSocialChatOpenQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'social.chat.open');
}

export async function completeReflectionCheckInAnswerQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'reflection.checkin_answer');
}

export async function completeReflectionCheckInChatQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'reflection.checkin_chat');
}

export async function completeWardrobeVisitQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'profile.wardrobe.visit');
}

export async function completeThemeChangeQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'profile.theme.change');
}

export async function completeNotificationReadQuests(userId: string): Promise<number> {
  return completeDailyQuestsByTrackKey(userId, 'app.notifications.read');
}

/** @deprecated Use completeSocialMessageQuests */
export async function completeSocialQuests(userId: string): Promise<number> {
  return completeSocialMessageQuests(userId);
}
