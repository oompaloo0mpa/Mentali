const crypto = require("node:crypto");

const SECRET = process.env.JWT_SECRET || "mentali-dev-secret-change-me";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signToken(userId) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      sub: String(userId),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    })
  );
  const signature = crypto.createHmac("sha256", SECRET).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(`${header}.${payload}`).digest("base64url");
  if (signature !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.sub ? String(data.sub) : null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.authUserId = userId;
  return next();
}

function assertSelf(req, res, userId) {
  if (!userId) return true;
  if (String(userId) !== String(req.authUserId)) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

module.exports = { signToken, verifyToken, requireAuth, assertSelf };
