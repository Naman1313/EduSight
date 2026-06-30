import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/shared/Footer"

export const metadata: Metadata = {
  title: "EduSight — Dropout Prevention",
  description: "Predictive early warning system for school dropout prevention in Indian government schools",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: "1 0 auto" }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
