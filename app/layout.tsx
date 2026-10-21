import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google"
import "./globals.css"

import { PwaRegistrar } from "./components/pwa-registrar"
import { PwaInstallPrompt } from "./components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#0a0a0a",
}

export const metadata: Metadata = {
  title: "Stir It Up - Ultimate Party Games Platform",
  description: "The ultimate interactive multiplayer party game collection for unforgettable nights. No filters. No judgment. Just fun.",
  keywords: "party games, drinking games, truth or dare, kiss marry kill, would you rather, multiplayer games, pwa",
  authors: [{ name: "Stir It Up Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stir It Up",
  },
  icons: {
    icon: [
      { url: "/StirItUp.png", sizes: "any", type: "image/png" },
    ],
    apple: [
      { url: "/StirItUp.png", sizes: "any", type: "image/png" },
    ],
    shortcut: ["/StirItUp.png"],
  },
  openGraph: {
    title: "Stir It Up - Ultimate Party Games Platform",
    description: "The ultimate interactive party game collection for unforgettable nights. No filters. No judgment. Just fun.",
    type: "website",
    url: "https://stirthegame.com",
    images: [{ url: "/StirItUp.png", width: 1024, height: 1024, alt: "Stir It Up Party Engine" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stir It Up - Ultimate Party Games Platform",
    description: "The ultimate interactive party game collection for unforgettable nights. No filters. No judgment. Just fun.",
    images: ["/StirItUp.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark selection:bg-zinc-800 selection:text-white">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${playfair.variable} font-sans bg-neutral-950 text-zinc-100 min-h-screen antialiased overflow-x-hidden touch-manipulation`}>
        <PwaRegistrar />
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  )
}

