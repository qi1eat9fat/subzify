import { getCategories } from "@/actions/categories"
import { CategoryList } from "@/components/categories/category-list"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">分类管理</h2>
        <p className="text-muted-foreground mt-1">管理订阅分类</p>
      </div>
      <CategoryList categories={categories} />
    </div>
  )
}
