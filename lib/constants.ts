export const CURRENCIES = [
  { code: "CNY", symbol: "¥", name: "人民币" },
  { code: "HKD", symbol: "HK$", name: "港币" },
  { code: "JPY", symbol: "¥", name: "日元" },
  { code: "USD", symbol: "$", name: "美元" },
  { code: "EUR", symbol: "€", name: "欧元" },
  { code: "GBP", symbol: "£", name: "英镑" },
] as const

export const CYCLE_UNITS = [
  { value: "day", label: "天" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]
export type CycleUnit = (typeof CYCLE_UNITS)[number]["value"]

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code
}

export function getCycleLabel(count: number, unit: string): string {
  const unitLabel = CYCLE_UNITS.find((u) => u.value === unit)?.label || unit
  return count === 1 ? `每${unitLabel}` : `每 ${count} ${unitLabel}`
}
