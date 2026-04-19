"use client"

import { useActionState, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveTelegramSettings, testTelegramNotification } from "@/actions/settings"
import { customToast } from "@/components/ui/custom-toast"

export function TelegramSettings({ defaultValues }: { defaultValues: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveTelegramSettings, null)

  useEffect(() => {
    if (state?.success) customToast.success(state.success)
    if (state?.error) customToast.error(state.error)
  }, [state])

  async function handleTest() {
    const result = await testTelegramNotification()
    if (result.success) customToast.success(result.success)
    if (result.error) customToast.error(result.error)
  }

  return (
    <article className="nordic-card flex flex-col gap-5 p-5">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          <Send className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-medium leading-tight tracking-tight">Telegram 推送</h3>
          <p className="mt-1 text-xs text-muted-foreground">配置 Telegram Bot 通知</p>
        </div>
      </header>

      <div className="nordic-hairline" />

      <form
        key={`${defaultValues.telegramBotToken ?? ""}|${defaultValues.telegramChatId ?? ""}`}
        action={formAction}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="telegramBotToken">Bot Token</Label>
          <Input
            id="telegramBotToken"
            name="telegramBotToken"
            placeholder="123456:ABC-DEF..."
            defaultValue={defaultValues.telegramBotToken || ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telegramChatId">Chat ID</Label>
          <Input
            id="telegramChatId"
            name="telegramChatId"
            placeholder="输入 Chat ID"
            defaultValue={defaultValues.telegramChatId || ""}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "保存中..." : "保存"}
          </Button>
          <Button type="button" variant="outline" onClick={handleTest}>
            测试消息
          </Button>
        </div>
      </form>
    </article>
  )
}
