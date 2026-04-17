import Image from "next/image"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrencySymbol } from "@/lib/constants"

type ExpiringSubscription = {
  id: string
  name: string
  icon: string | null
  amount: number
  currency: string
  expiresAt: Date
  autoRenew: boolean
}

type ExpiringGroups = {
  critical: ExpiringSubscription[]
  warning: ExpiringSubscription[]
  upcoming: ExpiringSubscription[]
}

const tierConfig = {
  critical: { label: "3 天内到期", className: "text-red-600 dark:text-red-400" },
  warning: { label: "7 天内到期", className: "text-amber-600 dark:text-amber-400" },
  upcoming: { label: "30 天内到期", className: "text-muted-foreground" },
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function ExpiringList({ groups }: { groups: ExpiringGroups }) {
  const total = groups.critical.length + groups.warning.length + groups.upcoming.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">到期提醒</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            近 30 天内无订阅到期
          </p>
        ) : (
          <div className="space-y-4">
            {(["critical", "warning", "upcoming"] as const).map((tier) => {
              const subs = groups[tier]
              if (subs.length === 0) return null
              const config = tierConfig[tier]
              return (
                <div key={tier}>
                  <p className={`text-xs font-medium mb-2 ${config.className}`}>
                    {config.label}（{subs.length}）
                  </p>
                  <div className="space-y-2">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
                          {sub.icon ? (
                            <Image src={sub.icon} alt={sub.name} width={32} height={32} className="object-cover" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 truncate">{sub.name}</div>
                        <span className="tabular-nums text-xs text-muted-foreground flex-shrink-0">
                          {daysUntil(sub.expiresAt)} 天
                        </span>
                        <span className="tabular-nums text-xs flex-shrink-0">
                          {getCurrencySymbol(sub.currency)}{sub.amount.toFixed(2)}
                        </span>
                        {sub.autoRenew && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">续</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
