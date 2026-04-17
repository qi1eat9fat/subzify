export async function sendBarkNotification(
  key: string,
  title: string,
  body: string,
  server?: string
): Promise<boolean> {
  try {
    const baseUrl = server || "https://api.day.app"
    const res = await fetch(`${baseUrl}/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, group: "Subzify" }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendTelegramNotification(
  token: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}
