import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"

export const dynamic = "force-dynamic"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 pb-28 md:p-6 md:pb-28">{children}</main>
      <BottomNav />
    </div>
  )
}
