"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Crown, Trophy, Shuffle, ThumbsUp } from "lucide-react"

interface CardsAgainstHumanityProps {
  players: string[]
  onBack: () => void
  darkMode: boolean
  soundEnabled: boolean
  playSound: (type: "click" | "success" | "transition") => void
  matureContent: boolean
}

interface BlackCard {
  text: string
  blanks: number
}

interface WhiteCard {
  text: string
}

export function CardsAgainstHumanity({
  players,
  onBack,
  darkMode,
  soundEnabled,
  playSound,
  matureContent,
}: CardsAgainstHumanityProps) {
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
    { text: "_ + _ = _", blanks: 3 },
    { text: "What ended my last relationship?", blanks: 1 },
    { text: "What's my secret power?", blanks: 1 },
    { text: "What would grandma find disturbing, yet oddly charming?", blanks: 1 },
    { text: "What's the most emo?", blanks: 1 },
    { text: "Instead of coal, Santa now gives the bad children _.", blanks: 1 },
    { text: "What gives me uncontrollable gas?", blanks: 1 },
    { text: "What's there a ton of in heaven?", blanks: 1 },
    { text: "What did I bring back from Mexico?", blanks: 1 },
    { text: "What am I giving up for Lent?", blanks: 1 },
    { text: "What helps Obama unwind?", blanks: 1 },
    { text: "What's the new fad diet?", blanks: 1 },
    { text: "What's my anti-drug?", blanks: 1 },
    { text: "What will always get you laid?", blanks: 1 },
    { text: "What did the US airdrop to the children of Afghanistan?", blanks: 1 },
    { text: "What do old people smell like?", blanks: 1 },
    { text: "What's the crustiest?", blanks: 1 },
    { text: "What would I find in my happy place?", blanks: 1 },
    { text: "What's impossible to do with a straight face?", blanks: 1 },
    { text: "What makes life worth living?", blanks: 1 },
    { text: "What's the worst thing about being a kid?", blanks: 1 },
    { text: "What keeps me warm during the cold, cold winter?", blanks: 1 },
    { text: "What's fun until it gets weird?", blanks: 1 },
    { text: "What's the most awkward thing to say at a wedding?", blanks: 1 },
    { text: "What ruins a first date?", blanks: 1 },
  ]

  const whiteCards: WhiteCard[] = [
    { text: "A big black dick" },
    { text: "Being on fire" },
    { text: "Grandma's ashes" },
    { text: "Puppies!" },
    { text: "Dead parents" },
    { text: "Coat hanger abortions" },
    { text: "Auschwitz" },
    { text: "The Big Bang" },
    { text: "Racism" },
    { text: "Old people smell" },
    { text: "Men" },
    { text: "Women" },
    { text: "Chainsaws for hands" },
    { text: "Passable transvestites" },
    { text: "The Pope" },
    { text: "Viagra" },
    { text: "Coat hanger abortions" },
    { text: "Surprise sex" },
    { text: "Roofies" },
    { text: "Poorly-timed Holocaust jokes" },
    { text: "Celebrity sex tapes" },
    { text: "Incest" },
    { text: "A windmill full of corpses" },
    { text: "Autocannibalism" },
    { text: "Genital piercings" },
    { text: "Anal beads" },
    { text: "Queefing" },
    { text: "Preteens" },
    { text: "Jibber-jabber" },
    { text: "Alcoholism" },
    { text: "Hospice care" },
    { text: "The violation of our most basic human rights" },
    { text: "Child abuse" },
    { text: "Jerking off into a pool of children's tears" },
    { text: "Nazis" },
    { text: "Catapults" },
    { text: "My genitals" },
    { text: "Bees?" },
    { text: "Switching to Geico" },
    { text: "Daniel Radcliffe's delicious asshole" },
    { text: "Firing a rifle into the air while balls deep in a squealing hog" },
    { text: "Not giving a shit about the Third World" },
    { text: "Dying" },
    { text: "Pixelated bukkake" },
    { text: "A cooler full of organs" },
    { text: "Foreskin" },
    { text: "Vigilante justice" },
    { text: "Bling" },
    { text: "Getting really high" },
    { text: "Crystal meth" },
  ]

  useEffect(() => {
    // Initialize scores
    const initialScores: Record<string, number> = {}
    players.forEach((player) => {
      initialScores[player] = 0
    })
    setScores(initialScores)

    // Set first black card
    setCurrentBlackCard(blackCards[0])
  }, [players])

  const startGame = () => {
    playSound("success")
    setGameStarted(true)
    setCurrentBlackCard(blackCards[Math.floor(Math.random() * blackCards.length)])
  }

  const nextRound = () => {
    playSound("click")
    setCurrentJudge((prev) => (prev + 1) % players.length)
    setCurrentBlackCard(blackCards[Math.floor(Math.random() * blackCards.length)])
    setGamePhase("playing")
    setWinnerThisRound("")
    setRoundNumber((prev) => prev + 1)
  }

  const selectWinner = (playerName: string) => {
    playSound("success")
    setWinnerThisRound(playerName)
    setScores((prev) => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1,
    }))
    setGamePhase("results")
  }

  const getRandomWhiteCards = (count: number) => {
    const shuffled = [...whiteCards].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  if (!gameStarted) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Setup
            </Button>

            <div className="mb-8">
              <div className="text-6xl mb-4">🃏</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Cards Against Humanity</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">The party game for horrible people</p>
            </div>

            <Card className="mb-8 bg-black text-white">
              <CardHeader>
                <CardTitle className="text-white">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <ul className="list-disc list-inside space-y-2">
                  <li>Each round, one player is the Card Czar (judge)</li>
                  <li>The Card Czar reads a black card out loud</li>
                  <li>Other players choose their funniest white card to complete the phrase</li>
                  <li>The Card Czar picks the funniest combination</li>
                  <li>First player to 5 points wins!</li>
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
                      variant={index === currentJudge ? "default" : "secondary"}
                      className={`text-lg px-4 py-2 ${index === currentJudge ? "bg-black text-white" : ""}`}
                    >
                      {player}
                      {index === currentJudge && <Crown className="w-4 h-4 ml-2" />}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={startGame}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-xl font-semibold"
            >
              <Trophy className="w-6 h-6 mr-2" />
              Start Game!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              End Game
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🃏 Cards Against Humanity</h1>
              <p className="text-gray-600 dark:text-gray-300">Round {roundNumber}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          {/* Scores */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Scores (First to 5 wins!)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player, index) => (
                  <div key={player} className="text-center">
                    <div className="font-semibold flex items-center justify-center">
                      {player}
                      {index === currentJudge && <Crown className="w-4 h-4 ml-1 text-yellow-500" />}
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">{scores[player] || 0}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Judge */}
          <Card className="mb-6 border-4 border-black">
            <CardHeader className="bg-black text-white">
              <CardTitle className="text-center text-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 mr-2" />
                {players[currentJudge]} is the Card Czar
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Black Card */}
          <Card className="mb-8 bg-black text-white min-h-[200px] flex items-center justify-center">
            <CardContent className="p-8 text-center">
              <div className="text-2xl md:text-3xl font-bold leading-relaxed">{currentBlackCard?.text}</div>
              <div className="mt-4 text-sm opacity-75">
                {currentBlackCard?.blanks === 1 ? "Pick 1" : `Pick ${currentBlackCard?.blanks}`}
              </div>
            </CardContent>
          </Card>

          {/* White Cards Sample */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sample White Cards (Players choose from their hand)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRandomWhiteCards(6).map((card, index) => (
                  <Card key={index} className="bg-white border-2 border-gray-300 cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="text-black font-medium">{card.text}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Phase Controls */}
          {gamePhase === "playing" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Playing Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg mb-4">
                  Players (except {players[currentJudge]}) choose your funniest white card!
                </p>
                <div className="text-center">
                  <Button
                    onClick={() => setGamePhase("judging")}
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    All Cards Submitted - Start Judging
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {gamePhase === "judging" && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Judging Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg mb-4">{players[currentJudge]}, pick the funniest combination!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {players
                    .filter((_, index) => index !== currentJudge)
                    .map((player) => (
                      <Button
                        key={player}
                        onClick={() => selectWinner(player)}
                        variant="outline"
                        size="lg"
                        className="h-16 text-lg bg-white hover:bg-gray-50"
                      >
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        Choose {player}'s Card
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gamePhase === "results" && (
            <Card className="mb-8 bg-green-50 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200">Round Winner!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-xl mb-4">
                  🎉 <strong>{winnerThisRound}</strong> wins this round!
                </p>
                <div className="text-center">
                  {Math.max(...Object.values(scores)) >= 5 ? (
                    <div>
                      <p className="text-2xl font-bold text-green-600 mb-4">
                        🏆 {Object.entries(scores).find(([_, score]) => score >= 5)?.[0]} WINS THE GAME!
                      </p>
                      <Button onClick={onBack} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                        Play Again
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={nextRound} size="lg" className="bg-black hover:bg-gray-800 text-white">
                      Next Round
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setCurrentBlackCard(blackCards[Math.floor(Math.random() * blackCards.length)])}
              variant="outline"
              size="lg"
              className="h-16 text-lg bg-transparent"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              New Black Card
            </Button>

            <Button onClick={nextRound} variant="outline" size="lg" className="h-16 text-lg bg-transparent">
              Skip Round
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
