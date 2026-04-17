import { getSettings } from "@/actions/settings"
import { BarkSettings } from "@/components/settings/bark-settings"
import { TelegramSettings } from "@/components/settings/telegram-settings"
import { PasswordChange } from "@/components/settings/password-change"
import { SystemReset } from "@/components/settings/system-reset"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">系统设置</h2>
        <p className="text-muted-foreground mt-1">通知配置与安全设置</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarkSettings defaultValues={settings} />
        <TelegramSettings defaultValues={settings} />
      </div>

      <PasswordChange />
      <SystemReset />
    </div>
  )
}
