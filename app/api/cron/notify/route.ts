import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBarkNotification, sendTelegramNotification } from "@/lib/notify"
import { advanceExpiredAutoRenewals } from "@/lib/subscription-lifecycle"

function computeNotifyTarget(sub: {
  expiresAt: Date
  notifyBefore: number
  notifyHour: number
  notifyMinute: number
}): Date {
  const target = new Date(sub.expiresAt)
  target.setDate(target.getDate() - sub.notifyBefore)
  target.setHours(sub.notifyHour, sub.notifyMinute, 0, 0)
  return target
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await advanceExpiredAutoRenewals()

  const now = new Date()
  const maxLookahead = new Date(now.getTime() + 90 * 86400 * 1000)

  const candidates = await prisma.subscription.findMany({
    where: { expiresAt: { gte: now, lte: maxLookahead } },
    include: { category: true },
  })

  const eligible = candidates.filter((sub) => {
    const target = computeNotifyTarget(sub)
    if (now < target) return false
    if (sub.notifiedAt && sub.notifiedAt >= target) return false
    return true
  })

  if (eligible.length === 0) {
    return NextResponse.json({ message: "No notifications to send", count: 0 })
  }

  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: ["barkKey", "barkServer", "telegramBotToken", "telegramChatId"] } },
  })
  const configMap = new Map(configs.map((c) => [c.key, c.value]))

  let sentCount = 0

  for (const sub of eligible) {
    const daysLeft = Math.ceil(
      (new Date(sub.expiresAt).getTime() - now.getTime()) / 86400000
    )
    const title = "订阅即将到期"
    const body = `「${sub.name}」将在 ${daysLeft} 天后到期（${new Date(sub.expiresAt).toLocaleDateString("zh-CN")}）`

    const promises: Promise<boolean>[] = []

    const barkKey = configMap.get("barkKey")
    if (barkKey) {
      promises.push(
        sendBarkNotification(barkKey, title, body, configMap.get("barkServer"))
      )
    }

    const tgToken = configMap.get("telegramBotToken")
    const tgChat = configMap.get("telegramChatId")
    if (tgToken && tgChat) {
      promises.push(
        sendTelegramNotification(tgToken, tgChat, `*${title}*\n${body}`)
      )
    }

    await Promise.allSettled(promises)

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { notifiedAt: now },
    })
    sentCount++
  }

  return NextResponse.json({ message: "Notifications sent", count: sentCount })
}
