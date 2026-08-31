"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Crown, Trophy, Shuffle, ThumbsUp, Beer } from "lucide-react"
import { useSocket } from "@/hooks/useSocket"

interface CardsAgainstHumanityProps {
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

interface BlackCard {
  text: string
  blanks: number
}

interface WhiteCard {
  text: string
}

export function CardsAgainstHumanity({
  roomCode,
  players,
  isHost = false,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
  onTriggerChug,
}: CardsAgainstHumanityProps) {
  const socket = useSocket()
  const [gameStarted, setGameStarted] = useState(false)
  const [currentJudge, setCurrentJudge] = useState(0)
  const [currentBlackCard, setCurrentBlackCard] = useState<BlackCard | null>(null)
  const [gamePhase, setGamePhase] = useState<"playing" | "judging" | "results">("playing")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [winnerThisRound, setWinnerThisRound] = useState<string>("")
  const [roundNumber, setRoundNumber] = useState(1)

  const blackCards: BlackCard[] = [
    { text: "What's that smell?", blanks: 1 },
    { text: "I got 99 problems but _ ain't one.", blanks: 1 },
    { text: "Maybe she's born with it. Maybe it's _.", blanks: 1 },
    { text: "What's the next Happy Meal toy?", blanks: 1 },
    { text: "What's Beyoncé's secret power?", blanks: 1 },
    { text: "What ended my last relationship?", blanks: 1 },
    { text: "What's my secret power?", blanks: 1 },
    { text: "What would grandma find disturbing, yet oddly charming?", blanks: 1 },
    { text: "What's the most emo?", blanks: 1 },
    { text: "Instead of coal, Santa now gives the bad children _.", blanks: 1 },
    { text: "What gives me uncontrollable gas?", blanks: 1 },
    { text: "What's there a ton of in heaven?", blanks: 1 },
    { text: "What did I bring back from Mexico?", blanks: 1 },
    { text: "What am I giving up for Lent?", blanks: 1 },
    { text: "What's the new fad diet?", blanks: 1 },
    { text: "What's my anti-drug?", blanks: 1 },
    { text: "What will always get you laid?", blanks: 1 },
    { text: "What do old people smell like?", blanks: 1 },
    { text: "What ruins a first date?", blanks: 1 },
    { text: "My weirdest kink involves _.", blanks: 1 },
    { text: "What's the worst thing to say right after sex?", blanks: 1 },
  ]

  const whiteCards: WhiteCard[] = [
    { text: "Being on fire" },
    { text: "Grandma's ashes" },
    { text: "Puppies!" },
    { text: "Chainsaws for hands" },
    { text: "Viagra" },
    { text: "Celebrity sex tapes" },
    { text: "Genital piercings" },
    { text: "Jibber-jabber" },
    { text: "My genitals" },
    { text: "Bees?" },
    { text: "Getting really high" },
    { text: "My partner's parents walking in" },
    { text: "Texting my ex at 3 AM" },
    { text: "A massive sugar arrangement" },
    { text: "An awkward friends-with-benefits deal" },
  ]

  useEffect(() => {
    const initialScores: Record<string, number> = {}
    players.forEach((player) => {
      initialScores[player] = 0
    })
    setScores(initialScores)
    setCurrentBlackCard(blackCards[0])
  }, [players])

  // Socket event listener for multiplayer synchronization
  useEffect(() => {
    if (!socket) return

    socket.on("cah-action", (action) => {
      if (action.type === "start-game") {
        setGameStarted(true)
        setCurrentBlackCard(action.payload.blackCard)
      } else if (action.type === "next-round") {
        setCurrentJudge(action.payload.currentJudge)
        setCurrentBlackCard(action.payload.blackCard)
        setGamePhase("playing")
        setWinnerThisRound("")
        setRoundNumber(action.payload.roundNumber)
      } else if (action.type === "set-phase") {
        setGamePhase(action.payload.phase)
      } else if (action.type === "select-winner") {
        setWinnerThisRound(action.payload.winner)
        setScores(action.payload.scores)
        setGamePhase("results")
      }
    })

    return () => {
      socket.off("cah-action")
    }
  }, [socket])

  const startGame = () => {
    playSound("success")
    const card = blackCards[Math.floor(Math.random() * blackCards.length)]
    setGameStarted(true)
    setCurrentBlackCard(card)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "cah-action",
        payload: { type: "start-game", blackCard: card }
      })
    }
  }

  const nextRound = () => {
    playSound("click")
    const nextJ = (currentJudge + 1) % players.length
    const nextCard = blackCards[Math.floor(Math.random() * blackCards.length)]
    const nextRoundNum = roundNumber + 1

    setCurrentJudge(nextJ)
    setCurrentBlackCard(nextCard)
    setGamePhase("playing")
    setWinnerThisRound("")
    setRoundNumber(nextRoundNum)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "cah-action",
        payload: { type: "next-round", currentJudge: nextJ, blackCard: nextCard, roundNumber: nextRoundNum }
      })
    }
  }

  const selectWinner = (playerName: string) => {
    playSound("success")
    const newScores = {
      ...scores,
      [playerName]: (scores[playerName] || 0) + 1,
    }
    setWinnerThisRound(playerName)
    setScores(newScores)
    setGamePhase("results")

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "cah-action",
        payload: { type: "select-winner", winner: playerName, scores: newScores }
      })
    }
  }

  const getRandomWhiteCards = (count: number) => {
    const shuffled = [...whiteCards].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="mb-8 border border-zinc-800 text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <div className="text-6xl mb-4">🃏</div>
              <h1 className="text-4xl font-extrabold mb-2 uppercase text-white tracking-tight">Cards Against Humanity</h1>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">The party game for horrible people</p>
            </div>

            <Card className="mb-8 bg-zinc-900/40 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-white uppercase tracking-wider text-sm font-bold">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-left text-zinc-400 text-xs font-semibold">
                <ul className="list-disc list-inside space-y-2">
                  <li>Each round, one player is the Card Czar (judge)</li>
                  <li>The Card Czar reads a black card out loud</li>
                  <li>Other players choose their funniest white card to complete the phrase</li>
                  <li>The Card Czar picks the funniest combination</li>
                  <li>First player to 5 points wins!</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-zinc-900/30 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-3">
                  {players.map((player, index) => (
                    <Badge
                      key={index}
                      className={`text-xs px-4 py-2 uppercase font-bold tracking-wider ${
                        index === currentJudge ? "bg-zinc-100 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {player}
                      {index === currentJudge && <Crown className="w-3.5 h-3.5 ml-2 inline text-zinc-500" />}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isHost || !roomCode ? (
              <Button
                onClick={startGame}
                size="lg"
                className="bg-zinc-100 hover:bg-zinc-200 text-black px-12 py-4 text-xs font-extrabold uppercase tracking-wider rounded-xl border-0"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Start Game!
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
              <h1 className="text-xl font-bold text-white uppercase tracking-tight">🃏 Cards Against Humanity</h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Round {roundNumber}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Scores */}
          <Card className="mb-6 bg-zinc-900/40 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center text-xs uppercase font-bold tracking-wider text-zinc-300">
                <Trophy className="w-4 h-4 mr-2 text-zinc-500" />
                Scores (First to 5 wins!)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player, index) => (
                  <div key={player} className="text-center p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="font-bold text-xs uppercase text-zinc-300 flex items-center justify-center gap-1">
                      {player}
                      {index === currentJudge && <Crown className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="text-2xl font-black text-white mt-1">{scores[player] || 0}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Judge */}
          <Card className="mb-6 border-2 border-zinc-700 bg-zinc-900/60">
            <CardHeader className="bg-zinc-900 text-white">
              <CardTitle className="text-center text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                {players[currentJudge]} is the Card Czar
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Black Card */}
          <Card className="mb-8 bg-zinc-900 border border-zinc-800 text-white min-h-[180px] flex items-center justify-center shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-xl md:text-2xl font-bold leading-relaxed tracking-tight uppercase">{currentBlackCard?.text}</div>
              <div className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                {currentBlackCard?.blanks === 1 ? "Pick 1" : `Pick ${currentBlackCard?.blanks}`}
              </div>
            </CardContent>
          </Card>

          {/* White Cards Sample */}
          <Card className="mb-8 bg-zinc-900/20 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sample White Cards (Pick the funniest!)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getRandomWhiteCards(6).map((card, index) => (
                  <Card key={index} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="text-zinc-200 font-bold text-xs uppercase tracking-wider">{card.text}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Phase Controls */}
          {gamePhase === "playing" && (
            <Card className="mb-8 bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  Players (except {players[currentJudge]}) choose your funniest white card!
                </p>
                {(isHost || !roomCode) && (
                  <Button
                    onClick={() => {
                      setGamePhase("judging")
                      if (socket && roomCode) {
                        socket.emit("game-action", roomCode, {
                          type: "cah-action",
                          payload: { type: "set-phase", phase: "judging" }
                        })
                      }
                    }}
                    size="lg"
                    className="bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold uppercase text-xs rounded-xl px-8"
                  >
                    All Cards Submitted - Start Judging
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {gamePhase === "judging" && (
            <Card className="mb-8 bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-4">
                  {players[currentJudge]}, pick the funniest card!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {players
                    .filter((_, index) => index !== currentJudge)
                    .map((player) => (
                      <Button
                        key={player}
                        onClick={() => selectWinner(player)}
                        variant="outline"
                        size="lg"
                        className="h-12 text-xs font-bold uppercase tracking-wider border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Choose {player}'s Card
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gamePhase === "results" && (
            <Card className="mb-8 bg-emerald-950/30 border border-emerald-900/50">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-bold uppercase text-emerald-400 mb-4">
                  🎉 {winnerThisRound} wins this round!
                </p>
                {(isHost || !roomCode) && (
                  <Button onClick={nextRound} size="lg" className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase text-xs px-8 rounded-xl">
                    Next Round
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Game Controls */}
          {(isHost || !roomCode) && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  const card = blackCards[Math.floor(Math.random() * blackCards.length)]
                  setCurrentBlackCard(card)
                }}
                variant="outline"
                className="h-11 text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-xl font-bold uppercase"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                New Black Card
              </Button>

              <Button onClick={nextRound} variant="outline" className="h-11 text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-xl font-bold uppercase">
                Skip Round
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
