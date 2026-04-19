"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

type CategoryData = { name: string; amount: number }

const NORDIC_COLORS = [
  "oklch(0.72 0.065 155)",  // sage
  "oklch(0.78 0.095 75)",   // honey
  "oklch(0.62 0.12 25)",    // clay
  "oklch(0.82 0.03 75)",    // oat
  "oklch(0.74 0.05 60)",    // sand
  "oklch(0.55 0.06 145)",   // moss
  "oklch(0.82 0.055 25)",   // blush
  "oklch(0.45 0.05 50)",    // cocoa
]

export function CategoryDonut({ data }: { data: CategoryData[] }) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount)
  const total = sorted.reduce((sum, d) => sum + d.amount, 0)

  return (
    <article className="nordic-card flex h-full flex-col gap-4 p-5">
      <header>
        <h3 className="text-lg font-medium leading-tight tracking-tight">分类占比</h3>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          yearly breakdown
        </p>
      </header>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
      ) : (
        <>
          <div className="relative flex-shrink-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={sorted}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="name"
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {sorted.map((_, i) => (
                    <Cell key={i} fill={NORDIC_COLORS[i % NORDIC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`¥${Number(value).toFixed(0)}`, "年度花费"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: "12px",
                    boxShadow: "var(--shadow-soft)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                年度
              </span>
              <span className="mt-0.5 text-lg font-medium tabular-nums leading-none">
                ¥{total.toFixed(0)}
              </span>
            </div>
          </div>

          <ul className="nordic-scroll nordic-fade-mask min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {sorted.map((d, i) => {
              const pct = total ? (d.amount / total) * 100 : 0
              return (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: NORDIC_COLORS[i % NORDIC_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                  <span className="tabular-nums text-foreground/70">{pct.toFixed(0)}%</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </article>
  )
}
