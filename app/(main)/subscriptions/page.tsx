import { getSubscriptions } from "@/actions/subscriptions"
import { getCategories } from "@/actions/categories"
import { SubscriptionList } from "@/components/subscriptions/subscription-list"
import { advanceExpiredAutoRenewals } from "@/lib/subscription-lifecycle"

export default async function SubscriptionsPage() {
  await advanceExpiredAutoRenewals()
  const [subscriptions, categories] = await Promise.all([
    getSubscriptions(),
    getCategories(),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">订阅管理</h2>
        <p className="text-muted-foreground mt-1">管理你的所有订阅服务</p>
      </div>
      <SubscriptionList
        subscriptions={subscriptions}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
