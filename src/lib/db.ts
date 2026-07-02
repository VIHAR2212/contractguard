// ===========================================================================
// /lib/db.ts
// ---------------------------------------------------------------------------
// ContractGuard does not currently use a database. This file is kept as a
// lazy stub so that:
//   1. Any stray imports of `@/lib/db` don't crash the build.
//   2. You can later wire up Prisma without touching call sites — just
//      replace the body of `getDB()` with `new PrismaClient()`.
//
// We deliberately do NOT instantiate PrismaClient at module load, because
// doing so requires DATABASE_URL to be set, which would break Vercel
// builds that don't have a database configured.
// ===========================================================================

export interface DbStub {
  readonly _isStub: true;
}

const stub: DbStub = { _isStub: true };

/**
 * Lazy getter. Replace the body with `new PrismaClient()` once you have a
 * real schema and DATABASE_URL configured.
 */
export function getDB(): DbStub {
  return stub;
}

// Backwards-compatible default export — call sites that do
// `import { db } from "@/lib/db"` still work.
export const db = stub;
