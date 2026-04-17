import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage() {
  const isSetup = await prisma.systemConfig.findUnique({
    where: { key: "isSetup" },
  })

  if (isSetup?.value !== "true") {
    redirect("/setup")
  }

  return <LoginForm />
}
