"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { changePassword } from "@/actions/auth"
import { customToast } from "@/components/ui/custom-toast"

export function PasswordChange() {
  const [state, formAction, pending] = useActionState(changePassword, null)

  useEffect(() => {
    if (state?.success) customToast.success(state.success)
    if (state?.error) customToast.error(state.error)
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">修改密码</CardTitle>
        <CardDescription>更新你的登录密码</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input id="newPassword" name="newPassword" type="password" placeholder="至少 6 位" required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
          </div>
          <Button type="submit" disabled={pending}>{pending ? "修改中..." : "修改密码"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
