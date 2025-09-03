import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, Monitor } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo and Branding */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">UneTrack</span>
            </div>
            <p className="text-muted-foreground text-sm">Digital Signage SaaS</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
              <CardDescription className="text-base">
                We've sent you a confirmation link. Please check your email and click the link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try signing up again.
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
