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
  Sparkles,
  Flame,
  CheckCircle,
  HelpCircle,
  Beer
} from "lucide-react"
import { Trophy, Trophy as TrophyIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { CardsAgainstHumanity } from "./cards-against-humanity"
import { IndianDrinkingGame } from "./indian-drinking-game"
import { DramaDol } from "./drama-dol"
import { DraftArenaGame } from "./draft-arena/draft-arena-game"
import { BeerChugAnimation } from "./beer-chug-animation"
import { getGameContent } from "../../lib/game-data/questions"
import { useSocket } from "@/hooks/useSocket"
import { motion, AnimatePresence } from "framer-motion"
import { KMKImageCards, WYRImageCards } from "./image-game-cards"
import { LivePlayersSidebar } from "./live-players-sidebar"

interface GameComponentProps {
  roomCode?: string
  gameId: string
  players: string[]
  myPlayerName?: string
  isHost?: boolean
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
  initialSettings?: {
    category?: string
    gender?: "female" | "male" | "mixed"
    timerDuration?: number
    mode?: "standard" | "challenge" | "spicy"
  }
}

function getTimerDuration(gameId: string): number {
  if (gameId === "rapid-fire") return 10
  return 30
}

export function GameComponent({
  roomCode,
  gameId,
  players,
  myPlayerName = "",
  isHost = false,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
  initialSettings,
}: GameComponentProps) {
  const socket = useSocket()
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [currentContent, setCurrentContent] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [timerDuration, setTimerDuration] = useState<number>(
    initialSettings?.timerDuration !== undefined ? initialSettings.timerDuration : 30
  )
  const [timerEnabled, setTimerEnabled] = useState(
    initialSettings?.timerDuration !== undefined ? initialSettings.timerDuration > 0 : true
  )
  const [autoNextEnabled, setAutoNextEnabled] = useState(true)
  const [timeLeft, setTimeLeft] = useState(
    initialSettings?.timerDuration !== undefined ? initialSettings.timerDuration : 30
  )
  const [timerActive, setTimerActive] = useState(false)
  const [contentIndex, setContentIndex] = useState(0)
  const [gameContent, setGameContent] = useState<string[]>([])
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})
  const [showScoring, setShowScoring] = useState(false)
  const [isLiveSidebarOpen, setIsLiveSidebarOpen] = useState(false)
  const [gameMode, setGameMode] = useState<"standard" | "challenge" | "spicy">(
    initialSettings?.mode || "standard"
  )

  const timerDurationRef = useRef(timerDuration)
  useEffect(() => {
    timerDurationRef.current = timerDuration
  }, [timerDuration])

  const changeTimerDuration = (newDuration: number) => {
    setTimerDuration(newDuration)
    setTimeLeft(newDuration)
    setTimerEnabled(newDuration > 0)
    setTimerActive(newDuration > 0)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "set-timer-duration",
        payload: { duration: newDuration }
      })
    }
  }

  const [kmkGender, setKmkGender] = useState<"female" | "male" | "mixed">(
    initialSettings?.gender || "female"
  )
  const [kmkCategory, setKmkCategory] = useState<string>(
    initialSettings?.category || "all"
  )

  const changeKMKGender = (gender: "female" | "male" | "mixed") => {
    setKmkGender(gender)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "update-kmk-config",
        payload: { kmkGender: gender, kmkCategory }
      })
    }
  }

  const changeKMKCategory = (category: string) => {
    setKmkCategory(category)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "update-kmk-config",
        payload: { kmkGender, kmkCategory: category }
      })
    }
  }

  const [aiEnabled, setAiEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bottleRotation, setBottleRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinTargetPlayer, setSpinTargetPlayer] = useState("")
  const [kmkSelections, setKmkSelections] = useState<Record<string, string>>({ kiss: "", marry: "", kill: "" })
  const [kmkVotes, setKmkVotes] = useState<Record<string, { kiss: string; marry: string; kill: string }>>({})
  const [todChoice, setTodChoice] = useState<"truth" | "dare" | null>(null)
  const [personRounds, setPersonRounds] = useState<any[]>([])
  const [wyrChoice, setWyrChoice] = useState<"A" | "B" | null>(null)
  const [customDeck, setCustomDeck] = useState<string[]>([])
  const [newCustomPrompt, setNewCustomPrompt] = useState("")

  const [sips, setSips] = useState<Record<string, number>>({})
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [customPromptOpen, setCustomPromptOpen] = useState(false)
  const [customPromptText, setCustomPromptText] = useState("")
  const [anonymousPrompts, setAnonymousPrompts] = useState<string[]>([])

  // Chugging Beer Animation state
  const [chugModalOpen, setChugModalOpen] = useState(false)
  const [chugTargetPlayer, setChugTargetPlayer] = useState("")
  const [chugSipsCount, setChugSipsCount] = useState(1)

  const [votes, setVotes] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [votingReveal, setVotingReveal] = useState(false)
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([])

  const [gameHistory, setGameHistory] = useState<{
    question: string
    currentPlayer: string
    votes?: Record<string, string>
    tallies?: Record<string, number>
    kmkVotes?: Record<string, { kiss: string; marry: string; kill: string }>
  }[]>([])
  const [showSummary, setShowSummary] = useState(false)

  // Spice Up Deck / Custom Bulk Names State
  const [isSpiceModalOpen, setIsSpiceModalOpen] = useState(false)
  const [spiceNamesInput, setSpiceNamesInput] = useState("")
  const [spiceCategory, setSpiceCategory] = useState("scientists")
  const [isAddingSpice, setIsAddingSpice] = useState(false)
  const [spiceMessage, setSpiceMessage] = useState<{ text: string; isError?: boolean } | null>(null)

  // Refs to avoid stale closures in socket events
  const currentPlayerRef = useRef(currentPlayer)
  const currentContentRef = useRef(currentContent)
  const votesRef = useRef(votes)
  const kmkVotesRef = useRef(kmkVotes)
  const playersRef = useRef(players)
  const gameIdRef = useRef(gameId)
  const isHostRef = useRef(isHost)

  useEffect(() => {
    kmkVotesRef.current = kmkVotes
  }, [kmkVotes])

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
    isHostRef.current = isHost
  }, [isHost])

  // Question loading effect with non-host fallback to prevent "LOADING..." freeze
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)

      // If in multiplayer and not host, request authoritative state from server
      if (roomCode && !isHost) {
        if (socket) {
          socket.emit("request-game-state", roomCode)
        }
        // Give 2.5s for sync, else fallback
        setTimeout(() => {
          setIsLoading(false)
        }, 2500)
        return
      }

      let fetchedQuestions: string[] = []
      let fetchedRounds: any[] = []
      
      try {
        const res = await fetch(`/api/questions?gameId=${gameId}&mature=${matureContent}&mode=${gameMode}&ai=${aiEnabled}&kmkGender=${kmkGender}&kmkCategory=${kmkCategory}&imageCards=true`)
        if (res.ok) {
          const data = await res.json()
          if (data.questions && data.questions.length > 0) {
            fetchedQuestions = data.questions
          }
          if (data.personRounds && data.personRounds.length > 0) {
            fetchedRounds = data.personRounds
            setPersonRounds(data.personRounds)
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
          payload: {
            gameContent: fetchedQuestions,
            personRounds: fetchedRounds,
            currentContent: fetchedQuestions[0],
            contentIndex: 0,
            currentPlayer: 0
          }
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
  }, [gameId, matureContent, gameMode, players, aiEnabled, kmkGender, kmkCategory, isHost, roomCode, socket])

  useEffect(() => {
    if (!socket) return

    socket.on("game-action", (action) => {
      if (action.type === "request-game-state") {
        if (isHostRef.current && socket && roomCode) {
          socket.emit("game-action", roomCode, {
            type: "sync-questions",
            payload: {
              gameContent,
              currentContent: currentContentRef.current,
              contentIndex,
              currentPlayer: currentPlayerRef.current
            }
          })
        }
      } else if (action.type === "update-kmk-config") {
        if (action.payload.kmkGender) setKmkGender(action.payload.kmkGender)
        if (action.payload.kmkCategory) setKmkCategory(action.payload.kmkCategory)
      } else if (action.type === "set-timer-duration") {
        setTimerDuration(action.payload.duration)
        setTimeLeft(action.payload.duration)
        setTimerEnabled(true)
        setTimerActive(true)
      } else if (action.type === "start-game") {
        setGameMode(action.payload.gameMode)
        setTimerEnabled(action.payload.timerEnabled)
        setAutoNextEnabled(action.payload.autoNextEnabled || false)
        setShowScoring(action.payload.showScoring)
        setAiEnabled(action.payload.aiEnabled || false)
        setGameStarted(true)
        setIsLoading(false)
        if (action.payload.timerEnabled) {
          setTimeLeft(timerDurationRef.current)
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
        setTodChoice(null)
        setWyrChoice(null)
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setKmkVotes({})
        setSpinTargetPlayer("")
        setBottleRotation(0)
        setIsLoading(false)
        setTimeLeft(timerDurationRef.current)
        setTimerActive(true)
      } else if (action.type === "skip-content") {
        setContentIndex(action.payload.contentIndex)
        setCurrentContent(action.payload.currentContent)
        setTodChoice(null)
        setWyrChoice(null)
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setKmkVotes({})
        setSpinTargetPlayer("")
        setBottleRotation(0)
        setIsLoading(false)
        setTimeLeft(timerDurationRef.current)
        setTimerActive(true)
      } else if (action.type === "shuffle-content") {
        setGameContent(action.payload.gameContent)
        setCurrentContent(action.payload.currentContent)
        if (action.payload.personRounds && Array.isArray(action.payload.personRounds)) {
          setPersonRounds(action.payload.personRounds)
        }
        setContentIndex(0)
        setTodChoice(null)
        setWyrChoice(null)
        setKmkSelections({ kiss: "", marry: "", kill: "" })
        setKmkVotes({})
        setSpinTargetPlayer("")
        setBottleRotation(0)
        setIsLoading(false)
        setTimeLeft(timerDurationRef.current)
        setTimerActive(true)
      } else if (action.type === "kmk-submit") {
        if (action.payload && action.payload.player && action.payload.selections) {
          setKmkVotes((prev) => ({
            ...prev,
            [action.payload.player]: action.payload.selections
          }))
        }
      } else if (action.type === "award-point") {
        setPlayerScores(action.payload.playerScores)
      } else if (action.type === "toggle-timer") {
        setTimerActive(action.payload.timerActive)
        if (action.payload.timeLeft !== undefined) {
          setTimeLeft(action.payload.timeLeft)
        }
      } else if (action.type === "reset-timer") {
        setTimeLeft(timerDurationRef.current)
        setTimerActive(false)
      } else if (action.type === "reveal-votes") {
        setVotingReveal(true)
      } else if (action.type === "trigger-chug") {
        setChugTargetPlayer(action.payload.playerName)
        setChugSipsCount(action.payload.sipsCount || 1)
        setChugModalOpen(true)
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
            tallies: activeGameId === "whos-most-likely" ? tallies : undefined,
            kmkVotes: activeGameId === "kiss-marry-kill" ? { ...kmkVotesRef.current } : undefined
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
        if (action.payload.personRounds) {
          setPersonRounds(action.payload.personRounds)
        }
        if (action.payload.contentIndex !== undefined) setContentIndex(action.payload.contentIndex)
        if (action.payload.currentPlayer !== undefined) setCurrentPlayer(action.payload.currentPlayer)
        setIsLoading(false)
      } else if (action.type === "custom-persons-added") {
        if (action.payload?.personRounds && Array.isArray(action.payload.personRounds)) {
          setPersonRounds((prev) => [...action.payload.personRounds, ...prev])
        }
        if (action.payload?.questions && Array.isArray(action.payload.questions)) {
          setGameContent((prev) => [...action.payload.questions, ...prev])
        }
      } else if (action.type === "add-custom-prompt") {
        setCustomDeck(prev => [...prev, action.payload])
      } else if (action.type === "remove-custom-prompt") {
        setCustomDeck(prev => prev.filter((_, idx) => idx !== action.payload))
      }
    })

    socket.on("room-state-sync", (state: any) => {
      if (!state) return
      if (state.gameContent && state.gameContent.length > 0) {
        setGameContent(state.gameContent)
      }
      if (state.personRounds && state.personRounds.length > 0) {
        setPersonRounds(state.personRounds)
      }
      if (state.currentContent) {
        setCurrentContent(state.currentContent)
      }
      if (state.contentIndex !== undefined) {
        setContentIndex(state.contentIndex)
      }
      if (state.currentPlayer !== undefined) {
        setCurrentPlayer(state.currentPlayer)
      }
      if (state.playerScores) {
        setPlayerScores((prev) => ({ ...prev, ...state.playerScores }))
      }
      if (state.sips) {
        setSips((prev) => ({ ...prev, ...state.sips }))
      }
      if (state.votes) {
        setVotes(state.votes)
      }
      if (state.kmkVotes) {
        setKmkVotes(state.kmkVotes)
      }
      if (state.votingReveal !== undefined) {
        setVotingReveal(state.votingReveal)
      }
      if (state.timerActive !== undefined) {
        setTimerActive(state.timerActive)
      }
      if (state.timeLeft !== undefined) {
        setTimeLeft(state.timeLeft)
      }
      if (state.gameStarted !== undefined) {
        setGameStarted(state.gameStarted)
      }
      if (state.settings) {
        if (state.settings.category) setKmkCategory(state.settings.category)
        if (state.settings.gender) setKmkGender(state.settings.gender)
        if (state.settings.timerDuration !== undefined) {
          setTimerDuration(state.settings.timerDuration)
          setTimerEnabled(state.settings.timerDuration > 0)
        }
        if (state.settings.mode) setGameMode(state.settings.mode)
      }
      setIsLoading(false)
    })

    socket.on("room-settings-updated", (settings: any) => {
      if (!settings) return
      if (settings.category) setKmkCategory(settings.category)
      if (settings.gender) setKmkGender(settings.gender)
      if (settings.timerDuration !== undefined) {
        setTimerDuration(settings.timerDuration)
        setTimerEnabled(settings.timerDuration > 0)
      }
      if (settings.mode) setGameMode(settings.mode)
    })

    socket.on("cast-vote", (voteData) => {
      setVotes((prev) => ({
        ...prev,
        [voteData.voterName || voteData.voter]: voteData.candidate
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
      socket.off("room-state-sync")
      socket.off("room-settings-updated")
      socket.off("cast-vote")
      socket.off("send-reaction")
      socket.off("anonymous-prompt")
      socket.off("sync-sips")
    }
  }, [socket, timerEnabled, contentIndex])

  // Timer & Auto-Next turn interval
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            playSound("transition")
            if (isHostRef.current || !roomCode) {
              nextTurn()
            }
            return getTimerDuration(gameIdRef.current)
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft, playSound])

  const triggerChugAnimation = (playerName: string, sipsCount: number = 1) => {
    setChugTargetPlayer(playerName)
    setChugSipsCount(sipsCount)
    setChugModalOpen(true)
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "trigger-chug",
        payload: { playerName, sipsCount }
      })
    }
  }

  const handleChugFinished = () => {
    setChugModalOpen(false)
    if (isHostRef.current || !roomCode) {
      setTimeout(() => {
        nextTurn()
      }, 500)
    }
  }

  const handleSelfSip = (sipsCount: number = 1) => {
    const activeUser = myPlayerName || (players && players.length > 0 ? players[currentPlayer % players.length] : "You")
    updateSips(activeUser, sipsCount)
    triggerChugAnimation(activeUser, sipsCount)
  }

  // Keyboard shortcut: Spacebar to toggle Pause/Play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInput = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
      if (e.code === "Space" && !isInput) {
        e.preventDefault()
        toggleTimer()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [timerActive, timerEnabled])

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
    setIsLoading(false)
    if (timerEnabled) {
      setTimeLeft(getTimerDuration(gameId))
      setTimerActive(true)
    }
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "start-game",
        payload: { gameMode, matureContent, timerEnabled, autoNextEnabled, showScoring, aiEnabled }
      })
      if (activeContent.length > 0) {
        socket.emit("game-action", roomCode, {
          type: "sync-questions",
          payload: {
            gameContent: activeContent,
            personRounds: personRounds,
            currentContent: activeContent[0],
            contentIndex: 0,
            currentPlayer: 0
          }
        })
      }
    }
  }

  const handleBulkAddSpice = async () => {
    if (!spiceNamesInput.trim()) return
    setIsAddingSpice(true)
    setSpiceMessage(null)

    try {
      const res = await fetch("/api/catalog/bulk-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: spiceNamesInput,
          category: spiceCategory,
          addedBy: myPlayerName || "Party Member"
        })
      })

      const data = await res.json()
      if (data.success) {
        const { added, skippedDuplicates, totalAdded } = data.data
        let feedback = `Successfully added ${totalAdded} personalities!`
        if (skippedDuplicates.length > 0) {
          feedback += ` (${skippedDuplicates.length} duplicates automatically skipped)`
        }
        setSpiceMessage({ text: feedback, isError: false })
        setSpiceNamesInput("")

        if (added && added.length > 0) {
          const newCards = added.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            gender: null,
            imageUrl: "/placeholder-user.jpg",
            thumbnailUrl: "/placeholder-user.jpg",
            hasVerifiedPortrait: false,
            license: "Public Domain / Custom Entry",
            licenseUrl: null,
            author: myPlayerName || "Party Member",
            sourceUrl: "/placeholder-user.jpg",
            attribution: `Portrait for ${item.name}`
          }))

          const newRounds: any[] = []
          for (let i = 0; i < newCards.length; i += 3) {
            const trio = newCards.slice(i, i + 3)
            if (trio.length < 3 && personRounds.length > 0) {
              const fillerTrio = personRounds[0].persons
              for (const f of fillerTrio) {
                if (trio.length < 3 && !trio.some((t: any) => t.id === f.id)) {
                  trio.push(f)
                }
              }
            }
            if (trio.length >= 2) {
              newRounds.push({
                roundNumber: 0,
                scenario: `Spice Round: ${trio.map((c: any) => c.name).join(", ")}`,
                persons: trio
              })
            }
          }

          const newQuestions = added.map((item: any) => `Wild Card: What would you do with ${item.name}?`)

          if (newRounds.length > 0) {
            setPersonRounds((prev) => [...newRounds, ...prev])
          }
          if (newQuestions.length > 0) {
            setGameContent((prev) => [...newQuestions, ...prev])
          }

          if (socket && roomCode) {
            socket.emit("game-action", roomCode, {
              type: "custom-persons-added",
              payload: {
                personRounds: newRounds,
                questions: newQuestions
              }
            })
          }
        }
      } else {
        setSpiceMessage({ text: data.error || "Failed to add names", isError: true })
      }
    } catch (err: any) {
      setSpiceMessage({ text: err.message || "Network error", isError: true })
    } finally {
      setIsAddingSpice(false)
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
      tallies: gameId === "whos-most-likely" ? tallies : undefined,
      kmkVotes: gameId === "kiss-marry-kill" ? { ...kmkVotes } : undefined
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
    setTodChoice(null)
    setWyrChoice(null)
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setKmkVotes({})
    setSpinTargetPlayer("")
    setBottleRotation(0)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "next-turn",
        payload: { currentPlayer: nextPlayer, contentIndex: nextContentIndex, currentContent: nextContentStr }
      })
    }

    if (timerEnabled) {
      setTimeLeft(timerDuration)
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
    setTodChoice(null)
    setWyrChoice(null)
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setKmkVotes({})
    setSpinTargetPlayer("")
    setBottleRotation(0)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "skip-content",
        payload: { contentIndex: newIndex, currentContent: nextContentStr }
      })
    }

    if (timerEnabled) {
      setTimeLeft(timerDuration)
      setTimerActive(true)
    }
  }

  const shuffleContent = () => {
    playSound("click")
    if (gameContent.length === 0 && personRounds.length === 0) return

    let shuffledQuestions: string[] = []
    let shuffledRounds: any[] = []

    if (personRounds && personRounds.length > 0 && personRounds.length === gameContent.length) {
      // Pair-shuffle gameContent and personRounds simultaneously with Fisher-Yates
      const indices = Array.from({ length: gameContent.length }, (_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = indices[i]
        indices[i] = indices[j]
        indices[j] = temp
      }
      // Guarantee order changes at index 0 so the current question/cards don't show the same one
      if (indices.length > 1 && indices[0] === contentIndex) {
        const swapTarget = 1 + Math.floor(Math.random() * (indices.length - 1))
        const temp = indices[0]
        indices[0] = indices[swapTarget]
        indices[swapTarget] = temp
      }
      shuffledQuestions = indices.map((idx) => gameContent[idx])
      shuffledRounds = indices.map((idx) => personRounds[idx])
    } else {
      // Fisher-Yates shuffle on gameContent
      const qCopy = [...gameContent]
      for (let i = qCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = qCopy[i]
        qCopy[i] = qCopy[j]
        qCopy[j] = temp
      }
      if (qCopy.length > 1 && qCopy[0] === currentContent) {
        const swapTarget = 1 + Math.floor(Math.random() * (qCopy.length - 1))
        const temp = qCopy[0]
        qCopy[0] = qCopy[swapTarget]
        qCopy[swapTarget] = temp
      }
      shuffledQuestions = qCopy

      // Fisher-Yates shuffle on personRounds if present
      if (personRounds && personRounds.length > 0) {
        const rCopy = [...personRounds]
        for (let i = rCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const temp = rCopy[i]
          rCopy[i] = rCopy[j]
          rCopy[j] = temp
        }
        if (
          rCopy.length > 1 &&
          personRounds[contentIndex] &&
          (rCopy[0]?.id === personRounds[contentIndex]?.id || rCopy[0]?.scenario === personRounds[contentIndex]?.scenario)
        ) {
          const swapTarget = 1 + Math.floor(Math.random() * (rCopy.length - 1))
          const temp = rCopy[0]
          rCopy[0] = rCopy[swapTarget]
          rCopy[swapTarget] = temp
        }
        shuffledRounds = rCopy
      }
    }

    setGameContent(shuffledQuestions)
    if (shuffledQuestions.length > 0) {
      setCurrentContent(shuffledQuestions[0])
    }
    if (shuffledRounds.length > 0) {
      setPersonRounds(shuffledRounds)
    }
    setContentIndex(0)
    setTodChoice(null)
    setWyrChoice(null)
    setKmkSelections({ kiss: "", marry: "", kill: "" })
    setKmkVotes({})
    setSpinTargetPlayer("")
    setBottleRotation(0)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "shuffle-content",
        payload: {
          gameContent: shuffledQuestions,
          currentContent: shuffledQuestions[0] || "",
          personRounds: shuffledRounds
        }
      })
    }

    if (timerEnabled) {
      setTimeLeft(timerDuration)
      setTimerActive(true)
    }
  }

  const toggleTimer = () => {
    playSound("click")
    const nextActive = !timerActive
    setTimerActive(nextActive)

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "toggle-timer",
        payload: { timerActive: nextActive, timeLeft }
      })
    }
  }

  const resetTimer = () => {
    playSound("click")
    setTimeLeft(timerDuration)
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
    const kmkMatch = currentContent.match(/Choose between:?\s*(.+?),\s*(.+?),\s*and\s*(.+?)\s*for Kiss/i) || 
                     currentContent.match(/Choose between:?\s*(.+?),\s*(.+?),\s*and\s*(.+?)\./i) ||
                     currentContent.match(/Choose between:?\s*(.+?),\s*(.+?),\s*and\s*(.+?)/i)
    if (kmkMatch) {
      const clean1 = kmkMatch[1].replace(/\s*-.*$/, '').replace(/for Kiss.*$/i, '').replace(/\..*$/, '').trim()
      const clean2 = kmkMatch[2].replace(/\s*-.*$/, '').replace(/for Kiss.*$/i, '').replace(/\..*$/, '').trim()
      const clean3 = kmkMatch[3].replace(/\s*-.*$/, '').replace(/for Kiss.*$/i, '').replace(/\..*$/, '').trim()
      return [clean1, clean2, clean3]
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

  const submitKMKChoices = () => {
    if (!kmkSelections.kiss || !kmkSelections.marry || !kmkSelections.kill) return
    playSound("success")
    const activeUser = myPlayerName || players[currentPlayer] || "Player"
    const selectionsObj = {
      kiss: kmkSelections.kiss || "",
      marry: kmkSelections.marry || "",
      kill: kmkSelections.kill || ""
    }
    setKmkVotes(prev => ({
      ...prev,
      [activeUser]: selectionsObj
    }))
    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "kmk-submit",
        payload: { player: activeUser, selections: selectionsObj }
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
    const voterName = players[currentPlayer] || "Player"
    if (socket && roomCode) {
      socket.emit("cast-vote", roomCode, { voter: socket.id, voterName, candidate })
    } else {
      setVotes((prev) => ({
        ...prev,
        [voterName]: candidate
      }))
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
        tallies: gameId === "whos-most-likely" ? tallies : undefined,
        kmkVotes: gameId === "kiss-marry-kill" ? { ...kmkVotes } : undefined
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
    "draft-arena": DraftArenaGame,
  }

  const SpecialGameComponent = specialGameComponents[gameId]
  if (SpecialGameComponent) {
    return (
      <>
        <SpecialGameComponent
          roomCode={roomCode}
          players={players}
          myPlayerName={myPlayerName}
          isHost={isHost}
          onBack={onBack}
          darkMode={darkMode}
          soundEnabled={soundEnabled}
          playSound={playSound}
          matureContent={matureContent}
          onTriggerChug={(player: string, count: number) => triggerChugAnimation(player, count)}
        />
        <BeerChugAnimation
          isOpen={chugModalOpen}
          playerName={chugTargetPlayer}
          sipsCount={chugSipsCount}
          onClose={() => setChugModalOpen(false)}
        />
      </>
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col items-center justify-center py-12 w-full">
        <div className="container mx-auto px-6 relative z-10 w-full max-w-xl">
          <div className="text-center w-full">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-zinc-400 hover:text-white border border-zinc-800 rounded-lg h-9 px-4 text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Setup
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsLiveSidebarOpen(true)}
                className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 h-9 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{players.length} Playing</span>
                {roomCode && <span className="font-mono text-zinc-500">• {roomCode}</span>}
              </Button>
            </div>

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
                          handleAddCustomPrompt()
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
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Enable Turn Timer</span>
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
                    <Play className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Auto-Next Turn on Expiry</span>
                  </div>
                  <Switch
                    checked={autoNextEnabled}
                    onCheckedChange={setAutoNextEnabled}
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
                    <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">Enable AI Question Generator</span>
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

            {isHost || !roomCode ? (
              <Button
                onClick={startGame}
                size="lg"
                className="bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl h-12 px-8 font-bold uppercase tracking-wider text-xs w-full max-w-sm inline-flex items-center justify-center border-0 transition-colors shadow-lg"
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

        {/* Live Players Sidebar */}
        <LivePlayersSidebar
          isOpen={isLiveSidebarOpen}
          onClose={() => setIsLiveSidebarOpen(false)}
          roomCode={roomCode}
          gameId={gameId}
          gameName={getGameName(gameId)}
          players={players}
          currentPlayerIndex={currentPlayer}
          myPlayerName={myPlayerName}
          isHost={isHost}
          scores={playerScores}
          sips={sips}
          matureContent={matureContent}
          soundEnabled={soundEnabled}
        />
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
                          <div className="absolute -left-[24.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700" />
                          
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                              <span>Round {index + 1}</span>
                              <span>{item.currentPlayer}'s turn</span>
                            </div>
                            
                            <p className="font-bold text-zinc-200 text-xs leading-relaxed uppercase tracking-wider">
                              {item.question}
                            </p>

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

                            {item.kmkVotes && Object.keys(item.kmkVotes).length > 0 && (
                              <div className="mt-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 space-y-2">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-400 block border-b border-zinc-850 pb-1">
                                  💋💍🔪 Kiss Marry Kill Selections
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Object.entries(item.kmkVotes).map(([player, pVote]) => (
                                    <div key={player} className="p-2 bg-zinc-900/60 border border-zinc-850 rounded-lg text-[10px] space-y-1">
                                      <span className="font-extrabold text-white uppercase tracking-wider block border-b border-zinc-800 pb-0.5">
                                        {player}
                                      </span>
                                      <div className="text-[9px] space-y-0.5 pt-0.5">
                                        <div><span className="text-pink-400 font-bold">💋 Kiss:</span> <span className="text-zinc-200 font-semibold">{pVote.kiss || "—"}</span></div>
                                        <div><span className="text-amber-400 font-bold">💍 Marry:</span> <span className="text-zinc-200 font-semibold">{pVote.marry || "—"}</span></div>
                                        <div><span className="text-red-400 font-bold">🔪 Kill:</span> <span className="text-zinc-200 font-semibold">{pVote.kill || "—"}</span></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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

  // Determine active dynamic actions
  const isTurnPlayer = players[currentPlayer] === players[0] || isHost || !roomCode

  return (
    <div className="min-h-screen bg-neutral-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col justify-between py-3 sm:py-6 px-2 sm:px-4 pt-safe pb-safe overflow-x-hidden">
      
      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 1, scale: 0.6 }}
              animate={{ y: -700, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute text-5xl select-none filter drop-shadow-lg"
              style={{ left: `${r.x}%`, bottom: "70px" }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Beer Chug Animation Modal */}
      <BeerChugAnimation
        isOpen={chugModalOpen}
        playerName={chugTargetPlayer}
        sipsCount={chugSipsCount}
        onClose={handleChugFinished}
      />

      <div className="container mx-auto px-1 sm:px-6 relative z-10 flex-1 flex flex-col justify-between max-w-4xl w-full">
        {/* Mobile-Optimized Header */}
        <header className="flex items-center justify-between gap-2 mb-3 sm:mb-6 pt-1">
          <Button
            variant="ghost"
            onClick={handleEndGame}
            className="rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 px-2 sm:px-3 text-[9px] uppercase tracking-wider flex items-center flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span className="hidden xs:inline">End Game</span>
            <span className="xs:hidden">Exit</span>
          </Button>

          <div className="text-center min-w-0 px-1">
            <h1 className="text-sm sm:text-lg font-bold uppercase tracking-tight text-white leading-tight truncate">
              {getGameName(gameId)}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold truncate">
                {players[currentPlayer]}'s Turn
              </span>
              {gameMode === "spicy" && (
                <span className="bg-red-950/60 text-red-400 border border-red-900/40 font-bold uppercase text-[7.5px] px-1.5 py-0.2 rounded">
                  Spicy
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={toggleTimer}
              className={`rounded-lg border h-8 px-2 sm:px-3 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                timerActive
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {timerActive ? (
                <span className="flex items-center gap-1">
                  <Pause className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span>{timeLeft}s</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                  <span className="hidden sm:inline">Timer</span>
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLeaderboard(true)}
              className="rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 h-8 px-2 sm:px-3 text-[9px] uppercase tracking-wider flex items-center gap-1"
            >
              <Trophy className="w-3 h-3 sm:hidden text-amber-400" />
              <span className="hidden sm:inline">Scores</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsLiveSidebarOpen(true)}
              className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 h-8 px-2 sm:px-3 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{players.length}</span>
              <span className="hidden sm:inline">Live</span>
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col justify-center gap-5 w-full">
          
          {/* Active Player banner */}
          <div className="text-center mb-1 flex items-center justify-center gap-2">
            <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-4 py-1.5 rounded-xl uppercase tracking-wider font-bold">
              {players[currentPlayer]}'s Turn
            </Badge>
            {!isHost && roomCode && (
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 border border-zinc-800 px-2.5 py-1 rounded-lg">
                Host Controlling
              </span>
            )}
          </div>

          {/* Timer with Per-Question Speed Selector */}
          {timerEnabled && (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 max-w-sm mx-auto w-full mb-1 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5 text-amber-400" /> Per-Question Timer
                </span>
                <div className="flex gap-1">
                  {[15, 30, 45, 60].map((secs) => (
                    <button
                      key={secs}
                      onClick={() => changeTimerDuration(secs)}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${
                        timerDuration === secs
                          ? "bg-amber-400 text-black font-extrabold"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {secs}s
                    </button>
                  ))}
                </div>
              </div>
              <Progress
                value={(timeLeft / timerDuration) * 100}
                className="h-2 bg-zinc-900"
              />
              <div className="flex justify-between items-center mt-2 text-xs font-mono font-bold text-zinc-400">
                <span>0s</span>
                <span className="text-amber-400 text-base font-extrabold">{timeLeft}s remaining</span>
                <span>{timerDuration}s</span>
              </div>
            </div>
          )}

          {/* Kiss Marry Kill & Would You Rather Customizer Bar */}
          {(gameId === "kiss-marry-kill" || gameId === "would-you-rather") && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3.5 max-w-3xl mx-auto w-full mb-1 space-y-2.5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {gameId === "kiss-marry-kill" ? "Kiss Marry Kill Customizer" : "Would You Rather People Customizer"}
                </span>
                
                {/* AI Generator Toggle */}
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`px-3 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition-colors border ${
                    aiEnabled
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {aiEnabled ? "🤖 Groq AI Options: ON" : "📚 Local Database (15k+): ON"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Gender Preference Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Gender Pool:</label>
                  <div className="flex gap-1">
                    {[
                      { id: "female", label: "👩 Female" },
                      { id: "male", label: "👨 Male" },
                      { id: "mixed", label: "🔀 Mixed" }
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => changeKMKGender(g.id as any)}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors ${
                          kmkGender === g.id
                            ? "bg-amber-400 text-black font-extrabold shadow-sm"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category / Genre Filter */}
                <div className="flex flex-col gap-1 min-w-0">
                  <label className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Industry / Genre:</label>
                  <div className="flex overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap gap-1 scrollbar-none touch-pan-x">
                    {[
                      { id: "all", label: "🌟 All" },
                      { id: "scientists", label: "🔬 Scientists" },
                      { id: "history", label: "🏛️ History" },
                      { id: "bollywood", label: "🎬 Bollywood" },
                      { id: "hollywood", label: "📽️ Hollywood" },
                      { id: "singers", label: "🎤 Singers" },
                      { id: "athletes", label: "⚽ Athletes" },
                      { id: "tech", label: "💻 Tech" },
                      { id: "writers", label: "✍️ Writers" },
                      { id: "artists", label: "🎨 Artists" },
                      { id: "adultstars", label: "🌶️ Adult Stars (18+)" },
                      { id: "fantasy", label: "⚔️ Fantasy" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => changeKMKCategory(c.id)}
                        className={`py-1 px-2.5 rounded-lg text-[8px] font-bold uppercase whitespace-nowrap transition-colors flex-shrink-0 sm:flex-shrink ${
                          kmkCategory === c.id
                            ? "bg-amber-400 text-black font-extrabold shadow-sm"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Question Card - ALWAYS SYNCHRONIZED FOR ALL PLAYERS */}
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 sm:p-10 min-h-[240px] flex flex-col items-center justify-center text-center shadow-xl relative max-w-3xl mx-auto w-full overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 animate-pulse">Loading Question...</span>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentContent}
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.2 }}
                      className="mb-4 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase px-3.5 py-1 rounded-full tracking-widest shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Question #{contentIndex + 1}</span>
                    </motion.div>

                    <div className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase max-w-2xl leading-relaxed">
                      {currentContent || "Get ready for the next round!"}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Interactive Truth or Dare choice step */}
                {gameId === "truth-or-dare" && (
                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => setTodChoice("truth")}
                      className={`h-10 px-6 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors ${
                        todChoice === "truth"
                          ? "bg-emerald-400 text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850"
                      }`}
                    >
                      😇 Truth Chosen
                    </Button>
                    <Button
                      onClick={() => setTodChoice("dare")}
                      className={`h-10 px-6 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors ${
                        todChoice === "dare"
                          ? "bg-red-500 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850"
                      }`}
                    >
                      😈 Dare Chosen
                    </Button>
                  </div>
                )}

                {/* Interactive Would You Rather Image Cards */}
                {gameId === "would-you-rather" && personRounds[contentIndex]?.optionA && (
                  <WYRImageCards
                    optionA={personRounds[contentIndex].optionA}
                    optionB={personRounds[contentIndex].optionB}
                    selectedOption={wyrChoice}
                    onChoose={(opt) => setWyrChoice(opt)}
                  />
                )}
                
                {/* Interactive Kiss Marry Kill with Synced Multiplayer Reveal */}
                {(() => {
                  const kmkOptionsList = getKMKOptions()
                  const currentPersonRound = personRounds[contentIndex]
                  const hasImageCards = Boolean(currentPersonRound && currentPersonRound.persons && currentPersonRound.persons.length === 3)

                  if (gameId === "kiss-marry-kill" && (hasImageCards || kmkOptionsList)) {
                    const myUser = myPlayerName || players[currentPlayer] || "Player"
                    const hasSubmitted = !!kmkVotes[myUser]
                    const isAllComplete = kmkSelections.kiss && kmkSelections.marry && kmkSelections.kill

                    return (
                      <div className="mt-6 border-t border-zinc-900 pt-5 w-full max-w-4xl mx-auto space-y-4">
                        {hasImageCards ? (
                          /* Image-Backed 3-Card KMK Presentation */
                          <KMKImageCards
                            persons={currentPersonRound.persons}
                            selections={kmkSelections}
                            onSelect={selectKMK}
                            onSubmit={submitKMKChoices}
                            hasSubmitted={hasSubmitted}
                            playerName={myUser}
                          />
                        ) : (
                          /* Text Option Fallback Panel */
                          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 space-y-3 max-w-lg mx-auto">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                              <span>Assign Your Choices ({myUser})</span>
                              {hasSubmitted && (
                                <span className="text-emerald-400 font-extrabold text-[9px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                  ✓ Submitted
                                </span>
                              )}
                            </h4>

                            <div className="space-y-2">
                              {kmkOptionsList?.map((opt) => {
                                return (
                                  <div key={opt} className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-2">
                                    <span className="font-extrabold text-xs text-left uppercase tracking-wider text-zinc-200 flex-1">{opt}</span>
                                    <div className="flex gap-1.5">
                                      {(['kiss', 'marry', 'kill'] as const).map((role) => {
                                        const labels = { kiss: "💋 Kiss", marry: "💍 Marry", kill: "🔪 Kill" }
                                        const isSelected = kmkSelections[role] === opt
                                        return (
                                          <Button
                                            key={role}
                                            size="sm"
                                            onClick={() => selectKMK(opt, role)}
                                            className={`h-8 px-2.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all ${
                                              isSelected 
                                                ? role === "kiss" ? "bg-pink-500 text-white shadow-md" : role === "marry" ? "bg-amber-400 text-black shadow-md" : "bg-red-600 text-white shadow-md"
                                                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
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

                            <Button
                              onClick={submitKMKChoices}
                              disabled={!isAllComplete}
                              className={`w-full h-10 text-xs font-black uppercase tracking-wider rounded-xl transition-all border-0 shadow-lg ${
                                hasSubmitted
                                  ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                                  : isAllComplete
                                  ? "bg-amber-400 hover:bg-amber-300 text-black"
                                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                              }`}
                            >
                              {hasSubmitted ? "✓ Update My Choices" : "Submit Choices 💋 💍 🔪"}
                            </Button>
                          </div>
                        )}

                        {/* Live Room Reveal Grid */}
                        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-left space-y-3 shadow-2xl">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-between border-b border-zinc-850 pb-2">
                            <span>Live Room Reveal ({Object.keys(kmkVotes).length}/{players.length} Submitted)</span>
                            <span className="text-[8px] text-zinc-500 font-mono">REVEALED IN REAL-TIME</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {players.map((p) => {
                              const pVote = kmkVotes[p]
                              const isMe = myPlayerName ? p.toLowerCase() === myPlayerName.toLowerCase() : false

                              return (
                                <div key={p} className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                                  isMe ? "bg-amber-500/10 border-amber-500/40" : "bg-zinc-900/50 border-zinc-800"
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold uppercase text-[10px] text-white tracking-wider">
                                      {p}{isMe ? " (You)" : ""}
                                    </span>
                                    {pVote ? (
                                      <span className="text-[8px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                                        Submitted
                                      </span>
                                    ) : (
                                      <span className="text-[8px] font-bold uppercase text-zinc-500 italic">
                                        Selecting...
                                      </span>
                                    )}
                                  </div>

                                  {pVote ? (
                                    <div className="space-y-1 text-[10px] pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-pink-400 font-bold">💋 Kiss:</span>
                                        <span className="font-semibold text-zinc-200 truncate">{pVote.kiss || "—"}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-amber-400 font-bold">💍 Marry:</span>
                                        <span className="font-semibold text-zinc-200 truncate">{pVote.marry || "—"}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-red-400 font-bold">🔪 Kill:</span>
                                        <span className="font-semibold text-zinc-200 truncate">{pVote.kill || "—"}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-zinc-600 italic py-2 text-center">
                                      Waiting for selections...
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
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
                        onClick={() => (isHost || !roomCode) && spinBottle()}
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
                    
                    {(isHost || !roomCode) && (
                      <Button
                        onClick={spinBottle}
                        disabled={isSpinning}
                        className="mt-3 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-lg px-4 h-8 text-[9px] tracking-wider border-0 transition-colors"
                      >
                        {isSpinning ? "Spinning..." : "Tap Bottle to Spin!"}
                      </Button>
                    )}
                    
                    {spinTargetPlayer && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-center"
                      >
                        <p className="font-bold text-[10px] uppercase text-amber-400">
                          Bottle pointed to {spinTargetPlayer}! Drink or Dare!
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
                          const activeVoterName = players[currentPlayer] || "Player"
                          const hasVotedForThis = votes[activeVoterName] === player || Object.values(votes).includes(player)
                          return (
                            <Button
                              key={player}
                              onClick={() => castVote(player)}
                              disabled={hasVoted}
                              className={`h-9 rounded-lg border font-bold uppercase tracking-wider text-[10px] transition-colors ${
                                hasVoted 
                                  ? "border-zinc-800 bg-zinc-900/40 text-zinc-400 cursor-not-allowed" 
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
                              <div key={player} className={`flex justify-between items-center p-2.5 border rounded-xl ${
                                isWinner ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                              }`}>
                                <span className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                  {player} {isWinner && "👑"}
                                </span>
                                <span className="font-bold text-xs">{count} {count === 1 ? 'vote' : 'votes'}</span>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    )}

                    {(isHost || !roomCode) && !votingReveal && (
                      <Button
                        onClick={revealVotes}
                        disabled={Object.keys(votes).length === 0}
                        className="w-full h-10 mt-4 bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase rounded-lg text-[10px] tracking-wider border-0 transition-colors shadow-md"
                      >
                        Reveal Votes ({Object.keys(votes).length} Cast)
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Sip Tracker / Drink Logger (View-Only Badges + Chug Trigger) */}
          {matureContent && (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 max-w-3xl mx-auto w-full mt-1 text-center">
              <h4 className="text-[9px] font-bold uppercase tracking-wider mb-2.5 text-zinc-500 flex items-center justify-center gap-1.5">
                <Beer className="w-3.5 h-3.5 text-amber-400" /> Sips Logged This Match
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {players.map((player) => {
                  const count = sips[player] || 0
                  const isMe = myPlayerName ? player.toLowerCase() === myPlayerName.toLowerCase() : false
                  return (
                    <div key={player} className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 transition-colors ${
                      isMe ? "bg-amber-500/10 border-amber-500/40" : "bg-zinc-900/50 border-zinc-800"
                    }`}>
                      <span className="text-zinc-200 text-[10px] font-bold uppercase tracking-wider">{player}{isMe ? " (You)" : ""}</span>
                      <span className="bg-zinc-800 border border-zinc-750 text-amber-400 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg">
                        {count} {count === 1 ? 'sip' : 'sips'}
                      </span>
                      <Button
                        onClick={() => triggerChugAnimation(player, 1)}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-md p-0"
                        title={`Trigger Chug Animation for ${player}`}
                      >
                        <Beer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Action Controls Bar based on active Game Mode */}
          <div className="max-w-xl mx-auto w-full mt-3 space-y-2">
            
            {/* Dynamic Game-Specific Action Buttons */}
            {gameId === "never-have-i-ever" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSelfSip(1)}
                  className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs rounded-xl border-0 shadow-md"
                >
                  <Beer className="w-4 h-4 mr-1.5" />
                  I've Done This! (Chug 🍺)
                </Button>
                <Button
                  onClick={() => isHost && nextTurn()}
                  disabled={!isHost && !!roomCode}
                  className="flex-1 h-11 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-xs rounded-xl border border-zinc-700"
                >
                  I'm Safe 😇
                </Button>
              </div>
            )}

            {gameId === "drink-if" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSelfSip(1)}
                  className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs rounded-xl border-0 shadow-md"
                >
                  <Beer className="w-4 h-4 mr-1.5" />
                  Applies to Me! (Take Sip 🍺)
                </Button>
              </div>
            )}

            {gameId === "strip-or-sip" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSelfSip(2)}
                  className="flex-1 h-11 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs rounded-xl border-0 shadow-md"
                >
                  <Beer className="w-4 h-4 mr-1.5" />
                  Sip / Chug Penalty 🍺
                </Button>
                <Button
                  onClick={() => isHost && nextTurn()}
                  disabled={!isHost && !!roomCode}
                  className="flex-1 h-11 bg-red-950/60 border border-red-900/50 hover:bg-red-900/80 text-red-300 font-bold uppercase text-xs rounded-xl"
                >
                  Strip Item 👕
                </Button>
              </div>
            )}

            {gameId === "rapid-fire" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    awardPoint(myPlayerName || players[currentPlayer])
                    if (isHost || !roomCode) nextTurn()
                  }}
                  className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold uppercase text-xs rounded-xl border-0 shadow-md"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Answered! (+1 Point)
                </Button>
              </div>
            )}

            {/* Standard Navigation Controls (Host Controlled) - Mobile Thumb-Friendly */}
            <div className="flex flex-col gap-2 w-full">
              {/* Primary Action Button: Next Turn (Prominent, High-Contrast) */}
              <Button
                onClick={nextTurn}
                disabled={!isHost && !!roomCode}
                size="lg"
                className="w-full h-12 text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl font-black uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg active:scale-98 flex items-center justify-center gap-2 border-0"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Next Turn</span>
              </Button>

              {/* Secondary Row: Skip, Shuffle, Spice Up */}
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button
                  onClick={skipContent}
                  disabled={!isHost && !!roomCode}
                  variant="outline"
                  className="h-10 text-[10px] sm:text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" />
                  Skip
                </Button>

                <Button
                  onClick={shuffleContent}
                  disabled={!isHost && !!roomCode}
                  variant="outline"
                  className="h-10 text-[10px] sm:text-xs border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  <Shuffle className="w-3.5 h-3.5 mr-1" />
                  Shuffle
                </Button>

                <Button
                  onClick={() => setIsSpiceModalOpen(true)}
                  variant="outline"
                  className="h-10 text-[10px] sm:text-xs border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-xl font-bold uppercase tracking-wider transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Spice
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Player Badges row */}
        <footer className="mt-6 border-t border-zinc-900 pt-4 pb-12 sm:pb-4">
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

      {/* Floating Quick Reactions Tray - Bottom-Center Horizontal Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-neutral-950/90 backdrop-blur-xl border border-zinc-800/80 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-2xl">
        <span className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-500 hidden sm:inline">Reactions:</span>
        {["🔥", "😂", "🍺", "😈", "💀"].map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            onClick={() => triggerReaction(emoji)}
            className="w-8 h-8 rounded-full hover:bg-zinc-800 text-lg p-0 flex items-center justify-center bg-transparent border-0 transition-transform active:scale-125"
          >
            {emoji}
          </Button>
        ))}
      </div>

      {/* Collapsible Leaderboard Drawer */}
      <AnimatePresence>
        {showLeaderboard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
              className="fixed inset-0 bg-black z-40"
            />
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
                {players.map((player) => (
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomPromptOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
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
                Type in an anonymous truth, dare, or scenario. It will be randomly shuffled into the deck!
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

      {/* Spice Up Deck / Bulk Names Modal */}
      <AnimatePresence>
        {isSpiceModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSpiceModalOpen(false)
                setSpiceMessage(null)
              }}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-neutral-950 border border-zinc-800 rounded-3xl p-6 z-50 text-zinc-100 flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-lg">⚡</span>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-tight text-white">
                      Spice Up Deck / Add Custom Personalities
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Add comma-separated names to inject into the game. Duplicates are safely skipped!
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSpiceModalOpen(false)
                    setSpiceMessage(null)
                  }}
                  className="text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Category Tag
                </label>
                <select
                  value={spiceCategory}
                  onChange={(e) => setSpiceCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-zinc-700"
                >
                  <option value="scientists">🔬 Famous Scientists & Thinkers</option>
                  <option value="tech">💻 Tech Pioneers & Innovators</option>
                  <option value="anime">⚡ Anime & Fantasy Figures</option>
                  <option value="bollywood">🎬 Bollywood Celebrities</option>
                  <option value="hollywood">🌟 Hollywood Celebrities</option>
                  <option value="athletes">🏆 World Athletes</option>
                  <option value="history">👑 Historical Icons</option>
                  <option value="other">🎭 Wild / Custom Names</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Enter Comma-Separated or Line-by-Line Names
                </label>
                <textarea
                  value={spiceNamesInput}
                  onChange={(e) => setSpiceNamesInput(e.target.value)}
                  placeholder="e.g. Albert Einstein, Marie Curie, Nikola Tesla, Oppenheimer, Shrek, Walter White"
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500/50 resize-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">
                  Quick Add Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSpiceCategory("scientists")
                      setSpiceNamesInput("Albert Einstein, Marie Curie, Nikola Tesla, J. Robert Oppenheimer, Isaac Newton")
                    }}
                    className="text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    + Scientists Pack
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpiceCategory("tech")
                      setSpiceNamesInput("Steve Jobs, Elon Musk, Sam Altman, Jensen Huang, Bill Gates")
                    }}
                    className="text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    + Tech Visionaries
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpiceCategory("anime")
                      setSpiceNamesInput("Goku, Satoru Gojo, Levi Ackerman, Naruto Uzumaki, Shrek")
                    }}
                    className="text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    + Anime & Legends
                  </button>
                </div>
              </div>

              {spiceMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    spiceMessage.isError
                      ? "bg-red-500/10 border border-red-500/30 text-red-400"
                      : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  {spiceMessage.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSpiceModalOpen(false)
                    setSpiceMessage(null)
                  }}
                  className="flex-1 h-10 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Close
                </Button>
                <Button
                  onClick={handleBulkAddSpice}
                  disabled={isAddingSpice || !spiceNamesInput.trim()}
                  className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs rounded-xl border-0 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isAddingSpice ? "Adding..." : "Add to Game 🚀"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Live Players & Session Sidebar for All Games */}
      <LivePlayersSidebar
        isOpen={isLiveSidebarOpen}
        onClose={() => setIsLiveSidebarOpen(false)}
        roomCode={roomCode}
        gameId={gameId}
        gameName={getGameName(gameId)}
        players={players}
        currentPlayerIndex={currentPlayer}
        myPlayerName={myPlayerName}
        isHost={isHost}
        scores={playerScores}
        sips={sips}
        matureContent={matureContent}
        soundEnabled={soundEnabled}
      />
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
    "draft-arena": "Draft Arena - Auction Engine",
    "custom-game": "Custom Game",
  }
  return names[gameId] || "Party Game"
}

function getGameRules(gameId: string): string {
  const rules: Record<string, string> = {
    "draft-arena":
      "Compete in live auction bidding! Nominate items, manage franchise salary caps, and build the ultimate squad.",
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
