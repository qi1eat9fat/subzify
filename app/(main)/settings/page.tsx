import { getSettings } from "@/actions/settings"
import { BarkSettings } from "@/components/settings/bark-settings"
import { TelegramSettings } from "@/components/settings/telegram-settings"
import { PasswordChange } from "@/components/settings/password-change"
import { SystemReset } from "@/components/settings/system-reset"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-[color:var(--nordic-sand)]" />
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          settings · 系统设置
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BarkSettings defaultValues={settings} />
        <TelegramSettings defaultValues={settings} />
        <PasswordChange />
      </div>

      <SystemReset />
    </div>
  )
}
