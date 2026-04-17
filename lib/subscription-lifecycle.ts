import { prisma } from "@/lib/prisma"
import { getNextExpiryDate } from "@/lib/subscription-utils"

// Re-export all pure functions for server-side usage
export {
  deriveStatus,
  getNextExpiryDate,
  cycleToDays,
  monthlyize,
  annualize,
  convertToCNY,
  calculateEffectiveMonthlySpend,
  calculateEffectiveYearlySpend,
} from "@/lib/subscription-utils"
export type { SubscriptionStatus } from "@/lib/subscription-utils"

export async function advanceExpiredAutoRenewals() {
  const now = new Date()
  const expiredAutoRenew = await prisma.subscription.findMany({
    where: {
      autoRenew: true,
      expiresAt: { lt: now },
    },
  })

  for (const sub of expiredAutoRenew) {
    let nextExpiry = sub.expiresAt
    while (nextExpiry < now) {
      nextExpiry = getNextExpiryDate(nextExpiry, sub.cycleCount, sub.cycleUnit)
    }
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        expiresAt: nextExpiry,
        notifiedAt: null,
      },
    })
  }
}
