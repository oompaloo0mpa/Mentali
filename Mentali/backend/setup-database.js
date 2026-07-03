require("dotenv").config();
const { connectMongo } = require("./mongodb");

const OID = { bsonType: "objectId" };
const DATE = { bsonType: "date" };
const STR = { bsonType: "string" };
const BOOL = { bsonType: "bool" };
const NUM = { bsonType: ["int", "long", "double", "decimal"] };

const collectionConfigs = [
  {
    name: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "email",
          "username",
          "displayName",
          "authProvider",
          "friendCode",
          "currentTier",
          "points",
          "currentStreak",
          "longestStreak",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          _id: OID,
          email: STR,
          username: STR,
          displayName: STR,
          authProvider: { enum: ["google", "apple", "email"] },
          friendCode: STR,
          currentTier: STR,
          points: NUM,
          currentStreak: NUM,
          longestStreak: NUM,
          createdAt: DATE,
          updatedAt: DATE,
        },
      },
    },
    indexes: [
      { key: { email: 1 }, options: { unique: true } },
      { key: { username: 1 }, options: { unique: true } },
      { key: { friendCode: 1 }, options: { unique: true } },
    ],
  },
  {
    name: "dailyCheckIns",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "checkInDate", "moodEmoji", "moodScore", "createdAt"],
        properties: {
          _id: OID,
          userId: OID,
          checkInDate: DATE,
          moodEmoji: STR,
          moodScore: NUM,
          reflectionText: { bsonType: ["string", "null"] },
          createdAt: DATE,
        },
      },
    },
    indexes: [
      { key: { userId: 1, checkInDate: 1 }, options: { unique: true } },
      { key: { userId: 1, createdAt: -1 }, options: {} },
    ],
  },
  {
    name: "chatbotSessions",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "userId",
          "sessionDate",
          "responses",
          "overallWellbeingLevel",
          "generatedInsight",
          "createdAt",
        ],
        properties: {
          _id: OID,
          userId: OID,
          sessionDate: DATE,
          responses: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["promptId", "question", "answer", "score"],
              properties: {
                promptId: STR,
                question: STR,
                answer: STR,
                score: NUM,
              },
            },
          },
          overallWellbeingLevel: STR,
          generatedInsight: STR,
          createdAt: DATE,
        },
      },
    },
    indexes: [
      { key: { userId: 1, sessionDate: -1 }, options: {} },
      { key: { createdAt: -1 }, options: {} },
    ],
  },
  {
    name: "friends",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userAId", "userBId", "pairKey", "requestedBy", "status", "createdAt"],
        properties: {
          _id: OID,
          userAId: OID,
          userBId: OID,
          pairKey: STR,
          requestedBy: OID,
          status: { enum: ["pending", "accepted", "blocked"] },
          createdAt: DATE,
          acceptedAt: { bsonType: ["date", "null"] },
          blockedAt: { bsonType: ["date", "null"] },
        },
      },
    },
    indexes: [
      { key: { pairKey: 1 }, options: { unique: true } },
      { key: { userAId: 1, status: 1 }, options: {} },
      { key: { userBId: 1, status: 1 }, options: {} },
    ],
  },
  {
    name: "chatMessages",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["friendshipId", "senderUserId", "recipientUserId", "text", "createdAt"],
        properties: {
          _id: OID,
          friendshipId: OID,
          senderUserId: OID,
          recipientUserId: OID,
          text: STR,
          imageUri: { bsonType: ["string", "null"] },
          fileName: { bsonType: ["string", "null"] },
          fileUri: { bsonType: ["string", "null"] },
          createdAt: DATE,
        },
      },
    },
    indexes: [
      { key: { friendshipId: 1, createdAt: 1 }, options: {} },
      { key: { senderUserId: 1, createdAt: -1 }, options: {} },
      { key: { recipientUserId: 1, createdAt: -1 }, options: {} },
    ],
  },
  {
    name: "supportMessagesTemplates",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["message", "category", "tone", "active", "createdAt", "updatedAt"],
        properties: {
          _id: OID,
          message: STR,
          category: STR,
          tone: STR,
          active: BOOL,
          createdAt: DATE,
          updatedAt: DATE,
        },
      },
    },
    indexes: [{ key: { active: 1, category: 1 }, options: {} }],
  },
  {
    name: "quests",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["title", "description", "rewardPoints", "category", "active", "createdAt", "updatedAt"],
        properties: {
          _id: OID,
          title: STR,
          description: STR,
          rewardPoints: NUM,
          category: { enum: ["social", "checkin", "reflection"] },
          active: BOOL,
          createdAt: DATE,
          updatedAt: DATE,
        },
      },
    },
    indexes: [{ key: { active: 1, category: 1 }, options: {} }],
  },
  {
    name: "userQuests",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "questId", "assignedDate", "completed", "createdAt", "updatedAt"],
        properties: {
          _id: OID,
          userId: OID,
          questId: OID,
          assignedDate: DATE,
          completed: BOOL,
          completedAt: { bsonType: ["date", "null"] },
          createdAt: DATE,
          updatedAt: DATE,
        },
      },
    },
    indexes: [
      { key: { userId: 1, questId: 1, assignedDate: 1 }, options: { unique: true } },
      { key: { userId: 1, completed: 1 }, options: {} },
    ],
  },
  {
    name: "shopItems",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "name",
          "description",
          "itemType",
          "category",
          "price",
          "rarity",
          "imageUrl",
          "active",
          "createdAt",
          "updatedAt",
        ],
        properties: {
          _id: OID,
          name: STR,
          description: STR,
          itemType: { enum: ["single", "bundle"] },
          category: { enum: ["cosmetic", "theme", "reward", "bundle"] },
          price: NUM,
          rarity: { enum: ["common", "rare", "epic", "limited"] },
          imageUrl: STR,
          cosmeticType: {
            bsonType: ["string", "null"],
            enum: ["top", "hat", "accessory", "shoes", "consumables", "theme", null],
          },
          bundleItems: {
            bsonType: ["array", "null"],
            items: {
              bsonType: "object",
              required: ["itemId", "quantity"],
              properties: {
                itemId: OID,
                quantity: NUM,
              },
            },
          },
          active: BOOL,
          createdAt: DATE,
          updatedAt: DATE,
        },
      },
    },
    indexes: [{ key: { active: 1, category: 1, itemType: 1 }, options: {} }],
  },
  {
    name: "userInventory",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "itemId", "obtainedFrom", "acquiredAt"],
        properties: {
          _id: OID,
          userId: OID,
          itemId: OID,
          obtainedFrom: { enum: ["onboarding", "shop", "reward"] },
          acquiredAt: DATE,
        },
      },
    },
    indexes: [
      { key: { userId: 1, itemId: 1 }, options: { unique: true } },
      { key: { userId: 1 }, options: {} },
    ],
  },
  {
    name: "equippedItems",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["userId", "updatedAt"],
        properties: {
          _id: OID,
          userId: OID,
          equippedTop: { bsonType: ["objectId", "null"] },
          equippedAccessory: { bsonType: ["objectId", "null"] },
          equippedExpression: { bsonType: ["objectId", "null"] },
          equippedTheme: { bsonType: ["objectId", "null"] },
          updatedAt: DATE,
        },
      },
    },
    indexes: [{ key: { userId: 1 }, options: { unique: true } }],
  },
  {
    name: "leaderboardTiers",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["tierName", "tierLevel", "promotionTier", "demotionTier"],
        properties: {
          _id: OID,
          tierName: STR,
          tierLevel: NUM,
          promotionTier: { bsonType: ["string", "null"] },
          demotionTier: { bsonType: ["string", "null"] },
        },
      },
    },
    indexes: [
      { key: { tierName: 1 }, options: { unique: true } },
      { key: { tierLevel: 1 }, options: { unique: true } },
    ],
  },
  {
    name: "leaderboardContests",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["tierName", "weekStartDate", "weekEndDate", "maxParticipants", "status", "createdAt"],
        properties: {
          _id: OID,
          tierName: STR,
          weekStartDate: DATE,
          weekEndDate: DATE,
          maxParticipants: NUM,
          status: { enum: ["active", "completed"] },
          createdAt: DATE,
        },
      },
    },
    indexes: [
      { key: { tierName: 1, weekStartDate: 1 }, options: { unique: true } },
      { key: { status: 1, weekEndDate: 1 }, options: {} },
    ],
  },
  {
    name: "contestParticipants",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["contestId", "userId", "pointsEarned", "rank", "result", "createdAt"],
        properties: {
          _id: OID,
          contestId: OID,
          userId: OID,
          pointsEarned: NUM,
          rank: NUM,
          result: { enum: ["promoted", "maintained", "demoted"] },
          createdAt: DATE,
        },
      },
    },
    indexes: [
      { key: { contestId: 1, userId: 1 }, options: { unique: true } },
      { key: { contestId: 1, rank: 1 }, options: { unique: true } },
    ],
  },
  {
    name: "userPreferences",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: [
          "userId",
          "anonymousMode",
          "theme",
          "dailyReminderEnabled",
          "reminderTime",
          "encouragementNotifications",
          "leaderboardNotifications",
          "showMoodToFriends",
          "allowFriendRequests",
          "updatedAt",
        ],
        properties: {
          _id: OID,
          userId: OID,
          anonymousMode: BOOL,
          theme: { enum: ["light", "dark", "pastel"] },
          dailyReminderEnabled: BOOL,
          reminderTime: STR,
          encouragementNotifications: BOOL,
          leaderboardNotifications: BOOL,
          showMoodToFriends: BOOL,
          allowFriendRequests: BOOL,
          updatedAt: DATE,
        },
      },
    },
    indexes: [{ key: { userId: 1 }, options: { unique: true } }],
  },
];

