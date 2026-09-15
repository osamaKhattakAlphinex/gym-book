/**
 * Phone number normalisation for Pakistani mobile numbers.
 *
 * Numbers are stored in this app the way a gym owner writes them
 * ("+92 300 1234567", "0300-1234567", "03001234567"). Both JazzCash and
 * WhatsApp want a bare MSISDN, so everything funnels through here.
 *
 * Isomorphic — safe to import from client components.
 */

export const DEFAULT_COUNTRY_CODE = "92";

export interface NormalizedPhone {
  /** Full international number, digits only, e.g. "923001234567". */
  msisdn: string;
  /** Local format JazzCash expects for mobile accounts, e.g. "03001234567". */
  local: string;
  /** Display/E.164 form, e.g. "+923001234567". */
  e164: string;
}

export class InvalidPhoneError extends Error {
  constructor(input: string) {
    super(`"${input}" is not a valid Pakistani mobile number`);
    this.name = "InvalidPhoneError";
  }
}

/** Strips spaces, dashes, brackets and a leading "+". */
function digitsOnly(input: string): string {
  return input.replace(/[^\d]/g, "");
}

/**
 * Accepts +92XXXXXXXXXX, 0092..., 92..., 03XXXXXXXXX and 3XXXXXXXXX.
 * Returns null instead of throwing so callers can decide how loud to be.
 */
export function tryNormalizePhone(input: string, countryCode = DEFAULT_COUNTRY_CODE): NormalizedPhone | null {
  let d = digitsOnly(input ?? "");
  if (!d) return null;

  // 0092300... -> 92300...
  if (d.startsWith("00")) d = d.slice(2);

  if (d.startsWith(countryCode) && d.length === countryCode.length + 10) {
    // already international
  } else if (d.startsWith("0") && d.length === 11) {
    d = countryCode + d.slice(1);
  } else if (d.length === 10 && d.startsWith("3")) {
    d = countryCode + d;
  } else if (d.startsWith(countryCode)) {
    // Non-standard length but carries the country code — accept and let the
    // provider reject it rather than silently mangling the number.
  } else {
    return null;
  }

  const national = d.slice(countryCode.length);
  if (national.length < 9 || national.length > 11) return null;

  return { msisdn: d, local: `0${national}`, e164: `+${d}` };
}

export function normalizePhone(input: string, countryCode = DEFAULT_COUNTRY_CODE): NormalizedPhone {
  const result = tryNormalizePhone(input, countryCode);
  if (!result) throw new InvalidPhoneError(input);
  return result;
}

export function isValidPhone(input: string): boolean {
  return tryNormalizePhone(input) !== null;
}

/** "923001234567" -> "+92 300 1234567" */
export function formatPhonePretty(input: string): string {
  const n = tryNormalizePhone(input);
  if (!n) return input;
  const national = n.msisdn.slice(DEFAULT_COUNTRY_CODE.length);
  return `+${DEFAULT_COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3)}`;
}
