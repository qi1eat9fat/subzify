"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bark 推送</CardTitle>
        <CardDescription>配置 Bark 推送通知的设备 Key</CardDescription>
      </CardHeader>
      <CardContent>
        <form key={`${defaultValues.barkKey ?? ""}|${defaultValues.barkServer ?? ""}`} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barkKey">Bark Key</Label>
            <Input id="barkKey" name="barkKey" placeholder="输入 Bark 设备 Key" defaultValue={defaultValues.barkKey || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barkServer">自定义服务器（可选）</Label>
            <Input id="barkServer" name="barkServer" placeholder="https://api.day.app" defaultValue={defaultValues.barkServer || ""} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "保存中..." : "保存"}</Button>
            <Button type="button" variant="outline" onClick={handleTest}>测试推送</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
