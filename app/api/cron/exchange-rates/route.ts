import { NextRequest, NextResponse } from "next/server"
import { refreshExchangeRates } from "@/actions/exchange-rates"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await refreshExchangeRates()
  return NextResponse.json(result)
}
