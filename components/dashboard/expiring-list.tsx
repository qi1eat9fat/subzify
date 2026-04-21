import Image from "next/image"
import { CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrencySymbol } from "@/lib/constants"
import { shanghaiDayDiff } from "@/lib/date"

type ExpiringSubscription = {
  id: string
  name: string
  icon: string | null
  amount: number
  currency: string
  expiresAt: Date
  autoRenew: boolean
}

type ExpiringGroups = {
  critical: ExpiringSubscription[]
  warning: ExpiringSubscription[]
  upcoming: ExpiringSubscription[]
}

const tierConfig = {
  critical: {
    label: "三日之内",
    subtitle: "CRITICAL",
    rule: "nordic-rule-critical",
    accent: "text-[color:var(--nordic-clay)]",
  },
  warning: {
    label: "一周之内",
    subtitle: "WARNING",
    rule: "nordic-rule-warning",
    accent: "text-[color:var(--nordic-honey)]",
  },
  upcoming: {
    label: "三十天内",
    subtitle: "UPCOMING",
    rule: "nordic-rule-upcoming",
    accent: "text-muted-foreground",
  },
}

function daysUntil(date: Date) {
  return shanghaiDayDiff(new Date(date), new Date())
}

export function ExpiringList({ groups }: { groups: ExpiringGroups }) {
  const total = groups.critical.length + groups.warning.length + groups.upcoming.length

  const MAX_ROWS = 5
  let remaining = MAX_ROWS
  const visibleGroups: ExpiringGroups = { critical: [], warning: [], upcoming: [] }
  for (const tier of ["critical", "warning", "upcoming"] as const) {
    const take = Math.min(groups[tier].length, remaining)
    visibleGroups[tier] = groups[tier].slice(0, take)
    remaining -= take
    if (remaining <= 0) break
  }
  const hiddenCount = Math.max(0, total - MAX_ROWS)

  return (
    <article className="nordic-card flex h-full flex-col gap-5 p-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-medium leading-tight tracking-tight">即将到期</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            upcoming renewals
          </p>
        </div>
        <span className="text-2xl font-light tabular-nums text-foreground/50">{total}</span>
      </header>

      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          近 30 天内无订阅到期
        </p>
      ) : (
        <div className="flex-1 space-y-5">
          {(["critical", "warning", "upcoming"] as const).map((tier) => {
            const subs = visibleGroups[tier]
            if (subs.length === 0) return null
            const config = tierConfig[tier]
            const totalInTier = groups[tier].length
            return (
              <section key={tier} className="flex gap-3">
                <span className={cn("w-0.5 flex-shrink-0 rounded-full", config.rule)} />
                <div className="flex-1 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {config.subtitle} · {totalInTier}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {subs.map((sub) => (
                      <li key={sub.id} className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[color:var(--card-sunken)]">
                          {sub.icon?.startsWith("http") ? (
                            <Image src={sub.icon} alt={sub.name} width={32} height={32} className="object-cover" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.4} />
                          )}
                        </div>
                        <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                        <span className={cn("text-sm font-medium tabular-nums", config.accent)}>
                          {daysUntil(sub.expiresAt)}d
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {getCurrencySymbol(sub.currency)}{sub.amount.toFixed(0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )
          })}
          {hiddenCount > 0 && (
            <p className="pt-1 text-right text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              还有 <span className="tabular-nums text-foreground">{hiddenCount}</span> 项未显示
            </p>
          )}
        </div>
      )}
    </article>
  )
}
