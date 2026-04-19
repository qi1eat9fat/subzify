import { getCategories } from "@/actions/categories"
import { CategoryList } from "@/components/categories/category-list"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-[color:var(--nordic-sand)]" />
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          categories · 分类管理
        </h2>
      </div>
      <CategoryList categories={categories} />
    </div>
  )
}
