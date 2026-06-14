"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  SkipForward,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Volume2,
  VolumeX,
  Settings,
  X,
  Plus,
  Minus,
  Crown,
  Wine
} from "lucide-react"
import { Trophy as TrophyIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { CardsAgainstHumanity } from "./cards-against-humanity"
import { IndianDrinkingGame } from "./indian-drinking-game"
import { DramaDol } from "./drama-dol"
import { getGameContent } from "../../lib/game-data/questions"
import { useSocket } from "@/hooks/useSocket"
import { motion, AnimatePresence } from "framer-motion"

interface GameComponentProps {
  roomCode?: string
  gameId: string
  players: string[]
  isHost?: boolean
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
}

export function GameComponent({
  roomCode,
  gameId,
  players,
  isHost = false,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
}: GameComponentProps) {
  const socket = useSocket()
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [currentContent, setCurrentContent] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [contentIndex, setContentIndex] = useState(0)
  const [gameContent, setGameContent] = useState<string[]>([])
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})
  const [showScoring, setShowScoring] = useState(false)
  const [gameMode, setGameMode] = useState<"standard" | "challenge" | "spicy">("standard")

  const [sips, setSips] = useState<Record<string, number>>({})
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [customPromptOpen, setCustomPromptOpen] = useState(false)
  const [customPromptText, setCustomPromptText] = useState("")
  const [anonymousPrompts, setAnonymousPrompts] = useState<string[]>([])

  const [votes, setVotes] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [votingReveal, setVotingReveal] = useState(false)
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([])

  const [gameHistory, setGameHistory] = useState<{
    question: string
    currentPlayer: string
    votes?: Record<string, string>
    tallies?: Record<string, number>
  }[]>([])
  const [showSummary, setShowSummary] = useState(false)

  // Refs to avoid stale closures in socket events
  const currentPlayerRef = useRef(currentPlayer)
  const currentContentRef = useRef(currentContent)
  const votesRef = useRef(votes)
  const playersRef = useRef(players)
  const gameIdRef = useRef(gameId)

  useEffect(() => {
    currentPlayerRef.current = currentPlayer
  }, [currentPlayer])

  useEffect(() => {
    currentContentRef.current = currentContent
  }, [currentContent])

  useEffect(() => {
    votesRef.current = votes
  }, [votes])

  useEffect(() => {
    playersRef.current = players
  }, [players])

  useEffect(() => {
    gameIdRef.current = gameId
  }, [gameId])

  useEffect(() => {
    const content = getGameContent(gameId, matureContent, gameMode)
    setGameContent(content)
    // Initialize player scores
    const scores: Record<string, number> = {}
    players.forEach((player) => {
      scores[player] = 0
    })
    setPlayerScores(scores)
  }, [gameId, matureContent, gameMode, players])

  useEffect(() => {
    if (gameContent.length > 0) {
      setCurrentContent(gameContent[0])
    }
  }, [gameContent])

  useEffect(() => {
    if (!socket) return

    socket.on("game-action", (action) => {
      if (action.type === "start-game") {
        setGameMode(action.payload.gameMode)
        setTimerEnabled(action.payload.timerEnabled)
        setShowScoring(action.payload.showScoring)
        setGameStarted(true)
        if (action.payload.timerEnabled) {
          setTimeLeft(30)
          setTimerActive(true)
        }
      } else if (action.type === "next-turn") {
        const prevVotes = votesRef.current
        const prevPlayers = playersRef.current
        const activeGameId = gameIdRef.current
        
        const tallies: Record<string, number> = {}
        prevPlayers.forEach(p => tallies[p] = 0)
        Object.values(prevVotes).forEach(candidate => {
          tallies[candidate] = (tallies[candidate] || 0) + 1
        })

        const historyItem = {
          question: currentContentRef.current,
          currentPlayer: prevPlayers[currentPlayerRef.current],
          votes: activeGameId === "whos-most-likely" ? { ...prevVotes } : undefined,
          tallies: activeGameId === "whos-most-likely" ? tallies : undefined
        }
        setGameHistory((prev) => [...prev, historyItem])

        setCurrentPlayer(action.payload.currentPlayer)
        setContentIndex(action.payload.contentIndex)
        setCurrentContent(action.payload.currentContent)
        setVotes({})
        setHasVoted(false)
        setVotingReveal(false)
        if (timerEnabled) {
          setTimeLeft(30)
          setTimerActive(true)
        }
      } else if (action.type === "skip-content") {
        setContentIndex(action.payload.contentIndex)
        setCurrentContent(action.payload.currentContent)
      } else if (action.type === "shuffle-content") {
        setGameContent(action.payload.gameContent)
        setCurrentContent(action.payload.currentContent)
        setContentIndex(0)
      } else if (action.type === "award-point") {
        setPlayerScores(action.payload.playerScores)
      } else if (action.type === "toggle-timer") {
        setTimerActive(action.payload.timerActive)
        setTimeLeft(action.payload.timeLeft)
      } else if (action.type === "reset-timer") {
        setTimeLeft(30)
        setTimerActive(false)
      } else if (action.type === "reveal-votes") {
        setVotingReveal(true)
      }
    })

    socket.on("cast-vote", (voteData) => {
      setVotes((prev) => ({
        ...prev,
        [voteData.voter]: voteData.candidate
      }))
    })

    socket.on("send-reaction", (reaction) => {
      const id = reaction.id || Math.random().toString()
      const newReaction = {
        id,
        emoji: reaction.emoji,
        x: Math.floor(Math.random() * 60) + 20,
        y: 100
      }
      setReactions((prev) => [...prev, newReaction])
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id))
      }, 3000)
    })

    socket.on("anonymous-prompt", (promptText) => {
      setAnonymousPrompts((prev) => [...prev, promptText])
      setGameContent((prev) => {
        const updated = [...prev]
        const insertIndex = (contentIndex + 1) % (updated.length || 1)
        updated.splice(insertIndex, 0, `Anonymous Prompt: ${promptText}`)
        return updated
      })
    })

    socket.on("sync-sips", (sipsData) => {
      setSips((prev) => ({
        ...prev,
        [sipsData.playerName]: sipsData.sipsCount
      }))
    })

    return () => {
      socket.off("game-action")
      socket.off("cast-vote")
      socket.off("send-reaction")
      socket.off("anonymous-prompt")
      socket.off("sync-sips")
    }
  }, [socket, timerEnabled, contentIndex])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            playSound("transition")
            nextTurn()
            return 30
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft, playSound])

  const startGame = () => {
    playSound("success")
    setGameStarted(true)
    if (timerEnabled) {
      setTimerActive(true)
    }
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "start-game",
        payload: { gameMode, matureContent, timerEnabled, showScoring }
      })
    }
  }

  const nextTurn = () => {
    playSound("click")
    
    // Save current round details to history
    const tallies: Record<string, number> = {}
    players.forEach(p => tallies[p] = 0)
    Object.values(votes).forEach(candidate => {
      tallies[candidate] = (tallies[candidate] || 0) + 1
    })

    const historyItem = {
      question: currentContent,
      currentPlayer: players[currentPlayer],
      votes: gameId === "whos-most-likely" ? { ...votes } : undefined,
      tallies: gameId === "whos-most-likely" ? tallies : undefined
    }
    setGameHistory((prev) => [...prev, historyItem])

    const nextPlayer = (currentPlayer + 1) % players.length
    const nextContentIndex = (contentIndex + 1) % gameContent.length
    const nextContentStr = gameContent[(contentIndex + 1) % gameContent.length]
    
    setCurrentPlayer(nextPlayer)
    setContentIndex(nextContentIndex)
    setCurrentContent(nextContentStr)
    setVotes({})
    setHasVoted(false)
    setVotingReveal(false)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "next-turn",
        payload: { currentPlayer: nextPlayer, contentIndex: nextContentIndex, currentContent: nextContentStr }
      })
    }

    if (timerEnabled) {
      setTimeLeft(30)
      setTimerActive(true)
    }
  }

  const skipContent = () => {
    playSound("click")
    const newIndex = (contentIndex + Math.floor(Math.random() * 10) + 1) % gameContent.length
    const nextContentStr = gameContent[newIndex]
    setContentIndex(newIndex)
    setCurrentContent(nextContentStr)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "skip-content",
        payload: { contentIndex: newIndex, currentContent: nextContentStr }
      })
    }
  }

  const shuffleContent = () => {
    playSound("click")
    const shuffled = [...gameContent].sort(() => Math.random() - 0.5)
    setGameContent(shuffled)
    setCurrentContent(shuffled[0])
    setContentIndex(0)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "shuffle-content",
        payload: { gameContent: shuffled, currentContent: shuffled[0] }
      })
    }
  }

  const toggleTimer = () => {
    playSound("click")
    const nextActive = !timerActive
    setTimerActive(nextActive)
    const nextTimeLeft = !nextActive && timerEnabled ? 30 : timeLeft
    if (!nextActive && timerEnabled) {
      setTimeLeft(30)
    }

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "toggle-timer",
        payload: { timerActive: nextActive, timeLeft: nextTimeLeft }
      })
    }
  }

  const resetTimer = () => {
    playSound("click")
    setTimeLeft(30)
    setTimerActive(false)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "reset-timer"
      })
    }
  }

  const awardPoint = (playerName: string) => {
    playSound("success")
    const newScores = {
      ...playerScores,
      [playerName]: (playerScores[playerName] || 0) + 1,
    }
    setPlayerScores(newScores)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "award-point",
        payload: { playerScores: newScores }
      })
    }
  }

  const castVote = (candidate: string) => {
    if (hasVoted) return
    setHasVoted(true)
    if (socket && roomCode) {
      socket.emit("cast-vote", roomCode, { voter: socket.id, candidate })
    }
  }

  const revealVotes = () => {
    setVotingReveal(true)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "reveal-votes"
      })
    }
  }

  useEffect(() => {
    if (
      gameId === "whos-most-likely" &&
      players.length > 0 &&
      Object.keys(votes).length === players.length &&
      !votingReveal
    ) {
      setVotingReveal(true)
    }
  }, [votes, players.length, gameId, votingReveal])

  const handleEndGame = () => {
    if (currentContent) {
      const tallies: Record<string, number> = {}
      players.forEach(p => tallies[p] = 0)
      Object.values(votes).forEach(candidate => {
        tallies[candidate] = (tallies[candidate] || 0) + 1
      })

      const lastItem = {
        question: currentContent,
        currentPlayer: players[currentPlayer],
        votes: gameId === "whos-most-likely" ? { ...votes } : undefined,
        tallies: gameId === "whos-most-likely" ? tallies : undefined
      }

      setGameHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].question === currentContent) {
          return prev
        }
        return [...prev, lastItem]
      })
    }
    setShowSummary(true)
  }

  const getVoteTally = () => {
    const counts: Record<string, number> = {}
    players.forEach(p => counts[p] = 0)
    Object.values(votes).forEach(candidate => {
      counts[candidate] = (counts[candidate] || 0) + 1
    })
    return counts
  }

  const updateSips = (playerName: string, delta: number) => {
    const nextCount = Math.max(0, (sips[playerName] || 0) + delta)
    const updatedSips = {
      ...sips,
      [playerName]: nextCount
    }
    setSips(updatedSips)
    if (socket && roomCode) {
      socket.emit("sync-sips", roomCode, { playerName, sipsCount: nextCount })
    }
  }

  const triggerReaction = (emoji: string) => {
    if (socket && roomCode) {
      socket.emit("send-reaction", roomCode, { emoji, id: Math.random().toString() })
    }
  }

  const submitCustomPrompt = () => {
    if (!customPromptText.trim()) return
    if (socket && roomCode) {
      socket.emit("anonymous-prompt", roomCode, customPromptText)
    }
    setCustomPromptText("")
    setCustomPromptOpen(false)
  }

  // Special game components
  const specialGameComponents = {
    "cards-against-humanity": CardsAgainstHumanity,
    "indian-drinking-game": IndianDrinkingGame,
    "drama-dol": DramaDol,
  }

  const SpecialGameComponent = specialGameComponents[gameId]
  if (SpecialGameComponent) {
    return (
      <SpecialGameComponent
        players={players}
        onBack={onBack}
        darkMode={darkMode}
        soundEnabled={soundEnabled}
        playSound={playSound}
        matureContent={matureContent}
      />
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-[#e8e5dc] font-sans selection:bg-[#8be8e5] selection:text-black relative overflow-hidden flex items-center justify-center py-12">
        {/* Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#8be8e5] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#c9a7f1] rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-8 text-[#e8e5dc] hover:bg-white/10 hover:text-white rounded-full h-12 px-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-10">
              <h1 className="text-5xl lg:text-7xl font-display font-bold mb-4 uppercase tracking-tighter leading-none">Ready to Play?</h1>
              <p className="text-2xl font-serif italic text-[#f1a7c5]">
                {players.length} players ready for {getGameName(gameId)}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8 text-left">
              <h3 className="font-display font-bold uppercase tracking-tighter text-2xl border-b border-white/10 pb-4 mb-6">
                Players
              </h3>
              <div className="flex flex-wrap gap-3">
                {players.map((player, index) => (
                  <Badge
                    key={index}
                    className={`text-lg px-5 py-2.5 rounded-full font-display uppercase tracking-wider font-semibold border ${
                      index === currentPlayer
                        ? "bg-[#8be8e5] text-black border-transparent"
                        : "bg-white/5 text-[#e8e5dc] border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {index === 0 && <Crown className="w-4 h-4 mr-2 text-[#f1a7c5]" />}
                    {player}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8 text-left">
              <h3 className="flex items-center font-display font-bold uppercase tracking-tighter text-2xl border-b border-white/10 pb-4 mb-6">
                <Settings className="w-5 h-5 mr-2" />
                Game Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-5 h-5 text-[#8be8e5]" />
                    <span className="text-lg font-medium">Enable Timer (30s per turn)</span>
                  </div>
                  <Switch
                    checked={timerEnabled}
                    onCheckedChange={setTimerEnabled}
                    disabled={!isHost}
                    className="data-[state=checked]:bg-[#8be8e5]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-[#c9a7f1]" />
                    <span className="text-lg font-medium">Enable Scoring</span>
                  </div>
                  <Switch
                    checked={showScoring}
                    onCheckedChange={setShowScoring}
                    disabled={!isHost}
                    className="data-[state=checked]:bg-[#c9a7f1]"
                  />
                </div>

                {matureContent && (
                  <div>
                    <label className="block text-sm font-medium mb-3 opacity-60">
                      Content Mode
                    </label>
                    <div className="flex space-x-3">
                      <Button
                        variant={gameMode === "standard" ? "default" : "outline"}
                        size="sm"
                        onClick={() => isHost && setGameMode("standard")}
                        disabled={!isHost}
                        className={`rounded-full h-11 px-6 font-display font-bold uppercase text-xs tracking-wider transition-all ${
                          gameMode === "standard"
                            ? "bg-[#8be8e5] text-black border-transparent"
                            : "border-white/10 text-[#e8e5dc] hover:bg-white/5 bg-transparent"
                        }`}
                      >
                        Standard
                      </Button>
                      <Button
                        variant={gameMode === "challenge" ? "default" : "outline"}
                        size="sm"
                        onClick={() => isHost && setGameMode("challenge")}
                        disabled={!isHost}
                        className={`rounded-full h-11 px-6 font-display font-bold uppercase text-xs tracking-wider transition-all ${
                          gameMode === "challenge"
                            ? "bg-[#c9a7f1] text-black border-transparent"
                            : "border-white/10 text-[#e8e5dc] hover:bg-white/5 bg-transparent"
                        }`}
                      >
                        Challenge
                      </Button>
                      <Button
                        variant={gameMode === "spicy" ? "default" : "outline"}
                        size="sm"
                        onClick={() => isHost && setGameMode("spicy")}
                        disabled={!isHost}
                        className={`rounded-full h-11 px-6 font-display font-bold uppercase text-xs tracking-wider transition-all ${
                          gameMode === "spicy"
                            ? "bg-[#f1a7c5] text-black border-transparent"
                            : "border-white/10 text-[#e8e5dc] hover:bg-white/5 bg-transparent"
                        }`}
                      >
                        Spicy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Rules Preview */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 mb-8 text-left">
              <h3 className="font-display font-bold uppercase tracking-tighter text-2xl border-b border-white/10 pb-4 mb-4">
                Quick Rules for {getGameName(gameId)}
              </h3>
              <div className="text-white/70 leading-relaxed font-medium">{getGameRules(gameId)}</div>
            </div>

            {isHost ? (
              <Button
                onClick={startGame}
                size="lg"
                className="bg-white hover:bg-[#e8e5dc] text-black rounded-full h-16 px-12 font-display uppercase tracking-widest font-bold text-lg w-full max-w-sm inline-flex items-center justify-center btn-press"
              >
                <Play className="w-5 h-5 mr-2 fill-black" />
                Start Game!
              </Button>
            ) : (
              <div className="bg-white/5 border border-white/10 text-[#e8e5dc]/60 py-4 px-8 rounded-2xl font-semibold text-lg inline-block animate-pulse">
                Waiting for Host to start the game...
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-[#1c1c1c] text-[#e8e5dc] font-sans selection:bg-[#8be8e5] selection:text-black relative overflow-hidden py-12 flex flex-col justify-between">
        {/* Background Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#8be8e5] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#c9a7f1] rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl lg:text-7xl font-display font-bold mb-4 uppercase tracking-tighter leading-none">Match Summary</h1>
              <p className="text-2xl font-serif italic text-[#f1a7c5]">
                {getGameName(gameId)}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              {/* Standings / Leaderboard (Left 5 cols) */}
              <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl w-full">
                <h3 className="font-display font-bold uppercase tracking-tighter text-2xl border-b border-white/10 pb-4 mb-6">
                  Standings
                </h3>
                
                <div className="space-y-4">
                  {(() => {
                    const sortedPlayers = [...players].sort((a, b) => {
                      const scoreA = playerScores[a] || 0
                      const scoreB = playerScores[b] || 0
                      if (scoreB !== scoreA) return scoreB - scoreA
                      
                      const sipsA = sips[a] || 0
                      const sipsB = sips[b] || 0
                      return sipsB - sipsA
                    })

                    return sortedPlayers.map((player, index) => {
                      const score = playerScores[player] || 0
                      const sipCount = sips[player] || 0
                      
                      return (
                        <div key={player} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                              index === 0 ? "bg-amber-400 text-black" :
                              index === 1 ? "bg-slate-300 text-black" :
                              index === 2 ? "bg-amber-700 text-white" :
                              "bg-white/10 text-white"
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-display font-medium text-base uppercase tracking-wider flex items-center gap-1.5">
                              {index === 0 && <Crown className="w-4 h-4 text-[#f1a7c5]" />}
                              {player}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            {showScoring && <span className="font-bold text-[#8be8e5] text-sm">{score} pts</span>}
                            <span className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                              <Wine className="w-3 h-3 text-[#c9a7f1]" /> {sipCount} {sipCount === 1 ? 'sip' : 'sips'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Timeline of Questions (Right 7 cols) */}
              <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl w-full">
                <h3 className="font-display font-bold uppercase tracking-tighter text-2xl border-b border-white/10 pb-4 mb-6">
                  Round History
                </h3>

                {gameHistory.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center text-white/40 font-display uppercase tracking-widest text-xs">
                    No rounds played yet
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-white/10 space-y-8 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    {gameHistory.map((item, index) => {
                      return (
                        <div key={index} className="relative">
                          {/* Timeline indicator node */}
                          <div className="absolute -left-[31px] top-1.5 w-[10px] h-[10px] rounded-full bg-[#8be8e5]" />
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#f1a7c5] font-display font-bold uppercase tracking-wider">Round {index + 1}</span>
                              <span className="opacity-60">{item.currentPlayer}'s turn</span>
                            </div>
                            
                            <p className="font-display font-medium text-white text-base leading-snug uppercase tracking-wide">
                              {item.question}
                            </p>

                            {/* Render vote results breakdown if whos-most-likely */}
                            {item.tallies && (
                              <div className="mt-3 bg-white/5 border border-white/5 rounded-xl p-3 space-y-2">
                                <span className="text-[10px] font-display uppercase tracking-widest text-white/50 block">Voting Breakdown:</span>
                                {Object.entries(item.tallies).map(([player, votesCount]) => {
                                  if (votesCount === 0) return null
                                  return (
                                    <div key={player} className="flex justify-between items-center text-xs">
                                      <span className="opacity-80 uppercase tracking-wider font-display">{player}</span>
                                      <span className="font-bold text-[#8be8e5]">{votesCount} {votesCount === 1 ? 'vote' : 'votes'}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="text-center mt-auto">
            <Button
              onClick={onBack}
              size="lg"
              className="bg-white hover:bg-[#e8e5dc] text-black rounded-full h-16 px-12 font-display uppercase tracking-widest font-bold text-lg w-full max-w-sm inline-flex items-center justify-center btn-press shadow-xl"
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-[#e8e5dc] font-sans selection:bg-[#8be8e5] selection:text-black relative overflow-hidden flex flex-col justify-between py-8">
      {/* Background Shapes */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#8be8e5] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#c9a7f1] rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-pulse pointer-events-none"></div>

      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: "100vh", opacity: 1, scale: 0.8 }}
            animate={{ y: "-10vh", opacity: 0, scale: 1.5 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-6xl"
            style={{ left: `${r.x}%`, bottom: "10px" }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10 flex-1 flex flex-col justify-between max-w-4xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleEndGame}
            className="text-[#e8e5dc] hover:bg-white/10 hover:text-white rounded-full h-12 px-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            End Game
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-display font-bold uppercase tracking-tighter leading-none">{getGameName(gameId)}</h1>
            <p className="text-lg font-serif italic text-[#f1a7c5] mt-1">{players[currentPlayer]}'s turn</p>
            {gameMode === "spicy" && (
              <Badge className="bg-[#f1a7c5] text-black border-transparent font-display font-semibold uppercase text-xs px-3 py-1 rounded-full mt-2">Spicy Mode</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaderboard(true)}
              className="rounded-full border-white/10 hover:bg-white/5 text-[#e8e5dc] h-12 px-6"
            >
              <TrophyIcon className="w-5 h-5 mr-2 text-[#f1a7c5]" />
              Scores
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center gap-6">
          
          {/* Active Player banner */}
          <div className="text-center mb-2">
            <Badge className="bg-[#c9a7f1] text-black text-lg px-6 py-2 rounded-full font-display font-bold uppercase tracking-wider">
              {players[currentPlayer]}'s Turn
            </Badge>
          </div>

          {/* Timer (optional) */}
          {timerEnabled && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 max-w-md mx-auto w-full mb-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold uppercase tracking-wider text-sm">Time Remaining</span>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={toggleTimer} className="text-white hover:bg-white/10">
                    {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={resetTimer} className="text-white hover:bg-white/10">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Progress
                value={(timeLeft / 30) * 100}
                className="h-3 bg-white/10"
              />
              <div className="text-center mt-2 font-display font-bold text-2xl text-[#8be8e5]">{timeLeft}s</div>
            </div>
          )}

          {/* Game Question Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-center shadow-2xl relative max-w-3xl mx-auto w-full">
            <div className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-white tracking-tight leading-snug uppercase max-w-2xl">
              {currentContent}
            </div>
            
            {/* Real-time voting for Whos Most Likely To */}
            {gameId === "whos-most-likely" && (
              <div className="mt-8 border-t border-white/10 pt-6 w-full max-w-md mx-auto">
                <h4 className="text-sm font-display uppercase tracking-wider mb-4 text-[#f1a7c5]">
                  {votingReveal ? "Voting Results!" : "Cast Your Vote:"}
                </h4>
                
                {!votingReveal ? (
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((player) => {
                      const voterSocketId = socket?.id || ""
                      const hasVotedForThis = votes[voterSocketId] === player
                      return (
                        <Button
                          key={player}
                          onClick={() => castVote(player)}
                          disabled={hasVoted}
                          className={`h-11 rounded-xl border font-display uppercase tracking-wider font-semibold text-xs ${
                            hasVotedForThis 
                              ? "bg-[#8be8e5] text-black border-transparent" 
                              : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                          }`}
                        >
                          {player}
                        </Button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const tallies = getVoteTally()
                      const maxVotes = Math.max(...Object.values(tallies), 0)
                      return players.map((player) => {
                        const count = tallies[player] || 0
                        const isWinner = count > 0 && count === maxVotes
                        return (
                          <div key={player} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                            <span className="font-display font-medium uppercase text-xs tracking-wider flex items-center gap-1">
                              {isWinner && <Crown className="w-4 h-4 text-[#f1a7c5]" />}
                              {player}
                            </span>
                            <span className="font-bold text-[#8be8e5] text-sm">{count} {count === 1 ? 'vote' : 'votes'}</span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}

                {isHost && !votingReveal && (
                  <Button
                    onClick={revealVotes}
                    disabled={Object.keys(votes).length === 0}
                    className="w-full h-12 mt-6 bg-[#c9a7f1] hover:bg-[#b08ce0] text-black font-display uppercase font-bold rounded-xl text-xs tracking-wider"
                  >
                    Reveal Votes ({Object.keys(votes).length} Cast)
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Game Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto w-full mt-4 sm:mt-6">
            <Button
              onClick={skipContent}
              variant="outline"
              size="lg"
              className="h-12 sm:h-16 text-sm sm:text-lg border-white/10 text-[#e8e5dc] hover:bg-white/5 bg-transparent rounded-full font-display uppercase tracking-wider font-semibold flex-1"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip
            </Button>

            <Button
              onClick={nextTurn}
              size="lg"
              className="h-12 sm:h-16 text-sm sm:text-lg bg-[#8be8e5] hover:bg-[#68d8d5] text-black rounded-full font-display uppercase tracking-widest font-bold flex-1 shadow-lg shadow-[#8be8e5]/20 btn-press"
            >
              <Play className="w-5 h-5 mr-2 fill-black" />
              Next Turn
            </Button>

            <Button
              onClick={shuffleContent}
              variant="outline"
              size="lg"
              className="h-12 sm:h-16 text-sm sm:text-lg border-white/10 text-[#e8e5dc] hover:bg-white/5 bg-transparent rounded-full font-display uppercase tracking-wider font-semibold flex-1"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Shuffle
            </Button>
          </div>
        </main>

        {/* Footer Player Badges row */}
        <footer className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-wrap justify-center gap-3">
            {players.map((player, index) => (
              <Badge
                key={player}
                className={`text-sm px-4 py-2 rounded-full font-display uppercase tracking-wider font-semibold border ${
                  index === currentPlayer
                    ? "bg-[#8be8e5] text-black border-transparent"
                    : "bg-white/5 text-[#e8e5dc] border-white/10"
                }`}
              >
                {player}
                {showScoring && <span className="ml-2 text-xs opacity-70">({playerScores[player] || 0})</span>}
              </Badge>
            ))}
          </div>
        </footer>
      </div>

      {/* Floating Reactions Tray */}
      <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-40 bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-2.5 shadow-2xl">
        {["🔥", "😂", "🍺", "😈", "💀"].map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            onClick={() => triggerReaction(emoji)}
            className="w-12 h-12 rounded-full hover:bg-white/10 text-2xl p-0 flex items-center justify-center btn-press bg-transparent border-0"
          >
            {emoji}
          </Button>
        ))}
      </div>

      {/* Collapsible Leaderboard Drawer */}
      <AnimatePresence>
        {showLeaderboard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-[#1c1c1c] border-l border-white/10 z-50 p-6 flex flex-col text-[#e8e5dc] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">Leaderboard</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowLeaderboard(false)} className="text-[#e8e5dc] hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {players.map((player, index) => (
                  <div key={player} className="flex flex-col gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-medium uppercase text-sm tracking-wider flex items-center gap-1.5">
                        {index === 0 && <Crown className="w-4 h-4 text-[#f1a7c5]" />}
                        {player}
                      </span>
                      {showScoring && <span className="text-[#8be8e5] font-bold font-display text-sm">{playerScores[player] || 0} pts</span>}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 border-t border-white/5 pt-2">
                      <span className="text-xs opacity-60 flex items-center gap-1">
                        <Wine className="w-3.5 h-3.5 text-[#c9a7f1]" /> Sips Taken:
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 rounded-full hover:bg-white/10 p-0 text-white/60"
                          onClick={() => updateSips(player, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-[#c9a7f1] text-sm">{sips[player] || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 rounded-full hover:bg-white/10 p-0 text-white/60"
                          onClick={() => updateSips(player, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Dares button */}
              <Button
                onClick={() => {
                  setShowLeaderboard(false)
                  setCustomPromptOpen(true)
                }}
                className="w-full h-14 mt-6 bg-[#c9a7f1] hover:bg-[#b08ce0] text-black font-display uppercase font-bold rounded-xl tracking-widest text-xs btn-press"
              >
                Submit Custom Dare
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Anonymous Prompt Input Drawer */}
      <AnimatePresence>
        {customPromptOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomPromptOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Input Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 m-auto w-full max-w-md h-fit bg-[#1c1c1c] border border-white/10 rounded-[2.5rem] p-8 z-50 text-[#e8e5dc] flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">Submit Spicy Scenario</h3>
                <Button variant="ghost" size="icon" onClick={() => setCustomPromptOpen(false)} className="text-[#e8e5dc] hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-sm opacity-60 font-medium">
                Type in an anonymous truth, dare, or scenario. It will be randomly shuffled into the deck to surprise players!
              </p>

              <textarea
                placeholder="e.g., Never have I ever kissed someone in this room..."
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 h-28 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f1a7c5] resize-none"
              />

              <Button
                onClick={submitCustomPrompt}
                className="w-full h-14 bg-[#f1a7c5] hover:bg-[#d58ea9] text-black font-display uppercase tracking-widest font-bold rounded-xl btn-press text-xs"
              >
                Submit Daringly
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function getGameName(gameId: string): string {
  const names: Record<string, string> = {
    "never-have-i-ever": "Never Have I Ever",
    "truth-or-dare": "Truth or Dare",
    "whos-most-likely": "Who's Most Likely To",
    "would-you-rather": "Would You Rather",
    "if-you-had-to": "If You Had To",
    "drink-if": "Drink If",
    "hot-seat": "Hot Seat",
    paranoia: "Paranoia",
    "kiss-marry-kill": "Kiss Marry Kill",
    "spin-the-bottle": "Spin the Bottle",
    "rapid-fire": "Rapid Fire",
    "strip-or-sip": "Strip or Sip",
    "emoji-decode": "Emoji Decode",
    "role-roulette": "Role Roulette",
    "indian-drinking-game": "Ultimate Indian Drinking Game",
    "drama-dol": "Drama-Dol Act or Get Sloshed",
    "cards-against-humanity": "Cards Against Humanity",
    "custom-game": "Custom Game",
  }
  return names[gameId] || "Party Game"
}

function getGameRules(gameId: string): string {
  const rules: Record<string, string> = {
    "never-have-i-ever":
      "Players take turns saying something they've never done. Anyone who HAS done it must drink or take a penalty!",
    "truth-or-dare": "Choose truth to answer a question honestly, or dare to complete a challenge. No backing down!",
    "whos-most-likely":
      "Read a scenario and everyone points to who they think is most likely to do it. The person with the most votes drinks!",
    "would-you-rather": "Choose between two difficult options. Discuss your choices and see who agrees!",
    "if-you-had-to": "Complete hypothetical scenarios with creative solutions. The most creative answer wins!",
    "drink-if": "Read statements and drink if they apply to you. Simple but effective!",
    "hot-seat": "One player sits in the hot seat while everyone else asks them questions. No question is off limits!",
    paranoia: "Whisper a question about someone in the group. They hear the answer but not the question!",
    "kiss-marry-kill": "Choose what you'd do with three people/characters. Classic dilemma game!",
    "spin-the-bottle": "Spin and see where fate takes you. Digital bottle, real consequences!",
    "rapid-fire": "Quick questions, quick answers. Keep the energy high and the responses flowing!",
    "strip-or-sip": "Choose your consequence - remove an item of clothing or take a drink!",
    "emoji-decode": "Guess the phrase, movie, or song from clues. Test your skills!",
    "role-roulette": "Act out random characters and scenarios. Let your creativity shine!",
    "custom-game": "Create your own rules and content. Make it as wild or tame as you want!",
  }

  return rules[gameId] || "Get ready for an amazing party game experience!"
}


