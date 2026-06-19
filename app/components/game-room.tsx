"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Copy, ArrowLeft } from "lucide-react"
import { games } from "../../lib/game-data/games"

interface GameRoomProps {
  roomCode: string
  players: string[]
  isHost: boolean
  selectedGame: string
  onSelectGame: (gameId: string) => void
  onStartGame: () => void
  onLeaveRoom: () => void
  darkMode: boolean
}

export function GameRoom({
  roomCode,
  players,
  isHost,
  selectedGame,
  onSelectGame,
  onStartGame,
  onLeaveRoom,
}: GameRoomProps) {
  const [copied, setCopied] = useState(false)

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeGame = games.find((g) => g.id === selectedGame) || games[0]

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden relative flex flex-col justify-between">
      
      <header className="relative z-10 py-3 px-6 border-b border-zinc-900 bg-neutral-950/80 backdrop-blur-sm flex justify-between items-center">
        <Button variant="ghost" onClick={onLeaveRoom} className="rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-3 text-[9px] uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Leave
        </Button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-8 items-start min-h-[70vh] py-8 w-full flex-1">
        {/* Left Column: Room Code & Selected Game Details */}
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

          {/* Host Game Selector Grid (Static Grid, No Scrolls) */}
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
        </div>

        {/* Right Column: Player Roster & Actions */}
        <div className="w-full lg:max-w-sm bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-end mb-4 border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Players
            </h3>
            <span className="text-xs font-mono text-zinc-500">({players.length})</span>
          </div>

          <div className="space-y-2 mb-6">
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
                Waiting for players...
              </div>
            )}
          </div>

          {isHost ? (
            <Button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="w-full h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase tracking-wider text-xs disabled:opacity-40 disabled:bg-zinc-850 disabled:text-zinc-600 border-0 transition-all"
            >
              Start Game
            </Button>
          ) : (
            <div className="w-full h-11 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              Waiting for Host...
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 border-t border-zinc-900 bg-neutral-950">
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Stir It Up Party Engine © 2026</p>
      </footer>
    </div>
  )
}
