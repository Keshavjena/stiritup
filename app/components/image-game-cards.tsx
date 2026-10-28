"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Sparkles, Check } from "lucide-react"
import { PersonCard } from "@/lib/catalog/types"

// ----------------- Reusable Uncropped Portrait with Ambient Aura -----------------

/**
 * Renders a 100% visible, uncropped portrait.
 * Uses an ambient blurred backdrop to fill aspect ratio differences so heads, faces,
 * and bodies are NEVER cut off, while avoiding empty black borders.
 */
function UncroppedPortrait({
  src,
  alt,
  className = "",
}: {
  src?: string
  alt: string
  className?: string
}) {
  const [error, setError] = useState(false)
  const imageSrc = !error && src ? src : "/placeholder-user.jpg"

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center select-none">
      {/* Ambient Blurred Aura (Fills the entire card with the photo's matching colors) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none transition-opacity duration-300"
      />

      {/* High-Resolution Uncropped Foreground (100% visible, zero cropping) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        onError={() => setError(true)}
        className={`relative z-10 max-h-full max-w-full object-contain p-2 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 ${className}`}
      />
    </div>
  )
}

// ----------------- Kiss Marry Kill 3-Card Interactive Component -----------------

interface KMKImageCardsProps {
  persons: [PersonCard, PersonCard, PersonCard]
  selections: { kiss?: string; marry?: string; kill?: string }
  onSelect: (personName: string, role: "kiss" | "marry" | "kill") => void
  onSubmit: () => void
  hasSubmitted: boolean
  playerName: string
  disabled?: boolean
}

export function KMKImageCards({
  persons,
  selections,
  onSelect,
  onSubmit,
  hasSubmitted,
  playerName,
  disabled = false
}: KMKImageCardsProps) {
  const isAllComplete = Boolean(selections.kiss && selections.marry && selections.kill)
  const assignedCount = [selections.kiss, selections.marry, selections.kill].filter(Boolean).length

  const roles = [
    {
      id: "kiss" as const,
      label: "💋 Kiss",
      activeBtn: "bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30 font-black",
      badgeClass: "bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/20",
      cardActive: "border-pink-500 ring-2 ring-pink-500/30 shadow-xl shadow-pink-500/10"
    },
    {
      id: "marry" as const,
      label: "💍 Marry",
      activeBtn: "bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/30 font-black",
      badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/20",
      cardActive: "border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10"
    },
    {
      id: "kill" as const,
      label: "🔪 Kill",
      activeBtn: "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 font-black",
      badgeClass: "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20",
      cardActive: "border-red-600 ring-2 ring-red-600/30 shadow-xl shadow-red-600/10"
    }
  ]

  const getAssignedRole = (name: string): "kiss" | "marry" | "kill" | undefined => {
    return (Object.entries(selections).find(([, val]) => val === name)?.[0] as
      | "kiss"
      | "marry"
      | "kill"
      | undefined)
  }

  return (
    <div className="w-full mx-auto space-y-4 my-2">
      {/* Top Header / Player Prompt */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="truncate">Assign Each Personality a Fate ({playerName})</span>
        </span>
        {hasSubmitted && (
          <Badge className="bg-emerald-500/20 border-emerald-500/40 text-emerald-300 text-[10px] uppercase font-extrabold px-3 py-1 flex-shrink-0 shadow-sm">
            ✓ Locked In
          </Badge>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE-SPECIFIC LAYOUT (< md): Dedicated Stack + Sticky Progress Tracker  */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Mobile Real-Time Selection Tracker Pill Bar */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-lg">
          <div
            className={`p-1.5 rounded-xl border text-center transition-all ${
              selections.kiss
                ? "bg-pink-500/15 border-pink-500/50 text-pink-300 shadow-sm shadow-pink-500/10"
                : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
            }`}
          >
            <span className="block text-[8px] uppercase tracking-wider font-extrabold text-zinc-400">💋 Kiss</span>
            <span className="truncate block font-black text-[11px] text-white">
              {selections.kiss || "Tap below"}
            </span>
          </div>

          <div
            className={`p-1.5 rounded-xl border text-center transition-all ${
              selections.marry
                ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10"
                : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
            }`}
          >
            <span className="block text-[8px] uppercase tracking-wider font-extrabold text-zinc-400">💍 Marry</span>
            <span className="truncate block font-black text-[11px] text-white">
              {selections.marry || "Tap below"}
            </span>
          </div>

          <div
            className={`p-1.5 rounded-xl border text-center transition-all ${
              selections.kill
                ? "bg-red-500/15 border-red-500/50 text-red-300 shadow-sm shadow-red-500/10"
                : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
            }`}
          >
            <span className="block text-[8px] uppercase tracking-wider font-extrabold text-zinc-400">🔪 Kill</span>
            <span className="truncate block font-black text-[11px] text-white">
              {selections.kill || "Tap below"}
            </span>
          </div>
        </div>

        {/* 3 Dedicated Mobile Cards with Tall Uncropped Portraits */}
        {persons.map((person) => {
          const assignedRole = getAssignedRole(person.name)
          const activeRoleConfig = roles.find((r) => r.id === assignedRole)

          return (
            <motion.div
              key={`mobile-${person.id}`}
              className={`bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all shadow-xl group flex flex-col ${
                activeRoleConfig ? activeRoleConfig.cardActive : "border-zinc-800/80"
              }`}
            >
              {/* Uncropped Mobile Portrait Stage (Generous height, never squashed or cropped) */}
              <div className="relative w-full h-64 xs:h-72 bg-zinc-950 overflow-hidden">
                <UncroppedPortrait
                  src={person.thumbnailUrl || person.imageUrl}
                  alt={person.name}
                />

                {/* Floating Role Badge */}
                <AnimatePresence>
                  {activeRoleConfig && (
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="absolute top-2.5 left-2.5 z-20"
                    >
                      <Badge className={`text-[10px] uppercase font-black px-2.5 py-1 border ${activeRoleConfig.badgeClass}`}>
                        {activeRoleConfig.label}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Category Overlay Tag */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-black/75 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-[8.5px] uppercase font-bold px-2 py-0.5 shadow-md"
                  >
                    {person.category}
                  </Badge>
                </div>
              </div>

              {/* Mobile Info & Touch Actions */}
              <div className="p-3.5 space-y-2.5 bg-zinc-950/80 border-t border-zinc-850">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-sm text-white tracking-tight uppercase truncate">
                    {person.name}
                  </h4>
                  {person.license && person.license !== "Public Domain / Fallback" && (
                    <span className="flex items-center gap-1 text-[8.5px] text-zinc-500 truncate flex-shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">{person.license}</span>
                    </span>
                  )}
                </div>

                {/* 3 Touch-Friendly Buttons (44px min height for phone thumb ergonomics) */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {roles.map((r) => {
                    const isSelected = assignedRole === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(person.name, r.id)}
                        className={`h-11 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border active:scale-95 flex items-center justify-center ${
                          isSelected
                            ? r.activeBtn
                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* PC / TABLET DESKTOP LAYOUT (>= md): Grand 3-Column Arena, Tall Uncropped   */}
      {/* ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
        {persons.map((person) => {
          const assignedRole = getAssignedRole(person.name)
          const activeRoleConfig = roles.find((r) => r.id === assignedRole)

          return (
            <motion.div
              key={`desktop-${person.id}`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`bg-zinc-900/40 border rounded-3xl overflow-hidden transition-all shadow-2xl flex flex-col justify-between group ${
                activeRoleConfig ? activeRoleConfig.cardActive : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {/* Grand PC Portrait Stage (Expansive 360px - 440px height, zero cropping) */}
              <div className="relative w-full h-[360px] lg:h-[420px] xl:h-[450px] bg-zinc-950 overflow-hidden">
                <UncroppedPortrait
                  src={person.thumbnailUrl || person.imageUrl}
                  alt={person.name}
                />

                {/* Floating Role Indicator Badge */}
                <AnimatePresence>
                  {activeRoleConfig && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      className="absolute top-3.5 left-3.5 z-20"
                    >
                      <Badge className={`text-xs uppercase font-black px-3 py-1.5 border shadow-xl ${activeRoleConfig.badgeClass}`}>
                        {activeRoleConfig.label}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Category Pill Tag */}
                <div className="absolute top-3.5 right-3.5 z-20">
                  <Badge
                    variant="secondary"
                    className="bg-black/80 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-[10px] uppercase font-black px-2.5 py-1 shadow-lg"
                  >
                    {person.category}
                  </Badge>
                </div>

                {/* License Tag */}
                {person.license && person.license !== "Public Domain / Fallback" && (
                  <div className="absolute bottom-2.5 left-3 z-20">
                    <span className="flex items-center gap-1.5 text-[9px] text-zinc-300 font-bold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-zinc-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="truncate max-w-[180px]">{person.license}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* PC Info & Action Buttons */}
              <div className="p-4 lg:p-5 space-y-3 bg-zinc-950/80 border-t border-zinc-850">
                <h4 className="font-black text-base lg:text-lg text-white tracking-tight uppercase truncate text-center">
                  {person.name}
                </h4>

                {/* 3 Decision Buttons Side by Side */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {roles.map((r) => {
                    const isSelected = assignedRole === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(person.name, r.id)}
                        className={`h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all border active:scale-95 flex items-center justify-center ${
                          isSelected
                            ? r.activeBtn
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submission CTA Button */}
      <div className="pt-2 flex justify-center">
        <Button
          onClick={onSubmit}
          disabled={!isAllComplete || disabled}
          className={`w-full sm:w-auto h-12 px-10 rounded-2xl font-black uppercase tracking-wider text-xs border-0 shadow-2xl transition-all ${
            hasSubmitted
              ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : isAllComplete
              ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/25 active:scale-95"
              : "bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {hasSubmitted
            ? "✓ Selections Locked In"
            : isAllComplete
            ? "Lock In Choices & Reveal"
            : `Assign All 3 to Continue (${assignedCount}/3)`}
        </Button>
      </div>
    </div>
  )
}

// ----------------- Would You Rather 2-Card Interactive Component -----------------

interface WYRImageCardsProps {
  optionA: PersonCard
  optionB: PersonCard
  selectedOption?: "A" | "B" | null
  onChoose: (option: "A" | "B") => void
  disabled?: boolean
}

export function WYRImageCards({
  optionA,
  optionB,
  selectedOption,
  onChoose,
  disabled = false
}: WYRImageCardsProps) {
  return (
    <div className="w-full mx-auto my-3 space-y-4">
      {/* 2 Comparison Cards with Uncropped Portraits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
        {/* Animated VS Badge in Center */}
        <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-neutral-950 border-2 border-amber-400 items-center justify-center font-black text-xs text-amber-400 shadow-2xl pointer-events-none">
          VS
        </div>

        {/* Option A Card */}
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.015 }}
          whileTap={{ scale: disabled ? 1 : 0.985 }}
          onClick={() => !disabled && onChoose("A")}
          className={`cursor-pointer bg-zinc-900/40 border rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-2xl ${
            selectedOption === "A"
              ? "border-amber-400 ring-2 ring-amber-400/30 shadow-amber-500/20 bg-amber-950/15"
              : "border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          {/* Uncropped Stage */}
          <div className="relative w-full h-64 sm:h-[380px] lg:h-[440px] bg-zinc-950 overflow-hidden">
            <UncroppedPortrait
              src={optionA.thumbnailUrl || optionA.imageUrl}
              alt={optionA.name}
            />

            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-zinc-100 text-black font-black text-[9px] sm:text-xs uppercase px-2.5 sm:px-3 py-1 shadow-lg">
                Option A
              </Badge>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <Badge
                variant="secondary"
                className="bg-black/80 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-[8.5px] sm:text-[10px] uppercase font-bold px-2 py-0.5 shadow-md"
              >
                {optionA.category}
              </Badge>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 bg-zinc-950/80 border-t border-zinc-850">
            <h4 className="font-black text-sm sm:text-lg text-white tracking-tight uppercase truncate text-center">
              {optionA.name}
            </h4>
            <Button
              disabled={disabled}
              className={`w-full h-11 rounded-xl font-black uppercase text-xs tracking-wider border-0 transition-all ${
                selectedOption === "A"
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-500/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {selectedOption === "A" ? "✓ Chosen" : "Choose Option A"}
            </Button>
          </div>
        </motion.div>

        {/* Option B Card */}
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.015 }}
          whileTap={{ scale: disabled ? 1 : 0.985 }}
          onClick={() => !disabled && onChoose("B")}
          className={`cursor-pointer bg-zinc-900/40 border rounded-3xl overflow-hidden transition-all flex flex-col justify-between shadow-2xl ${
            selectedOption === "B"
              ? "border-amber-400 ring-2 ring-amber-400/30 shadow-amber-500/20 bg-amber-950/15"
              : "border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          {/* Uncropped Stage */}
          <div className="relative w-full h-64 sm:h-[380px] lg:h-[440px] bg-zinc-950 overflow-hidden">
            <UncroppedPortrait
              src={optionB.thumbnailUrl || optionB.imageUrl}
              alt={optionB.name}
            />

            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-zinc-100 text-black font-black text-[9px] sm:text-xs uppercase px-2.5 sm:px-3 py-1 shadow-lg">
                Option B
              </Badge>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <Badge
                variant="secondary"
                className="bg-black/80 backdrop-blur-md border border-zinc-700/80 text-zinc-200 text-[8.5px] sm:text-[10px] uppercase font-bold px-2 py-0.5 shadow-md"
              >
                {optionB.category}
              </Badge>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 space-y-2 sm:space-y-3 bg-zinc-950/80 border-t border-zinc-850">
            <h4 className="font-black text-sm sm:text-lg text-white tracking-tight uppercase truncate text-center">
              {optionB.name}
            </h4>
            <Button
              disabled={disabled}
              className={`w-full h-11 rounded-xl font-black uppercase text-xs tracking-wider border-0 transition-all ${
                selectedOption === "B"
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-500/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {selectedOption === "B" ? "✓ Chosen" : "Choose Option B"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
