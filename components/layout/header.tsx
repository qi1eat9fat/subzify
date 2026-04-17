"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { logout } from "@/actions/auth"

export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      {title && <h1 className="text-sm font-medium">{title}</h1>}
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">登出</span>
          </Button>
        </form>
      </div>
    </header>
  )
}
