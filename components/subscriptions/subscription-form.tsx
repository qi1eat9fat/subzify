"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconSearch } from "@/components/subscriptions/icon-search"
import { createSubscription, updateSubscription } from "@/actions/subscriptions"
import { CURRENCIES, CYCLE_UNITS } from "@/lib/constants"
import { customToast } from "@/components/ui/custom-toast"
import { shanghaiDateKey } from "@/lib/date"

type Category = { id: string; name: string }
type SubscriptionData = {
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
  categoryId: string | null
}

interface SubscriptionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: SubscriptionData | null
  categories: Category[]
}

const CURRENCY_ITEMS = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.symbol} ${c.name}`,
}))

const NO_CATEGORY = "__none__"

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function SubscriptionForm({
  open,
  onOpenChange,
  subscription,
  categories,
}: SubscriptionFormProps) {
  const isEdit = !!subscription
  const action = isEdit ? updateSubscription : createSubscription
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  const [icon, setIcon] = useState("")
  const [autoRenew, setAutoRenew] = useState(true)
  const [currency, setCurrency] = useState("CNY")
  const [cycleUnit, setCycleUnit] = useState("month")
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY)

  const categoryItems = useMemo(
    () => [
      { value: NO_CATEGORY, label: "无分类" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories]
  )

  useEffect(() => {
    if (open) {
      setIcon(subscription?.icon || "")
      setAutoRenew(subscription?.autoRenew ?? true)
      setCurrency(subscription?.currency || "CNY")
      setCycleUnit(subscription?.cycleUnit || "month")
      setCategoryId(subscription?.categoryId || NO_CATEGORY)
    }
  }, [open, subscription])

  useEffect(() => {
    if (state?.success) {
      customToast.success(state.success)
      onOpenChange(false)
      formRef.current?.reset()
    }
    if (state?.error) {
      customToast.error(state.error)
    }
  }, [state, onOpenChange])

  const formatDate = (date?: Date) => {
    if (!date) return ""
    return shanghaiDateKey(new Date(date))
  }

  const defaultNotifyTime = subscription
    ? formatTime(subscription.notifyHour, subscription.notifyMinute)
    : "09:00"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑订阅" : "新增订阅"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={subscription.id} />}
          <input type="hidden" name="icon" value={icon} />
          <input type="hidden" name="autoRenew" value={autoRenew ? "on" : ""} />
          <input type="hidden" name="currency" value={currency} />
          <input type="hidden" name="cycleUnit" value={cycleUnit} />
          <input
            type="hidden"
            name="categoryId"
            value={categoryId === NO_CATEGORY ? "" : categoryId}
          />

          <div className="space-y-2">
            <Label htmlFor="sub-name">订阅名称</Label>
            <Input
              id="sub-name"
              name="name"
              placeholder="例如：Netflix、iCloud+"
              defaultValue={subscription?.name || ""}
              required
            />
          </div>

          <IconSearch value={icon} onChange={setIcon} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金额</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={subscription?.amount ?? ""}
                required
                className="tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label>币种</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v ?? "CNY")}
                items={CURRENCY_ITEMS}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycleCount">续订周期</Label>
            <div className="flex gap-2">
              <Input
                id="cycleCount"
                name="cycleCount"
                type="number"
                min="1"
                defaultValue={subscription?.cycleCount || 1}
                className="w-20 tabular-nums"
                required
              />
              <Select
                value={cycleUnit}
                onValueChange={(v) => setCycleUnit(v ?? "month")}
                items={CYCLE_UNITS as unknown as { value: string; label: string }[]}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CYCLE_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notifyBefore">提前提醒（天）</Label>
              <Input
                id="notifyBefore"
                name="notifyBefore"
                type="number"
                min="0"
                max="90"
                defaultValue={subscription?.notifyBefore ?? 3}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notifyTime">提醒时间</Label>
              <Input
                id="notifyTime"
                name="notifyTime"
                type="time"
                defaultValue={defaultNotifyTime}
                className="tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">到期日期</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={formatDate(subscription?.expiresAt)}
              required
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label>分类</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? NO_CATEGORY)}
              items={categoryItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="autoRenew" className="cursor-pointer">自动续订</Label>
              <p className="text-xs text-muted-foreground">到期后自动续费并推进到期日</p>
            </div>
            <Switch
              id="autoRenew"
              checked={autoRenew}
              onCheckedChange={setAutoRenew}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
