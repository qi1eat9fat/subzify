"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CategoryForm } from "@/components/categories/category-form"
import { CategoryCard, type CategoryCardData } from "@/components/categories/category-card"
import { deleteCategory } from "@/actions/categories"
import { customToast } from "@/components/ui/custom-toast"

export function CategoryList({ categories }: { categories: CategoryCardData[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<{ id: string; name: string } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteTarget = categories.find((c) => c.id === deleteId)

  async function handleDelete() {
    if (!deleteId) return
    const result = await deleteCategory(deleteId)
    if (result.success) {
      customToast.success(result.success)
    }
    setDeleteId(null)
  }

  function openEdit(cat: { id: string; name: string }) {
    setEditCategory(cat)
    setFormOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            共 <span className="tabular-nums text-foreground">{categories.length}</span> 个分类
          </p>
          <Button
            size="sm"
            onClick={() => {
              setEditCategory(null)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            新增分类
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="nordic-card flex flex-col items-center justify-center gap-2 p-12 text-center">
            <p className="text-sm text-muted-foreground">暂无分类</p>
            <p className="text-xs text-muted-foreground">点击右上角「新增分类」开始创建</p>
          </div>
        ) : (
          <div className="nordic-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                index={i}
                onEdit={openEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </div>

      <CategoryForm open={formOpen} onOpenChange={setFormOpen} category={editCategory} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类「{deleteTarget?.name}」吗？
              {deleteTarget && deleteTarget._count.subscriptions > 0 && (
                <>该分类下有 {deleteTarget._count.subscriptions} 个订阅，删除后这些订阅将变为未分类。</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
