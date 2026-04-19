"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      <article className="nordic-card flex flex-col gap-5 p-5 border-[color:var(--nordic-clay)]/30">
        <header className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--nordic-clay)]/10 ring-1 ring-[color:var(--nordic-clay)]/20">
            <AlertTriangle className="h-5 w-5 text-[color:var(--nordic-clay)]" strokeWidth={1.4} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-medium leading-tight tracking-tight text-[color:var(--nordic-clay)]">
              危险操作
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              重置系统将清除所有数据，包括订阅、分类、配置和密码，此操作不可撤销
            </p>
          </div>
        </header>

        <div className="nordic-hairline" />

        <div>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            重置系统
          </Button>
        </div>
      </article>

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
