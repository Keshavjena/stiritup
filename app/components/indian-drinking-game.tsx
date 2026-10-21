"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Trophy, Shuffle, Heart, Beer } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"

interface IndianDrinkingGameProps {
  roomCode?: string
  players: string[]
  isHost?: boolean
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
  onTriggerChug?: (player: string, count: number) => void
}

export function IndianDrinkingGame({
  roomCode,
  players,
  isHost = false,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
  onTriggerChug,
}: IndianDrinkingGameProps) {
  const socket = useSocket()
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState("")
  const [gameMode, setGameMode] = useState<"bollywood" | "desi" | "masala">("bollywood")
  const [challenges, setChallenges] = useState<string[]>([])
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})

  const challengeContent = {
    bollywood: [
      "Act out a famous Bollywood movie scene without speaking - others guess!",
      "Sing Kal Ho Naa Ho in the most dramatic way possible",
      "Do the signature dance move from Nagada Sang Dhol",
      "Recreate the train scene from DDLJ with another player",
      "Perform Shah Rukh Khan's signature pose for 30 seconds",
      "Name 5 movies with Deepika Padukone in 30 seconds",
      "Do the Lungi Dance with maximum energy",
      "Quote 3 famous dialogues from 3 Idiots",
      "Sing any Kishore Kumar song in your worst voice",
      "Act like Rajinikanth for the next 2 rounds",
    ],
    desi: [
      "Pretend to be a cricket commentator for an imaginary match",
      "Describe your favorite Indian dish in the most poetic way",
      "Act out a typical Indian wedding scene",
      "Eat something spicy and maintain a poker face",
      "Do an impression of your Indian mom when she's angry",
      "Act like you're bargaining at a local market",
      "Do the typical Indian head nod for 30 seconds",
      "Act like an Indian rickshaw driver negotiating fare",
    ],
    masala: [
      "Take a shot and then recite the alphabet backwards",
      "Kiss the person to your left on the cheek or take 2 sips",
      "Take two sips and tell everyone your most embarrassing desi moment",
      "Tell someone in the room why you find them attractive",
      "Drink and then tell your worst dating story",
      "Do a sexy dance for 1 minute or take 4 sips",
      "Truth: What's your biggest turn-on? Or take 2 shots",
    ],
  }

  useEffect(() => {
    const content = challengeContent[gameMode]
    setChallenges(content)
    setCurrentChallenge(content[0])

    const scores: Record<string, number> = {}
    players.forEach((player) => {
      scores[player] = 0
    })
    setPlayerScores(scores)
  }, [gameMode, players])

  // Socket listener for multiplayer
  useEffect(() => {
    if (!socket) return

    socket.on("indian-game-action", (action) => {
      if (action.type === "start-game") {
        setGameStarted(true)
      } else if (action.type === "next-challenge") {
        setCurrentPlayer(action.payload.currentPlayer)
        setCurrentChallenge(action.payload.challenge)
      } else if (action.type === "switch-mode") {
        setGameMode(action.payload.mode)
      }
    })

    return () => {
      socket.off("indian-game-action")
    }
  }, [socket])

  const startGame = () => {
    playSound("success")
    setGameStarted(true)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "indian-game-action",
        payload: { type: "start-game" }
      })
    }
  }

  const nextChallenge = () => {
    playSound("click")
    const nextP = (currentPlayer + 1) % players.length
    const nextIdx = (challengeIndex + 1) % challenges.length
    const nextC = challenges[nextIdx]

    setCurrentPlayer(nextP)
    setChallengeIndex(nextIdx)
    setCurrentChallenge(nextC)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "indian-game-action",
        payload: { type: "next-challenge", currentPlayer: nextP, challenge: nextC }
      })
    }
  }

  const switchMode = (mode: "bollywood" | "desi" | "masala") => {
    setGameMode(mode)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "indian-game-action",
        payload: { type: "switch-mode", mode }
      })
    }
  }

  const awardPoint = (playerName: string) => {
    playSound("success")
    setPlayerScores((prev) => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1,
    }))
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white py-4 sm:py-8 px-3 sm:px-6 pt-safe pb-safe flex flex-col justify-between">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="flex justify-start mb-4 sm:mb-6">
            <Button variant="ghost" onClick={onBack} className="border border-zinc-800 text-zinc-400 hover:text-white h-8 px-3 text-[9px] uppercase tracking-wider rounded-lg">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back
            </Button>
          </div>

          <div className="mb-6">
            <div className="text-5xl sm:text-6xl mb-3">🎭</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-1.5 uppercase tracking-tight text-white">
              Ultimate Indian Drinking Game
            </h1>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500">Bollywood meets party games - Desi style!</p>
          </div>

          <Card className="mb-6 bg-zinc-900/40 border-zinc-800 rounded-2xl">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Select Desi Game Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 px-4 pb-4">
              <Button
                variant={gameMode === "bollywood" ? "default" : "outline"}
                className={`w-full h-12 justify-start font-bold uppercase text-xs tracking-wider rounded-xl transition-all ${
                  gameMode === "bollywood" ? "bg-zinc-100 text-black shadow-md" : "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
                onClick={() => switchMode("bollywood")}
              >
                🎭 Bollywood Mode (Movies, dialogues & dancing)
              </Button>

              <Button
                variant={gameMode === "desi" ? "default" : "outline"}
                className={`w-full h-12 justify-start font-bold uppercase text-xs tracking-wider rounded-xl transition-all ${
                  gameMode === "desi" ? "bg-zinc-100 text-black shadow-md" : "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                }`}
                onClick={() => switchMode("desi")}
              >
                🏏 Desi Culture Mode (Cricket, moms & food)
              </Button>

              {matureContent && (
                <Button
                  variant={gameMode === "masala" ? "default" : "outline"}
                  className={`w-full h-12 justify-start font-bold uppercase text-xs tracking-wider rounded-xl transition-all ${
                    gameMode === "masala" ? "bg-red-500 text-white border-transparent shadow-md" : "border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                  }`}
                  onClick={() => switchMode("masala")}
                >
                  🌶️ Masala Mode (18+ Spicy challenges)
                </Button>
              )}
            </CardContent>
          </Card>

          {isHost || !roomCode ? (
            <Button
              onClick={startGame}
              size="lg"
              className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-black px-10 h-12 text-xs font-black uppercase tracking-wider rounded-xl border-0 shadow-lg active:scale-98"
            >
              <Star className="w-4 h-4 mr-2" />
              Start the Desi Party!
            </Button>
          ) : (
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider py-3 px-4 bg-zinc-900/50 rounded-xl border border-zinc-800">Waiting for Host to start...</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans py-3 sm:py-8 px-2 sm:px-4 pt-safe pb-safe overflow-x-hidden">
      <div className="container mx-auto px-1 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <Button variant="ghost" onClick={onBack} className="border border-zinc-800 text-zinc-400 hover:text-white h-8 px-2.5 sm:px-3 text-[9px] uppercase tracking-wider rounded-lg">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span className="hidden xs:inline">End Game</span>
              <span className="xs:hidden">Exit</span>
            </Button>

            <div className="text-center px-2">
              <h1 className="text-xs sm:text-lg font-bold text-white uppercase tracking-tight truncate">Ultimate Indian Drinking Game</h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">{players[currentPlayer]}'s Turn</p>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
          </div>

          {/* Current Player Card */}
          <Card className="mb-4 sm:mb-6 border-2 border-zinc-700 bg-zinc-900/80 rounded-2xl">
            <CardHeader className="py-2.5 px-3">
              <CardTitle className="text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                🎭 {players[currentPlayer]}'s Desi Challenge
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Challenge Card */}
          <Card className="mb-5 sm:mb-8 bg-zinc-900/40 border-zinc-800 min-h-[180px] sm:min-h-[220px] flex items-center justify-center rounded-2xl shadow-xl">
            <CardContent className="p-5 sm:p-8 text-center w-full">
              <div className="text-base sm:text-xl md:text-2xl font-black text-white leading-relaxed uppercase tracking-tight mb-4">
                {currentChallenge}
              </div>
              <Button
                onClick={() => onTriggerChug && onTriggerChug(players[currentPlayer], 1)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase px-4 h-10 rounded-xl shadow-md active:scale-98"
              >
                <Beer className="w-4 h-4 mr-1.5" />
                Trigger Beer Chug 🍺
              </Button>
            </CardContent>
          </Card>

          {/* Game Controls */}
          {(isHost || !roomCode) && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
              <Button
                onClick={nextChallenge}
                size="lg"
                className="h-12 bg-zinc-100 hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-md border-0"
              >
                <Star className="w-4 h-4 mr-2" />
                Next Challenge
              </Button>

              <Button
                onClick={() => switchMode(gameMode === "bollywood" ? "desi" : gameMode === "desi" ? "masala" : "bollywood")}
                variant="outline"
                className="h-12 border-zinc-800 text-zinc-300 hover:bg-zinc-900 font-bold uppercase text-xs tracking-wider rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2 text-red-400" />
                Switch Mode
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
