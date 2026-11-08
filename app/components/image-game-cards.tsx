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

export interface KMKRoleConfig {
  id: "kiss" | "marry" | "kill"
  label: string
  activeBtn: string
  badgeClass: string
  cardActive: string
}

/**
 * Returns dynamic, bold, and contextually styled action roles for Kiss Marry Kill.
 * Adapts based on scenario tone (e.g. Dark/Apocalypse, History/Weird, Glamour/Adult, Creators/Pop, Fantasy/Anime, or Classic).
 * Retains strict internal keys ('kiss', 'marry', 'kill') for stable networking and syncing.
 */
export function getContextualKMKRoles(
  scenario?: string,
  persons?: [PersonCard, PersonCard, PersonCard] | PersonCard[]
): [KMKRoleConfig, KMKRoleConfig, KMKRoleConfig] {
  const text = (scenario || "").toLowerCase()
  const cats = persons?.map((p) => (p.category || "").toLowerCase()).join(" ") || ""
  const names = persons?.map((p) => (p.name || "").toLowerCase()).join(" ") || ""
  const contextStr = `${text} ${cats} ${names}`

  // 1. Glamour & Adult (Spicy, Bold, Risqué)
  if (
    cats.includes("adultstars") ||
    cats.includes("onlyfans") ||
    cats.includes("glamour") ||
    cats.includes("models") ||
    contextStr.includes("spicy") ||
    contextStr.includes("penthouse") ||
    contextStr.includes("bedroom") ||
    contextStr.includes("dating show") ||
    contextStr.includes("monaco") ||
    contextStr.includes("heist") ||
    contextStr.includes("yacht")
  ) {
    return [
      {
        id: "kiss",
        label: "🔥 Wild Night",
        activeBtn: "bg-gradient-to-r from-pink-600 to-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40 font-black tracking-wider",
        badgeClass: "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30",
        cardActive: "border-rose-500 ring-2 ring-rose-500/40 shadow-xl shadow-rose-500/20"
      },
      {
        id: "marry",
        label: "💍 Put a Ring On It",
        activeBtn: "bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-amber-300 shadow-lg shadow-amber-500/40 font-black tracking-wider",
        badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/30",
        cardActive: "border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20"
      },
      {
        id: "kill",
        label: "🚫 Ghost & Block",
        activeBtn: "bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-lg shadow-red-600/40 font-black tracking-wider",
        badgeClass: "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30",
        cardActive: "border-red-600 ring-2 ring-red-600/40 shadow-xl shadow-red-600/20"
      }
    ]
  }

  // 2. History & Weird / Royalty / Ancient
  if (
    cats.includes("history") ||
    cats.includes("historical") ||
    cats.includes("academic") ||
    contextStr.includes("monarch") ||
    contextStr.includes("throne") ||
    contextStr.includes("empire") ||
    contextStr.includes("medieval") ||
    contextStr.includes("guillotine") ||
    contextStr.includes("ancient") ||
    contextStr.includes("exile") ||
    contextStr.includes("taco truck") ||
    contextStr.includes("ikea") ||
    contextStr.includes("cursed") ||
    contextStr.includes("genie")
  ) {
    return [
      {
        id: "kiss",
        label: "👑 Royal Favor",
        activeBtn: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/40 font-black tracking-wider",
        badgeClass: "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/30",
        cardActive: "border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20"
      },
      {
        id: "marry",
        label: "🏰 Crown Monarch",
        activeBtn: "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/40 font-black tracking-wider",
        badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/30",
        cardActive: "border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20"
      },
      {
        id: "kill",
        label: "⚔️ Send to Exile",
        activeBtn: "bg-gradient-to-r from-stone-800 to-zinc-900 text-rose-300 border-zinc-700 shadow-lg shadow-zinc-900/50 font-black tracking-wider",
        badgeClass: "bg-stone-800 text-rose-300 border-zinc-700 shadow-md shadow-zinc-900/30",
        cardActive: "border-stone-500 ring-2 ring-stone-500/40 shadow-xl shadow-stone-500/20"
      }
    ]
  }

  // 3. Dark, Apocalypse, Bunker, Zombie, High Stakes
  if (
    contextStr.includes("fallout") ||
    contextStr.includes("nuclear") ||
    contextStr.includes("zombie") ||
    contextStr.includes("demon") ||
    contextStr.includes("cult") ||
    contextStr.includes("cartel") ||
    contextStr.includes("hostage") ||
    contextStr.includes("treason") ||
    contextStr.includes("prison") ||
    contextStr.includes("poison") ||
    contextStr.includes("murder") ||
    contextStr.includes("bunker") ||
    contextStr.includes("minefield") ||
    contextStr.includes("sacrific")
  ) {
    return [
      {
        id: "kiss",
        label: "🛡️ Bunker Ally",
        activeBtn: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/40 font-black tracking-wider",
        badgeClass: "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30",
        cardActive: "border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/20"
      },
      {
        id: "marry",
        label: "🩸 Blood Pact",
        activeBtn: "bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-300 shadow-lg shadow-orange-500/40 font-black tracking-wider",
        badgeClass: "bg-orange-500 text-black border-amber-300 shadow-md shadow-orange-500/30",
        cardActive: "border-orange-500 ring-2 ring-orange-500/40 shadow-xl shadow-orange-500/20"
      },
      {
        id: "kill",
        label: "💀 Feed to Horde",
        activeBtn: "bg-gradient-to-r from-red-800 to-red-950 text-red-200 border-red-700 shadow-lg shadow-red-950/60 font-black tracking-wider",
        badgeClass: "bg-red-900 text-red-200 border-red-700 shadow-md shadow-red-900/40",
        cardActive: "border-red-700 ring-2 ring-red-700/50 shadow-xl shadow-red-900/30"
      }
    ]
  }

  // 4. Creators, Streamers & Viral Pop
  if (
    cats.includes("creators") ||
    cats.includes("youtubers") ||
    cats.includes("influencers") ||
    cats.includes("streamers") ||
    contextStr.includes("podcast") ||
    contextStr.includes("viral") ||
    contextStr.includes("live-stream") ||
    contextStr.includes("billboard") ||
    contextStr.includes("search history") ||
    contextStr.includes("dms") ||
    contextStr.includes("clout")
  ) {
    return [
      {
        id: "kiss",
        label: "✨ Viral Collab",
        activeBtn: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/40 font-black tracking-wider",
        badgeClass: "bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30",
        cardActive: "border-cyan-400 ring-2 ring-cyan-400/40 shadow-xl shadow-cyan-500/20"
      },
      {
        id: "marry",
        label: "💍 Clout Marriage",
        activeBtn: "bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-amber-300 shadow-lg shadow-amber-400/40 font-black tracking-wider",
        badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30",
        cardActive: "border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-400/20"
      },
      {
        id: "kill",
        label: "🚫 Cancel Forever",
        activeBtn: "bg-gradient-to-r from-rose-700 to-red-700 text-white border-rose-500 shadow-lg shadow-rose-700/40 font-black tracking-wider",
        badgeClass: "bg-rose-700 text-white border-rose-500 shadow-md shadow-rose-700/30",
        cardActive: "border-rose-600 ring-2 ring-rose-600/40 shadow-xl shadow-rose-600/20"
      }
    ]
  }

  // 5. Fantasy, Anime, Fiction & Superheroes
  if (
    cats.includes("fantasy") ||
    cats.includes("anime") ||
    cats.includes("gaming") ||
    contextStr.includes("multiverse") ||
    contextStr.includes("superpower") ||
    contextStr.includes("isekai")
  ) {
    return [
      {
        id: "kiss",
        label: "⚡ Waifu / Husbando",
        activeBtn: "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-500/40 font-black tracking-wider",
        badgeClass: "bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-500/30",
        cardActive: "border-fuchsia-500 ring-2 ring-fuchsia-500/40 shadow-xl shadow-fuchsia-500/20"
      },
      {
        id: "marry",
        label: "🛡️ Duo Partner",
        activeBtn: "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/40 font-black tracking-wider",
        badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/30",
        cardActive: "border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20"
      },
      {
        id: "kill",
        label: "💥 Delete Timeline",
        activeBtn: "bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-lg shadow-red-600/40 font-black tracking-wider",
        badgeClass: "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30",
        cardActive: "border-red-600 ring-2 ring-red-600/40 shadow-xl shadow-red-600/20"
      }
    ]
  }

  // 6. Default High-Energy Bold & Fun
  return [
    {
      id: "kiss",
      label: "💋 Kiss",
      activeBtn: "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-lg shadow-pink-500/30 font-black",
      badgeClass: "bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/20",
      cardActive: "border-pink-500 ring-2 ring-pink-500/30 shadow-xl shadow-pink-500/10"
    },
    {
      id: "marry",
      label: "💍 Marry",
      activeBtn: "bg-gradient-to-r from-amber-400 to-yellow-400 text-black border-amber-300 shadow-lg shadow-amber-500/30 font-black",
      badgeClass: "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-500/20",
      cardActive: "border-amber-400 ring-2 ring-amber-400/30 shadow-xl shadow-amber-500/10"
    },
    {
      id: "kill",
      label: "🔪 Kill",
      activeBtn: "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-lg shadow-red-600/30 font-black",
      badgeClass: "bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20",
      cardActive: "border-red-600 ring-2 ring-red-600/30 shadow-xl shadow-red-600/10"
    }
  ]
}