async function ensureCollection(db, config) {
  const exists = await db.listCollections({ name: config.name }).hasNext();
  if (!exists) {
    await db.createCollection(config.name, {
      validator: config.validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`Created collection: ${config.name}`);
  } else {
    await db.command({
      collMod: config.name,
      validator: config.validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`Updated validator: ${config.name}`);
  }

  if (config.indexes?.length) {
    for (const idx of config.indexes) {
      await db.collection(config.name).createIndex(idx.key, idx.options || {});
    }
    console.log(`Ensured indexes: ${config.name}`);
  }
}

async function seedReferenceData(db) {
  const now = new Date();

  // Leaderboard tiers
  const tiers = [
    { tierName: "Bronze", tierLevel: 1, promotionTier: "Silver", demotionTier: null },
    { tierName: "Silver", tierLevel: 2, promotionTier: "Gold", demotionTier: "Bronze" },
    { tierName: "Gold", tierLevel: 3, promotionTier: "Platinum", demotionTier: "Silver" },
    { tierName: "Platinum", tierLevel: 4, promotionTier: null, demotionTier: "Gold" },
  ];
  for (const tier of tiers) {
    await db.collection("leaderboardTiers").updateOne(
      { tierName: tier.tierName },
      { $set: tier },
      { upsert: true }
    );
  }

  // Support message templates
  const supportTemplates = [
    { message: "I’m here if you need to talk 💛", category: "comfort", tone: "gentle" },
    { message: "You are doing your best, and that matters.", category: "encouragement", tone: "calm" },
    { message: "One small step today still counts as progress.", category: "motivation", tone: "positive" },
  ];
  for (const template of supportTemplates) {
    await db.collection("supportMessagesTemplates").updateOne(
      { message: template.message },
      {
        $set: {
          ...template,
          active: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  }

  // Starter quests
  const questSeeds = [
    {
      title: "Send a supportive message",
      description: "Send 1 encouragement message to a friend.",
      rewardPoints: 5,
      category: "social",
    },
    {
      title: "Complete today's check-in",
      description: "Finish your daily mood check-in once today.",
      rewardPoints: 10,
      category: "checkin",
    },
    {
      title: "Write a short reflection",
      description: "Add one reflection note after check-in.",
      rewardPoints: 8,
      category: "reflection",
    },
  ];
  for (const quest of questSeeds) {
    await db.collection("quests").updateOne(
      { title: quest.title },
      {
        $set: {
          ...quest,
          active: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
  }
}

async function main() {
  let client = null;
  try {
    const connection = await connectMongo();
    client = connection.client;
    const db = connection.db;

    console.log(`Setting up database: ${db.databaseName}`);

    for (const config of collectionConfigs) {
      await ensureCollection(db, config);
    }

    await seedReferenceData(db);

    console.log("Database setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main();
