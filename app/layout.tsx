import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Ludo Tounsia",
  description: "Play Ludo Tounsia online with friends and family.",
  keywords: ["Ludo", "Ludo Tounsia", "Ludo Tunisia", "Ludo game"],
  authors: [{ name: "Mohamed Majri" }],
  openGraph: {
    title: "Ludo Tounsia",
    description: "Play Ludo Tounsia online with friends and family.",
    type: "website",
    locale: "en_US",
    siteName: "Ludo Tounsia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ludo Tounsia",
    description: "Play Ludo Tounsia online with friends and family.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}