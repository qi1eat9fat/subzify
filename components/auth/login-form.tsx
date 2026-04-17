"use client"

import { useActionState } from "react"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">知订 Subzify</CardTitle>
        <CardDescription>请输入密码登录</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入管理密码"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "登录中..." : "登录"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
