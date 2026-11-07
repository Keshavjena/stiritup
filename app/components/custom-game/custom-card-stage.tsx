"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CustomGameCard, CustomCardType } from "@/lib/custom-game/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Flame,
  Vote,
  Scale,
  Scroll,
  Lock,
  Zap,
  Beer,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from "lucide-react"

interface CustomCardStageProps {
  card: CustomGameCard
  players: string[]
  currentPlayerIndex: number
  myPlayerName: string
  isHost: boolean
  onAddSip: (player: string, count: number) => void
  onCastVote?: (candidate: string) => void
  votes?: Record<string, string>
  soundEnabled?: boolean
}

export function CustomCardStage({
  card,
  players,
  currentPlayerIndex,
  myPlayerName,
  isHost,
  onAddSip,
  onCastVote,
  votes = {},
  soundEnabled = true
}: CustomCardStageProps) {
  const [selectedDilemma, setSelectedDilemma] = useState<"A" | "B" | null>(null)
  const [showTriviaAnswer, setShowTriviaAnswer] = useState(false)
  const [confessedPlayers, setConfessedPlayers] = useState<Set<string>>(new Set())

  const activePlayer = players[currentPlayerIndex] || "Current Player"
  const isMyTurn = myPlayerName ? myPlayerName.toLowerCase() === activePlayer.toLowerCase() : false

  const getTypeConfig = (type: CustomCardType) => {
    switch (type) {
      case "rule":
        return {
          label: "Party Rule / Curse",
          icon: <Scroll className="w-4 h-4 text-amber-400" />,
          badgeClass: "bg-amber-500/15 border-amber-500/40 text-amber-300",
          borderClass: "border-amber-500/30"
        }
      case "vote":
        return {
          label: "Group Vote / Point",
          icon: <Vote className="w-4 h-4 text-cyan-400" />,
          badgeClass: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
          borderClass: "border-cyan-500/30"
        }
      case "dilemma":
        return {
          label: "Dilemma Choice",
          icon: <Scale className="w-4 h-4 text-purple-400" />,
          badgeClass: "bg-purple-500/15 border-purple-500/40 text-purple-300",
          borderClass: "border-purple-500/30"
        }
      case "confession":
        return {
          label: "Secret Confession",
          icon: <Lock className="w-4 h-4 text-rose-400" />,
          badgeClass: "bg-rose-500/15 border-rose-500/40 text-rose-300",
          borderClass: "border-rose-500/30"
        }
      case "trivia":
        return {
          label: "Speed Challenge",
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          badgeClass: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
          borderClass: "border-yellow-500/30"
        }
      case "action":
      default:
        return {
          label: "Action / Dare",
          icon: <Flame className="w-4 h-4 text-red-400" />,
          badgeClass: "bg-red-500/15 border-red-500/40 text-red-300",
          borderClass: "border-red-500/30"
        }
    }
  }

  const typeConfig = getTypeConfig(card.type)

  const handleConfess = (player: string) => {
    const updated = new Set(confessedPlayers)
    if (updated.has(player)) {
      updated.delete(player)
    } else {
      updated.add(player)
      onAddSip(player, card.sips || 1)
    }
    setConfessedPlayers(updated)
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-3 space-y-4">
      {/* Top Meta Bar: Type, Sips, Submitter */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Badge className={`px-3 py-1 font-extrabold uppercase text-[9px] tracking-widest border flex items-center gap-1.5 ${typeConfig.badgeClass}`}>
            {typeConfig.icon}
            <span>{typeConfig.label}</span>
          </Badge>

          {card.isCurse && (
            <Badge className="bg-amber-400 text-black border-amber-300 font-black text-[9px] uppercase px-2 py-0.5">
              Persistent Curse
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {card.sips > 0 && (
            <Badge className={`font-black text-[10px] uppercase px-2.5 py-0.5 border flex items-center gap-1 ${
              card.sips >= 5
                ? "bg-red-950/60 border-red-500/80 text-red-300"
                : "bg-zinc-900 border-zinc-800 text-amber-400"
            }`}>
              <Beer className="w-3 h-3 text-amber-400" />
              <span>{card.sips >= 5 ? "Shot Penalty! 🥃" : `${card.sips} ${card.sips === 1 ? "Sip" : "Sips"}`}</span>
            </Badge>
          )}

          {card.submittedBy && (
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              By {card.submittedBy}
            </span>
          )}
        </div>
      </div>

      {/* Main Card Shell */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className={`bg-zinc-900/40 border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between ${typeConfig.borderClass}`}
      >
        {/* Subtle Ambient Background Wash */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-4 relative z-10 text-center">
          {/* Target Tag */}
          <div className="flex justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800/80 inline-flex items-center gap-1.5">
              <Users className="w-3 h-3 text-zinc-400" />
              {card.target === "current" && `Target: ${activePlayer}`}
              {card.target === "all" && "Target: Everyone in Room"}
              {card.target === "point" && "Target: On 3, Everyone Point!"}
              {card.target === "rival" && `Target: ${activePlayer} Picks a Rival`}
              {card.target === "two_players" && "Target: Pick 2 Players"}
            </span>
          </div>

          {/* Card Text Content */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-relaxed max-w-xl mx-auto">
            {card.content}
          </h2>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE MECHANISM: DILEMMA CHOICE (Option A vs Option B)              */}
        {/* ========================================================================= */}
        {card.type === "dilemma" && card.options && card.options.length === 2 && (
          <div className="mt-6 pt-5 border-t border-zinc-850 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block text-center">
              Pick Your Side
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => setSelectedDilemma("A")}
                className={`h-12 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border ${
                  selectedDilemma === "A"
                    ? "bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-500/20"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {selectedDilemma === "A" && <CheckCircle2 className="w-4 h-4 mr-1.5 text-black" />}
                {card.options[0]}
              </Button>
              <Button
                onClick={() => setSelectedDilemma("B")}
                className={`h-12 rounded-2xl font-black uppercase text-xs tracking-wider transition-all border ${
                  selectedDilemma === "B"
                    ? "bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {selectedDilemma === "B" && <CheckCircle2 className="w-4 h-4 mr-1.5 text-white" />}
                {card.options[1]}
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE MECHANISM: GROUP VOTE / POINT (Who fits best?)                */}
        {/* ========================================================================= */}
        {card.type === "vote" && (
          <div className="mt-6 pt-5 border-t border-zinc-850 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block text-center">
              Tap a Player to Cast Your Point
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((p) => {
                const isSelected = votes[myPlayerName || activePlayer] === p
                const voteCount = Object.values(votes).filter((target) => target === p).length

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onCastVote && onCastVote(p)}
                    className={`p-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{p}</span>
                    {voteCount > 0 && (
                      <Badge className="bg-cyan-400 text-black text-[9px] font-black px-1.5 py-0 rounded">
                        {voteCount}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE MECHANISM: CONFESSION (Never Have I Ever / Truth)             */}
        {/* ========================================================================= */}
        {card.type === "confession" && (
          <div className="mt-6 pt-5 border-t border-zinc-850 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block text-center">
              Guilty? Tap Your Name to Drink & Confess
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {players.map((p) => {
                const hasConfessed = confessedPlayers.has(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleConfess(p)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      hasConfessed
                        ? "bg-rose-500 text-white border-rose-400 shadow-md"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span>{p}</span>
                    {hasConfessed && <span>🍺</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE MECHANISM: TRIVIA / CHALLENGE REVEAL                          */}
        {/* ========================================================================= */}
        {card.type === "trivia" && card.triviaAnswer && (
          <div className="mt-6 pt-5 border-t border-zinc-850 text-center space-y-2">
            {!showTriviaAnswer ? (
              <Button
                variant="outline"
                onClick={() => setShowTriviaAnswer(true)}
                className="h-9 px-4 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-bold uppercase tracking-wider"
              >
                Reveal Answer 💡
              </Button>
            ) : (
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 inline-block text-xs font-bold text-amber-300">
                Answer: {card.triviaAnswer}
              </div>
            )}
          </div>
        )}

        {/* Quick Sips Allocation Tray */}
        <div className="mt-6 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            Enforce Penalty:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              onClick={() => onAddSip(activePlayer, card.sips || 1)}
              className="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[10px] font-bold uppercase tracking-wider"
            >
              + {card.sips || 1} Sip to {activePlayer}
            </Button>
            {card.target === "all" && (
              <Button
                size="sm"
                onClick={() => players.forEach((p) => onAddSip(p, card.sips || 1))}
                className="h-8 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-bold uppercase tracking-wider border-0"
              >
                All Drink! 🍻
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
