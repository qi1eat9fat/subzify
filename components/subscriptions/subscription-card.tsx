"use client"

import Image from "next/image"
import { MoreHorizontal, CreditCard, RefreshCw, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrencySymbol } from "@/lib/constants"
import { deriveStatus } from "@/lib/subscription-utils"
import { formatShanghaiDate, shanghaiDayDiff } from "@/lib/date"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SubscriptionCardData = {
  id: string
  name: string
  icon: string | null
  amount: number
  currency: string
  cycleCount: number
  cycleUnit: string
  autoRenew: boolean
  expiresAt: Date
  categoryId: string | null
  category: { id: string; name: string } | null
}

const cycleShort: Record<string, string> = {
  day: "日",
  week: "周",
  month: "月",
  year: "年",
}

function daysUntil(date: Date) {
  return shanghaiDayDiff(new Date(date), new Date())
}

export function SubscriptionCard({
  sub,
  index = 0,
  onEdit,
  onDelete,
}: {
  sub: SubscriptionCardData
  index?: number
  onEdit: (sub: SubscriptionCardData) => void
  onDelete: (id: string) => void
}) {
  const status = deriveStatus(sub)
  const days = daysUntil(sub.expiresAt)
  const symbol = getCurrencySymbol(sub.currency)

  const statusMeta =
    status === "active"
      ? { dot: "nordic-dot-active", text: "生效中", tone: "text-[color:var(--nordic-sage)]" }
      : status === "expiring_soon"
        ? days <= 3
          ? { dot: "nordic-dot-critical", text: `${days} 天后到期`, tone: "text-[color:var(--nordic-clay)]" }
          : { dot: "nordic-dot-warning", text: `${days} 天后到期`, tone: "text-[color:var(--nordic-honey)]" }
        : { dot: "nordic-dot-critical", text: "已过期", tone: "text-[color:var(--nordic-clay)]" }

  return (
    <article
      className="nordic-card nordic-card-hover relative flex flex-col gap-5 p-5"
      style={{ "--i": index } as React.CSSProperties}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          {sub.icon?.startsWith("http") ? (
            <Image src={sub.icon} alt={sub.name} width={44} height={44} className="object-cover" />
          ) : (
            <CreditCard className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-medium leading-tight tracking-tight">
            {sub.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn("nordic-dot", statusMeta.dot)} />
            <span className={cn("text-[11px] font-medium uppercase tracking-[0.08em]", statusMeta.tone)}>
              {statusMeta.text}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-lg p-1.5 text-muted-foreground outline-none transition-colors hover:bg-[color:var(--card-sunken)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            aria-label="更多操作"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            <DropdownMenuItem onClick={() => onEdit(sub)}>
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(sub.id)}>
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex items-baseline gap-1.5">
        <span className="align-top text-sm font-normal text-muted-foreground leading-none pt-1">
          {symbol}
        </span>
        <span className="text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
          {sub.amount.toFixed(sub.amount % 1 === 0 ? 0 : 2)}
        </span>
        <span className="ml-1 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          / {sub.cycleCount > 1 ? `${sub.cycleCount} ` : ""}{cycleShort[sub.cycleUnit] ?? sub.cycleUnit}
        </span>
      </div>

      <div className="nordic-hairline" />

      <footer className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          <span className="tabular-nums flex-shrink-0">
            {formatShanghaiDate(new Date(sub.expiresAt), {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).replace(/\//g, ".")}
          </span>
          {sub.category && (
            <>
              <span aria-hidden className="flex-shrink-0">·</span>
              <span className="truncate normal-case tracking-normal">{sub.category.name}</span>
            </>
          )}
        </div>
        {sub.autoRenew && (
          <span className="flex flex-shrink-0 items-center gap-1 text-[color:var(--nordic-moss)]">
            <RefreshCw className="h-3 w-3" strokeWidth={1.6} />
            <span>自动续订</span>
          </span>
        )}
      </footer>
    </article>
  )
}
