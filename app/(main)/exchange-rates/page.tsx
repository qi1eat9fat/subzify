import { prisma } from "@/lib/prisma"
import { ExchangeRateCard } from "@/components/settings/exchange-rate-card"

export default async function ExchangeRatesPage() {
  const rates = await prisma.exchangeRate.findMany({ orderBy: { currency: "asc" } })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">汇率管理</h2>
        <p className="text-muted-foreground mt-1">查看与管理外币汇率</p>
      </div>

      <ExchangeRateCard rates={rates} />
    </div>
  )
}
