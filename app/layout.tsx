import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Family Tree — Genealogy",
  description: "Build and explore your family tree.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
