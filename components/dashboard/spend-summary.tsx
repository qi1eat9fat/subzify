import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SpendSummary({
  monthlyTotal,
  yearlyTotal,
}: {
  monthlyTotal: number
  yearlyTotal: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">当月预计花费</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">
            ¥{monthlyTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">已换算为人民币</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">当年预计花费</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tabular-nums">
            ¥{yearlyTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">已换算为人民币</p>
        </CardContent>
      </Card>
    </div>
  )
}
