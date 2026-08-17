import type { Metadata } from "next"
import { Geist_Mono, Heebo } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const fontSans = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OfficeFlow — ניהול לקוחות וגבייה למשרד רואי חשבון",
  description:
    "לוח בקרה מרכזי לכל תיקי הלקוחות: סטטוס גבייה, תאריכי יעד, חומרים חסרים ותזכורות WhatsApp מנוסחות אוטומטית.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body>
        <ThemeProvider>
          <DirectionProvider direction="rtl">
            {children}
            <Toaster position="bottom-left" richColors />
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
