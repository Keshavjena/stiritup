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
  Wine,
  Sparkles
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

function getTimerDuration(gameId: string): number {
  if (gameId === "rapid-fire") return 10
  return 30
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

  const [aiEnabled, setAiEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bottleRotation, setBottleRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinTargetPlayer, setSpinTargetPlayer] = useState("")
  const [kmkSelections, setKmkSelections] = useState<Record<string, string>>({ kiss: "", marry: "", kill: "" })
  const [customDeck, setCustomDeck] = useState<string[]>([])
  const [newCustomPrompt, setNewCustomPrompt] = useState("")

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
    const fetchQuestions = async () => {
      if (roomCode && !isHost) {
        setIsLoading(true)
        return
      }

      setIsLoading(true)
      let fetchedQuestions: string[] = []
      try {
        const res = await fetch(`/api/questions?gameId=${gameId}&mature=${matureContent}&mode=${gameMode}&ai=${aiEnabled}`)
        if (res.ok) {
          const data = await res.json()
          if (data.questions && data.questions.length > 0) {
            fetchedQuestions = data.questions
          }
        }
      } catch (err) {
        console.error("Error fetching questions from API:", err)
      }
      
      if (fetchedQuestions.length === 0) {
        fetchedQuestions = getGameContent(gameId, matureContent, gameMode)
      }

      if (gameId === "custom-game") {
        setCustomDeck(fetchedQuestions)
      }

      setGameContent(fetchedQuestions)
      if (fetchedQuestions.length > 0) {
        setCurrentContent(fetchedQuestions[0])
      }
      setContentIndex(0)
      setIsLoading(false)

      if (roomCode && isHost && socket && fetchedQuestions.length > 0) {
        socket.emit("game-action", roomCode, {
          type: "sync-questions",
          payload: { gameContent: fetchedQuestions, currentContent: fetchedQuestions[0] }
        })
      }
    }

    fetchQuestions()

    // Initialize player scores
    const scores: Record<string, number> = {}
    players.forEach((player) => {
      scores[player] = 0
    })
    setPlayerScores(scores)
  }, [gameId, matureContent, gameMode, players, aiEnabled, isHost, roomCode, socket])

  useEffect(() => {
    if (!socket) return

    socket.on("game-action", (action) => {
      if (action.type === "start-game") {
        setGameMode(action.payload.gameMode)
        setTimerEnabled(action.payload.timerEnabled)
        setShowScoring(action.payload.showScoring)
        setAiEnabled(action.payload.aiEnabled || false)
        setGameStarted(true)
        if (action.payload.timerEnabled) {
          setTimeLeft(getTimerDuration(gameIdRef.current))
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
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setSpinTargetPlayer("")
        setBottleRotation(0)
        if (timerEnabled) {
          setTimeLeft(getTimerDuration(activeGameId))
          setTimerActive(true)
        }
      } else if (action.type === "skip-content") {
        setContentIndex(action.payload.contentIndex)
        setCurrentContent(action.payload.currentContent)
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setSpinTargetPlayer("")
        setBottleRotation(0)
      } else if (action.type === "shuffle-content") {
        setGameContent(action.payload.gameContent)
        setCurrentContent(action.payload.currentContent)
        setContentIndex(0)
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setSpinTargetPlayer("")
        setBottleRotation(0)
      } else if (action.type === "award-point") {
        setPlayerScores(action.payload.playerScores)
      } else if (action.type === "toggle-timer") {
        setTimerActive(action.payload.timerActive)
        setTimeLeft(action.payload.timeLeft)
      } else if (action.type === "reset-timer") {
        setTimeLeft(getTimerDuration(gameIdRef.current))
        setTimerActive(false)
      } else if (action.type === "reveal-votes") {
        setVotingReveal(true)
      } else if (action.type === "end-game") {
        if (currentContentRef.current) {
          const prevVotes = votesRef.current
          const prevPlayers = playersRef.current
          const activeGameId = gameIdRef.current
          
          const tallies: Record<string, number> = {}
          prevPlayers.forEach(p => tallies[p] = 0)
          Object.values(prevVotes).forEach(candidate => {
            tallies[candidate] = (tallies[candidate] || 0) + 1
          })

          const lastItem = {
            question: currentContentRef.current,
            currentPlayer: prevPlayers[currentPlayerRef.current],
            votes: activeGameId === "whos-most-likely" ? { ...prevVotes } : undefined,
            tallies: activeGameId === "whos-most-likely" ? tallies : undefined
          }

          setGameHistory((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].question === currentContentRef.current) {
              return prev
            }
            return [...prev, lastItem]
          })
        }
        setShowSummary(true)
      } else if (action.type === "spin-bottle") {
        setBottleRotation(action.payload.targetAngle)
        setIsSpinning(true)
        setSpinTargetPlayer("")
        playSound("transition")
        setTimeout(() => {
          setIsSpinning(false)
          setSpinTargetPlayer(playersRef.current[action.payload.targetIdx])
          playSound("success")
        }, 3000)
      } else if (action.type === "sync-questions") {
        setGameContent(action.payload.gameContent)
        setCurrentContent(action.payload.currentContent)
        setContentIndex(0)
        setIsLoading(false)
      } else if (action.type === "add-custom-prompt") {
        setCustomDeck(prev => [...prev, action.payload])
      } else if (action.type === "remove-custom-prompt") {
        setCustomDeck(prev => prev.filter((_, idx) => idx !== action.payload))
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
            return getTimerDuration(gameIdRef.current)
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft, playSound])

  const startGame = () => {
    playSound("success")
    
    let activeContent = gameContent
    if (gameId === "custom-game") {
      activeContent = customDeck
      setGameContent(customDeck)
      if (customDeck.length > 0) {
        setCurrentContent(customDeck[0])
      }
    }
    
    setGameStarted(true)
    if (timerEnabled) {
      setTimeLeft(getTimerDuration(gameId))
      setTimerActive(true)
    }
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "start-game",
        payload: { gameMode, matureContent, timerEnabled, showScoring, aiEnabled }
      })
      if (gameId === "custom-game" && customDeck.length > 0) {
        socket.emit("game-action", roomCode, {
          type: "sync-questions",
          payload: { gameContent: customDeck, currentContent: customDeck[0] }
        })
      }
    }
  }

  const handleAddCustomPrompt = () => {
    if (!newCustomPrompt.trim()) return
    const text = newCustomPrompt.trim()
    setCustomDeck(prev => [...prev, text])
    setNewCustomPrompt("")
    
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "add-custom-prompt",
        payload: text
      })
    }
  }

  const handleRemoveCustomPrompt = (index: number) => {
    setCustomDeck(prev => prev.filter((_, idx) => idx !== index))
    
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "remove-custom-prompt",
        payload: index
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

    const nextContentIndex = contentIndex + 1
    if (nextContentIndex >= gameContent.length) {
      handleEndGame()
      if (socket && roomCode) {
        socket.emit("game-action", roomCode, {
          type: "end-game"
        })
      }
      return
    }

    const nextPlayer = (currentPlayer + 1) % players.length
    const nextContentStr = gameContent[nextContentIndex]
    
    setCurrentPlayer(nextPlayer)
    setContentIndex(nextContentIndex)
    setCurrentContent(nextContentStr)
    setVotes({})
    setHasVoted(false)
    setVotingReveal(false)
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setSpinTargetPlayer("")
    setBottleRotation(0)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "next-turn",
        payload: { currentPlayer: nextPlayer, contentIndex: nextContentIndex, currentContent: nextContentStr }
      })
    }

    if (timerEnabled) {
      setTimeLeft(getTimerDuration(gameId))
      setTimerActive(true)
    }
  }

  const skipContent = () => {
    playSound("click")
    const newIndex = contentIndex + 1
    if (newIndex >= gameContent.length) {
      handleEndGame()
      if (socket && roomCode) {
        socket.emit("game-action", roomCode, {
          type: "end-game"
        })
      }
      return
    }

    const nextContentStr = gameContent[newIndex]
    setContentIndex(newIndex)
    setCurrentContent(nextContentStr)
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setSpinTargetPlayer("")
    setBottleRotation(0)

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
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setSpinTargetPlayer("")
    setBottleRotation(0)

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
    const nextTimeLeft = !nextActive && timerEnabled ? getTimerDuration(gameId) : timeLeft
    if (!nextActive && timerEnabled) {
      setTimeLeft(getTimerDuration(gameId))
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
    setTimeLeft(getTimerDuration(gameId))
    setTimerActive(false)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "reset-timer"
      })
    }
  }

  const spinBottle = () => {
    if (isSpinning) return
    setIsSpinning(true)
    playSound("transition")
    
    const otherPlayers = players.filter((_, idx) => idx !== currentPlayer)
    const target = otherPlayers.length > 0 
      ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
      : players[Math.floor(Math.random() * players.length)]
      
    setSpinTargetPlayer("")
    
    const targetIdx = players.indexOf(target)
    const degreesPerPlayer = 360 / players.length
    const targetAngle = 1800 + (targetIdx * degreesPerPlayer)
    
    setBottleRotation(targetAngle)
    
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "spin-bottle",
        payload: { targetIdx, targetAngle }
      })
    }
    
    setTimeout(() => {
      setIsSpinning(false)
      setSpinTargetPlayer(target)
      playSound("success")
    }, 3000)
  }

  const getKMKOptions = () => {
    const kmkMatch = currentContent.match(/Choose between:?\s*(.+?),\s*(.+?),\s*and\s*(.+?)\s*for Kiss/i) || currentContent.match(/Choose between:?\s*(.+?),\s*(.+?),\s*and\s*(.+?)\./i)
    if (kmkMatch) {
      return [kmkMatch[1].trim(), kmkMatch[2].trim(), kmkMatch[3].trim()]
    }
    return null
  }

  const selectKMK = (option: string, role: "kiss" | "marry" | "kill") => {
    setKmkSelections(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(k => {
        if (updated[k] === option) {
          updated[k] = ""
        }
      })
      updated[role] = option
      return updated
    })
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
    const reactionId = Math.random().toString()
    const newReact = { emoji, id: reactionId }
    if (socket && roomCode) {
      socket.emit("send-reaction", roomCode, newReact)
    } else {
      // Local fallback for local play
      const id = reactionId
      const newReaction = {
        id,
        emoji: emoji,
        x: Math.floor(Math.random() * 60) + 20,
        y: 100
      }
      setReactions((prev) => [...prev, newReaction])
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id))
      }, 3000)
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
  const specialGameComponents: Record<string, any> = {
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
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col items-center justify-center py-12 w-full">
        <div className="container mx-auto px-6 relative z-10 w-full max-w-xl">
          <div className="text-center w-full">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-8 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg h-9 px-4 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold mb-2 uppercase tracking-tight text-white">Ready to Play?</h1>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                {players.length} players ready for {getGameName(gameId)}
              </p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mb-6 text-left w-full shadow-lg">
              <h3 className="font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-4 text-zinc-300">
                Players
              </h3>
              <div className="flex flex-wrap gap-2">
                {players.map((player, index) => (
                  <Badge
                    key={index}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider border ${
                      index === currentPlayer
                        ? "bg-zinc-100 text-black border-transparent"
                        : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {index === 0 && <Crown className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
                    {player}
                  </Badge>
                ))}
              </div>
            </div>

            {gameId === "custom-game" && (
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mb-6 text-left w-full shadow-lg">
                <h3 className="font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-4 text-zinc-300">
                  Custom Game Deck Builder
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a custom prompt, rule, or action..."
                      value={newCustomPrompt}
                      onChange={(e) => setNewCustomPrompt(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-10 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomPrompt();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddCustomPrompt}
                      className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase text-[10px] px-4 rounded-xl border-0 h-10 transition-colors"
                    >
                      Add Prompt
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {customDeck.length === 0 ? (
                      <p className="text-zinc-650 text-xs font-semibold">Deck is empty. Add custom prompts to start!</p>
                    ) : (
                      customDeck.map((promptText, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800 text-[11px] font-semibold text-zinc-300">
                          <span className="truncate flex-1 pr-3 text-left">{promptText}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomPrompt(idx)}
                            className="text-red-500 hover:text-red-400 hover:bg-transparent h-7 px-2 border-0"
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block mt-1">Total prompts in deck: {customDeck.length}</span>
                </div>
              </div>
            )}

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mb-6 text-left w-full shadow-lg">
              <h3 className="flex items-center font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-4 text-zinc-300">
                <Settings className="w-4 h-4 mr-1.5 text-zinc-500" />
                Game Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Enable Timer (30s per turn)</span>
                  </div>
                  <Switch
                    checked={timerEnabled}
                    onCheckedChange={setTimerEnabled}
                    disabled={!isHost}
                    className="data-[state=checked]:bg-zinc-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Enable Scoring</span>
                  </div>
                  <Switch
                    checked={showScoring}
                    onCheckedChange={setShowScoring}
                    disabled={!isHost}
                    className="data-[state=checked]:bg-zinc-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Enable Groq AI Questions</span>
                  </div>
                  <Switch
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                    disabled={!isHost}
                    className="data-[state=checked]:bg-zinc-100"
                  />
                </div>

                {matureContent && (
                  <div className="pt-2 border-t border-zinc-900">
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-500">
                      Content Mode
                    </label>
                    <div className="flex space-x-2">
                      {(["standard", "challenge", "spicy"] as const).map((mode) => {
                        const active = gameMode === mode
                        const labels = { standard: "Standard", challenge: "Challenge", spicy: "Spicy" }
                        return (
                          <Button
                            key={mode}
                            variant={active ? "default" : "outline"}
                            size="sm"
                            onClick={() => isHost && setGameMode(mode)}
                            disabled={!isHost}
                            className={`rounded-lg h-9 px-4 font-bold uppercase text-[10px] tracking-wider transition-colors ${
                              active
                                ? "bg-zinc-100 text-black border-transparent"
                                : "border-zinc-800 text-zinc-400 hover:bg-zinc-900 bg-transparent"
                            }`}
                          >
                            {labels[mode]}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Rules Preview */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 mb-6 text-left w-full shadow-lg">
              <h3 className="font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-3 text-zinc-300">
                Quick Rules for {getGameName(gameId)}
              </h3>
              <div className="text-zinc-400 leading-relaxed text-xs font-semibold">{getGameRules(gameId)}</div>
            </div>

            {isHost ? (
              <Button
                onClick={startGame}
                size="lg"
                className="bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl h-12 px-8 font-bold uppercase tracking-wider text-xs w-full max-w-sm inline-flex items-center justify-center border-0 transition-colors"
              >
                <Play className="w-4 h-4 mr-1.5 fill-black" />
                Start Game!
              </Button>
            ) : (
              <div className="bg-zinc-900/30 border border-zinc-800 text-zinc-500 py-3 px-6 rounded-xl font-bold uppercase text-xs tracking-wider inline-block">
                Waiting for Host to start...
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white py-12 flex flex-col justify-between">
        <div className="container mx-auto px-6 relative z-10 max-w-4xl flex-1 flex flex-col justify-between w-full">
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold mb-1 uppercase tracking-tight text-white">Match Summary</h1>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                {getGameName(gameId)}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
              {/* Standings / Leaderboard */}
              <div className="lg:col-span-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 shadow-xl w-full">
                <h3 className="font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-4 text-zinc-300">
                  Standings
                </h3>
                
                <div className="space-y-3">
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
                        <div key={player} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                          <div className="flex items-center space-x-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              index === 0 ? "bg-zinc-100 text-black font-extrabold" : "bg-zinc-800 text-zinc-400"
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                              {player}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            {showScoring && <span className="font-bold text-zinc-300 text-xs">{score} pts</span>}
                            <span className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
                              {sipCount} {sipCount === 1 ? 'sip' : 'sips'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Timeline of Questions */}
              <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 shadow-xl w-full">
                <h3 className="font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-3 mb-4 text-zinc-300">
                  Round History
                </h3>

                {gameHistory.length === 0 ? (
                  <div className="p-6 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-650 font-bold uppercase tracking-wider text-[10px]">
                    No rounds played yet
                  </div>
                ) : (
                  <div className="relative pl-5 border-l border-zinc-800 space-y-6 max-h-[45vh] overflow-y-auto pr-1">
                    {gameHistory.map((item, index) => {
                      return (
                        <div key={index} className="relative">
                          {/* Timeline indicator node */}
                          <div className="absolute -left-[24.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                              <span>Round {index + 1}</span>
                              <span>{item.currentPlayer}'s turn</span>
                            </div>
                            
                            <p className="font-bold text-zinc-200 text-xs leading-relaxed uppercase tracking-wider">
                              {item.question}
                            </p>

                            {/* Render vote results breakdown if whos-most-likely */}
                            {item.tallies && (
                              <div className="mt-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 space-y-1.5">
                                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Voting Breakdown</span>
                                {Object.entries(item.tallies).map(([player, votesCount]) => {
                                  if (votesCount === 0) return null
                                  return (
                                    <div key={player} className="flex justify-between items-center text-[10px]">
                                      <span className="font-bold text-zinc-400 uppercase tracking-wider">{player}</span>
                                      <span className="font-bold text-zinc-300">{votesCount} {votesCount === 1 ? 'vote' : 'votes'}</span>
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
          <div className="text-center mt-6">
            <Button
              onClick={onBack}
              size="lg"
              className="bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl h-11 px-8 font-bold uppercase tracking-wider text-xs w-full max-w-sm inline-flex items-center justify-center border-0 transition-colors shadow-md"
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col justify-between py-6">
      
      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: "100vh", opacity: 1, scale: 0.8 }}
            animate={{ y: "-10vh", opacity: 0, scale: 1.2 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute text-5xl"
            style={{ left: `${r.x}%`, bottom: "10px" }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10 flex-1 flex flex-col justify-between max-w-4xl w-full">
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleEndGame}
            className="rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-3 text-[9px] uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            End Game
          </Button>

          <div className="text-center">
            <h1 className="text-lg font-bold uppercase tracking-tight text-white leading-none">{getGameName(gameId)}</h1>
            <p className="text-xs text-zinc-450 uppercase tracking-wider font-semibold mt-1">{players[currentPlayer]}'s turn</p>
            {gameMode === "spicy" && (
              <Badge className="bg-red-950/40 text-red-400 border border-red-900/30 font-bold uppercase text-[8px] px-2 py-0.5 rounded-md mt-1.5">Spicy Mode</Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLeaderboard(true)}
              className="rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 h-8 px-3 text-[9px] uppercase tracking-wider"
            >
              Scores
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center gap-5 w-full">
          
          {/* Active Player banner */}
          <div className="text-center mb-1">
            <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-4 py-1.5 rounded-xl uppercase tracking-wider font-bold">
              {players[currentPlayer]}'s Turn
            </Badge>
          </div>

          {/* Timer (optional) */}
          {timerEnabled && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 max-w-sm mx-auto w-full mb-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Time Remaining</span>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={toggleTimer} className="text-zinc-400 hover:text-white w-6 h-6 p-0 hover:bg-zinc-800">
                    {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={resetTimer} className="text-zinc-400 hover:text-white w-6 h-6 p-0 hover:bg-zinc-800">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <Progress
                value={(timeLeft / getTimerDuration(gameId)) * 100}
                className="h-2 bg-zinc-900"
              />
              <div className="text-center mt-1.5 font-mono font-bold text-xl text-zinc-300">{timeLeft}s</div>
            </div>
          )}

          {/* Game Question Card */}
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 sm:p-10 min-h-[220px] flex flex-col items-center justify-center text-center shadow-xl relative max-w-3xl mx-auto w-full">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight uppercase max-w-2xl leading-normal">
                  {currentContent}
                </div>
                
                {/* Interactive Kiss Marry Kill */}
                {(() => {
                  const kmkOptionsList = getKMKOptions()
                  if (gameId === "kiss-marry-kill" && kmkOptionsList) {
                    const [o1, o2, o3] = kmkOptionsList
                    return (
                      <div className="mt-6 border-t border-zinc-900 pt-5 w-full max-w-md mx-auto space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-zinc-500">
                          Assign choices
                        </h4>
                        <div className="space-y-2">
                          {[o1, o2, o3].map((opt) => {
                            const currentRole = Object.keys(kmkSelections).find(k => kmkSelections[k] === opt)
                            return (
                              <div key={opt} className="p-2.5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
                                <span className="font-bold text-[11px] text-left uppercase tracking-wider text-zinc-300 flex-1">{opt}</span>
                                <div className="flex gap-1.5">
                                  {(['kiss', 'marry', 'kill'] as const).map((role) => {
                                    const labels = { kiss: "Kiss", marry: "Marry", kill: "Kill" }
                                    const isSelected = kmkSelections[role] === opt
                                    return (
                                      <Button
                                        key={role}
                                        size="sm"
                                        onClick={() => selectKMK(opt, role)}
                                        className={`h-8 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors ${
                                          isSelected 
                                            ? "bg-zinc-100 text-black border-transparent" 
                                            : "border border-zinc-800 bg-transparent text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                        }`}
                                      >
                                        {labels[role]}
                                      </Button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}

                {/* Interactive Spin the Bottle */}
                {gameId === "spin-the-bottle" && (
                  <div className="mt-6 flex flex-col items-center justify-center relative min-h-[200px] w-full">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: bottleRotation }}
                        transition={{ duration: 3, ease: "easeOut" }}
                        className="w-12 h-12 flex items-center justify-center cursor-pointer select-none z-10"
                        onClick={spinBottle}
                      >
                        <span className="text-5xl select-none filter drop-shadow-md">🍾</span>
                      </motion.div>
                      
                      {players.map((player, idx) => {
                        const angle = (idx * 360) / players.length
                        const radius = 70
                        const x = Math.sin((angle * Math.PI) / 180) * radius
                        const y = -Math.cos((angle * Math.PI) / 180) * radius
                        const isTarget = player === spinTargetPlayer
                        const isCurrent = player === players[currentPlayer]
                        
                        return (
                          <div
                            key={player}
                            className={`absolute px-2.5 py-0.5 rounded-full border text-[8px] font-bold uppercase transition-all duration-300 ${
                              isTarget 
                                ? "bg-zinc-100 text-black border-transparent scale-105 shadow-md" 
                                : isCurrent 
                                ? "bg-zinc-800 border-zinc-700 text-zinc-300"
                                : "bg-zinc-950 text-zinc-600 border-zinc-900"
                            }`}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          >
                            {player}
                          </div>
                        )
                      })}
                    </div>
                    
                    <Button
                      onClick={spinBottle}
                      disabled={isSpinning}
                      className="mt-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-lg px-4 h-8 text-[9px] tracking-wider border-0 transition-colors"
                    >
                      {isSpinning ? "Spinning..." : "Tap Bottle to Spin!"}
                    </Button>
                    
                    {spinTargetPlayer && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-center"
                      >
                        <p className="font-bold text-[10px] uppercase text-zinc-400">
                          Points to {spinTargetPlayer}!
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
                
                {/* Real-time voting for Whos Most Likely To */}
                {gameId === "whos-most-likely" && (
                  <div className="mt-6 border-t border-zinc-900 pt-5 w-full max-w-md mx-auto">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3 text-zinc-500">
                      {votingReveal ? "Voting Results" : "Cast Your Vote"}
                    </h4>
                    
                    {!votingReveal ? (
                      <div className="grid grid-cols-2 gap-2">
                        {players.map((player) => {
                          const voterSocketId = socket?.id || ""
                          const hasVotedForThis = votes[voterSocketId] === player
                          return (
                            <Button
                              key={player}
                              onClick={() => castVote(player)}
                              disabled={hasVoted}
                              className={`h-9 rounded-lg border font-bold uppercase tracking-wider text-[10px] transition-colors ${
                                hasVotedForThis 
                                  ? "bg-zinc-100 text-black border-transparent" 
                                  : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              {player}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const tallies = getVoteTally()
                          const maxVotes = Math.max(...Object.values(tallies), 0)
                          return players.map((player) => {
                            const count = tallies[player] || 0
                            const isWinner = count > 0 && count === maxVotes
                            return (
                              <div key={player} className="flex justify-between items-center p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <span className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5 text-zinc-300">
                                  {player}
                                </span>
                                <span className="font-bold text-zinc-400 text-xs">{count} {count === 1 ? 'vote' : 'votes'}</span>
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
                        className="w-full h-10 mt-4 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-lg text-[10px] tracking-wider border-0 transition-colors"
                      >
                        Reveal Votes ({Object.keys(votes).length} Cast)
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Sip Tracker / Drink Logger directly under question card */}
          {matureContent && (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-5 max-w-3xl mx-auto w-full mt-1 text-center">
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-3 text-zinc-500 flex items-center justify-center gap-1">
                Log Sips For This Round
              </h4>
              <div className="flex flex-wrap justify-center gap-1.5">
                {players.map((player) => {
                  const count = sips[player] || 0
                  return (
                    <Button
                      key={player}
                      onClick={() => updateSips(player, 1)}
                      variant="outline"
                      className="rounded-lg border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 text-zinc-400 flex items-center gap-2 h-8 px-2.5 text-[9px] font-bold uppercase tracking-wider"
                    >
                      <span>{player}</span>
                      <span className="bg-zinc-850 border border-zinc-700 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        {count}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto w-full mt-3">
            <Button
              onClick={skipContent}
              variant="outline"
              size="lg"
              className="h-11 text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl font-bold uppercase tracking-wider flex-1 transition-colors"
            >
              <SkipForward className="w-4 h-4 mr-1.5" />
              Skip
            </Button>

            <Button
              onClick={nextTurn}
              size="lg"
              className="h-11 text-xs bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl font-bold uppercase tracking-wider flex-1 transition-colors"
            >
              <Play className="w-4 h-4 mr-1.5 fill-black" />
              Next Turn
            </Button>

            <Button
              onClick={shuffleContent}
              variant="outline"
              size="lg"
              className="h-11 text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl font-bold uppercase tracking-wider flex-1 transition-colors"
            >
              <Shuffle className="w-4 h-4 mr-1.5" />
              Shuffle
            </Button>
          </div>
        </main>

        {/* Footer Player Badges row */}
        <footer className="mt-6 border-t border-zinc-900 pt-4">
          <div className="flex flex-wrap justify-center gap-2">
            {players.map((player, index) => (
              <Badge
                key={player}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider border ${
                  index === currentPlayer
                    ? "bg-zinc-100 text-black border-transparent"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {player}
                {showScoring && <span className="ml-1.5 text-[10px] text-zinc-500">({playerScores[player] || 0})</span>}
              </Badge>
            ))}
          </div>
        </footer>
      </div>

      {/* Floating Reactions Tray - Sleek Dark Minimalist */}
      <div className="fixed right-4 bottom-20 flex flex-col gap-2 z-40 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-full p-2 shadow-xl">
        {["🔥", "😂", "🍺", "😈", "💀"].map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            onClick={() => triggerReaction(emoji)}
            className="w-10 h-10 rounded-full hover:bg-zinc-850 text-xl p-0 flex items-center justify-center bg-transparent border-0 transition-colors"
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
              animate={{ opacity: 0.4 }}
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
              className="fixed right-0 top-0 bottom-0 w-80 bg-neutral-950 border-l border-zinc-900 z-50 p-6 flex flex-col text-zinc-100 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-350">Leaderboard</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowLeaderboard(false)} className="text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {players.map((player, index) => (
                  <div key={player} className="flex flex-col gap-2.5 p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase text-xs tracking-wider flex items-center gap-1.5 text-zinc-300">
                        {player}
                      </span>
                      {showScoring && <span className="text-zinc-400 font-bold text-xs">{playerScores[player] || 0} pts</span>}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 border-t border-zinc-900 pt-2.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1">
                        Sips Taken
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 rounded-full hover:bg-zinc-850 p-0 text-zinc-500"
                          onClick={() => updateSips(player, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-zinc-300 text-xs font-mono">{sips[player] || 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 rounded-full hover:bg-zinc-850 p-0 text-zinc-500"
                          onClick={() => updateSips(player, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reactions panel in Sidebar */}
              <div className="mt-4 border-t border-zinc-900 pt-3.5 mb-2">
                <h4 className="text-[9px] font-bold uppercase tracking-wider mb-2 text-zinc-500">Quick Reactions</h4>
                <div className="flex justify-between">
                  {["🔥", "😂", "🍺", "😈", "💀"].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      onClick={() => triggerReaction(emoji)}
                      className="w-9 h-9 rounded-full hover:bg-zinc-850 text-lg p-0 flex items-center justify-center bg-transparent border-0 transition-colors"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit Dares button */}
              <Button
                onClick={() => {
                  setShowLeaderboard(false)
                  setCustomPromptOpen(true)
                }}
                className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-xl tracking-wider text-[10px] transition-colors border-0"
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
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomPromptOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Input Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-neutral-950 border border-zinc-800 rounded-2xl p-6 z-50 text-zinc-100 flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Submit Spicy Scenario</h3>
                <Button variant="ghost" size="icon" onClick={() => setCustomPromptOpen(false)} className="text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                Type in an anonymous truth, dare, or scenario. It will be randomly shuffled into the deck to surprise players!
              </p>

              <textarea
                placeholder="e.g., Never have I ever kissed someone in this room..."
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 h-24 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 resize-none text-xs"
              />

              <Button
                onClick={submitCustomPrompt}
                className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-xl transition-colors text-[10px] tracking-wider border-0"
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


