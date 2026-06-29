require("dotenv").config();
const { connectMongo } = require("./mongodb");

const USER_SCOPED_COLLECTIONS = [
  "userPreferences",
  "passwordResetCodes",
  "dailyCheckIns",
  "chatbotSessions",
  "userQuests",
  "userInventory",
  "equippedItems",
  "contestParticipants",
];

async function main() {
  const { db, client } = await connectMongo();
  const users = await db.collection("users").deleteMany({});
  const friends = await db.collection("friends").deleteMany({});

  const cleared = { users: users.deletedCount, friends: friends.deletedCount };
  for (const name of USER_SCOPED_COLLECTIONS) {
    const result = await db.collection(name).deleteMany({});
    cleared[name] = result.deletedCount;
  }

  console.log("Cleared account data:", cleared);
  await client.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
