import { CURRENCIES } from "@/lib/constants"
import { formatShanghaiDate } from "@/lib/date"

type Rate = { currency: string; rate: number; updatedAt: Date }

export function ExchangeRateItem({ rate, index = 0 }: { rate: Rate; index?: number }) {
  const meta = CURRENCIES.find((c) => c.code === rate.currency)
  const symbol = meta?.symbol ?? rate.currency
  const name = meta?.name ?? rate.currency

  return (
    <article
      className="nordic-card nordic-card-hover relative flex flex-col gap-5 p-5"
      style={{ "--i": index } as React.CSSProperties}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          <span className="text-base font-medium tracking-tight text-[color:var(--nordic-cocoa)]">
            {symbol}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-medium leading-tight tracking-tight">
            {rate.currency}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="nordic-dot nordic-dot-active" />
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[color:var(--nordic-sage)]">
              已更新
            </span>
          </div>
        </div>
      </header>

      <div className="flex items-baseline gap-1.5">
        <span className="pt-1 align-top text-sm font-normal leading-none text-muted-foreground">
          ¥
        </span>
        <span className="text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
          {rate.rate.toFixed(4)}
        </span>
        <span className="ml-1 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          / 1 {rate.currency}
        </span>
      </div>

      <div className="nordic-hairline" />

      <footer className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        <span className="tabular-nums flex-shrink-0">
          {formatShanghaiDate(new Date(rate.updatedAt), {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).replace(/\//g, ".")}
        </span>
        <span aria-hidden className="flex-shrink-0">·</span>
        <span className="truncate normal-case tracking-normal">{name}</span>
      </footer>
    </article>
  )
}
