"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { refreshExchangeRates } from "@/actions/exchange-rates"
import { customToast } from "@/components/ui/custom-toast"
import { ExchangeRateItem } from "@/components/settings/exchange-rate-item"

type Rate = { currency: string; rate: number; updatedAt: Date }

export function ExchangeRateCard({ rates }: { rates: Rate[] }) {
  const [loading, setLoading] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    const result = await refreshExchangeRates()
    if (result.success) customToast.success(result.success)
    if (result.error) customToast.error(result.error)
    setLoading(false)
  }

  const foreignRates = rates.filter((r) => r.currency !== "CNY")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          共 <span className="tabular-nums text-foreground">{foreignRates.length}</span> 个外币汇率（1 外币 = X 人民币）
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "刷新中..." : "刷新汇率"}
        </Button>
      </div>

      {foreignRates.length === 0 ? (
        <div className="nordic-card flex flex-col items-center justify-center gap-2 p-12 text-center">
          <p className="text-sm text-muted-foreground">暂无汇率数据</p>
          <p className="text-xs text-muted-foreground">点击右上角「刷新汇率」获取最新数据</p>
        </div>
      ) : (
        <div className="nordic-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {foreignRates.map((r, i) => (
            <ExchangeRateItem key={r.currency} rate={r} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
