# Mentali MongoDB Data Dictionary (v1)

This document is the corrected/implementation-aligned dictionary used by `backend/setup-database.js`.

## Conventions
- `ObjectId` references use `*_Id` fields.
- All timestamps are Mongo `Date` values.
- Collections with mutable records include `updatedAt`.
- Enums are explicitly validated.
- Uniqueness is enforced by indexes where needed.

## 1) `users`
Main user profile + progression.

Fields:
- `_id: ObjectId`
- `email: string` (unique)
- `username: string` (unique)
- `displayName: string`
- `authProvider: "google" | "apple" | "email"`
- `friendCode: string` (unique)
- `currentTier: string`
- `points: number`
- `currentStreak: number`
- `longestStreak: number`
- `createdAt: Date`
- `updatedAt: Date`

## 2) `dailyCheckIns`
Daily mood check-in records.

Fields:
- `_id: ObjectId`
- `userId: ObjectId`
- `checkInDate: Date` (date key for one-per-day uniqueness)
- `moodEmoji: string`
- `moodScore: number`
- `reflectionText?: string | null`
- `createdAt: Date`

Indexes:
- Unique `{ userId, checkInDate }`

## 3) `chatbotSessions`
PHQ-4 / K-10 chatbot evaluation sessions.

Fields:
- `_id: ObjectId`
- `userId: ObjectId`
- `sessionDate: Date`
- `responses: [{ promptId, question, answer, score }]`
- `overallWellbeingLevel: string`
- `generatedInsight: string`
- `createdAt: Date`

## 4) `friends`
Friend request and relationship state.

Fields:
- `_id: ObjectId`
- `userAId: ObjectId`
- `userBId: ObjectId`
- `pairKey: string` (normalized pair key, unique)
- `requestedBy: ObjectId`
- `status: "pending" | "accepted" | "blocked"`
- `createdAt: Date`
- `acceptedAt?: Date | null`
- `blockedAt?: Date | null`

## 5) `supportMessagesTemplates`
Message templates for random suggestions.

Fields:
- `_id: ObjectId`
- `message: string`
- `category: string`
- `tone: string`
- `active: boolean`
- `createdAt: Date`
- `updatedAt: Date`

## 6) `quests`
Quest catalog.

Fields:
- `_id: ObjectId`
- `title: string`
- `description: string`
- `rewardPoints: number`
- `category: "social" | "checkin" | "reflection"`
- `active: boolean`
- `createdAt: Date`
- `updatedAt: Date`

## 7) `userQuests`
Per-user assigned quest progress.

Fields:
- `_id: ObjectId`
- `userId: ObjectId`
- `questId: ObjectId`
- `assignedDate: Date`
- `completed: boolean`
- `completedAt?: Date | null`
- `createdAt: Date`
- `updatedAt: Date`

## 8) `shopItems`
Shop inventory catalog (single + bundles).

Fields:
- `_id: ObjectId`
- `name: string`
- `description: string`
- `itemType: "single" | "bundle"`
- `category: "cosmetic" | "theme" | "reward" | "bundle"`
- `price: number`
- `rarity: "common" | "rare" | "epic" | "limited"`
- `imageUrl: string`
- `cosmeticType?: "top" | "hat" | "accessory" | "shoes" | "consumables" | "theme" | null`
- `bundleItems?: [{ itemId: ObjectId, quantity: number }] | null`
- `active: boolean`
- `createdAt: Date`
- `updatedAt: Date`

## 9) `userInventory`
Owned items per user.

Fields:
- `_id: ObjectId`
- `userId: ObjectId`
- `itemId: ObjectId`
- `obtainedFrom: "onboarding" | "shop" | "reward"`
- `acquiredAt: Date`

## 10) `equippedItems`
Current equipped cosmetic slots for each user.

Fields:
- `_id: ObjectId`
- `userId: ObjectId` (unique)
- `equippedTop?: ObjectId | null`
- `equippedAccessory?: ObjectId | null`
- `equippedExpression?: ObjectId | null`
- `equippedTheme?: ObjectId | null`
- `updatedAt: Date`

## 11) `leaderboardTiers`
Tier ladder definition.

Fields:
- `_id: ObjectId`
- `tierName: string` (unique)
- `tierLevel: number` (unique)
- `promotionTier?: string | null`
- `demotionTier?: string | null`

## 12) `leaderboardContests`
Weekly bracket containers.

Fields:
- `_id: ObjectId`
- `tierName: string`
- `weekStartDate: Date`
- `weekEndDate: Date`
- `maxParticipants: number`
- `status: "active" | "completed"`
- `createdAt: Date`

## 13) `contestParticipants`
Participants and outcomes in brackets.

Fields:
- `_id: ObjectId`
- `contestId: ObjectId`
- `userId: ObjectId`
- `pointsEarned: number`
- `rank: number`
- `result: "promoted" | "maintained" | "demoted"`
- `createdAt: Date`

Indexes:
- Unique `{ contestId, userId }`
- Unique `{ contestId, rank }`

## 14) `userPreferences`
Per-user settings.

Fields:
- `_id: ObjectId`
- `userId: ObjectId` (unique)
- `anonymousMode: boolean`
- `theme: "light" | "dark" | "pastel"`
- `dailyReminderEnabled: boolean`
- `reminderTime: string`
- `encouragementNotifications: boolean`
- `leaderboardNotifications: boolean`
- `showMoodToFriends: boolean`
- `allowFriendRequests: boolean`
- `updatedAt: Date`

