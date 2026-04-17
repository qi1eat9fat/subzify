"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CategoryData = { name: string; amount: number }

const COLORS = [
  "oklch(0.541 0.24 293.5)",  // violet
  "oklch(0.637 0.2 293.5)",   // lighter violet
  "oklch(0.488 0.243 264.4)", // indigo
  "oklch(0.577 0.2 262)",     // blue-indigo
  "oklch(0.7 0.15 293.5)",    // light purple
  "oklch(0.6 0.18 280)",      // blue-violet
  "oklch(0.55 0.22 310)",     // pink-violet
  "oklch(0.65 0.16 270)",     // periwinkle
]

export function CategoryDonut({ data }: { data: CategoryData[] }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">分类占比</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            暂无数据
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="amount"
                nameKey="name"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`¥${Number(value).toFixed(2)}`, "年度花费"]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-lg font-bold tabular-nums"
              >
                ¥{total.toFixed(0)}
              </text>
              <text
                x="50%"
                y="55%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-xs"
              >
                年度总计
              </text>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
