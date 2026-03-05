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

export async function tryReserveQuota(
  db: Db,
  userId: string,
  bytes: number,
): Promise<{ reserved: true } | { reserved: false; used: number; quota: number }> {
  // First check if there's enough quota
  const row = await db
    .select({
      storageBytesUsed: users.storageBytesUsed,
      storageQuotaBytes: users.storageQuotaBytes,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (row.length === 0) {
    return { reserved: false, used: 0, quota: 0 }
  }

  const { storageBytesUsed, storageQuotaBytes } = row[0]

  if (storageBytesUsed + bytes > storageQuotaBytes) {
    return { reserved: false, used: storageBytesUsed, quota: storageQuotaBytes }
  }

  // Reserve the quota atomically — the WHERE clause ensures we don't exceed
  await db
    .update(users)
    .set({
      storageBytesUsed: sql`${users.storageBytesUsed} + ${bytes}`,
      updatedAt: new Date(),
    })
    .where(
      sql`${users.id} = ${userId} AND ${users.storageBytesUsed} + ${bytes} <= ${users.storageQuotaBytes}`,
    )

  return { reserved: true }
}

export async function adjustUsage(db: Db, userId: string, delta: number): Promise<void> {
  await db
    .update(users)
    .set({
      storageBytesUsed: sql`MAX(0, ${users.storageBytesUsed} + ${delta})`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}
