"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { games } from "@/lib/game-data/games"
import { GameRoom } from "./components/game-room"
import { GameComponent } from "./components/game-component"
import { useSocket } from "@/hooks/useSocket"
import { FlameIcon as Fire, Sparkles, UserPlus, Play, Trophy, Users, Clock, Compass } from "lucide-react"

export default function Home() {
  const [currentView, setCurrentView] = useState<"home" | "setup" | "room" | "game">("home")
  const [selectedGame, setSelectedGame] = useState<string>("never-have-i-ever")
  const [roomCode, setRoomCode] = useState<string>("")
  const [joinCode, setJoinCode] = useState<string>("")
  const [players, setPlayers] = useState<string[]>([])
  const [playerName, setPlayerName] = useState<string>("")
  const [isHost, setIsHost] = useState(false)
  const [matureContent, setMatureContent] = useState(true) // Default to spicy
  const [activeTab, setActiveTab] = useState<"all" | "classic" | "spicy" | "creative">("all")

  const socket = useSocket()

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return

    socket.on("room-players", (playerList: { id: string, name: string, isHost: boolean }[]) => {
      const names = playerList.map(p => p.name)
      setPlayers(names)
      
      const me = playerList.find(p => p.id === socket.id)
      if (me) {
        setIsHost(me.isHost)
      }
    })

    socket.on("game-started", (gameId?: string) => {
      if (gameId) {
        setSelectedGame(gameId)
      }
      setCurrentView("game")
    })

    socket.on("select-game", (gameId: string) => {
      setSelectedGame(gameId)
    })

    return () => {
      socket.off("room-players")
      socket.off("game-started")
      socket.off("select-game")
    }
  }, [socket])

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId)
    if (socket && roomCode) {
      socket.emit("select-game", roomCode, gameId)
    }
  }

  // Broadcast current selected game when a new player joins the lobby
  useEffect(() => {
    if (isHost && socket && roomCode && selectedGame) {
      socket.emit("select-game", roomCode, selectedGame)
    }
  }, [players.length, isHost, socket, roomCode, selectedGame])

  const createRoom = () => {
    if (!playerName.trim()) return alert("Please enter your name")
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoom)
    setIsHost(true)
    setPlayers([playerName])
    socket?.emit("join-room", newRoom, playerName)
    setCurrentView("room")
  }

  const joinRoom = () => {
    if (!playerName.trim()) return alert("Please enter your name")
    if (!joinCode.trim()) return alert("Please enter a room code")
    setRoomCode(joinCode.toUpperCase())
    setIsHost(false)
    setPlayers([playerName])
    socket?.emit("join-room", joinCode.toUpperCase(), playerName)
    setCurrentView("room")
  }

  const startGame = () => {
    if (isHost && socket) {
      socket.emit("start-game", roomCode, selectedGame)
      setCurrentView("game")
    }
  }

  // Filter games based on tab
  const filteredGames = games.filter(game => {
    if (activeTab === "all") return true
    if (activeTab === "classic") return ["Classic", "Mystery", "Interactive"].includes(game.category)
    if (activeTab === "spicy") return game.mature || ["Drinking", "Adult", "Performance", "Card Game", "Cultural"].includes(game.category)
    if (activeTab === "creative") return ["Creative", "Fast-Paced", "Custom"].includes(game.category)
    return true
  })

  if (currentView === "room") {
    return (
      <GameRoom
        roomCode={roomCode}
        players={players}
        isHost={isHost}
        selectedGame={selectedGame || "never-have-i-ever"}
        onSelectGame={handleSelectGame}
        onStartGame={startGame}
        onLeaveRoom={() => {
          socket?.emit("leave-room", roomCode)
          setCurrentView("home")
        }}
        darkMode={true}
      />
    )
  }

  if (currentView === "game") {
    return (
      <GameComponent
        roomCode={roomCode}
        gameId={selectedGame || "never-have-i-ever"}
        players={players}
        isHost={isHost}
        onBack={() => {
          socket?.emit("leave-room", roomCode)
          setCurrentView("home")
        }}
        darkMode={true}
        soundEnabled={true}
        playSound={() => {}}
        matureContent={matureContent}
      />
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden relative flex flex-col justify-between">
      
      <header className="relative z-10 flex justify-between items-center py-4 px-6 border-b border-zinc-900 bg-neutral-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight uppercase text-white">
            Stir It Up
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="rounded-lg border border-zinc-800 hover:bg-zinc-900 hover:text-white text-zinc-400 font-bold uppercase text-[9px] tracking-wider px-3 h-8">
            Rules
          </Button>
          <Button className="rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase text-[9px] tracking-wider px-3 h-8 border-0">
            Menu
          </Button>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-12 flex flex-col lg:flex-row gap-12 mt-8 mb-12 flex-1">
        
        {/* Left Column: Hero Typography & Join Lobby */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase mb-4 text-white leading-none">
              Stir up the vibe. <br/>
              Share the soul.
            </h2>
            <p className="text-zinc-400 text-base font-normal max-w-md mb-6 leading-relaxed">
              The ultimate interactive party game to break the ice, spark wild debates, and reveal hidden confessions.
            </p>
          </motion.div>

          {/* Lobby card: sleek minimalist */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl shadow-xl max-w-md w-full"
          >
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-zinc-200">
              Join the Party
            </h3>
            <div className="space-y-3">
              <div>
                <Input 
                  placeholder="Your Name" 
                  value={playerName} 
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-zinc-900/60 border-zinc-800 rounded-xl h-11 text-sm text-white placeholder-zinc-500 focus:border-zinc-700 focus:bg-zinc-900/80 focus:ring-0"
                />
              </div>
              
              <div className="flex gap-4">
                <Button onClick={createRoom} className="flex-grow h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase tracking-wider text-xs border-0 transition-colors">
                  Create Room
                </Button>
              </div>
              
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink-0 mx-3 text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Or Join Existing</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Room Code" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-zinc-900/60 border-zinc-800 rounded-xl h-11 text-sm uppercase tracking-wider text-white placeholder-zinc-500 focus:border-zinc-700 focus:bg-zinc-900/80 focus:ring-0 flex-1"
                />
                <Button onClick={joinRoom} variant="outline" className="h-11 px-6 rounded-xl border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-bold uppercase tracking-wider text-xs transition-colors">
                  Join
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Game Category Filter Grid */}
        <div className="flex-1 flex flex-col justify-start py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-4">
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight text-white">
                Explore Games
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5">Select game to customize in lobby</p>
            </div>
            <span className="text-3xl font-mono text-zinc-700 font-bold">({games.length})</span>
          </div>

          {/* Interactive Filtering Tabs - Minimalist */}
          <div className="flex flex-wrap gap-1 mb-6 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-fit">
            {(["all", "classic", "spicy", "creative"] as const).map((tab) => {
              const active = activeTab === tab
              const labels = { all: "All", classic: "Classics", spicy: "18+ Spicy", creative: "Creative" }
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                    active 
                      ? "bg-zinc-800 text-white" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {labels[tab]}
                </button>
              )
            })}
          </div>

          {/* Games Grid Container - No internal scrollbar! */}
          <div className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-[160px]">
              <AnimatePresence mode="popLayout">
                {filteredGames.map((game) => {
                  const isSelected = selectedGame === game.id
                  const hoverBorders = "hover:border-zinc-700"
                  const selectedBorder = "border-zinc-200 bg-zinc-900/40"

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      key={game.id}
                      onClick={() => handleSelectGame(game.id)}
                      className={`relative overflow-hidden cursor-pointer rounded-2xl p-5 flex flex-col justify-end transition-all border bg-zinc-900/10 ${
                        isSelected 
                          ? selectedBorder 
                          : `border-zinc-800/60 ${hoverBorders}`
                      }`}
                    >
                      {/* Top elements */}
                      <div className="absolute top-5 left-5 flex flex-wrap gap-1.5 max-w-[85%]">
                        {game.mature && (
                          <span className="bg-red-950/40 border border-red-900/30 text-red-400 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm">
                            18+
                          </span>
                        )}
                        {game.new && (
                          <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Info badges */}
                      <div className="flex gap-2.5 mb-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>{game.players} players</span>
                        <span>•</span>
                        <span>{game.duration}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base tracking-tight uppercase leading-none mb-1 text-white">
                          {game.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-normal line-clamp-2 leading-relaxed">{game.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 border-t border-zinc-900 bg-neutral-950">
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Stir It Up Party Engine © 2026</p>
      </footer>
    </div>
  )
}
