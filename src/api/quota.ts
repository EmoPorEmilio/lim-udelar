import { eq, sql } from 'drizzle-orm'
import { users } from '../db/schema'
import type { Db } from '../db/index'

export const DEFAULT_QUOTAS: Record<string, number> = {
  student: 10_485_760,  // 10 MB
  admin: 104_857_600,   // 100 MB
}

export function getDefaultQuota(role: string): number {
  return DEFAULT_QUOTAS[role] ?? DEFAULT_QUOTAS.student
}

export async function checkQuota(
  db: Db,
  userId: string,
  additionalBytes: number,
): Promise<{ allowed: true } | { allowed: false; used: number; quota: number }> {
  const result = await db
    .select({
      storageBytesUsed: users.storageBytesUsed,
      storageQuotaBytes: users.storageQuotaBytes,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (result.length === 0) {
    return { allowed: false, used: 0, quota: 0 }
  }

  const { storageBytesUsed, storageQuotaBytes } = result[0]

  if (storageBytesUsed + additionalBytes > storageQuotaBytes) {
    return { allowed: false, used: storageBytesUsed, quota: storageQuotaBytes }
  }

  return { allowed: true }
}

export async function adjustUsage(db: Db, userId: string, delta: number): Promise<void> {
  await db
    .update(users)
    .set({
      storageBytesUsed: sql`MAX(0, ${users.storageBytesUsed} + ${delta})`,
    })
    .where(eq(users.id, userId))
}
