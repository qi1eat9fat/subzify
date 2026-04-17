"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { sendBarkNotification, sendTelegramNotification } from "@/lib/notify"

async function getConfigValue(key: string): Promise<string | null> {
  const config = await prisma.systemConfig.findUnique({ where: { key } })
  return config?.value || null
}

async function setConfigValue(key: string, value: string) {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}

export async function saveBarkSettings(_prevState: unknown, formData: FormData) {
  const barkKey = (formData.get("barkKey") as string)?.trim()
  const barkServer = (formData.get("barkServer") as string)?.trim()

  if (!barkKey) {
    return { error: "请输入 Bark Key" }
  }

  await setConfigValue("barkKey", barkKey)
  if (barkServer) {
    await setConfigValue("barkServer", barkServer)
  }

  revalidatePath("/settings")
  return { success: "Bark 配置保存成功" }
}

export async function saveTelegramSettings(_prevState: unknown, formData: FormData) {
  const token = (formData.get("telegramBotToken") as string)?.trim()
  const chatId = (formData.get("telegramChatId") as string)?.trim()

  if (!token || !chatId) {
    return { error: "请填写 Bot Token 和 Chat ID" }
  }

  await setConfigValue("telegramBotToken", token)
  await setConfigValue("telegramChatId", chatId)

  revalidatePath("/settings")
  return { success: "Telegram 配置保存成功" }
}

export async function testBarkNotification() {
  const key = await getConfigValue("barkKey")
  const server = await getConfigValue("barkServer")

  if (!key) return { error: "未配置 Bark Key" }

  const ok = await sendBarkNotification(key, "Subzify 测试", "通知配置成功！", server || undefined)
  return ok ? { success: "测试推送已发送" } : { error: "推送失败，请检查 Key" }
}

export async function testTelegramNotification() {
  const token = await getConfigValue("telegramBotToken")
  const chatId = await getConfigValue("telegramChatId")

  if (!token || !chatId) return { error: "未配置 Telegram" }

  const ok = await sendTelegramNotification(token, chatId, "✅ *Subzify 测试*\n通知配置成功！")
  return ok ? { success: "测试消息已发送" } : { error: "发送失败，请检查 Token/Chat ID" }
}

export async function resetSystem() {
  await prisma.subscription.deleteMany()
  await prisma.category.deleteMany()
  await prisma.exchangeRate.deleteMany()
  await prisma.systemConfig.deleteMany()
  return { success: "系统已重置" }
}

export async function getSettings() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ["barkKey", "barkServer", "telegramBotToken", "telegramChatId"] },
    },
  })
  return Object.fromEntries(configs.map((c) => [c.key, c.value]))
}
