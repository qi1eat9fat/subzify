"use client"

import { useActionState } from "react"
import { setup } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupForm() {
  const [state, formAction, pending] = useActionState(setup, null)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">知订 Subzify</CardTitle>
        <CardDescription>首次使用，请设置管理密码</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">设置密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="至少 6 位"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">确认密码</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="再次输入密码"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "初始化中..." : "开始使用"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
