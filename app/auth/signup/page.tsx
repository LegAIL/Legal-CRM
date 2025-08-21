
import { SignupForm } from "@/components/auth/signup-form"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function SignupPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold law-gold mb-2">LawAware CRM</h1>
          <p className="text-muted-foreground">Join our professional legal management platform</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
