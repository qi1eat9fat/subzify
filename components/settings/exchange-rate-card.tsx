"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { refreshExchangeRates } from "@/actions/exchange-rates"
import { RefreshCw } from "lucide-react"
import { customToast } from "@/components/ui/custom-toast"

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">汇率管理</CardTitle>
          <CardDescription>当前汇率数据（1 外币 = X 人民币）</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "刷新中..." : "刷新汇率"}
        </Button>
      </CardHeader>
      <CardContent>
        {foreignRates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            暂无汇率数据，请点击刷新获取
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {foreignRates.map((r) => (
              <div key={r.currency} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{r.currency}</div>
                <div className="text-lg font-bold tabular-nums">¥{r.rate.toFixed(4)}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {new Date(r.updatedAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
