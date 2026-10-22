"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash2, Sparkles, Check, Image as ImageIcon, Sliders } from "lucide-react"
import type { DraftPreset, DraftRosterSlot, DraftItem } from "@/lib/draft/types"

interface CustomThemeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preset: DraftPreset) => void
  initialPreset?: DraftPreset | null
}

export function DraftCustomThemeModal({
  isOpen,
  onClose,
  onSave,
  initialPreset
}: CustomThemeModalProps) {
  const [name, setName] = useState(initialPreset?.name ? `${initialPreset.name} (Variant)` : "Custom Dream Draft")
  const [description, setDescription] = useState(
    initialPreset?.description || "A custom auction draft configured by players."
  )
  const [currencySymbol, setCurrencySymbol] = useState(initialPreset?.currencySymbol || "$")
  const [startingBudget, setStartingBudget] = useState(initialPreset?.startingBudget || 100)
  const [minBidIncrement, setMinBidIncrement] = useState(initialPreset?.minBidIncrement || 1)
  const [nominationTimerSeconds, setNominationTimerSeconds] = useState(
    initialPreset?.nominationTimerSeconds || 20
  )

  const [rosterSlots, setRosterSlots] = useState<DraftRosterSlot[]>(
    initialPreset?.rosterSlots || [
      { id: "slot-1", name: "MVP Captain", slotCategory: "Captain", allowedCategories: ["Captain"], required: true, isWildcard: false },
      { id: "slot-2", name: "Star Performer", slotCategory: "Star", allowedCategories: ["Star"], required: true, isWildcard: false },
      { id: "slot-3", name: "Specialist", slotCategory: "Specialist", allowedCategories: ["Specialist"], required: true, isWildcard: false },
      { id: "slot-4", name: "Wildcard Any", slotCategory: "Wildcard", allowedCategories: ["Wildcard"], required: false, isWildcard: true }
    ]
  )

  const [items, setItems] = useState<DraftItem[]>(
    initialPreset?.items || [
      {
        id: "item-custom-1",
        name: "Diamond Ace",
        category: "Captain",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        description: "Proven leader with championship pedigree.",
        baseValuation: 25,
        stats: { Leadership: 96, Impact: 92, Clutch: 94 }
      },
      {
        id: "item-custom-2",
        name: "Shadow Prodigy",
        category: "Star",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        description: "Explosive playmaker capable of turning any game around.",
        baseValuation: 22,
        stats: { Skill: 98, Speed: 95, Flair: 91 }
      },
      {
        id: "item-custom-3",
        name: "Iron Vanguard",
        category: "Specialist",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        description: "Unyielding defense and tactical consistency.",
        baseValuation: 20,
        stats: { Defense: 95, Discipline: 94, Stamina: 90 }
      },
      {
        id: "item-custom-4",
        name: "Cosmic Enigma",
        category: "Wildcard",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        description: "Unpredictable wildcard with raw game-breaking talent.",
        baseValuation: 20,
        stats: { Magic: 99, Adaptability: 93, Chaos: 88 }
      }
    ]
  )

  // Quick item input state
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("Captain")
  const [newItemImageUrl, setNewItemImageUrl] = useState("")
  const [newItemDesc, setNewItemDesc] = useState("")
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)

  const handleAddSlot = () => {
    const newId = `slot-${Date.now()}`
    setRosterSlots((prev) => [
      ...prev,
      {
        id: newId,
        name: `Slot ${prev.length + 1}`,
        slotCategory: "Wildcard",
        allowedCategories: ["Wildcard"],
        required: false,
        isWildcard: true
      }
    ])
  }

  const handleRemoveSlot = (slotId: string) => {
    if (rosterSlots.length <= 1) return
    setRosterSlots((prev) => prev.filter((s) => s.id !== slotId))
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) return
    const newItem: DraftItem = {
      id: `custom-item-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory || "Wildcard",
      imageUrl:
        newItemImageUrl.trim() ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80",
      description: newItemDesc.trim() || "Custom drafted item with unique capabilities.",
      baseValuation: 20,
      stats: { Rating: 90, Value: 88 }
    }
    setItems((prev) => [...prev, newItem])
    setNewItemName("")
    setNewItemImageUrl("")
    setNewItemDesc("")
  }

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const handleImportSampleItems = () => {
    const samples: DraftItem[] = [
      {
        id: `sample-${Date.now()}-1`,
        name: "Hyper-Drive Quantum Frigate",
        category: "Star",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        description: "Equipped with tachyon shields and twin railguns.",
        baseValuation: 25,
        stats: { Firepower: 96, Speed: 95, OVR: 95 },
        tags: ["Sci-Fi", "Starship"]
      },
      {
        id: `sample-${Date.now()}-2`,
        name: "Cursed Dragon Tooth Glaive",
        category: "Specialist",
        imageUrl: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=600&q=80",
        description: "Carved from the obsidian fang of an elder dragon.",
        baseValuation: 24,
        stats: { Slash: 97, Flame: 94, OVR: 95 },
        tags: ["Mythic", "Weapon"]
      }
    ]
    setItems((prev) => [...prev, ...samples])
  }

  const handleSave = () => {
    if (!name.trim()) return
    const customPreset: DraftPreset = {
      id: `custom-${Date.now()}`,
      title: name.trim(),
      name: name.trim(),
      description: description.trim(),
      icon: "✨",
      theme: "custom",
      currencySymbol: currencySymbol.trim() || "$",
      startingBudget: Number(startingBudget) || 100,
      minStartingBid: 1,
      minBidIncrement: Number(minBidIncrement) || 1,
      timerSeconds: Number(nominationTimerSeconds) || 20,
      nominationTimerSeconds: Number(nominationTimerSeconds) || 20,
      antiSnipingSeconds: 5,
      rosterSlots,
      items,
      scoringConfig: {
        budgetBonusPerUnit: 0.5,
        fullRosterBonus: 25,
        synergyMultiplier: 8
      }
    }
    onSave(customPreset)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl my-8 bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-100 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Create Custom Draft Theme</h3>
                <p className="text-xs text-zinc-400">Define budgets, roster rules, and auction items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Scrollable Area */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Theme Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                  placeholder="e.g. 90s Hip Hop Hall of Fame"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                  placeholder="e.g. $, ⚡, ⭐, 👑"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 focus:outline-none text-white text-sm"
                placeholder="Brief summary of this draft auction theme"
              />
            </div>

            {/* Auction Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Starting Budget</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={startingBudget}
                  onChange={(e) => setStartingBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Min Bid Increment</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nomination Timer (sec)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={nominationTimerSeconds}
                  onChange={(e) => setNominationTimerSeconds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm"
                />
              </div>
            </div>

            {/* Roster Slots Configuration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-300">
                  Roster Slots ({rosterSlots.length} required per team)
                </span>
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </button>
              </div>

              <div className="space-y-2">
                {rosterSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm"
                  >
                    <span className="text-xs text-zinc-500 font-mono w-6">#{index + 1}</span>
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => {
                        const val = e.target.value
                        setRosterSlots((prev) =>
                          prev.map((s) => (s.id === slot.id ? { ...s, name: val } : s))
                        )
                      }}
                      placeholder="Slot name"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={slot.slotCategory || slot.allowedCategories?.[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value
                        setRosterSlots((prev) =>
                          prev.map((s) =>
                            s.id === slot.id ? { ...s, slotCategory: val, allowedCategories: [val] } : s
                          )
                        )
                      }}
                      placeholder="Category"
                      className="w-28 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 text-xs focus:outline-none"
                    />
                    <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(slot.isWildcard || !slot.required)}
                        onChange={(e) => {
                          const val = e.target.checked
                          setRosterSlots((prev) =>
                            prev.map((s) => (s.id === slot.id ? { ...s, isWildcard: val, required: !val } : s))
                          )
                        }}
                        className="rounded accent-amber-500"
                      />
                      Wildcard
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Pool Builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-300">
                  Auction Item Pool ({items.length} items ready)
                </span>
                <button
                  type="button"
                  onClick={handleImportSampleItems}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  + Add Sample Items
                </button>
              </div>

              {/* Add New Item Mini-Form */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item or Celebrity name"
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="Slot Category match"
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="url"
                    value={newItemImageUrl}
                    onChange={(e) => setNewItemImageUrl(e.target.value)}
                    placeholder="Image URL (optional)"
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="One-line bio or description"
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition"
                >
                  + Add Item to Auction Pool
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-semibold text-white truncate block">{item.name}</span>
                        <span className="text-zinc-400 text-[10px]">{item.category}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save & Use Theme
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
