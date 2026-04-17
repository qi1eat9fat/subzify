import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SetupForm } from "@/components/auth/setup-form"

export default async function SetupPage() {
  const isSetup = await prisma.systemConfig.findUnique({
    where: { key: "isSetup" },
  })

  if (isSetup?.value === "true") {
    redirect("/login")
  }

  return <SetupForm />
}
