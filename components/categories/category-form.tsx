"use client"

import { useActionState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createCategory, updateCategory } from "@/actions/categories"
import { customToast } from "@/components/ui/custom-toast"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: { id: string; name: string } | null
}

export function CategoryForm({ open, onOpenChange, category }: CategoryFormProps) {
  const isEdit = !!category
  const action = isEdit ? updateCategory : createCategory
  const [state, formAction, pending] = useActionState(action, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      customToast.success(state.success)
      onOpenChange(false)
      formRef.current?.reset()
    }
    if (state?.error) {
      customToast.error(state.error)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑分类" : "新增分类"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={category.id} />}
          <div className="space-y-2">
            <Label htmlFor="name">分类名称</Label>
            <Input
              id="name"
              name="name"
              placeholder="输入分类名称"
              defaultValue={category?.name || ""}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
