const dns = require("node:dns");
const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Transient errors that are worth retrying. These show up on flaky networks
 * (phone hotspots, captive portals, ISP TLS middleboxes) where the first
 * Atlas handshake or DNS SRV lookup fails but a retry succeeds.
 */
function isTransient(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return (
    message.includes("querySrv ECONNREFUSED") ||
    message.includes("querySrv ETIMEOUT") ||
    message.includes("SSL alert number 80") ||
    message.includes("tlsv1 alert internal error") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT") ||
    message.includes("Server selection timed out")
  );
}

async function connectAndPing(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 15000,
    // Prefer IPv4 sockets; some tethered/hotspot networks break TLS over IPv6.
    family: 4,
    retryReads: true,
    retryWrites: true,
  });
  await client.connect();
  const db = client.db("mentali");
  await db.command({ ping: 1 });
  return { client, db };
}

async function connectMongo() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  // Prefer reliable public resolvers for Atlas SRV lookups up front.
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // Ignore if the platform rejects setting DNS servers.
  }

  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { client, db } = await connectAndPing(uri);
      cachedClient = client;
      cachedDb = db;
      return { client, db };
    } catch (error) {
      lastError = error;
      if (!isTransient(error) || attempt === maxAttempts) {
        break;
      }
      const waitMs = attempt * 1200;
      console.warn(
        `MongoDB connect attempt ${attempt}/${maxAttempts} failed (${
          error instanceof Error ? error.message : error
        }). Retrying in ${waitMs}ms...`
      );
      await sleep(waitMs);
    }
  }

  throw lastError;
}

module.exports = { connectMongo };
