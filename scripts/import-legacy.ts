import Database from "better-sqlite3"
import { prisma } from "../lib/prisma"

const LEGACY_DB = process.argv[2] || "/home/wangqi/subzify.db"

type LegacyCategory = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

type LegacySubscription = {
  id: string
  name: string
  icon: string
  renewalAmount: number
  currency: string
  expiryDate: number
  periodValue: number
  periodUnit: string
  autoRenew: number
  reminderDays: number
  reminderTime: string
  createdAt: number
  updatedAt: number
  categoryId: string | null
}

async function main() {
  const legacy = new Database(LEGACY_DB, { readonly: true })

  const categories = legacy
    .prepare("SELECT id, name, createdAt, updatedAt FROM categories")
    .all() as LegacyCategory[]

  let catInserted = 0
  let catSkipped = 0
  for (const c of categories) {
    const existing = await prisma.category.findUnique({ where: { id: c.id } })
    if (existing) {
      catSkipped++
      continue
    }
    await prisma.category.create({
      data: {
        id: c.id,
        name: c.name,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
    })
    catInserted++
  }

  const subs = legacy
    .prepare(
      "SELECT id, name, icon, renewalAmount, currency, expiryDate, periodValue, periodUnit, autoRenew, reminderDays, reminderTime, createdAt, updatedAt, categoryId FROM subscriptions"
    )
    .all() as LegacySubscription[]

  const validCatIds = new Set(
    (await prisma.category.findMany({ select: { id: true } })).map((c) => c.id)
  )

  let subInserted = 0
  let subSkipped = 0
  for (const s of subs) {
    const existing = await prisma.subscription.findUnique({ where: { id: s.id } })
    if (existing) {
      subSkipped++
      continue
    }

    const [hh, mm] = (s.reminderTime || "09:00").split(":")
    const notifyHour = Number.parseInt(hh, 10) || 9
    const notifyMinute = Number.parseInt(mm, 10) || 0
    const categoryId = s.categoryId && validCatIds.has(s.categoryId) ? s.categoryId : null

    await prisma.subscription.create({
      data: {
        id: s.id,
        name: s.name,
        icon: s.icon || null,
        amount: s.renewalAmount,
        currency: s.currency,
        cycleCount: s.periodValue,
        cycleUnit: s.periodUnit,
        autoRenew: !!s.autoRenew,
        expiresAt: new Date(s.expiryDate),
        notifyBefore: s.reminderDays,
        notifyHour,
        notifyMinute,
        notifiedAt: null,
        categoryId,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
    })
    subInserted++
  }

  legacy.close()
  console.log(`categories: +${catInserted} inserted, ${catSkipped} skipped`)
  console.log(`subscriptions: +${subInserted} inserted, ${subSkipped} skipped`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
