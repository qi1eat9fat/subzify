"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { fetchExchangeRates } from "@/lib/exchange"

export async function refreshExchangeRates() {
  try {
    const rates = await fetchExchangeRates()

    for (const [currency, rate] of Object.entries(rates)) {
      await prisma.exchangeRate.upsert({
        where: { currency },
        update: { rate },
        create: { currency, rate },
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/exchange-rates")
    return { success: "汇率刷新成功" }
  } catch (error) {
    return { error: `汇率刷新失败：${error instanceof Error ? error.message : "未知错误"}` }
  }
}

export async function getExchangeRates() {
  const rates = await prisma.exchangeRate.findMany()
  return new Map(rates.map((r) => [r.currency, r.rate]))
}
