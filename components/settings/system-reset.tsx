"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { resetSystem } from "@/actions/settings"
import { logout } from "@/actions/auth"
import { customToast } from "@/components/ui/custom-toast"

export function SystemReset() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [resetting, setResetting] = useState(false)

  async function handleReset() {
    setResetting(true)
    const result = await resetSystem()
    if (result.success) {
      customToast.info(result.success)
      await logout()
    }
    setResetting(false)
    setOpen(false)
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">危险操作</CardTitle>
          <CardDescription>重置系统将清除所有数据，包括订阅、分类、配置和密码，此操作不可撤销</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            重置系统
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置系统</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有数据且不可恢复。请输入 <strong>RESET</strong> 确认。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder='输入 "RESET" 确认'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>取消</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={confirmText !== "RESET" || resetting}
              onClick={handleReset}
            >
              {resetting ? "重置中..." : "确认重置"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
