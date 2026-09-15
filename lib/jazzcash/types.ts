/**
 * JazzCash request/response shapes.
 *
 * Isomorphic — the UI imports the response types to render results, so keep
 * `node:crypto` and config access out of this file.
 */

export type JazzCashTxnType = "MWALLET" | "MIGS" | "MPAY" | "OTC";

export type JazzCashPaymentKind = "wallet" | "checkout";

/** JazzCash returns "000" for success; "121"/"124" mean "pending, keep polling". */
export const JAZZCASH_SUCCESS_CODE = "000";
export const JAZZCASH_PENDING_CODES = ["121", "124", "157"];

export type JazzCashTransactionStatus = "pending" | "successful" | "failed" | "cancelled";

/** Raw `pp_*` field bag exchanged with JazzCash. Values are always strings. */
export type JazzCashFields = Record<string, string>;

export interface JazzCashCheckoutRequest {
  /** Amount in rupees — converted to paisa before it reaches JazzCash. */
  amount: number;
  /** Free-text shown on the JazzCash page, e.g. "Monthly membership — Ahmed Khan". */
  description: string;
  /** Your own reference, usually the member id. */
  billReference?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  /** Overrides the configured return URL for this one transaction. */
  returnUrl?: string;
  /** Extra values echoed back untouched in the callback (ppmpf_1..5). */
  metadata?: string[];
}

export interface JazzCashCheckoutResponse {
  txnRefNo: string;
  /** Where the browser must POST. */
  action: string;
  /** Every field, secure hash included, to submit as a form. */
  fields: JazzCashFields;
  /** Self-submitting HTML form, for when you would rather just redirect. */
  redirectUrl: string;
  amount: number;
  expiresAt: string;
}

export interface JazzCashWalletRequest extends JazzCashCheckoutRequest {
  /** Member's JazzCash mobile account number. */
  mobileNumber: string;
  /** Last 6 digits of the member's CNIC, as JazzCash requires. */
  cnic: string;
}

export interface JazzCashApiResult {
  ok: boolean;
  status: JazzCashTransactionStatus;
  responseCode: string;
  responseMessage: string;
  txnRefNo: string;
  /** Amount in rupees. */
  amount?: number;
  retrievalReferenceNo?: string;
  /** Everything JazzCash sent back, for logging and debugging. */
  raw: JazzCashFields;
}

export interface JazzCashCallbackResult extends JazzCashApiResult {
  /** False when the returned `pp_SecureHash` did not match — do not trust it. */
  signatureValid: boolean;
  billReference?: string;
  metadata: string[];
}

/** A transaction as this app records it, independent of JazzCash's wire format. */
export interface JazzCashTransactionRecord {
  txnRefNo: string;
  kind: JazzCashPaymentKind;
  status: JazzCashTransactionStatus;
  amount: number;
  description: string;
  billReference?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  responseCode?: string;
  responseMessage?: string;
  retrievalReferenceNo?: string;
  environment: "sandbox" | "live";
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
  /** Set once a WhatsApp receipt has gone out, so retries do not double-send. */
  receiptSentAt?: string;
  /**
   * The signed checkout field set, minus `pp_Password` and `pp_SecureHash`.
   *
   * Keeping these lets `/pay/<ref>` re-render the same payable transaction
   * later, which is what makes a WhatsApp payment link work. The password and
   * hash are deliberately left out and recomputed from the environment at
   * serve time, so no secret is ever written to disk.
   */
  checkoutFields?: JazzCashFields;
}

export function statusFromResponseCode(code: string | undefined): JazzCashTransactionStatus {
  if (!code) return "pending";
  if (code === JAZZCASH_SUCCESS_CODE) return "successful";
  if (JAZZCASH_PENDING_CODES.includes(code)) return "pending";
  return "failed";
}
