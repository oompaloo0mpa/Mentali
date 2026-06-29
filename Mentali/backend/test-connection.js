require("dotenv").config();
const { connectMongo } = require("./mongodb");

async function main() {
  try {
    const { db, client } = await connectMongo();
    const collections = await db.listCollections().toArray();
    console.log("MongoDB connected successfully.");
    console.log("Database:", db.databaseName);
    console.log("Collections found:", collections.length);
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
