import type { SessionOptions } from "iron-session"

export interface SessionData {
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_SECRET || "fallback-secret-at-least-32-characters-long",
  cookieName: "subzify-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 86400, // 24 hours
  },
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
}
