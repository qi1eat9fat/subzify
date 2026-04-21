// All date computations in this app are anchored to Asia/Shanghai regardless
// of the process TZ or the browser's timezone. The subscription form only
// picks a calendar date (no time), so "today" and "expires on day X" always
// mean the Shanghai calendar day.

export const SHANGHAI_TZ = "Asia/Shanghai"

/** "YYYY-MM-DD" for the Shanghai calendar day that `d` falls in. */
export function shanghaiDateKey(d: Date = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: SHANGHAI_TZ })
}

/** Absolute instant of 00:00 Shanghai on the day that `d` falls in. */
export function startOfShanghaiDay(d: Date = new Date()): Date {
  return new Date(`${shanghaiDateKey(d)}T00:00:00+08:00`)
}

/** Signed day difference (a's day − b's day) in Shanghai calendar days. */
export function shanghaiDayDiff(a: Date, b: Date): number {
  return Math.round(
    (startOfShanghaiDay(a).getTime() - startOfShanghaiDay(b).getTime()) / 86400000
  )
}

/** Add N calendar days to a Shanghai date key and return the new key. */
export function addShanghaiDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00+08:00`)
  d.setUTCDate(d.getUTCDate() + days)
  return shanghaiDateKey(d)
}

/** Absolute instant of `hour:minute` Shanghai on the given Shanghai date key. */
export function shanghaiInstant(dateKey: string, hour = 0, minute = 0): Date {
  const hh = String(hour).padStart(2, "0")
  const mm = String(minute).padStart(2, "0")
  return new Date(`${dateKey}T${hh}:${mm}:00+08:00`)
}

/** Format an instant as zh-CN date in Shanghai time. */
export function formatShanghaiDate(
  d: Date,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  return d.toLocaleDateString("zh-CN", { ...opts, timeZone: SHANGHAI_TZ })
}
