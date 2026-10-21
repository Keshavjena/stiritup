"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Copy, ArrowLeft, SlidersHorizontal, Sparkles, Clock, Flame, Users, Check } from "lucide-react"
import { games } from "../../lib/game-data/games"

export interface RoomSettings {
  category: string
  gender: "mixed" | "female" | "male"
  timerDuration: number
  mode: "standard" | "spicy" | "challenge"
}

interface GameRoomProps {
  roomCode: string
  players: string[]
  isHost: boolean
  selectedGame: string
  onSelectGame: (gameId: string) => void
  onStartGame: (settings?: RoomSettings) => void
  onLeaveRoom: () => void
  darkMode: boolean
  roomSettings?: RoomSettings
  onUpdateSettings?: (settings: Partial<RoomSettings>) => void
}

export const ROOM_CATEGORIES = [
  { id: "all", label: "🌟 All (Mixed)", desc: "Wild combination of everyone" },
  { id: "scientists", label: "🔬 Scientists", desc: "Einstein, Newton, Lovelock, Curie" },
  { id: "history", label: "🏛️ History", desc: "Caesar, Cleopatra, Napoleon" },
  { id: "bollywood", label: "🎬 Bollywood", desc: "SRK, Deepika, Amitabh, Salman" },
  { id: "hollywood", label: "📽️ Hollywood", desc: "DiCaprio, Scarlett, Pitt, Zendaya" },
  { id: "singers", label: "🎤 Singers & Pop", desc: "Taylor Swift, Drake, Beyoncé, Weeknd" },
  { id: "athletes", label: "⚽ Athletes", desc: "Messi, Ronaldo, LeBron, Serena" },
  { id: "tech", label: "💻 Tech & Founders", desc: "Elon Musk, Steve Jobs, Bill Gates" },
  { id: "writers", label: "✍️ Writers & Thinkers", desc: "Shakespeare, Nietzsche, Tolkien" },
  { id: "artists", label: "🎨 Artists & Directors", desc: "Da Vinci, Picasso, Tarantino" },
  { id: "adultstars", label: "🌶️ Adult Stars (18+)", desc: "Mia Khalifa, Riley Reid, Johnny Sins" },
  { id: "fantasy", label: "⚔️ Fantasy & Anime", desc: "Goku, Naruto, Geralt, Hermione" },
]

