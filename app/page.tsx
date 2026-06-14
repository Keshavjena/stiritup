"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { games } from "@/lib/game-data/games"
import { GameRoom } from "./components/game-room"
import { GameComponent } from "./components/game-component"
import { PlayerSetup } from "./components/player-setup"
import { useSocket } from "@/hooks/useSocket"
import { FlameIcon as Fire, Sparkles, UserPlus, Play } from "lucide-react"

export default function Home() {
  const [currentView, setCurrentView] = useState<"home" | "setup" | "room" | "game">("home")
  const [selectedGame, setSelectedGame] = useState<string>("")
  const [roomCode, setRoomCode] = useState<string>("")
  const [joinCode, setJoinCode] = useState<string>("")
  const [players, setPlayers] = useState<string[]>([])
  const [playerName, setPlayerName] = useState<string>("")
  const [isHost, setIsHost] = useState(false)
  const [matureContent, setMatureContent] = useState(true) // Default to spicy

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
    if (!playerName) return alert("Please enter your name")
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoom)
    setIsHost(true)
    setPlayers([playerName])
    socket?.emit("join-room", newRoom, playerName)
    setCurrentView("room")
  }

  const joinRoom = () => {
    if (!playerName) return alert("Please enter your name")
    if (!joinCode) return alert("Please enter a room code")
    setRoomCode(joinCode.toUpperCase())
    setIsHost(false)
    setPlayers([playerName]) // Other players will be synced ideally
    socket?.emit("join-room", joinCode.toUpperCase(), playerName)
    setCurrentView("room")
  }

  const startGame = () => {
    if (isHost && socket) {
      socket.emit("start-game", roomCode, selectedGame)
      setCurrentView("game")
    }
  }

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
    <div className="min-h-screen bg-[#e8e5dc] text-[#1c1c1c] font-sans selection:bg-[#f1a7c5] selection:text-black overflow-hidden relative">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#8be8e5] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#f1a7c5] rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>

      <header className="relative z-10 flex justify-between items-center p-6 lg:p-12">
        <h1 className="text-3xl font-serif tracking-tighter italic font-bold">Stir It Up</h1>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-full border-black font-display font-medium uppercase text-xs tracking-widest">
            Rules
          </Button>
          <Button className="rounded-full bg-black text-[#e8e5dc] font-display font-medium uppercase text-xs tracking-widest">
            Menu
          </Button>
        </div>
      </header>

      <main className="relative z-10 px-6 lg:px-12 flex flex-col md:flex-row gap-12 mt-10">
        
        {/* Left Column: Huge Typography & Join */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[3.5rem] sm:text-[6rem] lg:text-[10rem] font-display font-bold leading-[0.8] tracking-tighter uppercase mb-6 text-[#1c1c1c]">
              The <br/>
              <span className="text-[#f1a7c5] drop-shadow-md">Shapes</span> <br/>
              Of <span className="font-serif italic text-[#8be8e5] lowercase font-normal">soul</span>
            </h2>
          </motion.div>

          <div className="mt-12 bg-white/40 backdrop-blur-xl border border-white/50 p-8 rounded-[2rem] shadow-xl max-w-md">
            <h3 className="font-display font-bold text-2xl uppercase tracking-tighter mb-4">Enter the Party</h3>
            <div className="space-y-4">
              <Input 
                placeholder="Your Name" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-white/60 border-0 rounded-xl h-14 text-lg font-medium"
              />
              <div className="flex gap-4">
                <Button onClick={createRoom} className="flex-1 h-14 rounded-xl bg-[#c9a7f1] hover:bg-[#b08ce0] text-black font-display uppercase tracking-widest font-bold">
                  Create Room
                </Button>
              </div>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-black/10"></div>
                <span className="flex-shrink-0 mx-4 text-black/40 text-sm uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-black/10"></div>
              </div>
              <div className="flex gap-4">
                <Input 
                  placeholder="Room Code" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-white/60 border-0 rounded-xl h-14 text-lg font-medium uppercase"
                />
                <Button onClick={joinRoom} variant="outline" className="h-14 rounded-xl border-black hover:bg-black hover:text-white font-display uppercase tracking-widest font-bold">
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Game Selection Carousel/Grid */}
        <div className="flex-1 overflow-visible">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-4xl font-display font-bold uppercase tracking-tighter">
              Games <br/>
              <span className="font-serif italic text-black/60 lowercase">upcoming</span>
            </h3>
            <span className="text-5xl font-serif text-black/20">({games.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[180px] sm:auto-rows-[200px]">
            {games.slice(0, 6).map((game, i) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedGame(game.id)}
                className={`relative overflow-hidden cursor-pointer rounded-[2rem] p-6 flex flex-col justify-end transition-all border-4 ${
                  selectedGame === game.id 
                    ? "border-black dark:border-white ring-4 ring-[#8be8e5]/50 scale-[1.01]" 
                    : "border-transparent"
                } ${
                  i === 0 ? "col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 bg-[#1c1c1c] text-[#e8e5dc]" : 
                  i === 1 ? "bg-[#f1a7c5] text-black" : 
                  i === 2 ? "bg-[#8be8e5] text-black" : 
                  "bg-white/60 backdrop-blur-md text-black"
                }`}
              >
                <div className="absolute top-6 right-6 text-4xl">{game.icon}</div>
                {game.mature && (
                  <div className="absolute top-6 left-6">
                    <span className="bg-black text-[#f1a7c5] text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1">
                      <Fire className="w-3 h-3" /> 18+
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-display font-bold text-2xl tracking-tighter uppercase leading-tight mb-2">{game.name}</h4>
                  <p className="text-sm opacity-70 font-medium line-clamp-2">{game.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
