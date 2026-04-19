import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { logout } from "@/actions/auth"

export function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/android-chrome-192x192.png"
          alt="知订·Subzify"
          width={28}
          height={28}
          unoptimized
          className="h-7 w-7 rounded-md"
        />
        <span className="text-sm font-semibold">知订·Subzify</span>
      </Link>
      {title && (
        <>
          <span className="h-4 w-px bg-border" />
          <h1 className="text-sm font-medium">{title}</h1>
        </>
      )}
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
