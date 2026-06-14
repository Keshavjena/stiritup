"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Users, Play, Shuffle, Crown } from "lucide-react"

interface PlayerSetupProps {
  gameName: string
  onBack: () => void
  onStart: (players: string[]) => void
  darkMode: boolean
  playSound: (type: "click" | "success" | "transition") => void
}

export function PlayerSetup({ gameName, onBack, onStart, darkMode, playSound }: PlayerSetupProps) {
  const [players, setPlayers] = useState<string[]>([""])
  const [roomCode, setRoomCode] = useState("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  const addPlayer = () => {
    playSound("click")
    setPlayers([...players, ""])
  }

  const removePlayer = (index: number) => {
    playSound("click")
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players]
    newPlayers[index] = name
    setPlayers(newPlayers)
  }

  const shufflePlayers = () => {
    playSound("click")
    const validPlayers = players.filter((p) => p.trim())
    const shuffled = [...validPlayers].sort(() => Math.random() - 0.5)
    setPlayers([...shuffled, ...Array(Math.max(0, players.length - validPlayers.length)).fill("")])
  }

  const handleStart = () => {
    const validPlayers = players.filter((p) => p.trim())
    if (validPlayers.length >= 2) {
      onStart(validPlayers)
    }
  }

  const generateRoomCode = () => {
    playSound("click")
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
    setIsCreatingRoom(true)
  }

  const validPlayers = players.filter((p) => p.trim())

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "dark bg-black" : "bg-white"}`}>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-12">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Setup {gameName}</h1>
              <p className="text-gray-600 dark:text-gray-400">Add players and get ready to play</p>
            </div>
          </div>

          {/* Room Creation */}
          <Card className="mb-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center text-black dark:text-white">
                <Users className="w-5 h-5 mr-2" />
                Multiplayer Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isCreatingRoom ? (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Want to play with friends online? Create a room!
                  </p>
                  <Button
                    onClick={generateRoomCode}
                    className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Create Room
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Share this code with your friends:</p>
                  <div className="text-4xl font-bold text-black dark:text-white bg-gray-100 dark:bg-gray-800 rounded-xl py-6 mb-6">
                    {roomCode}
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Room created! Friends can join with this code
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Player Setup */}
          <Card className="mb-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-black dark:text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Players ({validPlayers.length})
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shufflePlayers}
                    disabled={validPlayers.length < 2}
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white bg-transparent"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPlayer}
                    disabled={players.length >= 10}
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-bold">
                      {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                    </div>
                    <Input
                      placeholder={`Player ${index + 1} name`}
                      value={player}
                      onChange={(e) => updatePlayer(index, e.target.value)}
                      className="flex-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-black focus:border-black dark:focus:border-white"
                    />
                    {players.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(index)}
                        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {validPlayers.length < 2 && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    You need at least 2 players to start the game!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Rules Preview */}
          <Card className="mb-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-black dark:text-white">Quick Rules for {gameName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600 dark:text-gray-400 leading-relaxed">{getGameRules(gameName)}</div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleStart}
              disabled={validPlayers.length < 2}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-12 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGameRules(gameName: string): string {
  const rules: Record<string, string> = {
    "Never Have I Ever":
      "Players take turns saying something they've never done. Anyone who HAS done it must drink or take a penalty!",
    "Truth or Dare": "Choose truth to answer a question honestly, or dare to complete a challenge. No backing down!",
    "Who's Most Likely To":
      "Read a scenario and everyone points to who they think is most likely to do it. The person with the most votes drinks!",
    "Would You Rather": "Choose between two difficult options. Discuss your choices and see who agrees!",
    "If You Had To": "Complete hypothetical scenarios with creative solutions. The most creative answer wins!",
    "Drink If": "Read statements and drink if they apply to you. Simple but effective!",
    "Hot Seat": "One player sits in the hot seat while everyone else asks them questions. No question is off limits!",
    Paranoia: "Whisper a question about someone in the group. They hear the answer but not the question!",
    "Kiss Marry Kill": "Choose what you'd do with three people/characters. Classic dilemma game!",
    "Spin the Bottle": "Spin and see where fate takes you. Digital bottle, real consequences!",
    "Rapid Fire": "Quick questions, quick answers. Keep the energy high and the responses flowing!",
    "Strip or Sip": "Choose your consequence - remove an item of clothing or take a drink!",
    "Emoji Decode": "Guess the phrase, movie, or song from emoji clues. Test your emoji skills!",
    "Role Roulette": "Act out random characters and scenarios. Let your creativity shine!",
    "Custom Game": "Create your own rules and content. Make it as wild or tame as you want!",
  }

  return rules[gameName] || "Get ready for an amazing party game experience!"
}
