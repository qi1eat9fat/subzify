import { TrendingUp, Calendar } from "lucide-react"

function formatNumber(n: number) {
  const [intPart, decPart] = n.toFixed(2).split(".")
  return {
    int: Number(intPart).toLocaleString("en-US"),
    dec: decPart,
  }
}

export function MonthlySpendCard({ monthlyTotal }: { monthlyTotal: number }) {
  const m = formatNumber(monthlyTotal)

  return (
    <article className="nordic-card relative flex h-full flex-col justify-between gap-3 overflow-hidden p-5">
      <Calendar
        className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 text-foreground/[0.05]"
        strokeWidth={0.8}
      />

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--nordic-sage)]" />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          当月花费
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="align-top pt-1 text-xs text-muted-foreground">¥</span>
        <span className="text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
          {m.int}
        </span>
        <span className="text-sm font-light text-muted-foreground tabular-nums">.{m.dec}</span>
      </div>

      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        已换算为人民币
      </p>
    </article>
  )
}

export function YearlySpendCard({
  yearlyTotal,
  activeCount,
}: {
  yearlyTotal: number
  activeCount: number
}) {
  const y = formatNumber(yearlyTotal)

  return (
    <article className="nordic-card relative flex h-full flex-col justify-between gap-3 overflow-hidden p-5">
      <TrendingUp
        className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 text-foreground/[0.05]"
        strokeWidth={0.8}
      />

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--nordic-honey)]" />
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          年度花费
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="align-top pt-1 text-xs text-muted-foreground">¥</span>
        <span className="text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
          {y.int}
        </span>
        <span className="text-sm font-light text-muted-foreground tabular-nums">.{y.dec}</span>
      </div>

      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        <span className="tabular-nums">{activeCount}</span> 项进行中
      </p>
    </article>
  )
}
