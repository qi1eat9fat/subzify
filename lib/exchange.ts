const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1"
const FOREIGN_CURRENCIES = ["USD", "EUR", "GBP", "HKD", "JPY"]

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  // Frankfurter uses EUR as default base. Fetch USD-based rates, then compute CNY cross rates.
  // Strategy: get rates for all currencies vs USD, then derive CNY rates.
  const symbols = [...FOREIGN_CURRENCIES, "CNY"].join(",")
  const res = await fetch(`${FRANKFURTER_BASE}/latest?base=USD&symbols=${symbols}`)

  if (!res.ok) {
    throw new Error(`Exchange rate API error: ${res.status}`)
  }

  const data = await res.json()
  const usdRates = data.rates as Record<string, number>

  // usdRates gives: 1 USD = X CNY, 1 USD = Y EUR, etc.
  const cnyPerUsd = usdRates["CNY"]

  if (!cnyPerUsd) {
    throw new Error("CNY rate not found in API response")
  }

  // Compute: 1 unit of currency = Z CNY
  const result: Record<string, number> = { CNY: 1 }

  for (const currency of FOREIGN_CURRENCIES) {
    if (currency === "USD") {
      result["USD"] = cnyPerUsd
    } else {
      const usdPerUnit = 1 / (usdRates[currency] || 1)
      result[currency] = usdPerUnit * cnyPerUsd
    }
  }

  return result
}
