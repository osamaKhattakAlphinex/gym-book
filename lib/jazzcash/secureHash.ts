import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { JazzCashFields } from "./types";

/**
 * JazzCash message integrity.
 *
 * The scheme, as specified in the JazzCash HTTP Integration guide:
 *
 *   1. take every `pp_*` / `ppmpf_*` field with a non-empty value,
 *      excluding `pp_SecureHash` itself;
 *   2. sort those fields by key, ascending, case-insensitive;
 *   3. join the *values* with "&";
 *   4. prefix the whole string with `IntegritySalt` + "&";
 *   5. HMAC-SHA256 it with the integrity salt as the key;
 *   6. uppercase hex.
 *
 * Both directions use the same function: we sign what we send, and we
 * re-sign what comes back to check JazzCash actually sent it.
 */

const HASH_FIELD = "pp_SecureHash";

/** Fields JazzCash adds to the *response* that are not part of the digest. */
const RESPONSE_ONLY_FIELDS = new Set(["pp_SecureHash"]);

export function buildHashSource(fields: JazzCashFields, integritySalt: string): string {
  const keys = Object.keys(fields)
    .filter((key) => !RESPONSE_ONLY_FIELDS.has(key))
    .filter((key) => key.startsWith("pp_") || key.startsWith("ppmpf_"))
    .filter((key) => {
      const value = fields[key];
      return value !== undefined && value !== null && String(value).length > 0;
    })
    // Ordinal, not locale-aware: JazzCash's own reference implementations sort
    // keys by byte value, and ICU collation would quietly reorder "_" against
    // letters on some builds.
    .sort((a, b) => {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });

  return [integritySalt, ...keys.map((key) => String(fields[key]))].join("&");
}

export function computeSecureHash(fields: JazzCashFields, integritySalt: string): string {
  const source = buildHashSource(fields, integritySalt);
  return createHmac("sha256", integritySalt).update(source, "utf8").digest("hex").toUpperCase();
}

/** Returns a copy of `fields` with a freshly computed `pp_SecureHash`. */
export function signFields(fields: JazzCashFields, integritySalt: string): JazzCashFields {
  return { ...fields, [HASH_FIELD]: computeSecureHash(fields, integritySalt) };
}

/**
 * Constant-time check of the hash JazzCash returned.
 *
 * A response with no hash at all is treated as invalid: JazzCash always signs
 * its callbacks, so a missing hash means the request did not come from them.
 */
export function verifySecureHash(fields: JazzCashFields, integritySalt: string): boolean {
  const received = fields[HASH_FIELD];
  if (!received) return false;
  const expected = computeSecureHash(fields, integritySalt);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(received).toUpperCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { HASH_FIELD as JAZZCASH_HASH_FIELD };
