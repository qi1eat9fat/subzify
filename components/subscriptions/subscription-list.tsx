"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SubscriptionForm } from "@/components/subscriptions/subscription-form"
import { deleteSubscription } from "@/actions/subscriptions"
import { getCurrencySymbol, getCycleLabel } from "@/lib/constants"
import { deriveStatus } from "@/lib/subscription-utils"
import { customToast } from "@/components/ui/custom-toast"

type Category = { id: string; name: string }
type SubscriptionWithCategory = {
  id: string
  name: string
  icon: string | null
  amount: number
  currency: string
  cycleCount: number
  cycleUnit: string
  autoRenew: boolean
  expiresAt: Date
  notifyBefore: number
  notifyHour: number
  notifyMinute: number
  notifiedAt: Date | null
  categoryId: string | null
  category: Category | null
  createdAt: Date
  updatedAt: Date
}

const statusConfig = {
  active: { label: "生效中", variant: "default" as const, className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
  expiring_soon: { label: "即将到期", variant: "default" as const, className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  expired: { label: "已过期", variant: "default" as const, className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
}

export function SubscriptionList({
  subscriptions,
  categories,
}: {
  subscriptions: SubscriptionWithCategory[]
  categories: Category[]
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub] = useState<SubscriptionWithCategory | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteTarget = subscriptions.find((s) => s.id === deleteId)

  async function handleDelete() {
    if (!deleteId) return
    const result = await deleteSubscription(deleteId)
    if (result.success) customToast.success(result.success)
    setDeleteId(null)
  }

  function daysUntil(date: Date) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">全部订阅</CardTitle>
          <Button size="sm" onClick={() => { setEditSub(null); setFormOpen(true) }}>
            <Plus className="mr-1 h-4 w-4" />
            新增订阅
          </Button>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              暂无订阅，点击右上角新增
            </p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const status = deriveStatus(sub)
                const config = statusConfig[status]
                const days = daysUntil(sub.expiresAt)

                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                      {sub.icon ? (
                        <Image
                          src={sub.icon}
                          alt={sub.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{sub.name}</span>
                        <Badge variant="outline" className={config.className}>
                          {status === "expiring_soon" ? `${days} 天后到期` : config.label}
                        </Badge>
                        {sub.autoRenew && (
                          <Badge variant="secondary" className="text-xs">自动续订</Badge>
                        )}
                        {sub.category && (
                          <Badge variant="outline" className="text-xs">{sub.category.name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="tabular-nums font-medium text-foreground">
                          {getCurrencySymbol(sub.currency)}{sub.amount.toFixed(2)}
                        </span>
                        <span>{getCycleLabel(sub.cycleCount, sub.cycleUnit)}</span>
                        <span className="tabular-nums">
                          {new Date(sub.expiresAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditSub(sub); setFormOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(sub.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <SubscriptionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editSub}
        categories={categories}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除订阅「{deleteTarget?.name}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
