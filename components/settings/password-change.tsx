"use client"

import { useActionState, useEffect } from "react"
import { KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword } from "@/actions/auth"
import { customToast } from "@/components/ui/custom-toast"

export function PasswordChange() {
  const [state, formAction, pending] = useActionState(changePassword, null)

  useEffect(() => {
    if (state?.success) customToast.success(state.success)
    if (state?.error) customToast.error(state.error)
  }, [state])

  return (
    <article className="nordic-card flex flex-col gap-5 p-5">
      <header className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--card-sunken)] ring-1 ring-[color:var(--border)]">
          <KeyRound className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-medium leading-tight tracking-tight">修改密码</h3>
          <p className="mt-1 text-xs text-muted-foreground">更新你的登录密码</p>
        </div>
      </header>

      <div className="nordic-hairline" />

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">新密码</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="至少 6 位"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "修改中..." : "修改密码"}
        </Button>
      </form>
    </article>
  )
}
