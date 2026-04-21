import { prisma } from "@/lib/prisma"
import { startOfShanghaiDay } from "@/lib/date"
import { getNextExpiryDate } from "@/lib/subscription-utils"

// Re-export all pure functions for server-side usage
export {
  deriveStatus,
  getNextExpiryDate,
  cycleToDays,
  convertToCNY,
  getNaturalMonthWindow,
  getNaturalYearWindow,
  calculateSpendInWindow,
  calculateEffectiveMonthlySpend,
  calculateEffectiveYearlySpend,
} from "@/lib/subscription-utils"
export type { SubscriptionStatus } from "@/lib/subscription-utils"

export async function advanceExpiredAutoRenewals() {
  // Compare by Shanghai calendar day: the expiry day itself is still active,
  // so only advance once today's Shanghai midnight has passed expiresAt.
  const startOfToday = startOfShanghaiDay()

  const expiredAutoRenew = await prisma.subscription.findMany({
    where: {
      autoRenew: true,
      expiresAt: { lt: startOfToday },
    },
  })

  const MAX_ADVANCES = 1000
  for (const sub of expiredAutoRenew) {
    let nextExpiry = sub.expiresAt
    let advances = 0
    let stuck = false
    while (nextExpiry < startOfToday) {
      if (advances++ >= MAX_ADVANCES) {
        console.error(
          `[lifecycle] giving up advancing ${sub.id} (${sub.name}) after ${MAX_ADVANCES} iterations; cycle=${sub.cycleCount} ${sub.cycleUnit}`
        )
        stuck = true
        break
      }
      const advanced = getNextExpiryDate(nextExpiry, sub.cycleCount, sub.cycleUnit)
      if (advanced.getTime() <= nextExpiry.getTime()) {
        console.error(
          `[lifecycle] cannot advance ${sub.id} (${sub.name}); invalid cycle=${sub.cycleCount} ${sub.cycleUnit}`
        )
        stuck = true
        break
      }
      nextExpiry = advanced
    }
    if (stuck) continue
    try {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          expiresAt: nextExpiry,
          notifiedAt: null,
        },
      })
    } catch (err) {
      console.error(`[lifecycle] failed to update ${sub.id} (${sub.name}):`, err)
    }
  }
}