export function GameRoom({
  roomCode,
  players,
  isHost,
  selectedGame,
  onSelectGame,
  onStartGame,
  onLeaveRoom,
  roomSettings,
  onUpdateSettings,
}: GameRoomProps) {
  const [copied, setCopied] = useState(false)

  // Local settings state with fallback to provided props
  const [settings, setSettings] = useState<RoomSettings>({
    category: roomSettings?.category || "all",
    gender: roomSettings?.gender || "female",
    timerDuration: roomSettings?.timerDuration !== undefined ? roomSettings.timerDuration : 30,
    mode: roomSettings?.mode || "standard",
  })

  const currentSettings: RoomSettings = {
    category: roomSettings?.category || settings.category,
    gender: roomSettings?.gender || settings.gender,
    timerDuration: roomSettings?.timerDuration !== undefined ? roomSettings.timerDuration : settings.timerDuration,
    mode: roomSettings?.mode || settings.mode,
  }

  const updateSetting = <K extends keyof RoomSettings>(key: K, value: RoomSettings[K]) => {
    const updated = { ...currentSettings, [key]: value }
    setSettings(updated)
    if (onUpdateSettings) {
      onUpdateSettings({ [key]: value })
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeGame = games.find((g) => g.id === selectedGame) || games[0]

  const getCategoryLabel = (id: string) => {
    return ROOM_CATEGORIES.find((c) => c.id === id)?.label || id
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden relative flex flex-col justify-between pb-24 lg:pb-0">
      
      <header className="relative z-10 py-3 px-3 sm:px-6 border-b border-zinc-900 bg-neutral-950/80 backdrop-blur-sm flex justify-between items-center pt-safe">
        <Button variant="ghost" onClick={onLeaveRoom} className="rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-2.5 sm:px-3 text-[9px] uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Leave
        </Button>
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          PARTY LOBBY • {players.length} {players.length === 1 ? "PLAYER" : "PLAYERS"}
        </span>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start min-h-[70vh] py-4 sm:py-8 w-full flex-1 pb-safe">
        {/* Left Column: Room Code, Selected Game, and Host Controls */}
        <div className="flex-1 w-full text-center lg:text-left flex flex-col gap-5">
          <div>
            <h2 className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-1">Room Code</h2>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-3"
            >
              {roomCode}
            </motion.div>
            <Button
              onClick={copyRoomCode}
              className={`rounded-lg h-9 px-4 font-bold uppercase text-[9px] tracking-wider transition-colors border-0 ${
                copied ? "bg-green-600 text-white" : "bg-zinc-100 text-black hover:bg-zinc-200"
              }`}
            >
              {copied ? "Copied!" : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Code</>}
            </Button>
          </div>

          {/* Current Selected Game Details Card */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 text-left max-w-xl shadow-xl">
            <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider block mb-1">Selected Game</span>
            <div className="flex items-center gap-4">
              <div>
                <h4 className="font-bold text-lg uppercase tracking-tight text-white">{activeGame.name}</h4>
                {activeGame.mature && (
                  <span className="bg-red-950/40 text-red-400 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-red-900/30 mt-1 inline-block">
                    18+ Only
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-normal leading-relaxed mt-2">{activeGame.description}</p>
          </div>

          {/* Host Game Selector Grid */}
          {isHost && (
            <div className="w-full max-w-xl text-left">
              <h3 className="font-bold uppercase text-[10px] tracking-wider text-zinc-500 mb-2">
                Change Selected Game
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => onSelectGame(game.id)}
                    className={`cursor-pointer rounded-xl p-3 flex flex-col justify-between transition-all border ${
                      selectedGame === game.id
                        ? "border-zinc-200 bg-zinc-900/40 shadow-sm"
                        : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-[11px] tracking-wide uppercase leading-tight text-white line-clamp-1">
                        {game.name}
                      </h5>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5 block">{game.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Host Pre-Game Controls: Category, Gender, Timer & Mode */}
          {isHost && (
            <div className="w-full max-w-xl text-left bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Host Pre-Game Controls
                </span>
                <span className="text-[8px] font-mono uppercase bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">
                  Real-Time Sync
                </span>
              </div>

              {/* 1. Category / Genre Selection */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Catalog Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ROOM_CATEGORIES.map((c) => {
                    const isSelected = currentSettings.category === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => updateSetting("category", c.id)}
                        className={`p-2 rounded-xl text-left transition-all border ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400/80 text-white shadow-sm"
                            : "bg-zinc-900/40 border-zinc-800/70 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                        }`}
                      >
                        <div className="font-bold text-[10px] uppercase tracking-wide truncate flex items-center justify-between">
                          <span>{c.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-400 ml-1 flex-shrink-0" />}
                        </div>
                        <span className="text-[8px] text-zinc-500 line-clamp-1 font-normal mt-0.5">
                          {c.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Target Gender & 3. Round Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" /> Gender Pool:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "mixed" as const, label: "🔀 Mixed" },
                      { id: "female" as const, label: "👩 Female" },
                      { id: "male" as const, label: "👨 Male" },
                    ].map((g) => {
                      const isSelected = currentSettings.gender === g.id
                      return (
                        <button
                          key={g.id}
                          onClick={() => updateSetting("gender", g.id)}
                          className={`py-1.5 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider text-center transition-all border ${
                            isSelected
                              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                          }`}
                        >
                          {g.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Round Timer:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { val: 0, label: "Off" },
                      { val: 15, label: "15s" },
                      { val: 30, label: "30s" },
                      { val: 60, label: "60s" },
                    ].map((t) => {
                      const isSelected = currentSettings.timerDuration === t.val
                      return (
                        <button
                          key={t.val}
                          onClick={() => updateSetting("timerDuration", t.val)}
                          className={`py-1.5 px-1 rounded-xl text-[9px] font-bold uppercase tracking-wider text-center transition-all border ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                          }`}
                        >
                          {t.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Game Intensity / Mode */}
              <div className="pt-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" /> Game Intensity:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "standard" as const, label: "🥂 Standard", desc: "Casual & fun party vibes" },
                    { id: "spicy" as const, label: "🔥 Spicy (18+)", desc: "Wild, daring & uncensored" },
                    { id: "challenge" as const, label: "🍻 Drinking", desc: "Penalty sips enabled" },
                  ].map((m) => {
                    const isSelected = currentSettings.mode === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => updateSetting("mode", m.id)}
                        className={`p-2 rounded-xl text-left transition-all border ${
                          isSelected
                            ? "bg-red-500/15 border-red-400 text-red-100 shadow-sm"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                        }`}
                      >
                        <div className="font-bold text-[9px] uppercase tracking-wide truncate">{m.label}</div>
                        <span className="text-[7.5px] text-zinc-500 line-clamp-1 mt-0.5">{m.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Player Roster & Actions */}
        <div className="w-full lg:max-w-sm bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-end mb-4 border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Players
            </h3>
            <span className="text-xs font-mono text-zinc-500">({players.length})</span>
          </div>

          <div className="space-y-2 mb-4">
            {players.map((player, index) => (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index}
                className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-300 font-bold text-xs">
                    {player.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-200">{player}</span>
                </div>
                {index === 0 && (
                  <span className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-md">
                    Host
                  </span>
                )}
              </motion.div>
            ))}

            {players.length < 2 && (
              <div className="p-3 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 font-bold uppercase tracking-wider text-[9px]">
                Waiting for players to join...
              </div>
            )}
          </div>

          {/* Guest Real-Time Settings View (When Not Host) */}
          {!isHost && (
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 mb-5 space-y-2 text-left">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" /> Host Game Settings
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded-full border border-amber-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Synced
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 block text-[7.5px] font-bold uppercase">Category</span>
                  <span className="font-bold text-zinc-200 truncate block">{getCategoryLabel(currentSettings.category)}</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 block text-[7.5px] font-bold uppercase">Gender</span>
                  <span className="font-bold text-zinc-200 capitalize">{currentSettings.gender}</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 block text-[7.5px] font-bold uppercase">Timer</span>
                  <span className="font-bold text-zinc-200">{currentSettings.timerDuration ? `${currentSettings.timerDuration}s` : "Off (Manual)"}</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-850">
                  <span className="text-zinc-500 block text-[7.5px] font-bold uppercase">Mode</span>
                  <span className="font-bold text-zinc-200 capitalize">{currentSettings.mode}</span>
                </div>
              </div>
            </div>
          )}

          {isHost ? (
            <Button
              onClick={() => onStartGame(currentSettings)}
              disabled={players.length < 1}
              className="w-full h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase tracking-wider text-xs disabled:opacity-40 disabled:bg-zinc-850 disabled:text-zinc-600 border-0 transition-all shadow-lg"
            >
              Start Game
            </Button>
          ) : (
            <div className="w-full h-11 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Waiting for Host to start...
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-neutral-950/95 backdrop-blur-xl border-t border-zinc-800 z-40 lg:hidden pb-safe flex items-center gap-3">
        {isHost ? (
          <Button
            onClick={() => onStartGame(currentSettings)}
            disabled={players.length < 1}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold uppercase tracking-wider text-xs shadow-lg active:scale-[0.98] transition-all border-0"
          >
            Start Game ({players.length} {players.length === 1 ? "Player" : "Players"})
          </Button>
        ) : (
          <div className="w-full h-12 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-400 font-bold uppercase tracking-wider text-xs shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-2" />
            Waiting for Host to start...
          </div>
        )}
      </div>

      <footer className="relative z-10 text-center py-4 border-t border-zinc-900 bg-neutral-950">
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Stir It Up Party Engine © 2026</p>
      </footer>
    </div>
  )
}
