require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { connectMongo } = require("./mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.API_PORT || 4000);

function toObjectId(value, field = "id") {
  if (!ObjectId.isValid(value)) {
    const err = new Error(`Invalid ${field}`);
    err.status = 400;
    throw err;
  }
  return new ObjectId(value);
}

function friendPairKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `${x}_${y}`;
}

async function generateFriendCode(db) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempts = 0; attempts < 20; attempts += 1) {
    let code = "";
    for (let i = 0; i < 7; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
    const exists = await db.collection("users").findOne({ friendCode: code }, { projection: { _id: 1 } });
    if (!exists) return code;
  }
  throw new Error("Unable to generate unique friend code");
}

function stripSensitive(user) {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return safe;
}

app.get("/api/health", async (_req, res, next) => {
  try {
    const { db } = await connectMongo();
    await db.command({ ping: 1 });
    res.json({ ok: true, db: db.databaseName });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { email, username, displayName, password, authProvider = "email" } = req.body || {};

    if (!email || !username || !displayName) {
      return res.status(400).json({ error: "email, username, displayName are required" });
    }
    if (authProvider === "email" && !password) {
      return res.status(400).json({ error: "password is required for email auth" });
    }

    const existing = await db.collection("users").findOne({
      $or: [{ email: String(email).toLowerCase() }, { username: String(username).toLowerCase() }],
    });
    if (existing) return res.status(409).json({ error: "Email or username already exists" });

    const now = new Date();
    const doc = {
      email: String(email).trim().toLowerCase(),
      username: String(username).trim().toLowerCase(),
      displayName: String(displayName).trim(),
      authProvider,
      friendCode: await generateFriendCode(db),
      currentTier: "Bronze",
      points: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
      updatedAt: now,
      ...(authProvider === "email" ? { passwordHash: await bcrypt.hash(String(password), 10) } : {}),
    };

    const insert = await db.collection("users").insertOne(doc);
    const userId = insert.insertedId;

    await db.collection("userPreferences").updateOne(
      { userId },
      {
        $set: {
          userId,
          anonymousMode: false,
          theme: "pastel",
          dailyReminderEnabled: true,
          reminderTime: "20:00",
          encouragementNotifications: true,
          leaderboardNotifications: true,
          showMoodToFriends: true,
          allowFriendRequests: true,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    const created = await db.collection("users").findOne({ _id: userId });
    res.status(201).json({ user: stripSensitive(created) });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ error: "identifier and password are required" });

    const id = String(identifier).trim().toLowerCase();
    const user = await db.collection("users").findOne({ $or: [{ email: id }, { username: id }] });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (user.authProvider !== "email") {
      return res.status(400).json({ error: `Use ${user.authProvider} login for this account` });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user: stripSensitive(user) });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/request-reset", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { mode, value } = req.body || {};
    if (!mode || !value) return res.status(400).json({ error: "mode and value are required" });
    const normalized = String(value).trim().toLowerCase();

    const user =
      mode === "email"
        ? await db.collection("users").findOne({ email: normalized })
        : await db.collection("users").findOne({ username: normalized });
    if (!user) return res.status(404).json({ error: "Account not found" });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.collection("passwordResetCodes").updateOne(
      { mode, value: normalized },
      { $set: { mode, value: normalized, code, userId: user._id, createdAt: now, expiresAt, used: false } },
      { upsert: true }
    );

    // Demo response includes code. Replace with email/SMS provider in production.
    res.json({ ok: true, code });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/verify-reset-code", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { mode, value, code } = req.body || {};
    const normalized = String(value || "").trim().toLowerCase();
    const record = await db.collection("passwordResetCodes").findOne({ mode, value: normalized, code: String(code) });
    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/reset-password", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { mode, value, code, newPassword } = req.body || {};
    const normalized = String(value || "").trim().toLowerCase();
    const record = await db.collection("passwordResetCodes").findOne({ mode, value: normalized, code: String(code) });
    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await db.collection("users").updateOne(
      { _id: record.userId },
      { $set: { passwordHash: await bcrypt.hash(String(newPassword), 10), authProvider: "email", updatedAt: new Date() } }
    );
    await db.collection("passwordResetCodes").updateOne({ _id: record._id }, { $set: { used: true } });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/api/daily-checkins", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { userId, moodEmoji, moodScore, reflectionText, checkInDate } = req.body || {};
    const doc = {
      userId: toObjectId(userId, "userId"),
      moodEmoji,
      moodScore,
      reflectionText: reflectionText || null,
      checkInDate: checkInDate ? new Date(checkInDate) : new Date(new Date().toISOString().slice(0, 10)),
      createdAt: new Date(),
    };
    const result = await db.collection("dailyCheckIns").updateOne(
      { userId: doc.userId, checkInDate: doc.checkInDate },
      { $set: doc },
      { upsert: true }
    );
    res.status(201).json({ ok: true, upsertedId: result.upsertedId?.toString() || null });
  } catch (e) {
    next(e);
  }
});

