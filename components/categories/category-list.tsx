"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/categories/category-form"
import { deleteCategory } from "@/actions/categories"
import { customToast } from "@/components/ui/custom-toast"

type CategoryWithCount = {
  id: string
  name: string
  createdAt: Date
  _count: { subscriptions: number }
}

export function CategoryList({ categories }: { categories: CategoryWithCount[] }) {
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">全部分类</CardTitle>
          <Button size="sm" onClick={() => { setEditCategory(null); setFormOpen(true) }}>
            <Plus className="mr-1 h-4 w-4" />
            新增分类
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              暂无分类，点击右上角新增
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead className="tabular-nums w-[120px]">订阅数</TableHead>
                  <TableHead className="tabular-nums w-[160px]">创建时间</TableHead>
                  <TableHead className="w-[100px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="tabular-nums">{cat._count.subscriptions}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(cat.createdAt).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditCategory({ id: cat.id, name: cat.name }); setFormOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(cat.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editCategory}
      />

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
