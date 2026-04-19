import { prisma } from "@/lib/prisma"
import { ExchangeRateCard } from "@/components/settings/exchange-rate-card"

export default async function ExchangeRatesPage() {
  const rates = await prisma.exchangeRate.findMany({ orderBy: { currency: "asc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-[color:var(--nordic-sand)]" />
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          rates · 汇率管理
        </h2>
      </div>

      <ExchangeRateCard rates={rates} />
    </div>
  )
}
