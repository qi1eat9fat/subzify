"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Telegram 推送</CardTitle>
        <CardDescription>配置 Telegram Bot 通知</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={`${defaultValues.telegramBotToken ?? ""}|${defaultValues.telegramChatId ?? ""}`} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramBotToken">Bot Token</Label>
            <Input id="telegramBotToken" name="telegramBotToken" placeholder="123456:ABC-DEF..." defaultValue={defaultValues.telegramBotToken || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegramChatId">Chat ID</Label>
            <Input id="telegramChatId" name="telegramChatId" placeholder="输入 Chat ID" defaultValue={defaultValues.telegramChatId || ""} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "保存中..." : "保存"}</Button>
            <Button type="button" variant="outline" onClick={handleTest}>测试消息</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
