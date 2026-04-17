export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = (await import("node-cron")).default

    const baseUrl = `http://localhost:${process.env.PORT || 3000}`
    const buildHeaders = () => {
      const headers: Record<string, string> = {}
      if (process.env.CRON_SECRET) {
        headers["Authorization"] = `Bearer ${process.env.CRON_SECRET}`
      }
      return headers
    }

    cron.schedule(
      "0 0 * * *",
      async () => {
        try {
          await fetch(`${baseUrl}/api/cron/exchange-rates`, { headers: buildHeaders() })
          console.log("[cron] Exchange rates refreshed successfully")
        } catch (error) {
          console.error("[cron] Failed to refresh exchange rates:", error)
        }
      },
      { timezone: "Asia/Shanghai" }
    )

    cron.schedule(
      "*/5 * * * *",
      async () => {
        try {
          await fetch(`${baseUrl}/api/cron/notify`, { headers: buildHeaders() })
        } catch (error) {
          console.error("[cron] Failed to run notify check:", error)
        }
      },
      { timezone: "Asia/Shanghai" }
    )

    console.log("[cron] Scheduled: exchange rates daily 00:00, notify every 5 min (Asia/Shanghai)")
  }
}
