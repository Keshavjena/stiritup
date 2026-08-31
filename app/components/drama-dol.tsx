"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Theater, Zap, Trophy, Shuffle, Drama, Beer } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"

interface DramaDolProps {
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

export function DramaDol({
  roomCode,
  players,
  isHost = false,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
  onTriggerChug,
}: DramaDolProps) {
  const socket = useSocket()
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState("")
  const [gameMode, setGameMode] = useState<"classic" | "wild" | "extreme">("classic")
  const [challenges, setChallenges] = useState<string[]>([])
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})
  const [drinkPenalty, setDrinkPenalty] = useState(1)

  const challengeContent = {
    classic: [
      "Act out 'Romeo and Juliet' balcony scene with exaggerated emotions",
      "Perform a dramatic death scene from any movie",
      "Act like you're in a soap opera discovering a family secret",
      "Perform a Shakespearean soliloquy about pizza",
      "Act out a dramatic breakup scene with an imaginary partner",
      "Pretend to be a dramatic cooking show host making toast",
      "Do an overly emotional weather forecast",
      "Act like you're in a war movie, but the war is against mosquitoes",
    ],
    wild: [
      "Act out a seductive scene from a romance novel with a chair as co-star",
      "Perform a romantic scene with the sexiest voice you can manage",
      "Do a dramatic monologue about your most embarrassing intimate moment",
      "Perform like you're seducing someone through interpretive dance",
      "Do a sultry reading of Terms and Conditions",
    ],
    extreme: [
      "Perform a lap dance for someone while reciting Shakespeare OR take 3 sips",
      "Act out your orgasm face dramatically OR finish your drink",
      "Do a dramatic masturbation scene (clothed) OR take 3 sips",
      "Perform like you're a phone sex operator OR take 3 sips",
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
    setDrinkPenalty(gameMode === "extreme" ? 3 : gameMode === "wild" ? 2 : 1)
  }, [gameMode, players])

  // Socket listener for multiplayer
  useEffect(() => {
    if (!socket) return

    socket.on("drama-game-action", (action) => {
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
      socket.off("drama-game-action")
    }
  }, [socket])

  const startGame = () => {
    playSound("success")
    setGameStarted(true)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "drama-game-action",
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
        type: "drama-game-action",
        payload: { type: "next-challenge", currentPlayer: nextP, challenge: nextC }
      })
    }
  }

  const switchMode = (mode: "classic" | "wild" | "extreme") => {
    setGameMode(mode)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "drama-game-action",
        payload: { type: "switch-mode", mode }
      })
    }
  }

  const performChallenge = () => {
    playSound("success")
    setPlayerScores((prev) => ({
      ...prev,
      [players[currentPlayer]]: (prev[players[currentPlayer]] || 0) + 1,
    }))
    if (isHost || !roomCode) nextChallenge()
  }

  const takeDrink = () => {
    playSound("click")
    if (onTriggerChug) {
      onTriggerChug(players[currentPlayer], drinkPenalty)
    }
    if (isHost || !roomCode) nextChallenge()
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
              <div className="text-6xl mb-4">🎬</div>
              <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tight text-white">
                Drama-Dol Act or Get Sloshed
              </h1>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">Act it out or drink up - no in between!</p>
            </div>

            <Card className="mb-8 bg-zinc-900/40 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Choose Drama Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={gameMode === "classic" ? "default" : "outline"}
                  className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                    gameMode === "classic" ? "bg-zinc-100 text-black" : "border-zinc-800 text-zinc-400"
                  }`}
                  onClick={() => switchMode("classic")}
                >
                  🎭 Classic Drama (Theatrical fun)
                </Button>

                <Button
                  variant={gameMode === "wild" ? "default" : "outline"}
                  className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                    gameMode === "wild" ? "bg-zinc-100 text-black" : "border-zinc-800 text-zinc-400"
                  }`}
                  onClick={() => switchMode("wild")}
                >
                  🔥 Wild Drama (Spicy performances)
                </Button>

                {matureContent && (
                  <Button
                    variant={gameMode === "extreme" ? "default" : "outline"}
                    className={`w-full h-14 justify-start font-bold uppercase text-xs tracking-wider ${
                      gameMode === "extreme" ? "bg-red-500 text-white border-transparent" : "border-zinc-800 text-zinc-400"
                    }`}
                    onClick={() => switchMode("extreme")}
                  >
                    💥 Extreme Drama (18+ Maximum chaos)
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
                <Theater className="w-4 h-4 mr-2" />
                Start the Show!
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
              <h1 className="text-lg font-bold text-white uppercase tracking-tight">🎬 Drama-Dol</h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{players[currentPlayer]}'s Turn</p>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Current Player */}
          <Card className="mb-6 border-2 border-zinc-700 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-center text-sm font-extrabold uppercase tracking-wider text-white">
                🎭 {players[currentPlayer]}'s Performance
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Challenge Card */}
          <Card className="mb-8 bg-zinc-900/40 border-zinc-800 min-h-[220px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="text-xl md:text-2xl font-bold text-white leading-relaxed uppercase tracking-tight mb-4">
                {currentChallenge}
              </div>
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                Perform this challenge OR take {drinkPenalty} sip{drinkPenalty > 1 ? "s" : ""}!
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={performChallenge}
              size="lg"
              className="h-14 text-xs font-extrabold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl"
            >
              <Theater className="w-4 h-4 mr-2" />
              ACT IT OUT! (Earn Point)
            </Button>

            <Button
              onClick={takeDrink}
              size="lg"
              className="h-14 text-xs font-extrabold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-xl"
            >
              <Beer className="w-4 h-4 mr-2" />
              DRINK UP! ({drinkPenalty} Sips / Chug 🍺)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
