require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const fs = require("node:fs");
const path = require("node:path");
const {
  randomBytes
} = require("node:crypto");
const {
  Buffer
} = require("node:buffer");
const {
  ObjectId
} = require("mongodb");
const {
  connectMongo
} = require("./mongodb");
const {
  signToken,
  requireAuth,
  assertSelf
} = require("./auth");

const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb" }));

const PORT = Number(process.env.API_PORT || 4000);
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, {
    recursive: true
  });
}

const MIME_EXTENSION = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
  "text/plain": ".txt",
};

function sanitizeUploadName(name) {
  return String(name || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function uploadPublicUrl(req, filename) {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}/api/uploads/${encodeURIComponent(filename)}`;
}

function isPublicMediaUri(uri) {
  return typeof uri === "string" && /^https?:\/\//i.test(uri);
}

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
    const exists = await db.collection("users").findOne({
      friendCode: code
    }, {
      projection: {
        _id: 1
      }
    });
    if (!exists) return code;
  }
  throw new Error("Unable to generate unique friend code");
}

function stripSensitive(user) {
  if (!user) return user;
  const {
    passwordHash,
    ...safe
  } = user;
  return safe;
}

function authPayload(user) {
  const id = user._id ?.toString ?.() ?? String(user._id);
  return {
    user: stripSensitive(user),
    token: signToken(id)
  };
}

const PREFERENCE_FIELDS = new Set([
  "anonymousMode",
  "theme",
  "dailyReminderEnabled",
  "reminderTime",
  "encouragementNotifications",
  "leaderboardNotifications",
  "showMoodToFriends",
  "allowFriendRequests",
  "currentMoodId",
  "currentMoodEmoji",
]);

function pickPreferencePatch(body) {
  const patch = {};
  if (!body || typeof body !== "object") return patch;
  for (const key of PREFERENCE_FIELDS) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  return patch;
}

const DISPLAY_NAME_CHANGE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const DEFAULT_USER_PREFERENCES = {
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
};

async function areFriends(db, userA, userB) {
  const a = toObjectId(userA, "userId");
  const b = toObjectId(userB, "userId");
  const key = friendPairKey(a, b);
  const row = await db.collection("friends").findOne({
    pairKey: key,
    status: "accepted"
  });
  return !!row;
}

async function getUserPreferences(db, userId) {
  const uid = toObjectId(userId, "userId");
  return db.collection("userPreferences").findOne({
    userId: uid
  });
}

async function createNotification(db, userId, { icon, title }) {
  const uid = toObjectId(userId, "userId");
  await db.collection("notifications").insertOne({
    userId: uid,
    icon,
    title: String(title).trim(),
    read: false,
    createdAt: new Date(),
  });
}

function formatNotificationRow(row) {
  const created = row.createdAt ? new Date(row.createdAt) : new Date();
  const diffMs = Date.now() - created.getTime();
  const mins = Math.floor(diffMs / 60000);
  let time = "Just now";
  if (mins >= 60 * 48) {
    const days = Math.floor(mins / (60 * 24));
    time = days === 1 ? "Yesterday" : `${days} days ago`;
  } else if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    time = hours === 1 ? "1h ago" : `${hours}h ago`;
  } else if (mins >= 1) {
    time = `${mins}m ago`;
  }

  const recent = diffMs < 7 * 24 * 60 * 60 * 1000;
  return {
    id: row._id.toString(),
    icon: row.icon,
    title: row.title,
    time,
    read: !!row.read,
    recent,
    createdAt: created.toISOString(),
  };
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
    return {
      streak: current,
      lastStreakDate: today,
      streakUnlocked: false
    };
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
    $or: [{
      userAId: uid
    }, {
      userBId: uid
    }],
    status: {
      $in: ["accepted", "pending"]
    },
  });
  if (hasAny) return {
    seeded: false
  };

  const now = new Date();
  const sampleUsers = [{
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
    const existing = await db.collection("users").findOne({
      username: seed.username
    });
    let outId = existing ?._id;
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
      await db.collection("users").updateOne({
        _id: outId
      }, {
        $set: {
          displayName: seed.displayName,
          friendCode: seed.friendCode,
          currentStreak: seed.currentStreak,
          longestStreak: seed.longestStreak,
          updatedAt: now,
        },
      });
    }

    await db.collection("userPreferences").updateOne({
      userId: outId
    }, {
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
    }, {
      upsert: true
    });

    const dateIso = seed.checkedInToday ? todayIso() : new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await db.collection("dailyCheckIns").updateOne({
      userId: outId,
      checkInDate: new Date(dateIso)
    }, {
      $set: {
        userId: outId,
        moodEmoji: seed.moodEmoji,
        moodScore: 2,
        reflectionText: null,
        checkInDate: new Date(dateIso),
        createdAt: now,
      },
    }, {
      upsert: true
    });
    ids.push(outId);
  }

  const [alexId, joshId, mayaId] = ids;
  for (const otherId of [alexId, joshId]) {
    const key = friendPairKey(uid, otherId);
    await db.collection("friends").updateOne({
      pairKey: key
    }, {
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
    }, {
      upsert: true
    });
  }

  const pendingKey = friendPairKey(uid, mayaId);
  await db.collection("friends").updateOne({
    pairKey: pendingKey
  }, {
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
  }, {
    upsert: true
  });

  return {
    seeded: true
  };
}

async function loadFriendshipForUser(db, friendshipId, viewerUserId) {
  const fid = toObjectId(friendshipId, "friendshipId");
  const uid = toObjectId(viewerUserId, "viewerUserId");
  const friendship = await db.collection("friends").findOne({
    _id: fid,
    status: {
      $in: ["accepted", "blocked"]
    },
    $or: [{
      userAId: uid
    }, {
      userBId: uid
    }],
  });
  if (!friendship) {
    const err = new Error("Friendship not found");
    err.status = 404;
    throw err;
  }
  return {
    friendship,
    viewerId: uid
  };
}

function publicUserView(user, prefs, {
  isFriend
}) {
  const anonymousMode = !!prefs ?.anonymousMode;
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
    const exists = await db.collection("users").findOne({
      username: candidate
    }, {
      projection: {
        _id: 1
      }
    });
    if (!exists) return candidate;
    candidate = `${base}${Math.floor(100 + Math.random() * 900)}`;
  }
  return `user${Date.now().toString(36)}`;
}

app.get("/api/health", async (_req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    await db.command({
      ping: 1
    });
    res.json({
      ok: true,
      db: db.databaseName
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      email,
      username,
      displayName,
      password,
      phone,
      authProvider = "email"
    } = req.body || {};

    if (!email || !username || !displayName) {
      return res.status(400).json({
        error: "email, username, displayName are required"
      });
    }
    if (authProvider === "email" && !password) {
      return res.status(400).json({
        error: "password is required for email auth"
      });
    }
    if (!phone) {
      return res.status(400).json({
        error: "phone is required"
      });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({
        error: "Invalid phone number"
      });
    }

    const orConditions = [{
        email: String(email).toLowerCase()
      },
      {
        username: String(username).toLowerCase()
      },
      {
        phone: normalizedPhone
      },
    ];

    const existing = await db.collection("users").findOne({
      $or: orConditions
    });
    if (existing) return res.status(409).json({
      error: "Email, username, or phone already exists"
    });

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
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
      ...(authProvider === "email" ? {
        passwordHash: await bcrypt.hash(String(password), 10)
      } : {}),
      phone: normalizedPhone,
    };

    const insert = await db.collection("users").insertOne(doc);
    const userId = insert.insertedId;

    await db.collection("userPreferences").updateOne({
      userId
    }, {
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
    }, {
      upsert: true
    });

    const created = await db.collection("users").findOne({
      _id: userId
    });
    res.status(201).json(authPayload(created));
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      identifier,
      password,
      mode = "email"
    } = req.body || {};
    if (!identifier || !password) return res.status(400).json({
      error: "identifier and password are required"
    });

    let user;
    if (mode === "phone") {
      const phone = normalizePhone(identifier);
      if (!phone) return res.status(400).json({
        error: "Invalid phone number"
      });
      user = await db.collection("users").findOne({
        phone
      });
    } else {
      const id = String(identifier).trim().toLowerCase();
      user = await db.collection("users").findOne({
        $or: [{
          email: id
        }, {
          username: id
        }]
      });
    }
    if (!user) return res.status(401).json({
      error: "Invalid credentials"
    });

    if (user.authProvider !== "email") {
      return res.status(400).json({
        error: `Use ${user.authProvider} login for this account`
      });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash || "");
    if (!ok) return res.status(401).json({
      error: "Invalid credentials"
    });

    res.json(authPayload(user));
  } catch (e) {
    next(e);
  }
});

app.get("/api/users/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const user = await db.collection("users").findOne({
      _id: uid
    });
    if (!user) return res.status(404).json({
      error: "User not found"
    });
    res.json({
      user: stripSensitive(user)
    });
  } catch (e) {
    next(e);
  }
});

app.patch("/api/users/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const user = await db.collection("users").findOne({
      _id: uid
    });
    if (!user) return res.status(404).json({
      error: "User not found"
    });

    const {
      displayName,
      username,
      onboardingCompleted,
    } = req.body || {};
    const patch = {
      updatedAt: new Date()
    };

    if (displayName != null) {
      const nextName = String(displayName).trim();
      if (!nextName) {
        return res.status(400).json({
          error: "Display name is required"
        });
      }
      const currentName = String(user.displayName || "").trim();
      if (nextName !== currentName) {
        const lastChanged = user.displayNameChangedAt ?
          new Date(user.displayNameChangedAt).getTime() :
          0;
        if (lastChanged && Date.now() - lastChanged < DISPLAY_NAME_CHANGE_COOLDOWN_MS) {
          const daysLeft = Math.ceil(
            (DISPLAY_NAME_CHANGE_COOLDOWN_MS - (Date.now() - lastChanged)) / (24 * 60 * 60 * 1000),
          );
          return res.status(429).json({
            error: `Display name can only be changed every 3 days. Try again in ${daysLeft} day(s).`,
          });
        }
        patch.displayName = nextName;
        patch.displayNameChangedAt = new Date();
      }
    }

    if (username != null) patch.username = String(username).trim().toLowerCase();
    if (onboardingCompleted != null) patch.onboardingCompleted = !!onboardingCompleted;
    if (patch.username) {
      const taken = await db.collection("users").findOne({
        username: patch.username,
        _id: {
          $ne: uid
        },
      });
      if (taken) return res.status(409).json({
        error: "Username already taken"
      });
    }
    await db.collection("users").updateOne({
      _id: uid
    }, {
      $set: patch
    });
    const updatedUser = await db.collection("users").findOne({
      _id: uid
    });
    res.json({
      user: stripSensitive(updatedUser)
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/social", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      provider,
      email,
      fullName,
      identityToken,
      authorizationCode,
      accessToken,
    } = req.body || {};

    if (provider !== "apple" && provider !== "google") {
      return res.status(400).json({
        error: "provider must be apple or google"
      });
    }

    const claims = decodeJwtPayload(identityToken);
    const providerSub =
      String(claims ?.sub || "").trim() ||
      String(authorizationCode || "").trim() ||
      String(accessToken || "").trim() ||
      null;
    const providerEmail = String(claims ?.email || email || "")
      .trim()
      .toLowerCase();

    const providerKey = provider === "apple" ? "appleSub" : "googleSub";

    let user = null;
    if (providerSub) {
      user = await db.collection("users").findOne({
        [providerKey]: providerSub
      });
    }
    if (!user && providerEmail) {
      user = await db.collection("users").findOne({
        email: providerEmail
      });
    }

    const now = new Date();

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const displayName =
        String(fullName || claims ?.name || "").trim() ||
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
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
        [providerKey]: providerSub,
      };

      const insert = await db.collection("users").insertOne(doc);
      user = await db.collection("users").findOne({
        _id: insert.insertedId
      });
    } else {
      const patch = {
        updatedAt: now
      };
      if (providerSub && !user[providerKey]) patch[providerKey] = providerSub;
      if (fullName && String(fullName).trim()) patch.displayName = String(fullName).trim();
      await db.collection("users").updateOne({
        _id: user._id
      }, {
        $set: patch
      });
      user = {
        ...user,
        ...patch
      };
    }

    await db.collection("userPreferences").updateOne({
      userId: user._id
    }, {
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
    }, {
      upsert: true
    });

    res.json({
      ...authPayload(user),
      isNewUser,
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/request-reset", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      mode,
      value
    } = req.body || {};
    if (!mode || !value) return res.status(400).json({
      error: "mode and value are required"
    });

    let normalized;
    let user;
    if (mode === "email") {
      normalized = String(value).trim().toLowerCase();
      user = await db.collection("users").findOne({
        email: normalized
      });
    } else {
      normalized = normalizePhone(value);
      if (!normalized) {
        return res.status(400).json({
          error: "Invalid phone number"
        });
      }
      user = await db.collection("users").findOne({
        phone: normalized
      });
    }
    if (!user) return res.status(404).json({
      error: "Account not found"
    });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.collection("passwordResetCodes").updateOne({
      mode,
      value: normalized
    }, {
      $set: {
        mode,
        value: normalized,
        code,
        userId: user._id,
        createdAt: now,
        expiresAt,
        used: false
      }
    }, {
      upsert: true
    });

    // Demo only: include code when not in production.
    const payload = {
      ok: true
    };
    if (process.env.NODE_ENV !== "production") {
      payload.code = code;
      payload.demoNote = "Reset code shown for local development only.";
    }
    res.json(payload);
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/verify-reset-code", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      mode,
      value,
      code
    } = req.body || {};
    const normalized =
      mode === "phone" ? normalizePhone(value) : String(value || "").trim().toLowerCase();
    if (!normalized) {
      return res.status(400).json({
        error: mode === "phone" ? "Invalid phone number" : "Invalid email"
      });
    }
    const record = await db.collection("passwordResetCodes").findOne({
      mode,
      value: normalized,
      code: String(code)
    });
    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({
        error: "Invalid or expired code"
      });
    }
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/auth/reset-password", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      mode,
      value,
      code,
      newPassword
    } = req.body || {};
    const normalized =
      mode === "phone" ? normalizePhone(value) : String(value || "").trim().toLowerCase();
    if (!normalized) {
      return res.status(400).json({
        error: mode === "phone" ? "Invalid phone number" : "Invalid email"
      });
    }
    const record = await db.collection("passwordResetCodes").findOne({
      mode,
      value: normalized,
      code: String(code)
    });
    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({
        error: "Invalid or expired code"
      });
    }

    await db.collection("users").updateOne({
      _id: record.userId
    }, {
      $set: {
        passwordHash: await bcrypt.hash(String(newPassword), 10),
        authProvider: "email",
        updatedAt: new Date()
      }
    });
    await db.collection("passwordResetCodes").updateOne({
      _id: record._id
    }, {
      $set: {
        used: true
      }
    });

    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

function normalizeWellbeingScale(payload, scale) {
  if (!payload || typeof payload !== "object") return null;
  const band = String(payload.band || "");
  if (!["calm", "mild", "moderate", "high"].includes(band)) return null;
  const base = {
    total: Number(payload.total),
    band,
    suggestSupport: !!payload.suggestSupport,
    answeredCount: Number(payload.answeredCount ?? 0),
    itemCount: Number(payload.itemCount ?? 0),
  };
  if (scale === "phq4") {
    return {
      ...base,
      anxietyScore: Number(payload.anxietyScore ?? 0),
      moodScore: Number(payload.moodScore ?? 0),
    };
  }
  return base;
}

function normalizeCheckInResponses(responses) {
  if (!Array.isArray(responses)) return [];
  return responses
    .map((item) => {
      const scale = String(item ?.scale || "");
      if (!["phq4", "k10"].includes(scale)) return null;
      const row = {
        questionId: String(item.questionId || ""),
        scale,
        dimension: String(item.dimension || "distress"),
        value: Number(item.value ?? 0),
        label: String(item.label || ""),
        skipped: !!item.skipped,
      };
      if (item.confidence != null) row.confidence = Number(item.confidence);
      if (item.source) row.source = String(item.source);
      return row;
    })
    .filter((item) => item && item.questionId);
}

async function applyUserDailyStreak(db, userId, dateValue, isFirstCheckInToday) {
  if (!isFirstCheckInToday) return null;
  const user = await db.collection("users").findOne({
    _id: userId
  });
  if (!user) return null;

  const today = dateValue.toISOString().slice(0, 10);
  const yesterday = yesterdayIso(today);
  const last =
    user.lastCheckInDate instanceof Date ?
    user.lastCheckInDate.toISOString().slice(0, 10) :
    user.lastCheckInDate ?
    String(user.lastCheckInDate).slice(0, 10) :
    null;

  let current = Number(user.currentStreak || 0);
  let longest = Number(user.longestStreak || 0);
  if (last === yesterday) current += 1;
  else if (last !== today) current = 1;
  longest = Math.max(longest, current);

  await db.collection("users").updateOne({
    _id: userId
  }, {
    $set: {
      currentStreak: current,
      longestStreak: longest,
      lastCheckInDate: dateValue,
      updatedAt: new Date(),
    },
  });
  return {
    current,
    longest
  };
}

app.post("/api/daily-checkins", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      userId,
      moodId,
      moodEmoji,
      moodScore,
      reflectionText,
      checkInDate,
      phq4,
      k10,
      responses,
    } = req.body || {};
    if (!assertSelf(req, res, userId)) return;
    const now = new Date();
    const dateValue = checkInDate ? new Date(checkInDate) : new Date(now.toISOString().slice(0, 10));
    const uid = toObjectId(req.authUserId, "userId");
    const existing = await db.collection("dailyCheckIns").findOne({
      userId: uid,
      checkInDate: dateValue,
    });
    const isFirstCheckInToday = !existing;

    const doc = {
      userId: uid,
      moodId: moodId ? String(moodId) : null,
      moodEmoji,
      moodScore,
      reflectionText: reflectionText || null,
      checkInDate: dateValue,
      phq4: normalizeWellbeingScale(phq4, "phq4"),
      k10: normalizeWellbeingScale(k10, "k10"),
      responses: normalizeCheckInResponses(responses),
      createdAt: existing ?.createdAt ?? now,
      updatedAt: now,
    };

    await db.collection("dailyCheckIns").updateOne({
      userId: doc.userId,
      checkInDate: doc.checkInDate
    }, {
      $set: doc
    }, {
      upsert: true
    });

    const streak = await applyUserDailyStreak(db, uid, dateValue, isFirstCheckInToday);
    if (isFirstCheckInToday && streak.current > 0) {
      await createNotification(db, uid, {
        icon: "flame",
        title:
          streak.current === 1 ?
          "You started a new check-in streak" :
          `Your streak is now ${streak.current} days`,
      });
    }
    res.status(201).json({
      ok: true,
      streak
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/daily-checkins/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db.collection("dailyCheckIns").find({
      userId
    }).sort({
      createdAt: -1
    }).limit(60).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

const {
  generateCheckInReply
} = require("./checkinChat");
const {
  DAILY_QUEST_CATALOG
} = require("./dailyQuests");

function todayDateOnly() {
  return new Date(new Date().toISOString().slice(0, 10));
}

async function assignDailyQuestsForUser(db, uid, count = 3, replaceExisting = false) {
  const today = todayDateOnly();
  const collection = db.collection("userQuests");

  if (replaceExisting) {
    await collection.deleteMany({
      userId: uid,
      assignedDate: today
    });
  }

  const existing = await collection.find({
    userId: uid,
    assignedDate: today
  }).toArray();
  if (existing.length >= count) return existing;

  const alreadyIds = existing.map((row) => row.questId);
  const needed = count - existing.length;

  const pool = await db
    .collection("quests")
    .aggregate([{
        $match: {
          active: true,
          _id: {
            $nin: alreadyIds
          }
        }
      },
      {
        $sample: {
          size: needed
        }
      },
    ])
    .toArray();

  const now = new Date();
  for (const quest of pool) {
    await collection.updateOne({
      userId: uid,
      questId: quest._id,
      assignedDate: today
    }, {
      $setOnInsert: {
        userId: uid,
        questId: quest._id,
        assignedDate: today,
        completed: false,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    }, {
      upsert: true
    });
  }

  return collection.find({
    userId: uid,
    assignedDate: today
  }).toArray();
}

async function dailyQuestsWithDetails(db, uid, replaceExisting = false) {
  const rows = await assignDailyQuestsForUser(db, uid, 3, replaceExisting);
  const questIds = rows.map((row) => row.questId);
  const quests = await db.collection("quests").find({
    _id: {
      $in: questIds
    }
  }).toArray();
  const questMap = new Map(quests.map((q) => [String(q._id), q]));

  return rows.map((row) => {
    const quest = questMap.get(String(row.questId));
    return {
      id: row._id.toString(),
      questId: row.questId.toString(),
      title: quest ?.title ?? "Daily quest",
      description: quest ?.description ?? "",
      rewardPoints: Number(quest ?.rewardPoints ?? 0),
      category: quest ?.category ?? "checkin",
      completed: !!row.completed,
      completedAt: row.completedAt ?? null,
    };
  });
}

app.post("/api/checkin/chat", async (req, res, next) => {
  try {
    const {
      mood,
      questions,
      answers,
      messages,
      userMessage,
      selectedOption,
      ackIndex
    } = req.body || {};
    if (!mood) return res.status(400).json({
      error: "mood is required"
    });

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
    const {
      db
    } = await connectMongo();
    const {
      userId,
      sessionDate,
      responses,
      overallWellbeingLevel,
      generatedInsight
    } = req.body || {};
    const doc = {
      userId: toObjectId(userId, "userId"),
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      responses: Array.isArray(responses) ? responses : [],
      overallWellbeingLevel,
      generatedInsight,
      createdAt: new Date(),
    };
    const out = await db.collection("chatbotSessions").insertOne(doc);
    res.status(201).json({
      id: out.insertedId.toString()
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/chatbot-sessions/:userId", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db.collection("chatbotSessions").find({
      userId
    }).sort({
      sessionDate: -1
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/users/lookup-by-code", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.query.viewerId)) return;
    const {
      db
    } = await connectMongo();
    const code = String(req.query.code || "")
      .trim()
      .toUpperCase();
    const viewerId = req.query.viewerId;
    if (!code) return res.status(400).json({
      error: "code is required"
    });

    const user = await db.collection("users").findOne({
      friendCode: code
    });
    if (!user) return res.status(404).json({
      error: "No user found for that friend code"
    });

    const prefs = await getUserPreferences(db, user._id);
    const isFriend = viewerId ? await areFriends(db, viewerId, user._id) : false;
    res.json({
      user: publicUserView(user, prefs, {
        isFriend
      })
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/request-by-code", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      fromUserId,
      friendCode
    } = req.body || {};
    if (!assertSelf(req, res, fromUserId)) return;
    const from = toObjectId(fromUserId, "fromUserId");
    const code = String(friendCode || "")
      .trim()
      .toUpperCase();
    if (!code) return res.status(400).json({
      error: "friendCode is required"
    });

    const target = await db.collection("users").findOne({
      friendCode: code
    });
    if (!target) return res.status(404).json({
      error: "No user found for that friend code"
    });
    if (String(target._id) === String(from)) {
      return res.status(400).json({
        error: "You cannot add your own friend code"
      });
    }

    const key = friendPairKey(from, target._id);
    const now = new Date();
    const userA = String(from) < String(target._id) ? from : target._id;
    const userB = String(from) < String(target._id) ? target._id : from;

    // If a non-blocked document already exists (e.g. a removed friendship), reset it to
    // pending so the recipient sees a fresh incoming request instead of nothing.
    const existing = await db.collection("friends").findOne({
      pairKey: key
    });
    if (existing) {
      if (existing.status === "blocked") {
        return res.status(403).json({
          error: "Unable to send friend request"
        });
      }
      if (existing.status !== "pending") {
        await db.collection("friends").updateOne({
          pairKey: key
        }, {
          $set: {
            requestedBy: from,
            status: "pending",
            createdAt: now,
            acceptedAt: null,
            blockedAt: null,
          },
        });
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
    if (prefs?.allowFriendRequests !== false) {
      const fromUser = await db.collection("users").findOne({ _id: from });
      const senderName = fromUser?.displayName || fromUser?.username || "Someone";
      await createNotification(db, target._id, {
        icon: "person-add",
        title: `${senderName} sent you a friend request`,
      });
    }
    res.json({
      ok: true,
      user: publicUserView(target, prefs, {
        isFriend
      })
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/request", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      fromUserId,
      toUserId
    } = req.body || {};
    const from = toObjectId(fromUserId, "fromUserId");
    const to = toObjectId(toUserId, "toUserId");
    const key = friendPairKey(from, to);

    const now = new Date();
    await db.collection("friends").updateOne({
      pairKey: key
    }, {
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
    }, {
      upsert: true
    });
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/:id/accept", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const friendshipId = toObjectId(req.params.id);
    const row = await db.collection("friends").findOne({
      _id: friendshipId
    });
    if (!row) return res.status(404).json({
      error: "Friend request not found"
    });
    if (String(row.requestedBy) === String(req.authUserId)) {
      return res.status(403).json({
        error: "Cannot accept your own request"
      });
    }
    if (![String(row.userAId), String(row.userBId)].includes(String(req.authUserId))) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }
    await db.collection("friends").updateOne({
      _id: friendshipId
    }, {
      $set: {
        status: "accepted",
        acceptedAt: new Date(),
        blockedAt: null
      }
    });
    const accepter = await db.collection("users").findOne({
      _id: toObjectId(req.authUserId, "userId")
    });
    const accepterName = accepter?.displayName || accepter?.username || "A friend";
    await createNotification(db, row.requestedBy, {
      icon: "person-add",
      title: `${accepterName} accepted your friend request`,
    });
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/:id/reject", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const friendshipId = toObjectId(req.params.id);
    const row = await db.collection("friends").findOne({
      _id: friendshipId
    });
    if (!row) return res.status(404).json({
      error: "Friendship not found"
    });
    if (![String(row.userAId), String(row.userBId)].includes(String(req.authUserId))) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }
    await db.collection("friends").deleteOne({
      _id: friendshipId
    });
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/:id/block", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const friendshipId = toObjectId(req.params.id);
    const row = await db.collection("friends").findOne({
      _id: friendshipId
    });
    if (!row) return res.status(404).json({
      error: "Friendship not found"
    });
    if (![String(row.userAId), String(row.userBId)].includes(String(req.authUserId))) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }
    await db.collection("friends").updateOne({
      _id: friendshipId
    }, {
      $set: {
        status: "blocked",
        blockedAt: new Date()
      }
    });
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/friends/raw/:userId", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const data = await db
      .collection("friends")
      .find({
        status: {
          $in: ["pending", "accepted", "blocked"]
        },
        $or: [{
          userAId: userId
        }, {
          userBId: userId
        }],
      })
      .sort({
        createdAt: -1
      })
      .toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/friends/view/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const userId = toObjectId(req.params.userId, "userId");
    const today = todayIso();

    const rows = await db
      .collection("friends")
      .find({
        status: {
          $in: ["pending", "accepted", "blocked"]
        },
        $or: [{
          userAId: userId
        }, {
          userBId: userId
        }],
      })
      .sort({
        createdAt: -1
      })
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
      .find({
        _id: {
          $in: otherIds
        }
      })
      .project({
        displayName: 1,
        username: 1,
        friendCode: 1,
        currentStreak: 1,
        currentTier: 1,
        updatedAt: 1
      })
      .toArray();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const activeContests = await db.collection("leaderboardContests").find({
      status: "active"
    }).toArray();
    const activeContestIds = activeContests.map((c) => c._id);
    const participants = activeContestIds.length ?
      await db.collection("contestParticipants").find({
        userId: {
          $in: otherIds
        },
        contestId: {
          $in: activeContestIds
        }
      }).toArray() :
      [];
    const rankByUserId = new Map(participants.map((p) => [String(p.userId), Number(p.rank)]));

    const prefs = await db.collection("userPreferences").find({
      userId: {
        $in: otherIds
      }
    }).toArray();
    const prefMap = new Map(prefs.map((p) => [String(p.userId), p]));

    const checkins = await db
      .collection("dailyCheckIns")
      .find({
        userId: {
          $in: otherIds
        }
      })
      .sort({
        checkInDate: -1,
        createdAt: -1
      })
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
        const checkInIso = checkin ?.checkInDate ? new Date(checkin.checkInDate).toISOString().slice(0, 10) : null;
        const showMood = pref ?.showMoodToFriends !== false;

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
          moodId: showMood ? pref ?.currentMoodId || null : null,
          moodEmoji: showMood ? pref ?.currentMoodEmoji || checkin ?.moodEmoji || null : null,
          currentTier: user.currentTier || "Bronze",
          leaderboardRank: rankByUserId.get(otherId) ?? null,
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
          anonymousMode: !!pref ?.anonymousMode,
        };
      })
      .filter(Boolean);

    res.json({
      friends,
      requests
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/friends/bootstrap/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const result = await ensureFriendBootstrapData(db, req.params.userId);
    res.json({
      ok: true,
      ...result
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/chats/:friendshipId/messages", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.query.viewerUserId)) return;
    const {
      db
    } = await connectMongo();
    const viewerUserId = String(req.query.viewerUserId || "");
    if (!viewerUserId) return res.status(400).json({
      error: "viewerUserId is required"
    });

    const {
      friendship
    } = await loadFriendshipForUser(db, req.params.friendshipId, viewerUserId);
    if (friendship.status === "blocked") {
      return res.json({
        data: []
      });
    }

    const rows = await db
      .collection("chatMessages")
      .find({
        friendshipId: friendship._id
      })
      .sort({
        createdAt: 1
      })
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

app.post("/api/chats/:friendshipId/messages", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      senderUserId,
      text = "",
      imageUri = null,
      fileName = null,
      fileUri = null
    } = req.body || {};
    if (!assertSelf(req, res, senderUserId)) return;
    if (!senderUserId) return res.status(400).json({
      error: "senderUserId is required"
    });
    if (!String(text).trim() && !imageUri && !fileName) {
      return res.status(400).json({
        error: "Message content is required"
      });
    }
    if (imageUri && !isPublicMediaUri(imageUri)) {
      return res.status(400).json({
        error: "imageUri must be an uploaded public URL"
      });
    }
    if (fileUri && !isPublicMediaUri(fileUri)) {
      return res.status(400).json({
        error: "fileUri must be an uploaded public URL"
      });
    }

    const {
      friendship,
      viewerId
    } = await loadFriendshipForUser(db, req.params.friendshipId, senderUserId);
    if (friendship.status === "blocked") {
      return res.status(403).json({
        error: "This friendship is blocked"
      });
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
    await db.collection("friends").updateOne({
      _id: friendship._id
    }, {
      $set: {
        streak: streakUpdate.streak,
        lastStreakDate: streakUpdate.lastStreakDate,
      },
    });

    await db.collection("users").updateMany({
      _id: {
        $in: [viewerId, recipientUserId]
      }
    }, {
      $set: {
        updatedAt: now
      }
    });

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
    const {
      db
    } = await connectMongo();
    const [msg] = await db.collection("supportMessagesTemplates").aggregate([{
      $match: {
        active: true
      }
    }, {
      $sample: {
        size: 1
      }
    }]).toArray();
    res.json({
      data: msg || null
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/quests/active", async (_req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const data = await db.collection("quests").find({
      active: true
    }).sort({
      category: 1,
      title: 1
    }).toArray();
    res.json({
      data,
      catalogSize: DAILY_QUEST_CATALOG.length
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/user-quests/assign-daily", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      userId,
      count = 3,
      replace = false
    } = req.body || {};
    if (!assertSelf(req, res, userId)) return;
    const uid = toObjectId(userId, "userId");
    const data = await dailyQuestsWithDetails(db, uid, !!replace);
    res.json({
      ok: true,
      assigned: data.length,
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/user-quests/:userId/daily", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await dailyQuestsWithDetails(db, uid);
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/user-quests/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userQuests").find({
      userId: uid
    }).sort({
      assignedDate: -1
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/user-quests/:id/complete", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const questRowId = toObjectId(req.params.id);
    const userQuest = await db.collection("userQuests").findOne({
      _id: questRowId
    });
    if (!userQuest) return res.status(404).json({
      error: "Quest not found"
    });
    if (!assertSelf(req, res, userQuest.userId)) return;
    if (userQuest.completed) return res.json({
      ok: true,
      pointsAwarded: 0
    });

    const quest = await db.collection("quests").findOne({
      _id: userQuest.questId
    });
    const reward = Number(quest ?.rewardPoints || 0);

    await db.collection("userQuests").updateOne({
      _id: questRowId
    }, {
      $set: {
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    });
    if (reward > 0) {
      await db.collection("users").updateOne({
        _id: userQuest.userId
      }, {
        $inc: {
          points: reward
        },
        $set: {
          updatedAt: new Date()
        }
      });
      await createNotification(db, userQuest.userId, {
        icon: "trophy",
        title: `Quest complete! +${reward} points`,
      });
    }
    res.json({
      ok: true,
      pointsAwarded: reward
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/items", async (_req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const data = await db.collection("shopItems").find({
      active: true
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.post("/api/shop/purchase", requireAuth, async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const {
      userId,
      itemId,
      obtainedFrom = "shop"
    } = req.body || {};
    if (!assertSelf(req, res, userId)) return;
    const uid = toObjectId(req.authUserId, "userId");
    const iid = toObjectId(itemId, "itemId");
    const item = await db.collection("shopItems").findOne({
      _id: iid,
      active: true
    });
    if (!item) return res.status(404).json({
      error: "Item not found"
    });

    const user = await db.collection("users").findOne({
      _id: uid
    });
    const price = Number(item.price || 0);
    const points = Number(user ?.points || 0);
    if (price > points) return res.status(400).json({
      error: "Not enough points"
    });

    const owned = await db.collection("userInventory").findOne({
      userId: uid,
      itemId: iid
    });
    if (owned) return res.json({
      ok: true,
      alreadyOwned: true
    });

    await db.collection("userInventory").updateOne({
      userId: uid,
      itemId: iid
    }, {
      $setOnInsert: {
        userId: uid,
        itemId: iid,
        obtainedFrom,
        acquiredAt: new Date()
      }
    }, {
      upsert: true
    });
    if (price > 0) {
      await db.collection("users").updateOne({
        _id: uid
      }, {
        $inc: {
          points: -price
        },
        $set: {
          updatedAt: new Date()
        }
      });
    }
    res.json({
      ok: true,
      pointsSpent: price
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/inventory/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userInventory").find({
      userId: uid
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/shop/equipped/:userId", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("equippedItems").findOne({
      userId: uid
    });
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.put("/api/shop/equipped/:userId", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const {
      equippedTop = null, equippedAccessory = null, equippedExpression = null, equippedTheme = null
    } = req.body || {};
    await db.collection("equippedItems").updateOne({
      userId: uid
    }, {
      $set: {
        userId: uid,
        equippedTop: equippedTop ? toObjectId(equippedTop, "equippedTop") : null,
        equippedAccessory: equippedAccessory ? toObjectId(equippedAccessory, "equippedAccessory") : null,
        equippedExpression: equippedExpression ? toObjectId(equippedExpression, "equippedExpression") : null,
        equippedTheme: equippedTheme ? toObjectId(equippedTheme, "equippedTheme") : null,
        updatedAt: new Date(),
      },
    }, {
      upsert: true
    });
    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/tiers", async (_req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const data = await db.collection("leaderboardTiers").find({}).sort({
      tierLevel: 1
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/contests/active/:tierName", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const data = await db.collection("leaderboardContests").findOne({
      tierName: req.params.tierName,
      status: "active"
    });
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/leaderboard/contests/:contestId/participants", async (req, res, next) => {
  try {
    const {
      db
    } = await connectMongo();
    const contestId = toObjectId(req.params.contestId, "contestId");
    const data = await db.collection("contestParticipants").find({
      contestId
    }).sort({
      rank: 1
    }).toArray();
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.delete("/api/users/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");

    const friendships = await db
      .collection("friends")
      .find({
        $or: [{
          userAId: uid
        }, {
          userBId: uid
        }]
      })
      .project({
        _id: 1
      })
      .toArray();
    const friendshipIds = friendships.map((f) => f._id);

    await Promise.all([
      db.collection("userPreferences").deleteMany({
        userId: uid
      }),
      db.collection("friends").deleteMany({
        $or: [{
          userAId: uid
        }, {
          userBId: uid
        }]
      }),
      db.collection("dailyCheckIns").deleteMany({
        userId: uid
      }),
      db.collection("chatbotSessions").deleteMany({
        userId: uid
      }),
      db.collection("passwordResetCodes").deleteMany({
        userId: uid
      }),
      db.collection("userQuests").deleteMany({
        userId: uid
      }),
      db.collection("userInventory").deleteMany({
        userId: uid
      }),
      db.collection("equippedItems").deleteMany({
        userId: uid
      }),
      db.collection("contestParticipants").deleteMany({
        userId: uid
      }),
      friendshipIds.length ?
      db.collection("chatMessages").deleteMany({
        friendshipId: {
          $in: friendshipIds
        }
      }) :
      Promise.resolve(),
      db.collection("users").deleteOne({
        _id: uid
      }),
    ]);

    res.json({
      ok: true
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/preferences/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const data = await db.collection("userPreferences").findOne({
      userId: uid
    });
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.put("/api/preferences/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const {
      db
    } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const patch = pickPreferencePatch(req.body);
    const now = new Date();
    const existing = await db.collection("userPreferences").findOne({
      userId: uid
    });

    if (existing) {
      await db.collection("userPreferences").updateOne({
        userId: uid
      }, {
        $set: {
          ...patch,
          updatedAt: now
        }
      });
    } else {
      await db.collection("userPreferences").insertOne({
        userId: uid,
        ...DEFAULT_USER_PREFERENCES,
        ...patch,
        updatedAt: now,
      });
    }

    const data = await db.collection("userPreferences").findOne({
      userId: uid
    });
    res.json({
      data
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/notifications/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    const rows = await db.collection("notifications").find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json({ data: rows.map(formatNotificationRow) });
  } catch (e) {
    next(e);
  }
});

app.patch("/api/notifications/:notificationId/read", requireAuth, async (req, res, next) => {
  try {
    const { db } = await connectMongo();
    const notificationId = toObjectId(req.params.notificationId);
    const row = await db.collection("notifications").findOne({ _id: notificationId });
    if (!row) return res.status(404).json({ error: "Notification not found" });
    if (!assertSelf(req, res, row.userId)) return;
    await db.collection("notifications").updateOne(
      { _id: notificationId },
      { $set: { read: true } },
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.patch("/api/notifications/:userId/read-all", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    await db.collection("notifications").updateMany(
      { userId: uid, read: false },
      { $set: { read: true } },
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.delete("/api/notifications/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!assertSelf(req, res, req.params.userId)) return;
    const { db } = await connectMongo();
    const uid = toObjectId(req.params.userId, "userId");
    await db.collection("notifications").deleteMany({ userId: uid });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.use("/api/uploads", express.static(UPLOADS_DIR, {
  maxAge: "7d",
}));

app.post("/api/chats/uploads", requireAuth, async (req, res, next) => {
  try {
    const {
      fileName = "attachment",
      mimeType = "application/octet-stream",
      data
    } = req.body || {};
    if (!data) {
      return res.status(400).json({
        error: "File data is required"
      });
    }

    const buffer = Buffer.from(String(data), "base64");
    const maxBytes = String(mimeType).startsWith("image/") ? 12 * 1024 * 1024 : 25 * 1024 * 1024;
    if (buffer.length === 0) {
      return res.status(400).json({
        error: "File is empty"
      });
    }
    if (buffer.length > maxBytes) {
      return res.status(413).json({
        error: "File is too large"
      });
    }

    const safeName = sanitizeUploadName(fileName);
    const ext = path.extname(safeName) || MIME_EXTENSION[mimeType] || "";
    const storedName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    await fs.promises.writeFile(path.join(UPLOADS_DIR, storedName), buffer);

    res.json({
      url: uploadPublicUrl(req, storedName),
      fileName: safeName,
    });
  } catch (e) {
    next(e);
  }
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Mentali API listening on http://localhost:${PORT}`);
});