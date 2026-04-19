"use client"

import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type CategoryCardData = {
  id: string
  name: string
  createdAt: Date
  _count: { subscriptions: number }
}

export function CategoryCard({
  category,
  index = 0,
  onEdit,
  onDelete,
}: {
  category: CategoryCardData
  index?: number
  onEdit: (cat: { id: string; name: string }) => void
  onDelete: (id: string) => void
}) {
  const count = category._count.subscriptions
  const active = count > 0

  return (
    <article
      className="nordic-card nordic-card-hover relative flex flex-col gap-5 p-5"
      style={{ "--i": index } as React.CSSProperties}
    >
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          <FolderOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-medium leading-tight tracking-tight">
            {category.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={cn("nordic-dot", active ? "nordic-dot-active" : "")}
              style={
                !active
                  ? {
                      background: "var(--muted-foreground)",
                      opacity: 0.4,
                    }
                  : undefined
              }
            />
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-[0.08em]",
                active ? "text-[color:var(--nordic-sage)]" : "text-muted-foreground",
              )}
            >
              {active ? "使用中" : "未使用"}
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
            <DropdownMenuItem onClick={() => onEdit({ id: category.id, name: category.name })}>
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(category.id)}>
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[34px] font-light leading-none tracking-[-0.02em] tabular-nums">
          {count}
        </span>
        <span className="ml-1 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          项订阅
        </span>
      </div>

      <div className="nordic-hairline" />

      <footer className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        <span className="tabular-nums flex-shrink-0">
          {new Date(category.createdAt)
            .toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, ".")}
        </span>
        <span aria-hidden className="flex-shrink-0">·</span>
        <span className="truncate normal-case tracking-normal">创建于</span>
      </footer>
    </article>
  )
}
