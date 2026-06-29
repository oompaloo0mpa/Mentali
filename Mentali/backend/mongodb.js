const dns = require("node:dns");
const { MongoClient } = require("mongodb");

let cachedClient = null;
let cachedDb = null;

async function connectAndPing(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    // Prefer IPv4 sockets; some mobile/tethered networks break TLS over IPv6.
    family: 4,
  });
  await client.connect();
  const db = client.db("mentali");
  await db.command({ ping: 1 });
  return { client, db };
}

function shouldRetryWithPublicDns(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("querySrv ECONNREFUSED") || message.includes("querySrv ETIMEOUT");
}

async function connectMongo() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  }

  try {
    const { client, db } = await connectAndPing(uri);
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    // Some networks refuse SRV DNS lookups for Atlas. Retry using public resolvers.
    if (uri.startsWith("mongodb+srv://") && shouldRetryWithPublicDns(error)) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
      const { client, db } = await connectAndPing(uri);
      cachedClient = client;
      cachedDb = db;
      return { client, db };
    }
    throw error;
  }
}

module.exports = { connectMongo };
