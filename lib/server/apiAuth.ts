import "server-only";
import { timingSafeEqual } from "node:crypto";
import { apiSecret } from "@/lib/integrations/config";

/**
 * Optional shared-secret guard for the send/charge routes.
 *
 * GymBook's MVP has no user accounts (spec: "Owner login (single account)",
 * auth deferred), so these routes are open by default — which is fine on a
 * private deployment and not fine on a public URL. Setting `GYMBOOK_API_SECRET`
 * turns on `Authorization: Bearer <secret>` checking with no code change, the
 * same way every other integration switch in this app works.
 */
export function checkApiSecret(request: Request): { ok: true } | { ok: false; response: Response } {
  const secret = apiSecret();
  if (!secret) return { ok: true };

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : request.headers.get("x-gymbook-secret") ?? "";

  const a = Buffer.from(secret, "utf8");
  const b = Buffer.from(provided, "utf8");
  const valid = a.length === b.length && timingSafeEqual(a, b);

  if (valid) return { ok: true };
  return {
    ok: false,
    response: Response.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
