import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPO_DIR = path.resolve(
  process.env.DATA_REPO_DIR || path.join(process.cwd(), ".data-repo"),
);

// The default-creds repo stores credentials under data/*.yaml at its root.
export const DATA_DIR = path.join(REPO_DIR, "data");

const DATA_REPO_URL =
  process.env.DATA_REPO_URL ||
  "https://github.com/anotherhadi/default-creds.git";

const SYNC_INTERVAL_MS =
  Math.max(1, Number(process.env.DATA_SYNC_INTERVAL_HOURS) || 6) *
  60 *
  60 *
  1000;

type CacheInvalidator = () => void;
let invalidateCache: CacheInvalidator = () => {};

export function onDataUpdated(invalidator: CacheInvalidator) {
  invalidateCache = invalidator;
}

async function cloneData(): Promise<void> {
  console.log(`[data-sync] Cloning ${DATA_REPO_URL} into ${REPO_DIR}...`);
  fs.mkdirSync(path.dirname(REPO_DIR), { recursive: true });
  await execFileAsync("git", [
    "clone",
    "--depth",
    "1",
    DATA_REPO_URL,
    REPO_DIR,
  ]);
  console.log("[data-sync] Initial clone complete.");
}

async function pullData(): Promise<boolean> {
  const opts = { cwd: REPO_DIR };
  const before = await execFileAsync("git", ["rev-parse", "HEAD"], opts);
  const branch = (
    await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], opts)
  ).stdout.trim();

  // Fetch + hard reset (rather than `pull --ff-only`) so a rebase or force-push
  // upstream can't get this read-only mirror stuck refusing to fast-forward.
  await execFileAsync("git", ["fetch", "--depth", "1", "origin", branch], opts);
  await execFileAsync("git", ["reset", "--hard", `origin/${branch}`], opts);

  const after = await execFileAsync("git", ["rev-parse", "HEAD"], opts);
  return before.stdout.trim() !== after.stdout.trim();
}

export async function ensureDataSynced(): Promise<void> {
  try {
    if (!fs.existsSync(path.join(REPO_DIR, ".git"))) {
      await cloneData();
      invalidateCache();
      return;
    }
    const changed = await pullData();
    if (changed) {
      console.log("[data-sync] Data updated, cache invalidated.");
      invalidateCache();
    }
  } catch (e) {
    console.error("[data-sync] Sync failed:", e);
  }
}

let periodicSyncStarted = false;

export function startPeriodicSync() {
  if (periodicSyncStarted) return;
  periodicSyncStarted = true;
  setInterval(() => {
    void ensureDataSynced();
  }, SYNC_INTERVAL_MS);
}

export const dataSyncReady = ensureDataSynced().then(() => {
  startPeriodicSync();
});
