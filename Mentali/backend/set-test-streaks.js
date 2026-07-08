require("dotenv").config({ path: require("node:path").join(__dirname, "..", ".env") });
const { ObjectId } = require("mongodb");
const { connectMongo } = require("./mongodb");

const TARGETS = [
  { label: "jxydengai", tier: "Gold", rank: 2, streak: 105 },
  { label: "xavierlzh", tier: "Silver", rank: 5, streak: 112 },
];

function weekBounds(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function findUser(db, label) {
  const query = {
    $or: [
      { displayName: new RegExp(`^${label}$`, "i") },
      { username: new RegExp(`^${label}$`, "i") },
    ],
  };
  return db.collection("users").findOne(query);
}

async function ensureGoldContest(db) {
  const { start, end } = weekBounds();
  const existing = await db.collection("leaderboardContests").findOne({
    tierName: "Gold",
    status: "active",
  });
  if (existing) return existing;

  const now = new Date();
  const doc = {
    tierName: "Gold",
    weekStartDate: start,
    weekEndDate: end,
    maxParticipants: 20,
    status: "active",
    createdAt: now,
  };
  const out = await db.collection("leaderboardContests").insertOne(doc);
  return { _id: out.insertedId, ...doc };
}

async function upsertContestParticipant(db, contestId, userId, rank, pointsEarned = 500) {
  const now = new Date();
  await db.collection("contestParticipants").updateOne(
    { contestId, userId },
    {
      $set: {
        contestId,
        userId,
        pointsEarned,
        rank,
        result: "maintained",
        createdAt: now,
      },
    },
    { upsert: true },
  );
}

async function main() {
  const { db, client } = await connectMongo();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const users = [];

  for (const target of TARGETS) {
    const user = await findUser(db, target.label);
    if (!user) {
      console.warn(`User not found: ${target.label}`);
      continue;
    }

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          currentTier: target.tier,
          currentStreak: target.streak,
          longestStreak: Math.max(target.streak, Number(user.longestStreak || 0)),
          updatedAt: now,
        },
      },
    );

    users.push({ ...target, id: user._id, name: user.displayName || user.username });
    console.log(`Updated ${target.label}: tier=${target.tier}, streak=${target.streak}`);
  }

  if (users.length >= 2) {
    const [a, b] = users;
    const friendship = await db.collection("friends").findOne({
      status: "accepted",
      $or: [
        { userAId: a.id, userBId: b.id },
        { userAId: b.id, userBId: a.id },
      ],
    });

    if (friendship) {
      await db.collection("friends").updateOne(
        { _id: friendship._id },
        {
          $set: {
            streak: Math.max(a.streak, b.streak),
            lastStreakDate: today,
            updatedAt: now,
          },
        },
      );
      console.log(`Updated friendship streak to ${Math.max(a.streak, b.streak)}`);
    } else {
      console.warn("No accepted friendship found between the two users.");
    }
  }

  const goldUser = users.find((u) => u.label === "jxydengai");
  if (goldUser) {
    const contest = await ensureGoldContest(db);
    await upsertContestParticipant(db, contest._id, goldUser.id, goldUser.rank ?? 2, 820);
    console.log(`Set ${goldUser.label} to Gold contest rank #${goldUser.rank ?? 2}`);
  }

  await client.close();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
