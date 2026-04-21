import { getExchangeRates } from "@/actions/exchange-rates"
import { getSubscriptions } from "@/actions/subscriptions"
import { getCategories } from "@/actions/categories"
import {
  advanceExpiredAutoRenewals,
  calculateEffectiveMonthlySpend,
  calculateEffectiveYearlySpend,
} from "@/lib/subscription-lifecycle"
import { addShanghaiDays, shanghaiDateKey } from "@/lib/date"
import { MonthlySpendCard, YearlySpendCard } from "@/components/dashboard/spend-summary"
import { ExpiringList } from "@/components/dashboard/expiring-list"
import { CategoryDonut } from "@/components/dashboard/category-donut"
import { SubscriptionList } from "@/components/subscriptions/subscription-list"

export default async function DashboardPage() {
  await advanceExpiredAutoRenewals()

  const [subscriptions, categories, rateMap] = await Promise.all([
    getSubscriptions(),
    getCategories(),
    getExchangeRates(),
  ])

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

  const todayKey = shanghaiDateKey()
  const in3Days = addShanghaiDays(todayKey, 3)
  const in7Days = addShanghaiDays(todayKey, 7)
  const in30Days = addShanghaiDays(todayKey, 30)

  const keyOf = (s: { expiresAt: Date }) => shanghaiDateKey(new Date(s.expiresAt))

  const expiringSubs = subscriptions
    .filter((s) => {
      const key = keyOf(s)
      return key >= todayKey && key <= in30Days
    })
    .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime())

  const expiringGroups = {
    critical: expiringSubs.filter((s) => keyOf(s) <= in3Days),
    warning: expiringSubs.filter((s) => {
      const key = keyOf(s)
      return key > in3Days && key <= in7Days
    }),
    upcoming: expiringSubs.filter((s) => {
      const key = keyOf(s)
      return key > in7Days && key <= in30Days
    }),
  }

  const activeCount = subscriptions.filter(
    (s) => s.autoRenew || keyOf(s) >= todayKey,
  ).length

  const hasRates = rateMap.size > 1
  const categoryData = [...categoryTotals.values()].filter((d) => d.amount > 0)

  return (
    <div className="space-y-12">
      <section id="overview" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[color:var(--nordic-sand)]" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            dashboard · 仪表盘
          </h2>
        </div>

        {!hasRates && subscriptions.some((s) => s.currency !== "CNY") && (
          <div className="rounded-[14px] border border-[color:var(--nordic-honey)]/30 bg-[color:var(--card-sunken)] p-4 text-sm text-[color:var(--nordic-cocoa)]">
            部分订阅使用外币，但尚未获取汇率数据。请前往「汇率管理」刷新汇率以确保统计准确。
          </div>
        )}

        <div className="nordic-stagger grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="lg:col-span-2" style={{ "--i": 0 } as React.CSSProperties}>
            <ExpiringList groups={expiringGroups} />
          </div>
          <div className="lg:col-span-1" style={{ "--i": 1 } as React.CSSProperties}>
            <CategoryDonut data={categoryData} />
          </div>
          <div
            className="flex flex-col gap-5 lg:col-span-1"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <div className="min-h-0 flex-1">
              <MonthlySpendCard monthlyTotal={monthlyTotal} />
            </div>
            <div className="min-h-0 flex-1">
              <YearlySpendCard yearlyTotal={yearlyTotal} activeCount={activeCount} />
            </div>
          </div>
        </div>
      </section>

      <div className="nordic-hairline" />

      <section id="subscriptions" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[color:var(--nordic-sand)]" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            subscriptions · 订阅管理
          </h2>
        </div>
        <SubscriptionList
          subscriptions={subscriptions}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      </section>
    </div>
  )
}
