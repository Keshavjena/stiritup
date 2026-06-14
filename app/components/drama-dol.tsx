"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Theater, Zap, Trophy, Shuffle, Drama } from "lucide-react"

interface DramaDolProps {
  players: string[]
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
}

export function DramaDol({ players, onBack, darkMode, soundEnabled, playSound, matureContent }: DramaDolProps) {
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
      "🎭 Act out 'Romeo and Juliet' balcony scene with exaggerated emotions",
      "🎪 Perform a dramatic death scene from any movie",
      "🎬 Act like you're in a soap opera discovering a family secret",
      "🎯 Do a dramatic monologue as a rejected reality TV contestant",
      "🎭 Perform a Shakespearean soliloquy about pizza",
      "🎪 Act out a dramatic breakup scene with an imaginary partner",
      "🎬 Pretend to be a dramatic cooking show host making toast",
      "🎯 Do an overly emotional weather forecast",
      "🎭 Act like you're auditioning for a tragic romance movie",
      "🎪 Perform a dramatic courtroom scene as the defendant",
      "🎬 Act out receiving terrible news about your favorite TV show being cancelled",
      "🎯 Do a dramatic interpretation of 'Twinkle Twinkle Little Star'",
      "🎭 Perform as a dramatic sports commentator for thumb wrestling",
      "🎪 Act like you're in a period drama having tea",
      "🎬 Do a dramatic scene about losing your phone battery",
      "🎯 Perform a Shakespearean argument about pineapple on pizza",
      "🎭 Act out a dramatic reunion scene with your reflection",
      "🎪 Perform as a news anchor reporting on a missing sock",
      "🎬 Do a dramatic monologue about waiting in line at the DMV",
      "🎯 Act like you're in a medical drama saving a stuffed animal",
      "🎭 Perform a dramatic scene about finding the perfect parking spot",
      "🎪 Act out a courtroom drama defending your favorite childhood cartoon",
      "🎬 Do a dramatic interpretation of ordering at a drive-through",
      "🎯 Perform as a dramatic narrator for someone brushing their teeth",
      "🎭 Act like you're in a war movie, but the war is against mosquitoes",
      "🎪 Perform a dramatic scene about your WiFi going down",
      "🎬 Do a Shakespearean monologue about doing laundry",
      "🎯 Act out a dramatic confrontation with a vending machine",
      "🎭 Perform like you're in a telenovela discovering your evil twin",
      "🎪 Do a dramatic scene about the last slice of pizza",
    ],
    wild: [
      "🔥 Act out a seductive scene from a romance novel with a chair as your co-star",
      "💋 Perform a dramatic strip tease (keep it classy) or take 3 shots",
      "🎭 Act like you're auditioning for an adult film (PG-13 version)",
      "🔥 Do sultry dance while dramatically reading a grocery list",
      "💋 Perform a romantic scene with the sexiest voice you can manage",
      "🎭 Act out a dramatic breakup because your partner is 'too good in bed'",
      "🔥 Do a dramatic monologue about your most embarrassing intimate moment",
      "💋 Perform like you're seducing someone through interpretive dance",
      "🎭 Act out a scene where you dramatically discover your partner's kink",
      "🔥 Do a theatrical reading of the worst pickup lines you know",
      "💋 Perform a dramatic scene about sexting the wrong person",
      "🎭 Act like you're in a soap opera love triangle",
      "🔥 Do a sultry performance of 'Happy Birthday' to someone in the room",
      "💋 Perform a dramatic scene about walk of shame",
      "🎭 Act out discovering your roommate's sex toys dramatically",
      "🔥 Do a dramatic monologue about your worst date ever",
      "💋 Perform like you're auditioning to be someone's fantasy",
      "🎭 Act out a dramatic scene about forgetting someone's name after a hookup",
      "🔥 Do a theatrical interpretation of explaining the birds and bees",
      "💋 Perform a dramatic scene about your most awkward intimate encounter",
      "🎭 Act like you're in a medical drama explaining sexual health",
      "🔥 Do a sultry reading of Terms and Conditions",
      "💋 Perform a dramatic scene about getting caught in the act",
      "🎭 Act out a courtroom drama about your dating life",
      "🔥 Do a dramatic monologue as someone's disappointed ex",
      "💋 Perform like you're teaching a masterclass in flirting",
      "🎭 Act out a scene about dramatic morning after awkwardness",
      "🔥 Do a theatrical performance about modern dating apps",
      "💋 Perform a dramatic scene about your most embarrassing body function during intimacy",
      "🎭 Act like you're in a telenovela about forbidden love",
    ],
    extreme: [
      "🌶️ Perform a lap dance for someone while reciting Shakespeare OR take 5 shots",
      "🔥 Act out your orgasm face dramatically OR finish your drink",
      "💥 Do a strip tease to nursery rhymes OR take 4 shots and remove clothing",
      "🌶️ Perform oral sex on a banana/hot dog dramatically OR take 6 shots",
      "🔥 Act out the most inappropriate thing you'd do in public OR empty your glass",
      "💥 Do a sensual body shot presentation OR take a double shot",
      "🌶️ Perform like you're filming an intimate scene OR take 5 shots",
      "🔥 Act out your kinkiest fantasy (keep clothes on) OR drink for 30 seconds straight",
      "💥 Do a dramatic masturbation scene (clothed) OR take 7 shots",
      "🌶️ Perform like you're in an adult film audition OR finish two drinks",
      "🔥 Act out giving 'the talk' to your parents OR take 6 shots",
      "💥 Do a dramatic interpretation of your first time OR empty your glass",
      "🌶️ Perform a seductive scene with food OR take 5 shots and feed someone",
      "🔥 Act like you're narrating your own sex tape OR take 8 shots",
      "💥 Do a dramatic reading of your browser history OR drink everything in sight",
      "🌶️ Perform like you're a dominatrix giving commands OR take 6 shots",
      "🔥 Act out your most embarrassing bedroom moment OR finish your drink twice",
      "💥 Do a dramatic scene about your weirdest turn-on OR take 7 shots",
      "🌶️ Perform oral techniques on your thumb dramatically OR take 5 shots",
      "🔥 Act like you're teaching sex ed to aliens OR drink for 45 seconds",
      "💥 Do a dramatic interpretation of different orgasm types OR take 6 shots",
      "🌶️ Perform like you're confessing your dirtiest secret OR empty your glass",
      "🔥 Act out a threesome negotiation scene OR take 8 shots",
      "💥 Do a dramatic monologue about your ideal orgy OR finish two drinks",
      "🌶️ Perform like you're a phone sex operator OR take 7 shots",
      "🔥 Act out discovering your partner's secret fetish OR drink everything available",
      "💥 Do a sultry interpretation of explaining consent OR take 6 shots",
      "🌶️ Perform like you're in a kinky role-play scenario OR take 5 shots and act it out",
      "🔥 Act out your reaction to the best sex of your life OR finish your drink three times",
      "💥 Do a dramatic scene about joining the mile-high club OR take 9 shots",
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

    // Set drink penalty based on mode
    setDrinkPenalty(gameMode === "extreme" ? 3 : gameMode === "wild" ? 2 : 1)
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

  const performChallenge = () => {
    playSound("success")
    setPlayerScores((prev) => ({
      ...prev,
      [players[currentPlayer]]: (prev[players[currentPlayer]] || 0) + 1,
    }))
    nextChallenge()
  }

  const takeDrink = () => {
    playSound("click")
    nextChallenge()
  }

  if (!gameStarted) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-pink-50 to-purple-50"}`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-pink-100 dark:hover:bg-pink-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <div className="text-6xl mb-4">🎬</div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Drama-Dol Act or Get Sloshed
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">Act it out or drink up - no in between!</p>
            </div>

            <Card className="mb-8 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20">
              <CardHeader>
                <CardTitle className="text-pink-800 dark:text-pink-200">Choose Your Drama Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant={gameMode === "classic" ? "default" : "outline"}
                    className="w-full h-16 text-left"
                    onClick={() => setGameMode("classic")}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎭</span>
                      <div>
                        <div className="font-bold">Classic Drama</div>
                        <div className="text-sm opacity-75">Theatrical fun for everyone!</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant={gameMode === "wild" ? "default" : "outline"}
                    className="w-full h-16 text-left"
                    onClick={() => setGameMode("wild")}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <div className="font-bold">Wild Drama</div>
                        <div className="text-sm opacity-75">Spicy performances and dares!</div>
                      </div>
                    </div>
                  </Button>

                  {matureContent && (
                    <Button
                      variant={gameMode === "extreme" ? "default" : "outline"}
                      className="w-full h-16 text-left bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      onClick={() => setGameMode("extreme")}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💥</span>
                        <div>
                          <div className="font-bold">Extreme Drama (18+)</div>
                          <div className="text-sm opacity-75">No limits, maximum chaos!</div>
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Game Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <ul className="list-disc list-inside space-y-2">
                  <li>Each player gets a performance challenge</li>
                  <li>You can either ACT it out or DRINK up</li>
                  <li>Acting earns you points, drinking earns you... well, drinks!</li>
                  <li>
                    Drink penalty: {gameMode === "extreme" ? "3 shots" : gameMode === "wild" ? "2 shots" : "1 shot"}
                  </li>
                  <li>Most dramatic performance wins the round!</li>
                </ul>
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
                        index === currentPlayer ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white" : ""
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
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold"
            >
              <Theater className="w-6 h-6 mr-2" />
              Start the Show!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-pink-50 to-purple-50"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="hover:bg-pink-100 dark:hover:bg-pink-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              End Game
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">🎬 Drama-Dol</h1>
              <p className="text-gray-600 dark:text-gray-300">{players[currentPlayer]}'s turn</p>
              <Badge
                className={`mt-1 ${
                  gameMode === "extreme"
                    ? "bg-red-500 text-white"
                    : gameMode === "wild"
                      ? "bg-orange-500 text-white"
                      : "bg-pink-500 text-white"
                }`}
              >
                {gameMode === "classic" ? "🎭 Classic" : gameMode === "wild" ? "🔥 Wild" : "💥 Extreme"}
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
                Performance Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player) => (
                  <div key={player} className="text-center">
                    <div className="font-semibold">{player}</div>
                    <div className="text-2xl font-bold text-pink-600">{playerScores[player] || 0}</div>
                    <div className="text-sm text-gray-500">performances</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Player */}
          <Card className="mb-6 border-4 border-pink-300 dark:border-pink-600">
            <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
              <CardTitle className="text-center text-2xl">🎭 {players[currentPlayer]}'s Performance</CardTitle>
            </CardHeader>
          </Card>

          {/* Challenge Card */}
          <Card className="mb-8 min-h-[300px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed mb-6">
                {currentChallenge}
              </div>
              {gameMode === "extreme" && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white mb-4">
                  💥 EXTREME CHALLENGE!
                </Badge>
              )}
              <div className="text-lg text-gray-600 dark:text-gray-300">
                Perform this challenge OR take {drinkPenalty} shot{drinkPenalty > 1 ? "s" : ""}!
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Button
              onClick={performChallenge}
              size="lg"
              className="h-20 text-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Theater className="w-6 h-6 mr-3" />
              <div>
                <div className="font-bold">ACT IT OUT!</div>
                <div className="text-sm opacity-75">Earn a performance point</div>
              </div>
            </Button>

            <Button
              onClick={takeDrink}
              size="lg"
              variant="outline"
              className="h-20 text-xl border-2 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
            >
              <Zap className="w-6 h-6 mr-3" />
              <div>
                <div className="font-bold">DRINK UP!</div>
                <div className="text-sm opacity-75">
                  Take {drinkPenalty} shot{drinkPenalty > 1 ? "s" : ""}
                </div>
              </div>
            </Button>
          </div>

          {/* Game Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Button onClick={shuffleChallenges} variant="outline" size="lg" className="h-16 text-lg bg-transparent">
              <Shuffle className="w-5 h-5 mr-2" />
              Shuffle Challenges
            </Button>

            <Button
              onClick={() =>
                setGameMode(
                  gameMode === "classic"
                    ? "wild"
                    : gameMode === "wild"
                      ? matureContent
                        ? "extreme"
                        : "classic"
                      : "classic",
                )
              }
              variant="outline"
              size="lg"
              className="h-16 text-lg bg-transparent"
            >
              <Drama className="w-5 h-5 mr-2" />
              Switch Drama Level
            </Button>
          </div>

          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Players & Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {players.map((player, index) => (
                  <Badge
                    key={index}
                    variant={index === currentPlayer ? "default" : "secondary"}
                    className={`text-lg px-4 py-2 ${
                      index === currentPlayer
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white animate-pulse"
                        : ""
                    }`}
                  >
                    {player}
                    <span className="ml-2 text-sm">({playerScores[player] || 0} acts)</span>
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
