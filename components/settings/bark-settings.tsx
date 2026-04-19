"use client"

import { useActionState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveBarkSettings, testBarkNotification } from "@/actions/settings"
import { customToast } from "@/components/ui/custom-toast"

export function BarkSettings({ defaultValues }: { defaultValues: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveBarkSettings, null)

  useEffect(() => {
    if (state?.success) customToast.success(state.success)
    if (state?.error) customToast.error(state.error)
  }, [state])

  async function handleTest() {
    const result = await testBarkNotification()
    if (result.success) customToast.success(result.success)
    if (result.error) customToast.error(result.error)
  }

  return (
    <article className="nordic-card flex flex-col gap-5 p-5">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          <Bell className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-medium leading-tight tracking-tight">Bark 推送</h3>
          <p className="mt-1 text-xs text-muted-foreground">配置 Bark 推送通知的设备 Key</p>
        </div>
      </header>

      <div className="nordic-hairline" />

      <form
        key={`${defaultValues.barkKey ?? ""}|${defaultValues.barkServer ?? ""}`}
        action={formAction}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="barkKey">Bark Key</Label>
          <Input
            id="barkKey"
            name="barkKey"
            placeholder="输入 Bark 设备 Key"
            defaultValue={defaultValues.barkKey || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barkServer">自定义服务器（可选）</Label>
          <Input
            id="barkServer"
            name="barkServer"
            placeholder="https://api.day.app"
            defaultValue={defaultValues.barkServer || ""}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "保存中..." : "保存"}
          </Button>
          <Button type="button" variant="outline" onClick={handleTest}>
            测试推送
          </Button>
        </div>
      </form>
    </article>
  )
}
