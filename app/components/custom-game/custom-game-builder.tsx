"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CustomGameCard,
  CustomGameDeck,
  CustomCardType,
  CustomCardTarget,
  CustomTemplatePreset
} from "@/lib/custom-game/types"
import { CUSTOM_GAME_TEMPLATES } from "@/lib/custom-game/templates"
import {
  createDeckFromTemplate,
  createBlankDeck,
  parseBulkTextIntoCards,
  validateCustomDeck,
  exportDeckToJson,
  importDeckFromJson,
  saveDeckToStorage,
  loadSavedDecksFromStorage,
  generateCardId
} from "@/lib/custom-game/engine"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Shuffle,
  FileText,
  Save,
  Download,
  Upload,
  Check,
  Flame,
  Vote,
  Scale,
  Scroll,
  Lock,
  Zap,
  Beer,
  Layers,
  Users,
  Settings,
  HelpCircle,
  Eye,
  AlertCircle
} from "lucide-react"

interface CustomGameBuilderProps {
  initialDeck?: CustomGameDeck
  isHost: boolean
  players: string[]
  myPlayerName: string
  roomCode?: string
  socket?: any
  onDeckChange: (deck: CustomGameDeck) => void
  onStartGame?: () => void
}

export function CustomGameBuilder({
  initialDeck,
  isHost,
  players,
  myPlayerName,
  roomCode,
  socket,
  onDeckChange,
  onStartGame
}: CustomGameBuilderProps) {
  const [deck, setDeck] = useState<CustomGameDeck>(() => {
    return initialDeck || createDeckFromTemplate("wild-house-party")
  })

  // Builder tabs
  const [activeTab, setActiveTab] = useState<"create" | "bulk" | "templates" | "personalities" | "saved">("create")

  // Single card form state
  const [promptContent, setPromptContent] = useState("")
  const [cardType, setCardType] = useState<CustomCardType>("action")
  const [cardSips, setCardSips] = useState<number>(2)
  const [cardTarget, setCardTarget] = useState<CustomCardTarget>("current")
  const [dilemmaOptA, setDilemmaOptA] = useState("")
  const [dilemmaOptB, setDilemmaOptB] = useState("")
  const [isCurse, setIsCurse] = useState(false)

  // 18k+ Personality generator state
  const [persCategory, setPersCategory] = useState("all")
  const [persStyle, setPersStyle] = useState<"all" | "quirky" | "dark" | "spicy">("all")
  const [persCount, setPersCount] = useState<number>(10)
  const [isGeneratingPers, setIsGeneratingPers] = useState(false)
  const [persSuccessMessage, setPersSuccessMessage] = useState<string | null>(null)

  // Bulk paste state
  const [bulkInput, setBulkInput] = useState("")
  const [bulkDefaultType, setBulkDefaultType] = useState<CustomCardType>("action")

  // Filter state for card list
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Saved decks & export state
  const [savedDecks, setSavedDecks] = useState<CustomGameDeck[]>([])
  const [jsonExportOpen, setJsonExportOpen] = useState(false)
  const [jsonImportText, setJsonImportText] = useState("")
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false)

  // Player contribution state for non-hosts
  const [suggestedPrompt, setSuggestedPrompt] = useState("")
  const [suggestSuccess, setSuggestSuccess] = useState(false)

  // Load saved decks from storage on mount
  useEffect(() => {
    setSavedDecks(loadSavedDecksFromStorage())
  }, [])

  // Sync state up whenever deck updates
  const updateDeck = (updated: CustomGameDeck, broadcast = true) => {
    setDeck(updated)
    onDeckChange(updated)

    if (broadcast && socket && roomCode && isHost) {
      socket.emit("game-action", roomCode, {
        type: "update-custom-deck",
        payload: {
          title: updated.title,
          customCards: updated.cards,
          isMature: updated.isMature
        }
      })
    }
  }

  // Socket listener for custom deck updates and player card suggestions
  useEffect(() => {
    if (!socket) return

    const handleAction = (action: any) => {
      if (action.type === "update-custom-deck" && !isHost) {
        if (action.payload?.customCards) {
          setDeck((prev) => ({
            ...prev,
            title: action.payload.title || prev.title,
            cards: action.payload.customCards,
            isMature: action.payload.isMature !== undefined ? action.payload.isMature : prev.isMature
          }))
        }
      } else if (action.type === "player-suggest-card" && isHost) {
        // Player submitted a card in real-time!
        if (action.payload?.card) {
          setDeck((prev) => {
            const updated = {
              ...prev,
              cards: [...prev.cards, action.payload.card]
            }
            onDeckChange(updated)
            return updated
          })
        }
      }
    }

    socket.on("game-action", handleAction)
    return () => {
      socket.off("game-action", handleAction)
    }
  }, [socket, isHost, onDeckChange])

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const newDeck = createDeckFromTemplate(templateId)
    updateDeck(newDeck)
    setActiveTab("create")
  }

  // Handle single card addition
  const handleAddCard = () => {
    if (!promptContent.trim()) return

    const options: [string, string] | undefined =
      cardType === "dilemma" && dilemmaOptA.trim() && dilemmaOptB.trim()
        ? [dilemmaOptA.trim(), dilemmaOptB.trim()]
        : undefined

    const newCard: CustomGameCard = {
      id: generateCardId(),
      content: promptContent.trim(),
      type: cardType,
      sips: cardSips,
      target: cardTarget,
      options,
      isCurse: isCurse || cardType === "rule",
      submittedBy: myPlayerName || "Host"
    }

    const updatedDeck = {
      ...deck,
      cards: [...deck.cards, newCard],
      updatedAt: new Date().toISOString()
    }

    updateDeck(updatedDeck)

    // Reset form inputs
    setPromptContent("")
    setDilemmaOptA("")
    setDilemmaOptB("")
    setIsCurse(false)
  }

  // Handle bulk cards addition
  const handleAddBulkCards = () => {
    if (!bulkInput.trim()) return

    const newCards = parseBulkTextIntoCards(bulkInput, bulkDefaultType)
    if (newCards.length === 0) return

    const updatedDeck = {
      ...deck,
      cards: [...deck.cards, ...newCards],
      updatedAt: new Date().toISOString()
    }

    updateDeck(updatedDeck)
    setBulkInput("")
    setActiveTab("create")
  }

  // Handle generating dynamic cards from the 18k+ personality database
  const handleGeneratePersonalityCards = async () => {
    setIsGeneratingPers(true)
    try {
      const res = await fetch(
        `/api/catalog/games/round?gameId=custom-cards&category=${persCategory}&style=${persStyle}&count=${persCount}`
      )
      const data = await res.json()
      if (data.success && Array.isArray(data.cards) && data.cards.length > 0) {
        const updatedDeck = {
          ...deck,
          cards: [...deck.cards, ...data.cards],
          updatedAt: new Date().toISOString()
        }
        updateDeck(updatedDeck)
        setPersSuccessMessage(`Added ${data.cards.length} pop-culture star cards to your deck!`)
        setTimeout(() => setPersSuccessMessage(null), 3000)
      }
    } catch (err) {
      console.error("Failed to generate personality cards:", err)
    } finally {
      setIsGeneratingPers(false)
    }
  }

  // Handle player prompt contribution (for non-hosts)
  const handleSuggestCard = () => {
    if (!suggestedPrompt.trim()) return

    const newCard: CustomGameCard = {
      id: generateCardId("suggest"),
      content: suggestedPrompt.trim(),
      type: "action",
      sips: 2,
      target: "current",
      submittedBy: myPlayerName || "Player"
    }

    if (socket && roomCode) {
      socket.emit("game-action", roomCode, {
        type: "player-suggest-card",
        payload: { card: newCard }
      })
    }

    setSuggestedPrompt("")
    setSuggestSuccess(true)
    setTimeout(() => setSuggestSuccess(false), 2500)
  }

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    const updated = {
      ...deck,
      cards: deck.cards.filter((c) => c.id !== cardId)
    }
    updateDeck(updated)
  }

  // Duplicate card
  const handleDuplicateCard = (card: CustomGameCard) => {
    const copy: CustomGameCard = {
      ...card,
      id: generateCardId("copy")
    }
    const updated = {
      ...deck,
      cards: [...deck.cards, copy]
    }
    updateDeck(updated)
  }

  // Move card up/down
  const handleMoveCard = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= deck.cards.length) return

    const newCards = [...deck.cards]
    const temp = newCards[index]
    newCards[index] = newCards[targetIdx]
    newCards[targetIdx] = temp

    updateDeck({ ...deck, cards: newCards })
  }

  // Shuffle deck
  const handleShuffleDeck = () => {
    const copy = [...deck.cards]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    updateDeck({ ...deck, cards: copy })
  }

  // Save deck to storage
  const handleSaveDeck = () => {
    saveDeckToStorage(deck)
    setSavedDecks(loadSavedDecksFromStorage())
    setSaveSuccessMessage(true)
    setTimeout(() => setSaveSuccessMessage(false), 2000)
  }

  // Import JSON
  const handleImportJson = () => {
    const imported = importDeckFromJson(jsonImportText)
    if (imported) {
      updateDeck(imported)
      setJsonImportText("")
      setJsonExportOpen(false)
      setActiveTab("create")
    } else {
      alert("Invalid custom deck JSON format.")
    }
  }

  const filteredCards = deck.cards.filter((card) => {
    if (typeFilter === "all") return true
    return card.type === typeFilter
  })

  const validation = validateCustomDeck(deck)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Builder Top Bar: Title & Deck Meta */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400 flex-shrink-0" />
            {isHost ? (
              <Input
                value={deck.title}
                onChange={(e) => updateDeck({ ...deck, title: e.target.value })}
                placeholder="Name Your Custom Deck..."
                className="bg-zinc-900/80 border-zinc-700/80 font-bold text-sm tracking-wide text-white h-9 rounded-xl max-w-sm"
              />
            ) : (
              <h3 className="font-bold text-base text-white tracking-wide">
                {deck.title}
              </h3>
            )}
            <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-mono text-[9px] uppercase px-2 py-0.5 tabular-nums">
              {deck.cards.length} Cards
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-400">
            {deck.description || "Custom game engine with synchronized cards, drinking penalties, and rules."}
          </p>
        </div>

        {/* Global Deck Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShuffleDeck}
            disabled={deck.cards.length < 2 || !isHost}
            className="h-8 rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-300 text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-800"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1 text-amber-400" /> Shuffle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDeck}
            className="h-8 rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-300 text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-800"
          >
            <Save className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            {saveSuccessMessage ? "Saved! ✓" : "Save Deck"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setJsonExportOpen(!jsonExportOpen)}
            className="h-8 rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-300 text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-cyan-400" /> JSON
          </Button>
        </div>
      </div>

      {/* JSON Import/Export Drawer */}
      <AnimatePresence>
        {jsonExportOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Deck JSON Code (Copy or Paste to Share)
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setJsonExportOpen(false)}
                className="text-zinc-500 h-6 px-2 text-xs"
              >
                Close
              </Button>
            </div>
            <textarea
              readOnly
              value={exportDeckToJson(deck)}
              className="w-full h-32 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-300 select-all"
            />
            <div className="space-y-2 pt-1 border-t border-zinc-900">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Paste JSON to Import Deck:
              </span>
              <div className="flex gap-2">
                <Input
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder="Paste JSON deck code here..."
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-9"
                />
                <Button
                  size="sm"
                  onClick={handleImportJson}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase text-[10px] px-4 rounded-xl h-9"
                >
                  Import
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-Host Player Suggestion Box */}
      {!isHost && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Contribute a Card to the Host's Deck
          </span>
          <p className="text-[11px] text-zinc-400">
            Submit a dare, rule, or confession. It will appear live in the host's deck builder with your name!
          </p>
          <div className="flex gap-2 pt-1">
            <Input
              value={suggestedPrompt}
              onChange={(e) => setSuggestedPrompt(e.target.value)}
              placeholder="e.g. Everyone wearing black takes 2 sips..."
              className="bg-zinc-900 border-zinc-800 rounded-xl text-xs h-10"
              onKeyDown={(e) => e.key === "Enter" && handleSuggestCard()}
            />
            <Button
              onClick={handleSuggestCard}
              className="bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase text-[10px] rounded-xl px-4 h-10"
            >
              {suggestSuccess ? "Submitted! ✓" : "Send Card"}
            </Button>
          </div>
        </div>
      )}

      {/* Host Builder Navigation Tabs */}
      {isHost && (
        <div className="flex flex-wrap gap-1 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "create"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Card Creator
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeTab === "templates"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Templates ({CUSTOM_GAME_TEMPLATES.length})
          </button>
          <button
            onClick={() => setActiveTab("personalities")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeTab === "personalities"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            Stars & Chaos (18k+)
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "bulk"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Bulk Paste
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "saved"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            My Saved ({savedDecks.length})
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CARD CREATOR                                                       */}
      {/* ========================================================================= */}
      {isHost && activeTab === "create" && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add a New Card
          </h4>

          {/* Prompt text input */}
          <div>
            <textarea
              rows={2}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Type your challenge, rule, confession, or question..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAddCard()
                }
              }}
            />
          </div>

          {/* Mechanism & Type Picker */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
              Card Mechanism:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
              {[
                { id: "action" as const, label: "💥 Action / Dare" },
                { id: "rule" as const, label: "📜 Party Rule" },
                { id: "vote" as const, label: "🎯 Group Vote" },
                { id: "dilemma" as const, label: "⚖️ Dilemma" },
                { id: "confession" as const, label: "🤫 Confession" },
                { id: "trivia" as const, label: "⚡ Speed Quiz" }
              ].map((t) => {
                const isSelected = cardType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCardType(t.id)}
                    className={`p-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border transition-all text-center ${
                      isSelected
                        ? "bg-zinc-100 text-black border-white shadow-md"
                        : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dilemma Inputs if Dilemma selected */}
          {cardType === "dilemma" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-zinc-950/60 rounded-2xl border border-zinc-800">
              <div>
                <label className="text-[8.5px] font-bold uppercase text-zinc-400 block mb-1">
                  Option A Label:
                </label>
                <Input
                  value={dilemmaOptA}
                  onChange={(e) => setDilemmaOptA(e.target.value)}
                  placeholder="e.g. Never have coffee again"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-9"
                />
              </div>
              <div>
                <label className="text-[8.5px] font-bold uppercase text-zinc-400 block mb-1">
                  Option B Label:
                </label>
                <Input
                  value={dilemmaOptB}
                  onChange={(e) => setDilemmaOptB(e.target.value)}
                  placeholder="e.g. Never have alcohol again"
                  className="bg-zinc-900 border-zinc-800 text-xs rounded-xl h-9"
                />
              </div>
            </div>
          )}

          {/* Sips & Target Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Sips Selector */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                <Beer className="w-3 h-3 text-amber-400" /> Sips Penalty:
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { s: 0, label: "0 (Fun)" },
                  { s: 1, label: "1 Sip" },
                  { s: 2, label: "2 Sips" },
                  { s: 3, label: "3 Sips" },
                  { s: 5, label: "Shot! 🥃" }
                ].map((item) => {
                  const isSelected = cardSips === item.s
                  return (
                    <button
                      key={item.s}
                      type="button"
                      onClick={() => setCardSips(item.s)}
                      className={`py-1.5 px-1 rounded-xl text-[9px] font-extrabold uppercase border text-center transition-all ${
                        isSelected
                          ? "bg-amber-400 text-black border-amber-300 font-black shadow-sm"
                          : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Target Selector */}
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> Who Drinks / Acts:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { t: "current" as const, label: "Current" },
                  { t: "all" as const, label: "Everyone" },
                  { t: "point" as const, label: "Pointed" },
                  { t: "rival" as const, label: "Rival" }
                ].map((item) => {
                  const isSelected = cardTarget === item.t
                  return (
                    <button
                      key={item.t}
                      type="button"
                      onClick={() => setCardTarget(item.t)}
                      className={`py-1.5 px-1 rounded-xl text-[9px] font-extrabold uppercase border text-center transition-all ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm"
                          : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Submit Card Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleAddCard}
              disabled={!promptContent.trim()}
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase tracking-wider text-xs px-6 h-10 rounded-xl border-0 shadow-lg shadow-amber-500/20 transition-all"
            >
              Add Card to Deck (+1)
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEMPLATES SELECTOR                                                 */}
      {/* ========================================================================= */}
      {isHost && activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pick a Curated Template to Load or Customize
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateDeck(createBlankDeck())
                setActiveTab("create")
              }}
              className="h-8 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px] uppercase font-bold"
            >
              Start Blank Slate
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CUSTOM_GAME_TEMPLATES.map((tmpl) => {
              const isCurrent = deck.title === tmpl.title
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`cursor-pointer bg-zinc-900/30 border rounded-2xl p-4 transition-all flex flex-col justify-between hover:border-zinc-700 shadow-lg ${
                    isCurrent ? "border-amber-400 bg-amber-950/15" : "border-zinc-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{tmpl.icon}</span>
                      {tmpl.isMature && (
                        <Badge className="bg-red-950/60 border border-red-900/40 text-red-400 text-[8px] font-black uppercase">
                          18+
                        </Badge>
                      )}
                    </div>
                    <h5 className="font-extrabold text-sm uppercase text-white tracking-wide">
                      {tmpl.title}
                    </h5>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase">
                    <span>{tmpl.cards.length} Cards</span>
                    <span className="text-amber-400">Load Template →</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: POP CULTURE & 18K+ STARS GENERATOR                                 */}
      {/* ========================================================================= */}
      {isHost && activeTab === "personalities" && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Pop-Culture & Celebrity Card Generator
              </h4>
              <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 font-mono text-[8px] uppercase tabular-nums">
                19k Catalog
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Dynamically generate celebrity dilemmas, room vibe-checks, speed roast challenges, and apocalyptic Kiss Marry Kill trios with Hollywood icons, Bollywood stars, YouTubers, models, and anime legends.
            </p>
          </div>

          {persSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              {persSuccessMessage}
            </motion.div>
          )}

          {/* Category Picker */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
              1. Choose Star Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "all", label: "All Pop Culture" },
                { id: "hollywood", label: "Hollywood & TV" },
                { id: "bollywood", label: "Bollywood" },
                { id: "creators", label: "Streamers & YouTube" },
                { id: "singers", label: "Music & Pop" },
                { id: "glamour", label: "Glamour & Models" },
                { id: "adultstars", label: "Adult Stars (18+)" },
                { id: "fantasy", label: "Anime & Fantasy" },
                { id: "athletes", label: "Athletes (Opt-In)" }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPersCategory(c.id)}
                  className={`p-2 rounded-xl text-[10px] font-bold uppercase tracking-wide border transition-all text-center ${
                    persCategory === c.id
                      ? "bg-zinc-100 text-black border-white shadow-md font-extrabold"
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario & Dilemma Style Picker */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
              2. Scenario & Question Mood:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "all" as const, label: "Wild Mix (All)", desc: "Dilemmas, votes & KMK" },
                { id: "quirky" as const, label: "Quirky & Absurd", desc: "Awkward elevator scenarios" },
                { id: "dark" as const, label: "Dark & Apocalyptic", desc: "Zombies, bunker pacts & trials" },
                { id: "spicy" as const, label: "Late Night Spicy (18+)", desc: "High drama & roasts" }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPersStyle(s.id)}
                  className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                    persStyle === s.id
                      ? "bg-amber-400 text-black border-amber-300 shadow-md"
                      : "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wide block">
                    {s.label}
                  </span>
                  <span className={`text-[8.5px] font-medium block mt-0.5 ${persStyle === s.id ? "text-zinc-900" : "text-zinc-500"}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Count & CTA Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-850">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                Number of Cards:
              </span>
              <div className="flex gap-1">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPersCount(num)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase border transition-all ${
                      persCount === num
                        ? "bg-white text-black border-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {num} Cards
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGeneratePersonalityCards}
              disabled={isGeneratingPers}
              className="bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-black font-black uppercase tracking-wider text-xs px-6 h-10 rounded-xl border-0 shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
            >
              {isGeneratingPers ? (
                "Summoning Stars..."
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Generate & Add +{persCount} Cards
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BULK PASTE                                                         */}
      {/* ========================================================================= */}
      {isHost && activeTab === "bulk" && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-1">
              Bulk Paste Prompts (10, 20, 50 at once)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Paste your list of dares, questions, or rules below. Each line becomes a distinct card. Mechanisms like dilemmas, votes, and penalties are auto-detected!
            </p>
          </div>

          <textarea
            rows={8}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={`Never have I ever lied about my age\nWould you rather fly or read minds?\nPoint at the person most likely to sleep through an alarm\nTake 2 sips if you arrived late tonight\nThe Little Green Man: remove imaginary green man from glass or drink`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Lines detected: {bulkInput.split("\n").filter((l) => l.trim().length > 0).length}
            </span>
            <Button
              onClick={handleAddBulkCards}
              disabled={!bulkInput.trim()}
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase text-xs px-6 h-10 rounded-xl border-0 shadow-lg"
            >
              Import All Lines into Deck
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SAVED DECKS                                                        */}
      {/* ========================================================================= */}
      {isHost && activeTab === "saved" && (
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            Saved Custom Decks in Browser Storage ({savedDecks.length})
          </span>

          {savedDecks.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/20 border border-zinc-800 rounded-2xl text-xs text-zinc-500">
              No saved custom decks yet. Tap "Save Deck" above to store your custom creations!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedDecks.map((d) => (
                <div
                  key={d.id}
                  className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-sm uppercase text-white truncate">
                      {d.title}
                    </h5>
                    <span className="text-[10px] text-zinc-400 block">
                      {d.cards.length} cards • Updated {new Date(d.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-850 flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateDeck(d)
                        setActiveTab("create")
                      }}
                      className="h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-bold uppercase text-[9px] px-3 border-0"
                    >
                      Load Deck
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE DECK CARDS LIST & MANAGEMENT                                         */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-2">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-white">
              Cards in Current Deck ({deck.cards.length})
            </h4>
            {!validation.isValid && (
              <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                {validation.errors[0]}
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex overflow-x-auto gap-1 pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "action", label: "Dares" },
              { id: "rule", label: "Rules" },
              { id: "vote", label: "Votes" },
              { id: "dilemma", label: "Dilemmas" },
              { id: "confession", label: "Confessions" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-colors ${
                  typeFilter === f.id
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "bg-zinc-950/60 border-zinc-850 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty Deck State */}
        {deck.cards.length === 0 ? (
          <div className="p-10 text-center bg-zinc-950/60 border border-zinc-800 rounded-3xl space-y-3">
            <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              This deck is currently empty.
            </span>
            <Button
              size="sm"
              onClick={() => handleSelectTemplate("wild-house-party")}
              className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold uppercase text-[10px] rounded-xl px-4 h-9 border-0"
            >
              Load Wild House Party Template
            </Button>
          </div>
        ) : (
          /* Cards Grid / Stack */
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-3.5 flex items-start justify-between gap-3 group hover:border-zinc-700 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono font-bold text-zinc-500">
                      #{idx + 1}
                    </span>
                    <Badge className="bg-zinc-800 border-zinc-700 text-zinc-300 text-[8px] font-black uppercase px-2 py-0.2">
                      {card.type}
                    </Badge>
                    {card.sips > 0 && (
                      <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[8px] font-bold uppercase px-1.5 py-0.2">
                        {card.sips} sips
                      </Badge>
                    )}
                    {card.isCurse && (
                      <Badge className="bg-purple-500/10 border-purple-500/30 text-purple-300 text-[8px] font-bold uppercase px-1.5 py-0.2">
                        Curse
                      </Badge>
                    )}
                    {card.submittedBy && (
                      <span className="text-[8px] text-zinc-500 uppercase font-bold">
                        by {card.submittedBy}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-xs text-white leading-relaxed">
                    {card.content}
                  </p>

                  {card.options && (
                    <div className="flex gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>A: {card.options[0]}</span>
                      <span>•</span>
                      <span>B: {card.options[1]}</span>
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                {isHost && (
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveCard(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-lg text-zinc-500 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCard(idx, "down")}
                      disabled={idx === deck.cards.length - 1}
                      className="p-1 rounded-lg text-zinc-500 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateCard(card)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-amber-400"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded-lg text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Custom Game CTA (if host and onStartGame passed) */}
      {isHost && onStartGame && (
        <div className="pt-2 flex justify-center">
          <Button
            onClick={onStartGame}
            disabled={!validation.isValid}
            className={`w-full sm:w-auto h-12 px-10 rounded-2xl font-black uppercase tracking-wider text-xs border-0 shadow-2xl transition-all ${
              validation.isValid
                ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Launch Custom Game ({deck.cards.length} Cards)
          </Button>
        </div>
      )}
    </div>
  )
}
