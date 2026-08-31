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
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="mb-8 border border-zinc-800 text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tight text-white">
                Ultimate Indian Drinking Game
              </h1>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">Bollywood meets party games - Desi style!</p>
            </div>

            <Card className="mb-8 bg-zinc-900/40 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Select Desi Game Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={gameMode === "bollywood" ? "default" : "outline"}
                  className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                    gameMode === "bollywood" ? "bg-zinc-100 text-black" : "border-zinc-800 text-zinc-400"
                  }`}
                  onClick={() => switchMode("bollywood")}
                >
                  🎭 Bollywood Mode (Movies, dialogues & dancing)
                </Button>

                <Button
                  variant={gameMode === "desi" ? "default" : "outline"}
                  className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                    gameMode === "desi" ? "bg-zinc-100 text-black" : "border-zinc-800 text-zinc-400"
                  }`}
                  onClick={() => switchMode("desi")}
                >
                  🏏 Desi Culture Mode (Cricket, moms & food)
                </Button>

                {matureContent && (
                  <Button
                    variant={gameMode === "masala" ? "default" : "outline"}
                    className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                      gameMode === "masala" ? "bg-red-500 text-white border-transparent" : "border-zinc-800 text-zinc-400"
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
                className="bg-zinc-100 hover:bg-zinc-200 text-black px-12 py-4 text-xs font-extrabold uppercase tracking-wider rounded-xl border-0"
              >
                <Star className="w-4 h-4 mr-2" />
                Start the Desi Party!
              </Button>
            ) : (
              <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Waiting for Host to start...</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="border border-zinc-800 text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              End Game
            </Button>

            <div className="text-center">
              <h1 className="text-lg font-bold text-white uppercase tracking-tight">Ultimate Indian Drinking Game</h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{players[currentPlayer]}'s Turn</p>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Current Player Card */}
          <Card className="mb-6 border-2 border-zinc-700 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-center text-sm font-extrabold uppercase tracking-wider text-white">
                🎭 {players[currentPlayer]}'s Desi Challenge
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Challenge Card */}
          <Card className="mb-8 bg-zinc-900/40 border-zinc-800 min-h-[220px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="text-xl md:text-2xl font-bold text-white leading-relaxed uppercase tracking-tight mb-4">
                {currentChallenge}
              </div>
              <Button
                onClick={() => onTriggerChug && onTriggerChug(players[currentPlayer], 1)}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase px-4 h-9 rounded-lg"
              >
                <Beer className="w-4 h-4 mr-1.5" />
                Trigger Beer Chug 🍺
              </Button>
            </CardContent>
          </Card>

          {/* Game Controls */}
          {(isHost || !roomCode) && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Button
                onClick={nextChallenge}
                size="lg"
                className="h-12 bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold uppercase text-xs tracking-wider rounded-xl"
              >
                <Star className="w-4 h-4 mr-2" />
                Next Challenge
              </Button>

              <Button
                onClick={() => switchMode(gameMode === "bollywood" ? "desi" : gameMode === "desi" ? "masala" : "bollywood")}
                variant="outline"
                className="h-12 border-zinc-800 text-zinc-300 font-bold uppercase text-xs tracking-wider rounded-xl"
              >
                <Heart className="w-4 h-4 mr-2" />
                Switch Mode
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
