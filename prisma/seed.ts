import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
})
const prisma = new PrismaClient({ adapter })

const defaultCategories = ["流媒体", "生产力", "云存储", "游戏", "其他"]

async function main() {
  // Seed default categories
  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { id: name },
      update: {},
      create: { id: name, name },
    })
  }

  // Seed CNY exchange rate
  await prisma.exchangeRate.upsert({
    where: { currency: "CNY" },
    update: { rate: 1 },
    create: { currency: "CNY", rate: 1 },
  })

  console.log("Seed completed: default categories + CNY rate")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
