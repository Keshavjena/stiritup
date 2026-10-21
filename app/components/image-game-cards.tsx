"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ExternalLink, Sparkles, Check, Heart, Trophy } from "lucide-react"
import { PersonCard } from "@/lib/catalog/types"

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

  const roles = [
    { id: "kiss" as const, label: "💋 Kiss", activeClass: "bg-pink-500 text-white border-pink-400 shadow-pink-500/30" },
    { id: "marry" as const, label: "💍 Marry", activeClass: "bg-amber-400 text-black border-amber-300 shadow-amber-500/30 font-black" },
    { id: "kill" as const, label: "🔪 Kill", activeClass: "bg-red-600 text-white border-red-500 shadow-red-600/30" }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4 my-2 sm:my-4">
      {/* Header Prompt */}
      <div className="flex items-center justify-between px-1 sm:px-2">
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">Assign each personality a fate ({playerName})</span>
        </span>
        {hasSubmitted && (
          <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[9px] sm:text-[10px] uppercase font-extrabold px-2 py-0.5 flex-shrink-0">
            ✓ Submitted
          </Badge>
        )}
      </div>

      {/* 3 Image Cards: Horizontal Row on Mobile (Fits on 1 Screen), Vertical Portrait on Tablet/Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {persons.map((person) => {
          // Check which role this person has been assigned
          const assignedRole = Object.entries(selections).find(([, name]) => name === person.name)?.[0] as
            | "kiss"
            | "marry"
            | "kill"
            | undefined

          return (
            <motion.div
              key={person.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all flex flex-row sm:flex-col justify-between shadow-xl ${
                assignedRole === "kiss"
                  ? "border-pink-500/70 shadow-pink-500/10"
                  : assignedRole === "marry"
                  ? "border-amber-400/70 shadow-amber-500/10"
                  : assignedRole === "kill"
                  ? "border-red-600/70 shadow-red-600/10"
                  : "border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              {/* Portrait Container: Compact square on mobile, 4/5 portrait on tablet/desktop */}
              <div className="relative w-24 h-28 xs:w-28 xs:h-32 sm:w-full sm:aspect-[4/5] bg-zinc-950 overflow-hidden flex-shrink-0">
                <img
                  src={person.thumbnailUrl || person.imageUrl || "/placeholder-user.jpg"}
                  alt={person.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/placeholder-user.jpg"
                  }}
                />

                {/* Role Badge Indicator if Selected */}
                <AnimatePresence>
                  {assignedRole && (
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10"
                    >
                      <Badge
                        className={`text-[8.5px] sm:text-xs uppercase font-extrabold px-1.5 sm:px-3 py-0.5 sm:py-1 shadow-lg border ${
                          assignedRole === "kiss"
                            ? "bg-pink-500 text-white border-pink-400"
                            : assignedRole === "marry"
                            ? "bg-amber-400 text-black border-amber-300"
                            : "bg-red-600 text-white border-red-500"
                        }`}
                      >
                        {assignedRole === "kiss" ? "💋 Kiss" : assignedRole === "marry" ? "💍 Marry" : "🔪 Kill"}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Category Pill (Desktop) */}
                <div className="absolute top-2 right-2 hidden sm:block">
                  <Badge
                    variant="secondary"
                    className="bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[8.5px] uppercase font-bold px-1.5 py-0.5"
                  >
                    {person.category}
                  </Badge>
                </div>
              </div>

              {/* Card Bottom / Action Buttons */}
              <div className="p-2.5 sm:p-3.5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between bg-zinc-950/40 min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs sm:text-base text-white tracking-tight uppercase truncate">
                      {person.name}
                    </h4>
                    <span className="sm:hidden text-[7.5px] font-bold uppercase text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded flex-shrink-0">
                      {person.category}
                    </span>
                  </div>
                  {person.license && person.license !== "Public Domain / Fallback" && (
                    <div className="hidden sm:flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-500 pt-0.5 sm:pt-1">
                      <span className="flex items-center gap-1 truncate">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{person.license}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Decision Buttons (Touch targets: 38px high on mobile) */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  {roles.map((r) => {
                    const isSelected = assignedRole === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(person.name, r.id)}
                        className={`h-9 rounded-xl text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider transition-all border active:scale-95 ${
                          isSelected
                            ? `${r.activeClass} shadow-md`
                            : "bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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

      {/* Submission CTA */}
      <div className="pt-1.5 flex justify-center">
        <Button
          onClick={onSubmit}
          disabled={!isAllComplete || disabled}
          className={`w-full sm:w-auto h-11 px-8 rounded-xl font-extrabold uppercase tracking-wider text-xs border-0 shadow-xl transition-all ${
            hasSubmitted
              ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : isAllComplete
              ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 active:scale-95"
              : "bg-zinc-900 border border-zinc-800 text-zinc-500"
          }`}
        >
          {hasSubmitted ? "✓ Selections Locked In" : isAllComplete ? "Lock In Choices & Reveal" : "Assign All 3 to Continue"}
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
    <div className="w-full max-w-3xl mx-auto my-2 sm:my-4 space-y-3 sm:space-y-4">
      {/* Side-by-Side 2 Cards on Both Mobile & Desktop for Instant Comparison */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 relative">
        {/* Animated VS Badge in Center */}
        <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-950 border-2 border-zinc-700 items-center justify-center font-black text-[10px] sm:text-xs text-amber-400 shadow-xl pointer-events-none">
          VS
        </div>

        {/* Option A Card */}
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onChoose("A")}
          className={`cursor-pointer bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-xl ${
            selectedOption === "A"
              ? "border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10 bg-amber-950/10"
              : "border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="relative aspect-square sm:aspect-[4/5] w-full bg-zinc-950 overflow-hidden">
            <img
              src={optionA.thumbnailUrl || optionA.imageUrl || "/placeholder-user.jpg"}
              alt={optionA.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder-user.jpg"
              }}
            />
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge className="bg-zinc-100 text-black font-extrabold text-[8px] sm:text-[10px] uppercase px-1.5 sm:px-2.5 py-0.5">
                Option A
              </Badge>
            </div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 hidden xs:block">
              <Badge
                variant="secondary"
                className="bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[7.5px] sm:text-[9px] uppercase font-bold px-1.5 py-0.2"
              >
                {optionA.category}
              </Badge>
            </div>
          </div>

          <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 bg-zinc-950/40">
            <h4 className="font-extrabold text-xs sm:text-base text-white tracking-tight uppercase line-clamp-1">
              {optionA.name}
            </h4>
            <Button
              disabled={disabled}
              className={`w-full h-9 sm:h-10 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wider border-0 transition-colors ${
                selectedOption === "A"
                  ? "bg-amber-400 text-black font-black"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {selectedOption === "A" ? "✓ Chosen" : "Choose"}
            </Button>
          </div>
        </motion.div>

        {/* Option B Card */}
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onChoose("B")}
          className={`cursor-pointer bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-xl ${
            selectedOption === "B"
              ? "border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10 bg-amber-950/10"
              : "border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <div className="relative aspect-square sm:aspect-[4/5] w-full bg-zinc-950 overflow-hidden">
            <img
              src={optionB.thumbnailUrl || optionB.imageUrl || "/placeholder-user.jpg"}
              alt={optionB.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder-user.jpg"
              }}
            />
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge className="bg-zinc-100 text-black font-extrabold text-[8px] sm:text-[10px] uppercase px-1.5 sm:px-2.5 py-0.5">
                Option B
              </Badge>
            </div>
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 hidden xs:block">
              <Badge
                variant="secondary"
                className="bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[7.5px] sm:text-[9px] uppercase font-bold px-1.5 py-0.2"
              >
                {optionB.category}
              </Badge>
            </div>
          </div>

          <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 bg-zinc-950/40">
            <h4 className="font-extrabold text-xs sm:text-base text-white tracking-tight uppercase line-clamp-1">
              {optionB.name}
            </h4>
            <Button
              disabled={disabled}
              className={`w-full h-9 sm:h-10 rounded-xl font-bold uppercase text-[10px] sm:text-xs tracking-wider border-0 transition-colors ${
                selectedOption === "B"
                  ? "bg-amber-400 text-black font-black"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {selectedOption === "B" ? "✓ Chosen" : "Choose"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