interface KMKImageCardsProps {
  persons: [PersonCard, PersonCard, PersonCard]
  selections: { kiss?: string; marry?: string; kill?: string }
  onSelect: (personName: string, role: "kiss" | "marry" | "kill") => void
  onSubmit: () => void
  hasSubmitted: boolean
  playerName: string
  scenario?: string
  disabled?: boolean
}

export function KMKImageCards({
  persons,
  selections,
  onSelect,
  onSubmit,
  hasSubmitted,
  playerName,
  scenario,
  disabled = false
}: KMKImageCardsProps) {
  const isAllComplete = Boolean(selections.kiss && selections.marry && selections.kill)
  const assignedCount = [selections.kiss, selections.marry, selections.kill].filter(Boolean).length

  const roles = getContextualKMKRoles(scenario, persons)

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
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
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
          {roles.map((r) => {
            const selectedVal = selections[r.id]
            return (
              <div
                key={r.id}
                className={`p-1.5 rounded-xl border text-center transition-all ${
                  selectedVal
                    ? `${r.badgeClass} shadow-sm`
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
                }`}
              >
                <span className="block text-[8px] uppercase tracking-wider font-extrabold text-zinc-300 truncate">
                  {r.label}
                </span>
                <span className="truncate block font-black text-[11px] text-white">
                  {selectedVal || "Tap below"}
                </span>
              </div>
            )
          })}
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
