import { prisma } from "@/lib/prisma"
import { getExchangeRates } from "@/actions/exchange-rates"
import {
  advanceExpiredAutoRenewals,
  calculateEffectiveMonthlySpend,
  calculateEffectiveYearlySpend,
  annualize,
  convertToCNY,
} from "@/lib/subscription-lifecycle"
import { SpendSummary } from "@/components/dashboard/spend-summary"
import { ExpiringList } from "@/components/dashboard/expiring-list"
import { CategoryDonut } from "@/components/dashboard/category-donut"

export default async function DashboardPage() {
  await advanceExpiredAutoRenewals()

  const [subscriptions, rateMap] = await Promise.all([
    prisma.subscription.findMany({ include: { category: true } }),
    getExchangeRates(),
  ])

  // Compute spend totals
  let monthlyTotal = 0
  let yearlyTotal = 0
  const categoryTotals = new Map<string, { name: string; amount: number }>()

  for (const sub of subscriptions) {
    monthlyTotal += calculateEffectiveMonthlySpend(sub, rateMap)
    const yearly = calculateEffectiveYearlySpend(sub, rateMap)
    yearlyTotal += yearly

    const catName = sub.category?.name || "未分类"
    const existing = categoryTotals.get(catName) || { name: catName, amount: 0 }
    existing.amount += yearly
    categoryTotals.set(catName, existing)
  }

  // Compute expiring subscriptions
  const now = new Date()
  const threeDays = new Date(now.getTime() + 3 * 86400000)
  const oneWeek = new Date(now.getTime() + 7 * 86400000)
  const oneMonth = new Date(now.getTime() + 30 * 86400000)

  const expiringSubs = subscriptions
    .filter((s) => new Date(s.expiresAt) <= oneMonth && new Date(s.expiresAt) >= now)
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())

  const expiringGroups = {
    critical: expiringSubs.filter((s) => new Date(s.expiresAt) <= threeDays),
    warning: expiringSubs.filter(
      (s) => new Date(s.expiresAt) > threeDays && new Date(s.expiresAt) <= oneWeek
    ),
    upcoming: expiringSubs.filter(
      (s) => new Date(s.expiresAt) > oneWeek && new Date(s.expiresAt) <= oneMonth
    ),
  }

  const hasRates = rateMap.size > 1
  const categoryData = [...categoryTotals.values()].filter((d) => d.amount > 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">仪表盘</h2>
        <p className="text-muted-foreground mt-1">订阅概览与数据分析</p>
      </div>

      {!hasRates && subscriptions.some((s) => s.currency !== "CNY") && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
          部分订阅使用外币，但尚未获取汇率数据。请前往「汇率管理」刷新汇率以确保统计准确。
        </div>
      )}

      <SpendSummary monthlyTotal={monthlyTotal} yearlyTotal={yearlyTotal} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ExpiringList groups={expiringGroups} />
        <CategoryDonut data={categoryData} />
      </div>
    </div>
  )
}