app.get("/api/daily-checkins/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db.collection("dailyCheckIns").find({ userId }).sort({ createdAt: -1 }).limit(60).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.post("/api/chatbot-sessions", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { userId, sessionDate, responses, overallWellbeingLevel, generatedInsight } = req.body || {};
    const doc = {
      userId: toObjectId(userId, "userId"),
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      responses: Array.isArray(responses) ? responses : [],
      overallWellbeingLevel,
      generatedInsight,
      createdAt: new Date(),
    };
    const out = await db.collection("chatbotSessions").insertOne(doc);
    res.status(201).json({ id: out.insertedId.toString() });
  } catch (e) {
    next(e);
  }
});

app.get("/api/chatbot-sessions/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db.collection("chatbotSessions").find({ userId }).sort({ sessionDate: -1 }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/request", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { fromUserId, toUserId } = req.body || {};
    const from = toObjectId(fromUserId, "fromUserId");
    const to = toObjectId(toUserId, "toUserId");
    const key = friendPairKey(from, to);

    const now = new Date();
    await db.collection("friends").updateOne(
      { pairKey: key },
      {
        $setOnInsert: {
          userAId: String(from) < String(to) ? from : to,
          userBId: String(from) < String(to) ? to : from,
          pairKey: key,
          requestedBy: from,
          status: "pending",
          createdAt: now,
          acceptedAt: null,
          blockedAt: null,
        },
      },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/:id/accept", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    await db.collection("friends").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { status: "accepted", acceptedAt: new Date(), blockedAt: null } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/:id/block", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    await db.collection("friends").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { status: "blocked", blockedAt: new Date() } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.get("/api/friends/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db
      .collection("friends")
      .find({
        status: { $in: ["pending", "accepted", "blocked"] },
        $or: [{ userAId: userId }, { userBId: userId }],
      })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.get("/api/support-messages/random", async (_req, res, next) => {
  try {
    const { db } = await connectMongo();
    const [msg] = await db.collection("supportMessagesTemplates").aggregate([{ $match: { active: true } }, { $sample: { size: 1 } }]).toArray();
    res.json({ data: msg || null });
  } catch (e) {
    next(e);
  }
});

app.get("/api/quests/active", async (_req, res, next) => {
  try {
    const { db } = await connectMongo();
    const data = await db.collection("quests").find({ active: true }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.post("/api/user-quests/assign-daily", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { userId, count = 3 } = req.body || {};
    const uid = toObjectId(userId, "userId");
    const today = new Date(new Date().toISOString().slice(0, 10));
    const quests = await db.collection("quests").aggregate([{ $match: { active: true } }, { $sample: { size: Number(count) } }]).toArray();
    const now = new Date();
    for (const q of quests) {
      await db.collection("userQuests").updateOne(
        { userId: uid, questId: q._id, assignedDate: today },
        { $setOnInsert: { userId: uid, questId: q._id, assignedDate: today, completed: false, completedAt: null, createdAt: now, updatedAt: now } },
        { upsert: true }
      );
    }
    res.json({ ok: true, assigned: quests.length });
  } catch (e) {
    next(e);
  }
});

app.get("/api/user-quests/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userQuests").find({ userId: uid }).sort({ assignedDate: -1 }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.post("/api/user-quests/:id/complete", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    await db.collection("userQuests").updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: { completed: true, completedAt: new Date(), updatedAt: new Date() } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/items", async (_req, res, next) => {
  try {
    const { db } = await connectMongo();
    const data = await db.collection("shopItems").find({ active: true }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.post("/api/shop/purchase", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { userId, itemId, obtainedFrom = "shop" } = req.body || {};
    const uid = toObjectId(userId, "userId");
    const iid = toObjectId(itemId, "itemId");
    await db.collection("userInventory").updateOne(
      { userId: uid, itemId: iid },
      { $setOnInsert: { userId: uid, itemId: iid, obtainedFrom, acquiredAt: new Date() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/inventory/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userInventory").find({ userId: uid }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/equipped/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("equippedItems").findOne({ userId: uid });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.put("/api/shop/equipped/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const { equippedTop = null, equippedAccessory = null, equippedExpression = null, equippedTheme = null } = req.body || {};
    await db.collection("equippedItems").updateOne(
      { userId: uid },
      {
        $set: {
          userId: uid,
          equippedTop: equippedTop ? toObjectId(equippedTop, "equippedTop") : null,
          equippedAccessory: equippedAccessory ? toObjectId(equippedAccessory, "equippedAccessory") : null,
          equippedExpression: equippedExpression ? toObjectId(equippedExpression, "equippedExpression") : null,
          equippedTheme: equippedTheme ? toObjectId(equippedTheme, "equippedTheme") : null,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/tiers", async (_req, res, next) => {
  try {
    const { db } = await connectMongo();
    const data = await db.collection("leaderboardTiers").find({}).sort({ tierLevel: 1 }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/contests/active/:tierName", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const data = await db.collection("leaderboardContests").findOne({ tierName: req.params.tierName, status: "active" });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/contests/:contestId/participants", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const contestId = toObjectId(req.params.contestId, "contestId");
    const data = await db.collection("contestParticipants").find({ contestId }).sort({ rank: 1 }).toArray();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.get("/api/preferences/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userPreferences").findOne({ userId: uid });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.put("/api/preferences/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    await db.collection("userPreferences").updateOne(
      { userId: uid },
      { $set: { ...req.body, userId: uid, updatedAt: new Date() } },
      { upsert: true }
    );
    const data = await db.collection("userPreferences").findOne({ userId: uid });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Mentali API listening on http://localhost:${PORT}`);
});
