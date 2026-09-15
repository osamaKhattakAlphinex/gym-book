import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { persistenceDir } from "@/lib/integrations/config";
import type { JazzCashTransactionRecord } from "@/lib/jazzcash/types";

/**
 * Where server-side payment state lives.
 *
 * The rest of GymBook keeps its data in the browser, but JazzCash callbacks
 * arrive from JazzCash's servers with no browser attached, so the transaction
 * has to exist somewhere the server can find it. This is a small append-mostly
 * JSON file with an in-memory mirror: good enough for one gym on a single
 * instance, and a single interface to swap for MongoDB (spec §"payments")
 * when there is more than one.
 *
 * On a read-only filesystem (Vercel's default) writes are skipped and the
 * in-memory map is used on its own. Payments still complete; the record is
 * lost on redeploy, which is why `inquire()` is always the source of truth.
 */

const FILE_NAME = "jazzcash-transactions.json";

const memory = new Map<string, JazzCashTransactionRecord>();
let loaded = false;
let writable = true;
/** Serialises writes so two concurrent callbacks cannot interleave a rewrite. */
let writeChain: Promise<void> = Promise.resolve();

function filePath(): string {
  const dir = persistenceDir();
  return path.isAbsolute(dir) ? path.join(dir, FILE_NAME) : path.join(process.cwd(), dir, FILE_NAME);
}

async function load(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as JazzCashTransactionRecord[];
    for (const record of parsed) memory.set(record.txnRefNo, record);
  } catch {
    // No file yet, or unreadable — start empty.
  }
}

async function persist(): Promise<void> {
  if (!writable) return;
  const target = filePath();
  const tmp = `${target}.${process.pid}.tmp`;
  try {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(tmp, JSON.stringify([...memory.values()], null, 2), "utf8");
    await rename(tmp, target);
  } catch {
    // Read-only FS (serverless). Keep serving from memory and stop retrying.
    writable = false;
  }
}

function schedulePersist(): Promise<void> {
  writeChain = writeChain.then(persist, persist);
  return writeChain;
}

export async function saveTransaction(
  record: Omit<JazzCashTransactionRecord, "createdAt" | "updatedAt"> & Partial<Pick<JazzCashTransactionRecord, "createdAt">>
): Promise<JazzCashTransactionRecord> {
  await load();
  const now = new Date().toISOString();
  const existing = memory.get(record.txnRefNo);
  const saved: JazzCashTransactionRecord = {
    ...existing,
    ...record,
    createdAt: existing?.createdAt ?? record.createdAt ?? now,
    updatedAt: now,
  };
  memory.set(saved.txnRefNo, saved);
  await schedulePersist();
  return saved;
}

export async function updateTransaction(
  txnRefNo: string,
  updates: Partial<JazzCashTransactionRecord>
): Promise<JazzCashTransactionRecord | null> {
  await load();
  const existing = memory.get(txnRefNo);
  if (!existing) return null;
  const updated: JazzCashTransactionRecord = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  if (updates.status === "successful" && !existing.settledAt) updated.settledAt = updated.updatedAt;
  memory.set(txnRefNo, updated);
  await schedulePersist();
  return updated;
}

export async function getTransaction(txnRefNo: string): Promise<JazzCashTransactionRecord | null> {
  await load();
  return memory.get(txnRefNo) ?? null;
}

export async function listTransactions(options: { memberId?: string; limit?: number } = {}): Promise<JazzCashTransactionRecord[]> {
  await load();
  const all = [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filtered = options.memberId ? all.filter((t) => t.memberId === options.memberId) : all;
  return filtered.slice(0, options.limit ?? 100);
}

/** Test seam — drops the in-memory mirror so the next read reloads from disk. */
export function resetTransactionCache(): void {
  memory.clear();
  loaded = false;
  writable = true;
}
