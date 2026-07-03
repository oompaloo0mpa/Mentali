require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Buffer } = require("node:buffer");
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
    for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
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

async function areFriends(db, userA, userB) {
  const a = toObjectId(userA, "userId");
  const b = toObjectId(userB, "userId");
  const key = friendPairKey(a, b);
  const row = await db.collection("friends").findOne({ pairKey: key, status: "accepted" });
  return !!row;
}

async function getUserPreferences(db, userId) {
  const uid = toObjectId(userId, "userId");
  return db.collection("userPreferences").findOne({ userId: uid });
}

function relativeLastSeen(dateValue) {
  const ts = dateValue ? new Date(dateValue).getTime() : Date.now();
  const diffMs = Math.max(0, Date.now() - ts);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Last seen just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  return `Last seen ${Math.round(hours / 24)}d ago`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso(today = todayIso()) {
  const d = new Date(`${today}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Increment the per-friendship messaging streak when someone sends a chat message. */
function applyFriendshipMessageStreak(friendship, today = todayIso()) {
  const current = Number(friendship.streak || 0);
  const lastDate = friendship.lastStreakDate || null;

  if (lastDate === today) {
    return { streak: current, lastStreakDate: today, streakUnlocked: false };
  }

  let newStreak;
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate === yesterdayIso(today)) {
    newStreak = current + 1;
  } else {
    newStreak = 1;
  }

  return {
    streak: newStreak,
    lastStreakDate: today,
    streakUnlocked: current === 0 && newStreak >= 1,
  };
}

async function ensureFriendBootstrapData(db, userId) {
  const uid = toObjectId(userId, "userId");
  const hasAny = await db.collection("friends").findOne({
    $or: [{ userAId: uid }, { userBId: uid }],
    status: { $in: ["accepted", "pending"] },
  });
  if (hasAny) return { seeded: false };

  const now = new Date();
  const sampleUsers = [
    {
      email: "alex.seed@mentali.dev",
      username: "alex_seed",
      displayName: "Alex",
      friendCode: "ALX7K2",
      currentStreak: 142,
      longestStreak: 142,
      moodId: "great",
      moodEmoji: "😄",
      checkedInToday: true,
      anonymousMode: false,
      phone: "+6591000101",
    },
    {
      email: "josh.seed@mentali.dev",
      username: "josh_seed",
      displayName: "Josh",
      friendCode: "JSH4M9",
      currentStreak: 312,
      longestStreak: 350,
      moodId: "sad",
      moodEmoji: "😟",
      checkedInToday: false,
      anonymousMode: false,
      phone: "+6591000102",
    },
    {
      email: "maya.seed@mentali.dev",
      username: "maya_seed",
      displayName: "Maya",
      friendCode: "MAYA3X",
      currentStreak: 18,
      longestStreak: 33,
      moodId: "good",
      moodEmoji: "🙂",
      checkedInToday: true,
      anonymousMode: true,
      phone: "+6591000103",
    },
  ];

  const ids = [];
  for (const seed of sampleUsers) {
    const existing = await db.collection("users").findOne({ username: seed.username });
    let outId = existing?._id;
    if (!outId) {
      const inserted = await db.collection("users").insertOne({
        email: seed.email,
        username: seed.username,
        displayName: seed.displayName,
        authProvider: "email",
        passwordHash: await bcrypt.hash("SeedUser123!", 10),
        friendCode: seed.friendCode,
        currentTier: "Bronze",
        points: 0,
        currentStreak: seed.currentStreak,
        longestStreak: seed.longestStreak,
        phone: seed.phone,
        createdAt: now,
        updatedAt: now,
      });
      outId = inserted.insertedId;
    } else {
      await db.collection("users").updateOne(
        { _id: outId },
        {
          $set: {
            displayName: seed.displayName,
            friendCode: seed.friendCode,
            currentStreak: seed.currentStreak,
            longestStreak: seed.longestStreak,
            updatedAt: now,
          },
        }
      );
    }

    await db.collection("userPreferences").updateOne(
      { userId: outId },
      {
        $set: {
          userId: outId,
          anonymousMode: seed.anonymousMode,
          theme: "pastel",
          dailyReminderEnabled: true,
          reminderTime: "20:00",
          encouragementNotifications: true,
          leaderboardNotifications: true,
          showMoodToFriends: true,
          allowFriendRequests: true,
          currentMoodId: seed.moodId,
          currentMoodEmoji: seed.moodEmoji,
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    const dateIso = seed.checkedInToday ? todayIso() : new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await db.collection("dailyCheckIns").updateOne(
      { userId: outId, checkInDate: new Date(dateIso) },
      {
        $set: {
          userId: outId,
          moodEmoji: seed.moodEmoji,
          moodScore: 2,
          reflectionText: null,
          checkInDate: new Date(dateIso),
          createdAt: now,
        },
      },
      { upsert: true }
    );
    ids.push(outId);
  }

  const [alexId, joshId, mayaId] = ids;
  for (const otherId of [alexId, joshId]) {
    const key = friendPairKey(uid, otherId);
    await db.collection("friends").updateOne(
      { pairKey: key },
      {
        $set: {
          userAId: String(uid) < String(otherId) ? uid : otherId,
          userBId: String(uid) < String(otherId) ? otherId : uid,
          pairKey: key,
          requestedBy: uid,
          status: "accepted",
          createdAt: now,
          acceptedAt: now,
          blockedAt: null,
        },
      },
      { upsert: true }
    );
  }

  const pendingKey = friendPairKey(uid, mayaId);
  await db.collection("friends").updateOne(
    { pairKey: pendingKey },
    {
      $set: {
        userAId: String(uid) < String(mayaId) ? uid : mayaId,
        userBId: String(uid) < String(mayaId) ? mayaId : uid,
        pairKey: pendingKey,
        requestedBy: mayaId,
        status: "pending",
        createdAt: now,
        acceptedAt: null,
        blockedAt: null,
      },
    },
    { upsert: true }
  );

  return { seeded: true };
}

async function loadFriendshipForUser(db, friendshipId, viewerUserId) {
  const fid = toObjectId(friendshipId, "friendshipId");
  const uid = toObjectId(viewerUserId, "viewerUserId");
  const friendship = await db.collection("friends").findOne({
    _id: fid,
    status: { $in: ["accepted", "blocked"] },
    $or: [{ userAId: uid }, { userBId: uid }],
  });
  if (!friendship) {
    const err = new Error("Friendship not found");
    err.status = 404;
    throw err;
  }
  return { friendship, viewerId: uid };
}

function publicUserView(user, prefs, { isFriend }) {
  const anonymousMode = !!prefs?.anonymousMode;
  if (!anonymousMode || isFriend) {
    return {
      _id: user._id,
      displayName: user.displayName,
      username: user.username,
      friendCode: user.friendCode,
      anonymousMode: false,
    };
  }
  return {
    _id: user._id,
    displayName: "Anonymous user",
    username: null,
    friendCode: user.friendCode,
    anonymousMode: true,
  };
}

function normalizePhone(value) {
  const compact = String(value || "").trim().replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{6,14}$/.test(compact)) return null;
  return compact;
}

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function sanitizeUsernameBase(value) {
  const base = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 20);
  return base || "user";
}

async function ensureUniqueUsername(db, seed) {
  const base = sanitizeUsernameBase(seed);
  let candidate = base;
  for (let i = 0; i < 1000; i += 1) {
    const exists = await db.collection("users").findOne({ username: candidate }, { projection: { _id: 1 } });
    if (!exists) return candidate;
    candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
  }
  return `user${Date.now().toString(36)}`;
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
    const { email, username, displayName, password, phone, authProvider = "email" } = req.body || {};

    if (!email || !username || !displayName) {
      return res.status(400).json({ error: "email, username, displayName are required" });
    }
    if (authProvider === "email" && !password) {
      return res.status(400).json({ error: "password is required for email auth" });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const orConditions = [
      { email: String(email).toLowerCase() },
      { username: String(username).toLowerCase() },
      { phone: normalizedPhone },
    ];

    const existing = await db.collection("users").findOne({ $or: orConditions });
    if (existing) return res.status(409).json({ error: "Email, username, or phone already exists" });

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
      phone: normalizedPhone,
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
          currentMoodId: "okay",
          currentMoodEmoji: "😐",
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
    const { identifier, password, mode = "email" } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ error: "identifier and password are required" });

    let user;
    if (mode === "phone") {
      const phone = normalizePhone(identifier);
      if (!phone) return res.status(400).json({ error: "Invalid phone number" });
      user = await db.collection("users").findOne({ phone });
    } else {
      const id = String(identifier).trim().toLowerCase();
      user = await db.collection("users").findOne({ $or: [{ email: id }, { username: id }] });
    }
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

app.post("/api/auth/social", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const {
      provider,
      email,
      fullName,
      identityToken,
      authorizationCode,
      accessToken,
    } = req.body || {};

    if (provider !== "apple" && provider !== "google") {
      return res.status(400).json({ error: "provider must be apple or google" });
    }

    const claims = decodeJwtPayload(identityToken);
    const providerSub =
      String(claims?.sub || "").trim() ||
      String(authorizationCode || "").trim() ||
      String(accessToken || "").trim() ||
      null;
    const providerEmail = String(claims?.email || email || "")
      .trim()
      .toLowerCase();

    const providerKey = provider === "apple" ? "appleSub" : "googleSub";

    let user = null;
    if (providerSub) {
      user = await db.collection("users").findOne({ [providerKey]: providerSub });
    }
    if (!user && providerEmail) {
      user = await db.collection("users").findOne({ email: providerEmail });
    }

    const now = new Date();

    if (!user) {
      const displayName =
        String(fullName || claims?.name || "").trim() ||
        (providerEmail ? providerEmail.split("@")[0] : "Mentali user");

      const usernameSeed = providerEmail ? providerEmail.split("@")[0] : `${provider}_user`;
      const username = await ensureUniqueUsername(db, usernameSeed);
      const fallbackEmail = providerEmail || `${provider}.${Date.now()}@mentali.local`;

      const doc = {
        email: fallbackEmail,
        username,
        displayName,
        authProvider: provider,
        friendCode: await generateFriendCode(db),
        currentTier: "Bronze",
        points: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: now,
        updatedAt: now,
        [providerKey]: providerSub,
      };

      const insert = await db.collection("users").insertOne(doc);
      user = await db.collection("users").findOne({ _id: insert.insertedId });
    } else {
      const patch = { updatedAt: now };
      if (providerSub && !user[providerKey]) patch[providerKey] = providerSub;
      if (fullName && String(fullName).trim()) patch.displayName = String(fullName).trim();
      await db.collection("users").updateOne({ _id: user._id }, { $set: patch });
      user = { ...user, ...patch };
    }

    await db.collection("userPreferences").updateOne(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          anonymousMode: false,
          theme: "pastel",
          dailyReminderEnabled: true,
          reminderTime: "20:00",
          encouragementNotifications: true,
          leaderboardNotifications: true,
          showMoodToFriends: true,
          allowFriendRequests: true,
          currentMoodId: "okay",
          currentMoodEmoji: "😐",
          updatedAt: now,
        },
      },
      { upsert: true }
    );

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

    let normalized;
    let user;
    if (mode === "email") {
      normalized = String(value).trim().toLowerCase();
      user = await db.collection("users").findOne({ email: normalized });
    } else {
      normalized = normalizePhone(value);
      if (!normalized) {
        return res.status(400).json({ error: "Invalid phone number" });
      }
      user = await db.collection("users").findOne({ phone: normalized });
    }
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
    const normalized =
      mode === "phone" ? normalizePhone(value) : String(value || "").trim().toLowerCase();
    if (!normalized) {
      return res.status(400).json({ error: mode === "phone" ? "Invalid phone number" : "Invalid email" });
    }
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
    const normalized =
      mode === "phone" ? normalizePhone(value) : String(value || "").trim().toLowerCase();
    if (!normalized) {
      return res.status(400).json({ error: mode === "phone" ? "Invalid phone number" : "Invalid email" });
    }
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

const { generateCheckInReply } = require("./checkinChat");

app.post("/api/checkin/chat", async (req, res, next) => {
  try {
    const { mood, questions, answers, messages, userMessage, selectedOption, ackIndex } = req.body || {};
    if (!mood) return res.status(400).json({ error: "mood is required" });

    const result = await generateCheckInReply({
      mood,
      questions: questions ?? [],
      answers: answers ?? [],
      messages: messages ?? [],
      userMessage: userMessage ?? null,
      selectedOption: selectedOption ?? null,
      ackIndex: ackIndex ?? 0,
    });

    res.json(result);
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

app.get("/api/users/lookup-by-code", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const code = String(req.query.code || "")
      .trim()
      .toUpperCase();
    const viewerId = req.query.viewerId;
    if (!code) return res.status(400).json({ error: "code is required" });

    const user = await db.collection("users").findOne({ friendCode: code });
    if (!user) return res.status(404).json({ error: "No user found for that friend code" });

    const prefs = await getUserPreferences(db, user._id);
    const isFriend = viewerId ? await areFriends(db, viewerId, user._id) : false;
    res.json({ user: publicUserView(user, prefs, { isFriend }) });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/request-by-code", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { fromUserId, friendCode } = req.body || {};
    const from = toObjectId(fromUserId, "fromUserId");
    const code = String(friendCode || "")
      .trim()
      .toUpperCase();
    if (!code) return res.status(400).json({ error: "friendCode is required" });

    const target = await db.collection("users").findOne({ friendCode: code });
    if (!target) return res.status(404).json({ error: "No user found for that friend code" });
    if (String(target._id) === String(from)) {
      return res.status(400).json({ error: "You cannot add your own friend code" });
    }

    const key = friendPairKey(from, target._id);
    const now = new Date();
    const userA = String(from) < String(target._id) ? from : target._id;
    const userB = String(from) < String(target._id) ? target._id : from;

    // If a non-blocked document already exists (e.g. a removed friendship), reset it to
    // pending so the recipient sees a fresh incoming request instead of nothing.
    const existing = await db.collection("friends").findOne({ pairKey: key });
    if (existing) {
      if (existing.status === "blocked") {
        return res.status(403).json({ error: "Unable to send friend request" });
      }
      if (existing.status !== "pending") {
        await db.collection("friends").updateOne(
          { pairKey: key },
          {
            $set: {
              requestedBy: from,
              status: "pending",
              createdAt: now,
              acceptedAt: null,
              blockedAt: null,
            },
          }
        );
      }
    } else {
      await db.collection("friends").insertOne({
        userAId: userA,
        userBId: userB,
        pairKey: key,
        requestedBy: from,
        status: "pending",
        createdAt: now,
        acceptedAt: null,
        blockedAt: null,
      });
    }

    const prefs = await getUserPreferences(db, target._id);
    const isFriend = await areFriends(db, from, target._id);
    res.json({ ok: true, user: publicUserView(target, prefs, { isFriend }) });
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

app.post("/api/friends/:id/reject", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    await db.collection("friends").deleteOne({ _id: toObjectId(req.params.id) });
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

app.get("/api/friends/raw/:userId", async (req, res, next) => {
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

app.get("/api/friends/view/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const today = todayIso();

    const rows = await db
      .collection("friends")
      .find({
        status: { $in: ["pending", "accepted", "blocked"] },
        $or: [{ userAId: userId }, { userBId: userId }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const accepted = rows.filter((r) => r.status === "accepted" || r.status === "blocked");
    const incoming = rows.filter(
      (r) => r.status === "pending" && String(r.requestedBy) !== String(userId)
    );

    const otherIds = [
      ...new Set(
        [...accepted, ...incoming].map((r) =>
          String(r.userAId) === String(userId) ? String(r.userBId) : String(r.userAId)
        )
      ),
    ].map((id) => new ObjectId(id));

    const users = await db
      .collection("users")
      .find({ _id: { $in: otherIds } })
      .project({ displayName: 1, username: 1, friendCode: 1, currentStreak: 1, updatedAt: 1 })
      .toArray();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const prefs = await db.collection("userPreferences").find({ userId: { $in: otherIds } }).toArray();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));

    const checkins = await db
      .collection("dailyCheckIns")
      .find({ userId: { $in: otherIds } })
      .sort({ checkInDate: -1, createdAt: -1 })
      .toArray();
    const latestCheckin = new Map();
    for (const c of checkins) {
      const key = String(c.userId);
      if (!latestCheckin.has(key)) latestCheckin.set(key, c);
    }

    const friends = accepted
      .map((r) => {
        const otherId = String(r.userAId) === String(userId) ? String(r.userBId) : String(r.userAId);
        const user = userMap.get(otherId);
        if (!user) return null;
        const pref = prefMap.get(otherId);
        const checkin = latestCheckin.get(otherId);
        const checkInIso = checkin?.checkInDate ? new Date(checkin.checkInDate).toISOString().slice(0, 10) : null;
        const showMood = pref?.showMoodToFriends !== false;

        return {
          id: String(r._id),
          userId: otherId,
          name: user.displayName || user.username || "Friend",
          code: user.friendCode,
          streak: Number(r.streak ?? 0),
          lastSeen: relativeLastSeen(user.updatedAt),
          streakDone: checkInIso === today,
          lastStreakDoneDate: checkInIso,
          lastStreakDate: r.lastStreakDate || null,
          addedAt: new Date(r.createdAt || new Date()).getTime(),
          blocked: r.status === "blocked",
          moodId: showMood ? pref?.currentMoodId || null : null,
          moodEmoji: showMood ? pref?.currentMoodEmoji || checkin?.moodEmoji || null : null,
        };
      })
      .filter(Boolean);

    const requests = incoming
      .map((r) => {
        const otherId = String(r.userAId) === String(userId) ? String(r.userBId) : String(r.userAId);
        const user = userMap.get(otherId);
        const pref = prefMap.get(otherId);
        if (!user) return null;
        return {
          id: String(r._id),
          userId: otherId,
          name: user.displayName || user.username || "Friend",
          username: user.username || null,
          anonymousMode: !!pref?.anonymousMode,
        };
      })
      .filter(Boolean);

    res.json({ friends, requests });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/bootstrap/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const result = await ensureFriendBootstrapData(db, req.params.userId);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
});

app.get("/api/chats/:friendshipId/messages", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const viewerUserId = String(req.query.viewerUserId || "");
    if (!viewerUserId) return res.status(400).json({ error: "viewerUserId is required" });

    const { friendship } = await loadFriendshipForUser(db, req.params.friendshipId, viewerUserId);
    if (friendship.status === "blocked") {
      return res.json({ data: [] });
    }

    const rows = await db
      .collection("chatMessages")
      .find({ friendshipId: friendship._id })
      .sort({ createdAt: 1 })
      .limit(500)
      .toArray();

    res.json({
      data: rows.map((r) => ({
        _id: String(r._id),
        friendshipId: String(r.friendshipId),
        senderUserId: String(r.senderUserId),
        recipientUserId: String(r.recipientUserId),
        text: r.text || "",
        imageUri: r.imageUri || null,
        fileName: r.fileName || null,
        fileUri: r.fileUri || null,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/chats/:friendshipId/messages", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const { senderUserId, text = "", imageUri = null, fileName = null, fileUri = null } = req.body || {};
    if (!senderUserId) return res.status(400).json({ error: "senderUserId is required" });
    if (!String(text).trim() && !imageUri && !fileName) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const { friendship, viewerId } = await loadFriendshipForUser(db, req.params.friendshipId, senderUserId);
    if (friendship.status === "blocked") {
      return res.status(403).json({ error: "This friendship is blocked" });
    }

    const recipientUserId =
      String(friendship.userAId) === String(viewerId) ? friendship.userBId : friendship.userAId;
    const now = new Date();

    const out = await db.collection("chatMessages").insertOne({
      friendshipId: friendship._id,
      senderUserId: viewerId,
      recipientUserId,
      text: String(text || ""),
      imageUri: imageUri || null,
      fileName: fileName || null,
      fileUri: fileUri || null,
      createdAt: now,
    });

    const streakUpdate = applyFriendshipMessageStreak(friendship);
    await db.collection("friends").updateOne(
      { _id: friendship._id },
      {
        $set: {
          streak: streakUpdate.streak,
          lastStreakDate: streakUpdate.lastStreakDate,
        },
      }
    );

    await db.collection("users").updateMany(
      { _id: { $in: [viewerId, recipientUserId] } },
      { $set: { updatedAt: now } }
    );

    res.status(201).json({
      data: {
        _id: String(out.insertedId),
        friendshipId: String(friendship._id),
        senderUserId: String(viewerId),
        recipientUserId: String(recipientUserId),
        text: String(text || ""),
        imageUri: imageUri || null,
        fileName: fileName || null,
        fileUri: fileUri || null,
        createdAt: now,
      },
      streak: streakUpdate.streak,
      streakUnlocked: streakUpdate.streakUnlocked,
    });
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

app.delete("/api/users/:userId", async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");

    await Promise.all([
      db.collection("userPreferences").deleteMany({ userId: uid }),
      db.collection("friends").deleteMany({ $or: [{ userAId: uid }, { userBId: uid }] }),
      db.collection("dailyCheckins").deleteMany({ userId: uid }),
      db.collection("chatbotSessions").deleteMany({ userId: uid }),
      db.collection("passwordResetCodes").deleteMany({ userId: uid }),
      db.collection("users").deleteOne({ _id: uid }),
    ]);

    res.json({ ok: true });
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
