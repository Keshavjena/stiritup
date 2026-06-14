"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Trophy, Shuffle, Heart } from "lucide-react"

interface IndianDrinkingGameProps {
  players: string[]
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
}

export function IndianDrinkingGame({
  players,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
}: IndianDrinkingGameProps) {
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
      "Draw a famous Bollywood actor using only your non-dominant hand",
      "Name 5 movies with Deepika Padukone in 30 seconds",
      "Do the Lungi Dance with maximum energy",
      "Quote 3 famous dialogues from 3 Idiots",
      "Recreate the iconic Kuch Kuch Hota Hai basketball scene",
      "Sing any Kishore Kumar song in your worst voice",
      "Act like Rajinikanth for the next 2 rounds",
      "Do the signature step from Bhangra Paa Le",
      "Name all the Khans in Bollywood in 20 seconds",
      "Recreate the Sholay friendship scene",
      "Dance to Tum Hi Ho like it's a party song",
      "Describe Lagaan plot using only cricket terms",
      "Do Amitabh Bachchan's famous dialogue from Zanjeer",
      "Perform the Malhari dance with full energy",
      "Sing Jana Gana Mana in a Bollywood style",
      "Name 3 movies of Aamir Khan, Salman Khan, and Shah Rukh Khan each",
      "Act out the climax scene from Dangal",
      "Do the signature dance from Jai Ho",
      "Recreate the Om Shanti Om title track dance",
      "Act like you're in a typical Bollywood romantic song",
      "Hum a popular A.R. Rahman tune and let others guess",
      "Name 5 Bollywood movies released in 2023",
      "Recreate the bike scene from Dhoom",
      "Dance like you're in a Yash Raj Films movie",
      "Draw the poster of Mughal-E-Azam from memory",
    ],
    desi: [
      "Pretend to be a cricket commentator for an imaginary match",
      "Describe your favorite Indian dish in the most poetic way",
      "Do a classical Indian dance move for 1 minute",
      "Act out a typical Indian wedding scene",
      "Eat something spicy and maintain a poker face",
      "Name 10 Indian states and their capitals",
      "Do an impression of your Indian mom when she's angry",
      "Perform a typical Bollywood romantic proposal",
      "Describe how to make chai without using the word tea",
      "Sing any bhajan or devotional song",
      "Name 5 Indian festivals and explain one",
      "Act like you're bargaining at a local market",
      "Do the typical Indian head nod for 30 seconds",
      "Describe Diwali to someone who's never heard of it",
      "Name 10 Bollywood actors from the 90s",
      "Recreate a typical Indian family dinner conversation",
      "Act like you're explaining cricket to a foreigner",
      "Do a traditional Indian greeting to everyone in the room",
      "Name 5 Indian languages and say hello in each",
      "Act out a scene from Ramayana or Mahabharata",
      "Do a bhangra dance for 1 minute straight",
      "Describe your mom's cooking without making anyone cry",
      "Name 10 Indian cities that start with B",
      "Act like an Indian rickshaw driver negotiating fare",
      "Sing Vande Mataram with full patriotic emotion",
      "Explain the benefits of yoga in the most Indian way",
      "Name all the cricketers in the current Indian team",
      "Act out a typical Indian parent-teacher meeting",
      "Do a classical Indian mudra (hand gesture) tutorial",
      "Describe the process of making jalebi dramatically",
    ],
    masala: [
      "Take a shot and then recite the alphabet backwards",
      "Kiss the person to your left on the cheek",
      "Take two sips and tell everyone your most embarrassing desi moment",
      "Strip one piece of clothing or take 3 sips",
      "Tell someone in the room why you find them attractive",
      "Take a body shot off someone in the room",
      "Drink and then tell your worst dating story",
      "Give someone a 30-second massage",
      "Do a sexy dance for 1 minute or take 4 sips",
      "Truth: What's your biggest turn-on? Or take 2 shots",
      "Dare: Whisper something dirty in someone's ear",
      "Take 3 sips and reveal your biggest sexual fantasy",
      "Act out a Bollywood intimate scene with someone",
      "French kiss someone's hand for 10 seconds",
      "Take off your shirt or take 5 sips",
      "Drink and tell everyone about your first kiss",
      "Give someone a lap dance for 30 seconds",
      "Strip down to underwear or finish your drink",
      "Make out with someone for 1 minute or take 6 sips",
      "Suck on someone's finger for 15 seconds",
      "Take 4 sips and describe your ideal one-night stand",
      "Recreate a scene from Fifty Shades Bollywood style",
      "Tell someone their most attractive feature",
      "Take a shot off someone's belly button",
      "Drink and share your kinkiest fantasy",
      "Kiss someone's neck for 10 seconds",
      "Do a striptease dance or empty your glass",
      "Take 5 sips and reveal who you'd sleep with in this room",
      "Give someone a hickey or take a double shot",
      "Take 3 sips and describe your favorite position",
    ],
  }

  useEffect(() => {
    const content = challengeContent[gameMode]
    setChallenges(content)
    setCurrentChallenge(content[0])

    // Initialize scores
    const scores: Record<string, number> = {}
    players.forEach((player) => {
      scores[player] = 0
    })
    setPlayerScores(scores)
  }, [gameMode, players])

  const startGame = () => {
    playSound("success")
    setGameStarted(true)
  }

  const nextChallenge = () => {
    playSound("click")
    setCurrentPlayer((prev) => (prev + 1) % players.length)
    const newIndex = (challengeIndex + 1) % challenges.length
    setChallengeIndex(newIndex)
    setCurrentChallenge(challenges[newIndex])
  }

  const shuffleChallenges = () => {
    playSound("click")
    const shuffled = [...challenges].sort(() => Math.random() - 0.5)
    setChallenges(shuffled)
    setCurrentChallenge(shuffled[0])
    setChallengeIndex(0)
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
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-orange-50 to-red-50"}`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-orange-100 dark:hover:bg-orange-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Ultimate Indian Drinking Game
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">Bollywood meets party games - desi style!</p>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-200">Game Modes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant={gameMode === "bollywood" ? "default" : "outline"}
                    className="w-full h-16 text-left"
                    onClick={() => setGameMode("bollywood")}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold">Bollywood Mode</div>
                        <div className="text-sm opacity-75">Movies, songs, and dancing!</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant={gameMode === "desi" ? "default" : "outline"}
                    className="w-full h-16 text-left"
                    onClick={() => setGameMode("desi")}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-bold">Desi Culture Mode</div>
                        <div className="text-sm opacity-75">Cricket, festivals, and traditions!</div>
                      </div>
                    </div>
                  </Button>

                  {matureContent && (
                    <Button
                      variant={gameMode === "masala" ? "default" : "outline"}
                      className="w-full h-16 text-left bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      onClick={() => setGameMode("masala")}
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold">Masala Mode (18+)</div>
                          <div className="text-sm opacity-75">Spicy challenges and dares!</div>
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-3">
                  {players.map((player, index) => (
                    <Badge
                      key={index}
                      variant={index === currentPlayer ? "default" : "secondary"}
                      className={`text-lg px-4 py-2 ${
                        index === currentPlayer ? "bg-gradient-to-r from-orange-600 to-red-600 text-white" : ""
                      }`}
                    >
                      {player}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={startGame}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl font-semibold"
            >
              <Star className="w-6 h-6 mr-2" />
              Start the Desi Party!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-orange-50 to-red-50"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="hover:bg-orange-100 dark:hover:bg-orange-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              End Game
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                Ultimate Indian Drinking Game
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{players[currentPlayer]}'s turn</p>
              <Badge
                className={`mt-1 ${
                  gameMode === "masala"
                    ? "bg-red-500 text-white"
                    : gameMode === "bollywood"
                      ? "bg-purple-500 text-white"
                      : "bg-orange-500 text-white"
                }`}
              >
                {gameMode === "bollywood" ? "Bollywood" : gameMode === "desi" ? "Desi Culture" : "Masala Mode"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          {/* Scoring */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player) => (
                  <div key={player} className="text-center">
                    <div className="font-semibold">{player}</div>
                    <div className="text-2xl font-bold text-orange-600">{playerScores[player] || 0}</div>
                    <Button size="sm" variant="outline" onClick={() => awardPoint(player)} className="mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      +1
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Player */}
          <Card className="mb-6 border-4 border-orange-300 dark:border-orange-600">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardTitle className="text-center text-2xl">{players[currentPlayer]}'s Challenge</CardTitle>
            </CardHeader>
          </Card>

          {/* Challenge Card */}
          <Card className="mb-8 min-h-[300px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed mb-4">
                {currentChallenge}
              </div>
              {gameMode === "masala" && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">Spicy Challenge!</Badge>
              )}
            </CardContent>
          </Card>

          {/* Game Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button onClick={shuffleChallenges} variant="outline" size="lg" className="h-16 text-lg bg-transparent">
              <Shuffle className="w-5 h-5 mr-2" />
              Shuffle
            </Button>

            <Button
              onClick={nextChallenge}
              size="lg"
              className="h-16 text-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Star className="w-5 h-5 mr-2" />
              Next Challenge
            </Button>

            <Button
              onClick={() =>
                setGameMode(
                  gameMode === "bollywood"
                    ? "desi"
                    : gameMode === "desi"
                      ? matureContent
                        ? "masala"
                        : "bollywood"
                      : "bollywood",
                )
              }
              variant="outline"
              size="lg"
              className="h-16 text-lg bg-transparent"
            >
              <Heart className="w-5 h-5 mr-2" />
              Switch Mode
            </Button>
          </div>

          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {players.map((player, index) => (
                  <Badge
                    key={index}
                    variant={index === currentPlayer ? "default" : "secondary"}
                    className={`text-lg px-4 py-2 ${
                      index === currentPlayer
                        ? "bg-gradient-to-r from-orange-600 to-red-600 text-white animate-pulse"
                        : ""
                    }`}
                  >
                    {player}
                    <span className="ml-2 text-sm">({playerScores[player] || 0})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
