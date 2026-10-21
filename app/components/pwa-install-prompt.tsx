"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Share2, PlusSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(isStandaloneMode)
    if (isStandaloneMode) return

    // Check if user dismissed prompt recently
    const dismissed = sessionStorage.getItem("stir_pwa_dismissed")
    if (dismissed) return

    // iOS Safari detection
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
    if (isIosDevice && isSafari) {
      setIsIos(true)
      // Show prompt after 3s on iOS
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android / Desktop Chrome `beforeinstallprompt`
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      setShowPrompt(false)
      setDeferredPrompt(null)
      console.log("[PWA] App successfully installed!")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true)
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log("[PWA] User response to install prompt:", outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    setShowIosGuide(false)
    sessionStorage.setItem("stir_pwa_dismissed", "true")
  }

  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="App Installation Banner"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-neutral-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3.5 shadow-2xl text-white selection:bg-zinc-800"
      >
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-0.5 shadow-md flex-shrink-0">
            <img
              src="/icon-192.png"
              alt="Stir It Up"
              className="w-full h-full object-cover rounded-[10px]"
            />
          </div>

          {/* Prompt Text */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-white truncate">
                Install Stir It Up
              </h4>
              <span className="text-[8px] font-black uppercase bg-amber-400 text-black px-1.5 py-0.2 rounded-full">
                App
              </span>
            </div>
            <p className="text-[10.5px] text-zinc-400 font-normal leading-snug mt-0.5">
              Full-screen party mode, instant offline load, zero browser lag.
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={dismissPrompt}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10px] uppercase tracking-wider border-0 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIos ? "Add to Home Screen" : "Install App"}</span>
          </Button>
          <Button
            onClick={dismissPrompt}
            variant="ghost"
            className="h-9 px-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-[9px] uppercase font-bold tracking-wider"
          >
            Later
          </Button>
        </div>

        {/* iOS Safari Guide Overlay */}
        {showIosGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-300 space-y-1.5"
          >
            <p className="font-bold text-amber-400 uppercase text-[9px] flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> To Install on iPhone / iPad:
            </p>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="font-bold text-white bg-zinc-800 w-4 h-4 rounded-full flex items-center justify-center text-[9px]">1</span>
              <span>Tap the <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> <strong>Share</strong> button in Safari toolbar.</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="font-bold text-white bg-zinc-800 w-4 h-4 rounded-full flex items-center justify-center text-[9px]">2</span>
              <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-zinc-200 mx-0.5" /> <strong>Add to Home Screen</strong>.</span>
            </div>
          </motion.div>
        )}
      </motion.aside>
    </AnimatePresence>
  )
}
