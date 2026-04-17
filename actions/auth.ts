"use server"

import { getIronSession } from "iron-session"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { SessionData } from "@/lib/session"
import { sessionOptions } from "@/lib/session"

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function setup(_prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!password || password.length < 6) {
    return { error: "密码长度至少 6 位" }
  }

  if (password !== confirm) {
    return { error: "两次输入的密码不一致" }
  }

  const existing = await prisma.systemConfig.findUnique({
    where: { key: "isSetup" },
  })

  if (existing?.value === "true") {
    return { error: "系统已初始化" }
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.systemConfig.createMany({
    data: [
      { key: "passwordHash", value: hash },
      { key: "isSetup", value: "true" },
    ],
  })

  // Seed CNY exchange rate
  await prisma.exchangeRate.upsert({
    where: { currency: "CNY" },
    update: { rate: 1 },
    create: { currency: "CNY", rate: 1 },
  })

  const session = await getSession()
  session.isLoggedIn = true
  await session.save()

  redirect("/dashboard")
}

export async function login(_prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string

  if (!password) {
    return { error: "请输入密码" }
  }

  const config = await prisma.systemConfig.findUnique({
    where: { key: "passwordHash" },
  })

  if (!config) {
    return { error: "系统未初始化" }
  }

  const valid = await bcrypt.compare(password, config.value)

  if (!valid) {
    return { error: "密码错误" }
  }

  const session = await getSession()
  session.isLoggedIn = true
  await session.save()

  redirect("/dashboard")
}

export async function logout() {
  const session = await getSession()
  session.destroy()
  redirect("/login")
}

export async function changePassword(_prevState: unknown, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword) {
    return { error: "请填写所有字段" }
  }

  if (newPassword.length < 6) {
    return { error: "新密码长度至少 6 位" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "两次输入的新密码不一致" }
  }

  const config = await prisma.systemConfig.findUnique({
    where: { key: "passwordHash" },
  })

  if (!config) {
    return { error: "系统未初始化" }
  }

  const valid = await bcrypt.compare(currentPassword, config.value)

  if (!valid) {
    return { error: "当前密码错误" }
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.systemConfig.update({
    where: { key: "passwordHash" },
    data: { value: hash },
  })

  return { success: "密码修改成功" }
}
