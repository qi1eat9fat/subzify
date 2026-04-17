import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import type { SessionData } from "@/lib/session"
import { sessionOptions } from "@/lib/session"

const publicPaths = ["/login", "/setup"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next()
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  )

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron).*)"],
}
