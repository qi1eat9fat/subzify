export type SubscriptionStatus = "active" | "expiring_soon" | "expired"

export function deriveStatus(sub: { expiresAt: Date; autoRenew: boolean }): SubscriptionStatus {
  const now = new Date()
  const daysUntilExpiry = Math.ceil(
    (new Date(sub.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntilExpiry < 0) return "expired"
  if (daysUntilExpiry <= 30) return "expiring_soon"
  return "active"
}

export function getNextExpiryDate(
  currentExpiry: Date,
  cycleCount: number,
  cycleUnit: string
): Date {
  const next = new Date(currentExpiry)
  switch (cycleUnit) {
    case "day":
      next.setDate(next.getDate() + cycleCount)
      break
    case "week":
      next.setDate(next.getDate() + cycleCount * 7)
      break
    case "month":
      next.setMonth(next.getMonth() + cycleCount)
      break
    case "year":
      next.setFullYear(next.getFullYear() + cycleCount)
      break
  }
  return next
}

export function cycleToDays(cycleCount: number, cycleUnit: string): number {
  switch (cycleUnit) {
    case "day":
      return cycleCount
    case "week":
      return cycleCount * 7
    case "month":
      return cycleCount * 30.44
    case "year":
      return cycleCount * 365.25
    default:
      return cycleCount * 30.44
  }
}

export function monthlyize(amount: number, cycleCount: number, cycleUnit: string): number {
  const days = cycleToDays(cycleCount, cycleUnit)
  return amount * (30.44 / days)
}

export function annualize(amount: number, cycleCount: number, cycleUnit: string): number {
  const days = cycleToDays(cycleCount, cycleUnit)
  return amount * (365.25 / days)
}

export function convertToCNY(
  amount: number,
  currency: string,
  rateMap: Map<string, number>
): number {
  if (currency === "CNY") return amount
  const rate = rateMap.get(currency)
  if (!rate) return amount
  return amount * rate
}

export function calculateEffectiveMonthlySpend(
  sub: {
    amount: number
    currency: string
    cycleCount: number
    cycleUnit: string
    autoRenew: boolean
    expiresAt: Date
  },
  rateMap: Map<string, number>
): number {
  const cnyAmount = convertToCNY(sub.amount, sub.currency, rateMap)
  const monthlyCny = monthlyize(cnyAmount, sub.cycleCount, sub.cycleUnit)
  const now = new Date()

  if (!sub.autoRenew && new Date(sub.expiresAt) < now) return 0
  return monthlyCny
}

export function calculateEffectiveYearlySpend(
  sub: {
    amount: number
    currency: string
    cycleCount: number
    cycleUnit: string
    autoRenew: boolean
    expiresAt: Date
  },
  rateMap: Map<string, number>
): number {
  const cnyAmount = convertToCNY(sub.amount, sub.currency, rateMap)
  const yearlyCny = annualize(cnyAmount, sub.cycleCount, sub.cycleUnit)
  const now = new Date()

  if (!sub.autoRenew && new Date(sub.expiresAt) < now) return 0
  if (sub.autoRenew) return yearlyCny

  const monthsRemaining = Math.max(
    0,
    (new Date(sub.expiresAt).getFullYear() - now.getFullYear()) * 12 +
      (new Date(sub.expiresAt).getMonth() - now.getMonth())
  )
  return yearlyCny * Math.min(monthsRemaining / 12, 1)
}
