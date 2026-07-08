require("dotenv").config({ path: require("node:path").join(__dirname, "..", ".env") });
const { connectMongo } = require("./mongodb");

async function main() {
  const { db, client } = await connectMongo();
  const targetStreak = Number(process.argv[2] || 0) || null;
  const labels = ["jxydengai", "xavierlzh"];
  const users = [];
  for (const label of labels) {
    const user = await db.collection("users").findOne({
      $or: [
        { username: new RegExp(`^${label}$`, "i") },
        { displayName: new RegExp(`^${label}$`, "i") },
      ],
    });
    if (user) users.push(user);
  }

  if (users.length !== 2) {
    console.log(`Expected 2 users, found ${users.length}`);
    await client.close();
    return;
  }

  const pair = await db.collection("friends").findOne({
    status: "accepted",
    $or: [
      { userAId: users[0]._id, userBId: users[1]._id },
      { userAId: users[1]._id, userBId: users[0]._id },
    ],
  });

  const shared = targetStreak ?? Number(pair?.streak ?? Math.max(...users.map((u) => Number(u.currentStreak || 0))));
  const now = new Date();
  await db.collection("users").updateMany(
    { _id: { $in: users.map((u) => u._id) } },
    { $set: { currentStreak: shared, updatedAt: now }, $max: { longestStreak: shared } },
  );

  await db.collection("friends").updateOne(
    {
      status: "accepted",
      $or: [
        { userAId: users[0]._id, userBId: users[1]._id },
        { userAId: users[1]._id, userBId: users[0]._id },
      ],
    },
    {
      $set: {
        streak: shared,
        lastStreakDate: now.toISOString().slice(0, 10),
        updatedAt: now,
      },
    },
  );

  console.log(`Synced jxydengai and xavierlzh to currentStreak=${shared} and friendship streak=${shared}`);
  await client.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
