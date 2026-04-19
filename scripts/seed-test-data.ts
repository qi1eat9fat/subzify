import { prisma } from "@/lib/prisma"

const TEST_PREFIX = "[TEST]"

// 返回 UTC 当天 00:00，与前端 <input type="date"> 提交后 new Date("YYYY-MM-DD") 的语义保持一致
function utcDateOnly(offsetDays: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

// 当前时间向前/向后偏移分钟后的 {hour, minute}（本地时区）
function clockOffset(minutes: number): { hour: number; minute: number } {
  const d = new Date(Date.now() + minutes * 60_000)
  return { hour: d.getHours(), minute: d.getMinutes() }
}

async function clearTestData() {
  const del = await prisma.subscription.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
  const catDel = await prisma.category.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
  console.log(`cleared: ${del.count} subscriptions, ${catDel.count} categories`)
}

async function seed() {
  await clearTestData()

  const catVideo = await prisma.category.create({ data: { name: `${TEST_PREFIX} 影音娱乐` } })
  const catCloud = await prisma.category.create({ data: { name: `${TEST_PREFIX} 云服务` } })
  const catDaily = await prisma.category.create({ data: { name: `${TEST_PREFIX} 生活缴费` } })

  // 让通知点落在"刚刚过去 1 分钟"→ 下一次 cron（最多 5 分钟）就会命中
  const justBefore = clockOffset(-1)
  // 通知点落在"30 分钟后"→ 当前轮 cron 不会发
  const futureToday = clockOffset(30)

  const fixtures = [
    {
      name: `${TEST_PREFIX} 今日到期·非续费`,
      icon: null,
      amount: 15,
      currency: "CNY",
      cycleCount: 1,
      cycleUnit: "month",
      autoRenew: false,
      expiresAt: utcDateOnly(0),
      notifyBefore: 0,
      notifyHour: justBefore.hour,
      notifyMinute: justBefore.minute,
      categoryId: catVideo.id,
      _expect: "🔔 应发送（验证 autoRenew=false 当天到期修复）",
    },
    {
      name: `${TEST_PREFIX} 3 天后到期·提前提醒`,
      icon: null,
      amount: 50,
      currency: "CNY",
      cycleCount: 1,
      cycleUnit: "year",
      autoRenew: true,
      expiresAt: utcDateOnly(3),
      notifyBefore: 3,
      notifyHour: justBefore.hour,
      notifyMinute: justBefore.minute,
      categoryId: catCloud.id,
      _expect: "🔔 应发送（常规提前通知流程）",
    },
    {
      name: `${TEST_PREFIX} 已通知·去重测试`,
      icon: null,
      amount: 20,
      currency: "CNY",
      cycleCount: 1,
      cycleUnit: "month",
      autoRenew: false,
      expiresAt: utcDateOnly(0),
      notifyBefore: 0,
      notifyHour: justBefore.hour,
      notifyMinute: justBefore.minute,
      notifiedAt: new Date(),
      categoryId: catDaily.id,
      _expect: "❌ 不发（notifiedAt 已写入，应被过滤）",
    },
    {
      name: `${TEST_PREFIX} 通知点未到`,
      icon: null,
      amount: 9.9,
      currency: "USD",
      cycleCount: 1,
      cycleUnit: "month",
      autoRenew: true,
      expiresAt: utcDateOnly(1),
      notifyBefore: 0,
      notifyHour: futureToday.hour,
      notifyMinute: futureToday.minute,
      categoryId: catCloud.id,
      _expect: "⏳ 不发（通知点在 30 分钟后）",
    },
    {
      name: `${TEST_PREFIX} 已过期·自动续费`,
      icon: null,
      amount: 30,
      currency: "CNY",
      cycleCount: 1,
      cycleUnit: "month",
      autoRenew: true,
      expiresAt: utcDateOnly(-5),
      notifyBefore: 3,
      notifyHour: 9,
      notifyMinute: 0,
      categoryId: catCloud.id,
      _expect: "🔄 不发（advanceExpiredAutoRenewals 推进到下月，target 远在未来）",
    },
    {
      name: `${TEST_PREFIX} 本期应发·上期已通知`,
      icon: null,
      amount: 42,
      currency: "CNY",
      cycleCount: 1,
      cycleUnit: "month",
      autoRenew: true,
      expiresAt: utcDateOnly(2),
      notifyBefore: 3,
      notifyHour: 9,
      notifyMinute: 0,
      notifiedAt: new Date(Date.now() - 40 * 86400_000),
      categoryId: catVideo.id,
      _expect: "🔔 应发送（notifiedAt 远早于本期 target，不应被去重）",
    },
  ]

  console.log(`now = ${new Date().toString()}`)
  console.log(`seeding ${fixtures.length} test subscriptions...\n`)

  for (const f of fixtures) {
    const { _expect, ...data } = f
    await prisma.subscription.create({ data })
    const notifyAt = `${String(f.notifyHour).padStart(2, "0")}:${String(f.notifyMinute).padStart(2, "0")}`
    console.log(
      `  • ${f.name}\n    expires=${f.expiresAt.toISOString().slice(0, 10)}  notifyBefore=${f.notifyBefore}d  notifyAt=${notifyAt}  autoRenew=${f.autoRenew}\n    → ${_expect}\n`
    )
  }

  console.log("done. 下一次 cron 最多 5 分钟后触发；也可直接 curl /api/cron/notify 手动跑一次。")
}

async function main() {
  const arg = process.argv[2]
  if (arg === "--clean") {
    await clearTestData()
  } else {
    await seed()
  }
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
