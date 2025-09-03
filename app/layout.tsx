import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AssetProvider } from "@/lib/asset-context"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "UneTrack",
  description: "Comprehensive Asset Management Platform for Enterprise",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AssetProvider>
            {children}
            <Toaster />
          </AssetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
