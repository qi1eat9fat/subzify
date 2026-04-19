"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import {
  SubscriptionCard,
  type SubscriptionCardData,
} from "@/components/subscriptions/subscription-card"
import { deleteSubscription } from "@/actions/subscriptions"
import { deriveStatus } from "@/lib/subscription-utils"
import { customToast } from "@/components/ui/custom-toast"

type Category = { id: string; name: string }
type SubscriptionWithCategory = SubscriptionCardData & {
  notifyBefore: number
  notifyHour: number
  notifyMinute: number
  notifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
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

  const activeSubs = subscriptions.filter((s) => deriveStatus(s) !== "expired")
  const expiredSubs = subscriptions.filter((s) => deriveStatus(s) === "expired")

  async function handleDelete() {
    if (!deleteId) return
    const result = await deleteSubscription(deleteId)
    if (result.success) customToast.success(result.success)
    setDeleteId(null)
  }

  function handleEdit(sub: SubscriptionCardData) {
    const full = subscriptions.find((s) => s.id === sub.id)
    if (full) {
      setEditSub(full)
      setFormOpen(true)
    }
  }

  function handleAdd() {
    setEditSub(null)
    setFormOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          共 <span className="tabular-nums text-foreground">{subscriptions.length}</span> 项 ·
          生效 <span className="tabular-nums text-foreground">{activeSubs.length}</span> ·
          已过期 <span className="tabular-nums text-foreground">{expiredSubs.length}</span>
        </span>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" />
          新增订阅
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="nordic-card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">暂无订阅</p>
          <p className="text-xs text-muted-foreground/70">点击右上角「新增订阅」开始记录</p>
        </div>
      ) : (
        <div className="space-y-10">
          {activeSubs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">生效中</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  ACTIVE · {activeSubs.length}
                </span>
              </div>
              <div className="nordic-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeSubs.map((sub, i) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </section>
          )}

          {expiredSubs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-muted-foreground">已过期</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  EXPIRED · {expiredSubs.length}
                </span>
              </div>
              <div className="nordic-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expiredSubs.map((sub, i) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
