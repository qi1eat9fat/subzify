import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendBarkNotification, sendTelegramNotification } from "@/lib/notify"
import { advanceExpiredAutoRenewals } from "@/lib/subscription-lifecycle"
import {
  addShanghaiDays,
  formatShanghaiDate,
  shanghaiDateKey,
  shanghaiDayDiff,
  shanghaiInstant,
  startOfShanghaiDay,
} from "@/lib/date"

function computeNotifyTarget(sub: {
  expiresAt: Date
  notifyBefore: number
  notifyHour: number
  notifyMinute: number
}): Date {
  const expiryKey = shanghaiDateKey(new Date(sub.expiresAt))
  const targetKey = addShanghaiDays(expiryKey, -sub.notifyBefore)
  return shanghaiInstant(targetKey, sub.notifyHour, sub.notifyMinute)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await advanceExpiredAutoRenewals()

  const now = new Date()
  const startOfToday = startOfShanghaiDay(now)
  const maxLookahead = new Date(now.getTime() + 90 * 86400 * 1000)

  const candidates = await prisma.subscription.findMany({
    where: { expiresAt: { gte: startOfToday, lte: maxLookahead } },
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
  let skippedCount = 0

  for (const sub of eligible) {
    // Mark as notified BEFORE sending. If the write fails (e.g. readonly DB),
    // skip this sub entirely so we don't spam the user every 5 minutes when
    // the send succeeds but the write loops forever.
    try {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { notifiedAt: now },
      })
    } catch (err) {
      console.error(`[cron/notify] failed to mark ${sub.id} (${sub.name}) before send, skipping:`, err)
      skippedCount++
      continue
    }

    const daysLeft = shanghaiDayDiff(new Date(sub.expiresAt), now)
    const title = "订阅即将到期"
    const body = `「${sub.name}」将在 ${daysLeft} 天后到期（${formatShanghaiDate(new Date(sub.expiresAt))}）`

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

    try {
      await Promise.allSettled(promises)
    } catch (err) {
      console.error(`[cron/notify] send failed for ${sub.id} (${sub.name}):`, err)
    }
    sentCount++
  }

  return NextResponse.json({ message: "Notifications sent", count: sentCount, skipped: skippedCount })
}
