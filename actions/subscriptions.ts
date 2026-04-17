"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getSubscriptions() {
  return prisma.subscription.findMany({
    orderBy: { expiresAt: "asc" },
    include: { category: true },
  })
}

function parseNotifyTime(input: string | null | undefined): { hour: number; minute: number } {
  if (!input) return { hour: 9, minute: 0 }
  const [h, m] = input.split(":").map((s) => parseInt(s, 10))
  const hour = Number.isFinite(h) && h >= 0 && h <= 23 ? h : 9
  const minute = Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0
  return { hour, minute }
}

export async function createSubscription(_prevState: unknown, formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const icon = (formData.get("icon") as string)?.trim() || null
  const amount = parseFloat(formData.get("amount") as string)
  const currency = formData.get("currency") as string
  const cycleCount = parseInt(formData.get("cycleCount") as string, 10)
  const cycleUnit = formData.get("cycleUnit") as string
  const autoRenew = formData.get("autoRenew") === "on"
  const expiresAt = formData.get("expiresAt") as string
  const notifyBefore = parseInt(formData.get("notifyBefore") as string, 10)
  const { hour: notifyHour, minute: notifyMinute } = parseNotifyTime(
    formData.get("notifyTime") as string
  )
  const categoryId = (formData.get("categoryId") as string) || null

  if (!name) return { error: "请输入订阅名称" }
  if (isNaN(amount) || amount < 0) return { error: "请输入有效金额" }
  if (!expiresAt) return { error: "请选择到期日期" }
  if (isNaN(cycleCount) || cycleCount < 1) return { error: "续订周期数量至少为 1" }

  await prisma.subscription.create({
    data: {
      name,
      icon,
      amount,
      currency: currency || "CNY",
      cycleCount: cycleCount || 1,
      cycleUnit: cycleUnit || "month",
      autoRenew,
      expiresAt: new Date(expiresAt),
      notifyBefore: isNaN(notifyBefore) ? 3 : notifyBefore,
      notifyHour,
      notifyMinute,
      categoryId: categoryId || null,
    },
  })

  revalidatePath("/subscriptions")
  revalidatePath("/dashboard")
  return { success: "订阅创建成功" }
}

export async function updateSubscription(_prevState: unknown, formData: FormData) {
  const id = formData.get("id") as string
  const name = (formData.get("name") as string)?.trim()
  const icon = (formData.get("icon") as string)?.trim() || null
  const amount = parseFloat(formData.get("amount") as string)
  const currency = formData.get("currency") as string
  const cycleCount = parseInt(formData.get("cycleCount") as string, 10)
  const cycleUnit = formData.get("cycleUnit") as string
  const autoRenew = formData.get("autoRenew") === "on"
  const expiresAt = formData.get("expiresAt") as string
  const notifyBefore = parseInt(formData.get("notifyBefore") as string, 10)
  const { hour: notifyHour, minute: notifyMinute } = parseNotifyTime(
    formData.get("notifyTime") as string
  )
  const categoryId = (formData.get("categoryId") as string) || null

  if (!name) return { error: "请输入订阅名称" }
  if (isNaN(amount) || amount < 0) return { error: "请输入有效金额" }
  if (!expiresAt) return { error: "请选择到期日期" }

  const oldSub = await prisma.subscription.findUnique({ where: { id } })
  const newExpiresAt = new Date(expiresAt)

  // Reset notifiedAt if expiresAt changed
  const notifiedAt =
    oldSub && oldSub.expiresAt.getTime() !== newExpiresAt.getTime() ? null : undefined

  await prisma.subscription.update({
    where: { id },
    data: {
      name,
      icon,
      amount,
      currency: currency || "CNY",
      cycleCount: cycleCount || 1,
      cycleUnit: cycleUnit || "month",
      autoRenew,
      expiresAt: newExpiresAt,
      notifyBefore: isNaN(notifyBefore) ? 3 : notifyBefore,
      notifyHour,
      notifyMinute,
      categoryId: categoryId || null,
      ...(notifiedAt === null ? { notifiedAt: null } : {}),
    },
  })

  revalidatePath("/subscriptions")
  revalidatePath("/dashboard")
  return { success: "订阅更新成功" }
}

export async function deleteSubscription(id: string) {
  await prisma.subscription.delete({ where: { id } })
  revalidatePath("/subscriptions")
  revalidatePath("/dashboard")
  return { success: "订阅删除成功" }
}
