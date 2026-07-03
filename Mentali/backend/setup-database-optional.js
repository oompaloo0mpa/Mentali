require("dotenv").config();
const { spawn } = require("node:child_process");

const TIMEOUT_MS = 15000;

function run() {
  const child = spawn(process.execPath, ["backend/setup-database.js"], {
    stdio: "inherit",
    windowsHide: true,
  });

  const timer = setTimeout(() => {
    console.warn(
      `Database setup timed out after ${TIMEOUT_MS / 1000}s. Continuing app startup; you can run npm run db:setup manually later.`
    );
    child.kill();
    process.exit(0);
  }, TIMEOUT_MS);

  child.on("exit", (code) => {
    clearTimeout(timer);
    if (code === 0) {
      process.exit(0);
      return;
    }
    console.warn("Database setup failed. Continuing app startup; run npm run db:setup when network is stable.");
    process.exit(0);
  });

  child.on("error", () => {
    clearTimeout(timer);
    console.warn("Unable to launch database setup. Continuing app startup.");
    process.exit(0);
  });
}

run();
