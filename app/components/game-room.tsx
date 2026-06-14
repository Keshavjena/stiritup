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
    <div className="min-h-screen bg-[#1c1c1c] text-[#e8e5dc] font-sans selection:bg-[#8be8e5] selection:text-black relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#8be8e5] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#c9a7f1] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse"></div>

      <header className="relative z-10 p-6 lg:p-12 flex justify-between items-center">
        <Button variant="ghost" onClick={onLeaveRoom} className="text-[#e8e5dc] hover:bg-white/10 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5 mr-2" /> Leave
        </Button>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-8 items-start min-h-[70vh] pb-12">
        {/* Left Column: Room Code & Selected Game Details */}
        <div className="flex-1 w-full text-center lg:text-left flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-serif italic text-[#f1a7c5] mb-2">Room Code</h2>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[3.5rem] sm:text-[6rem] lg:text-[7.5rem] font-display font-bold tracking-tighter leading-none mb-4"
            >
              {roomCode}
            </motion.div>
            <Button
              onClick={copyRoomCode}
              className={`rounded-full h-12 px-6 font-display uppercase tracking-widest font-bold transition-all text-xs ${
                copied ? "bg-green-400 text-black" : "bg-white text-black hover:bg-[#e8e5dc]"
              }`}
            >
              {copied ? "Copied!" : <><Copy className="w-4 h-4 mr-2" /> Copy Code</>}
            </Button>
          </div>

          {/* Current Selected Game Details Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-left max-w-xl shadow-2xl">
            <span className="text-[#f1a7c5] font-serif italic text-xs">Selected Game:</span>
            <div className="flex items-center gap-4 mt-2 mb-3">
              <span className="text-4xl">{activeGame.icon}</span>
              <div>
                <h4 className="font-display font-bold text-2xl uppercase tracking-tighter text-white">{activeGame.name}</h4>
                {activeGame.mature && (
                  <span className="bg-red-500/10 text-red-400 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-red-500/20 mt-1 inline-block">
                    18+ Only
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-medium">{activeGame.description}</p>
          </div>

          {/* Host Game Selector Carousel */}
          {isHost && (
            <div className="w-full max-w-xl text-left">
              <h3 className="font-display font-bold uppercase tracking-tighter text-sm text-[#8be8e5] mb-3">
                Change Selected Game
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onSelectGame(game.id)}
                    className={`flex-shrink-0 w-48 relative overflow-hidden cursor-pointer rounded-2xl p-4 flex flex-col justify-end transition-all border-2 ${
                      selectedGame === game.id
                        ? "border-[#8be8e5] bg-white/10 shadow-lg shadow-[#8be8e5]/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="absolute top-3 right-3 text-2xl">{game.icon}</div>
                    <div className="mt-8">
                      <h5 className="font-display font-bold text-sm tracking-tight uppercase leading-tight text-white line-clamp-1">
                        {game.name}
                      </h5>
                      <span className="text-[10px] text-white/50">{game.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Player Roster & Actions */}
        <div className="w-full lg:max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
            <h3 className="text-3xl font-display font-bold uppercase tracking-tighter">
              Players
            </h3>
            <span className="text-2xl font-serif text-white/40">({players.length})</span>
          </div>

          <div className="space-y-4 mb-8 max-h-[35vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {players.map((player, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="flex items-center justify-between p-4 bg-white/10 rounded-2xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8be8e5] to-[#c9a7f1] rounded-full flex items-center justify-center text-black font-display font-bold text-lg">
                    {player.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-display font-medium text-base uppercase tracking-wider">{player}</span>
                </div>
                {index === 0 && (
                  <span className="bg-[#f1a7c5] text-black text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </motion.div>
            ))}

            {players.length < 2 && (
              <div className="p-4 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center text-white/40 font-display uppercase tracking-widest text-xs">
                Waiting for players...
              </div>
            )}
          </div>

          {isHost ? (
            <Button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="w-full h-16 rounded-xl bg-[#8be8e5] hover:bg-[#68d8d5] text-black font-display uppercase tracking-widest font-bold text-base disabled:opacity-50 disabled:bg-white/20 disabled:text-white btn-press"
            >
              Start Game
            </Button>
          ) : (
            <div className="w-full h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 font-display uppercase tracking-widest font-bold text-sm">
              Waiting for Host...
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
