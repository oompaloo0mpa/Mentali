import {
  completeUserQuest,
  fetchDailyQuests,
  type DailyQuestRow,
} from '@/services/api';

type QuestMatcher = {
  categories?: DailyQuestRow['category'][];
  titleIncludes?: string[];
};

function matchesQuest(row: DailyQuestRow, matcher: QuestMatcher): boolean {
  if (row.completed) return false;
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

export async function completeCheckInQuests(userId: string): Promise<number> {
  return completeMatchingDailyQuests(userId, {
    categories: ['checkin'],
    titleIncludes: ['check-in', 'check in'],
  });
}

export async function completeMoodQuests(userId: string): Promise<number> {
  return completeMatchingDailyQuests(userId, {
    titleIncludes: ['mood'],
  });
}

export async function completeSocialQuests(userId: string): Promise<number> {
  return completeMatchingDailyQuests(userId, {
    categories: ['social'],
  });
}
