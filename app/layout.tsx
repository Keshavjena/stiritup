import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Stir the Game - Ultimate Party Games Platform",
  description: "The ultimate party game collection for unforgettable nights. No filters. No judgment. Just fun.",
  keywords: "party games, drinking games, truth or dare, never have I ever, multiplayer games",
  authors: [{ name: "Stir the Game Team" }],
  openGraph: {
    title: "Stir the Game - Ultimate Party Games Platform",
    description: "The ultimate party game collection for unforgettable nights. No filters. No judgment. Just fun.",
    type: "website",
    url: "https://stirthegame.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stir the Game - Ultimate Party Games Platform",
    description: "The ultimate party game collection for unforgettable nights. No filters. No judgment. Just fun.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  )
}

