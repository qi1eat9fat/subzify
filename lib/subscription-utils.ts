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

export function getNaturalMonthWindow(ref: Date): { start: Date; end: Date } {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function getNaturalYearWindow(ref: Date): { start: Date; end: Date } {
  const start = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0)
  const end = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999)
  return { start, end }
}

function daysInclusive(start: Date, end: Date): number {
  if (end < start) return 0
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1
}

export function calculateSpendInWindow(
  sub: {
    amount: number
    currency: string
    cycleCount: number
    cycleUnit: string
    autoRenew: boolean
    expiresAt: Date
  },
  rateMap: Map<string, number>,
  windowStart: Date,
  windowEnd: Date
): number {
  const dailyCny =
    convertToCNY(sub.amount, sub.currency, rateMap) /
    cycleToDays(sub.cycleCount, sub.cycleUnit)

  const expires = new Date(sub.expiresAt)
  const effectiveEnd = sub.autoRenew
    ? windowEnd
    : expires < windowEnd
    ? expires
    : windowEnd

  const days = daysInclusive(windowStart, effectiveEnd)
  return dailyCny * days
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
  rateMap: Map<string, number>,
  ref: Date = new Date()
): number {
  const { start, end } = getNaturalMonthWindow(ref)
  return calculateSpendInWindow(sub, rateMap, start, end)
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
  rateMap: Map<string, number>,
  ref: Date = new Date()
): number {
  const { start, end } = getNaturalYearWindow(ref)
  return calculateSpendInWindow(sub, rateMap, start, end)
}
