"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { subscriptions: true } },
    },
  })
}

export async function createCategory(_prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim()

  if (!name) {
    return { error: "请输入分类名称" }
  }

  const existing = await prisma.category.findFirst({
    where: { name },
  })

  if (existing) {
    return { error: "该分类名称已存在" }
  }

  await prisma.category.create({ data: { name } })
  revalidatePath("/categories")
  return { success: "分类创建成功" }
}

export async function updateCategory(_prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string
  const name = (formData.get("name") as string)?.trim()

  if (!name) {
    return { error: "请输入分类名称" }
  }

  const existing = await prisma.category.findFirst({
    where: { name, NOT: { id } },
  })

  if (existing) {
    return { error: "该分类名称已存在" }
  }

  await prisma.category.update({
    where: { id },
    data: { name },
  })
  revalidatePath("/categories")
  return { success: "分类更新成功" }
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath("/categories")
  return { success: "分类删除成功" }
}
