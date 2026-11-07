import { CustomTemplatePreset } from "./types"

export const CUSTOM_GAME_TEMPLATES: CustomTemplatePreset[] = [
  // 1. WILD HOUSE PARTY
  {
    id: "wild-house-party",
    title: "Wild House Party",
    name: "Wild House Party",
    description: "High-energy drinking challenges, hilarious curses, and physical party dares.",
    icon: "🎉",
    isMature: false,
    category: "Party",
    defaultTimerDuration: 30,
    cards: [
      {
        content: "The Little Green Man: Anyone who takes a drink without pretending to remove an invisible green man from their glass must take an extra sip.",
        type: "rule",
        sips: 1,
        target: "all",
        isCurse: true,
        tags: ["curse", "party-rule"]
      },
      {
        content: "Thumb Master: You are now the Thumb Master. Whenever you place your thumb on the table, everyone must follow. Last person to do so drinks 2 sips.",
        type: "rule",
        sips: 2,
        target: "all",
        isCurse: true,
        tags: ["curse", "thumb-master"]
      },
      {
        content: "Give your best impression of another player in the room until someone guesses who it is. If nobody guesses within 30 seconds, drink 2 sips.",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 30,
        tags: ["dare", "acting"]
      },
      {
        content: "Who is most likely to lose their phone, keys, or wallet before this night is over?",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "roast"]
      },
      {
        content: "Would you rather drink a mystery cocktail mixed by the group or let the person to your right send any emoji to your 3rd most recent text?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Mystery Cocktail", "Risky Emoji Text"],
        tags: ["dilemma", "choice"]
      },
      {
        content: "Staring Contest: Challenge the person opposite you. First to blink or laugh takes 3 sips.",
        type: "action",
        sips: 3,
        target: "rival",
        timerSeconds: 30,
        tags: ["duel", "stare"]
      },
      {
        content: "Never have I ever pretended to be on a phone call just to avoid talking to someone.",
        type: "confession",
        sips: 1,
        target: "all",
        tags: ["confession", "relatable"]
      },
      {
        content: "The T-Rex Rule: You must keep your elbows tucked into your ribs for the next 2 rounds. Fail = drink 1 sip per infraction.",
        type: "rule",
        sips: 1,
        target: "current",
        isCurse: true,
        tags: ["curse", "physical"]
      },
      {
        content: "Rapid Fire: Name 5 alcoholic beverages in 7 seconds or take a shot penalty.",
        type: "trivia",
        sips: 3,
        target: "current",
        timerSeconds: 10,
        tags: ["speed", "trivia"]
      },
      {
        content: "Point at the player who gives the best relationship advice but has the most chaotic dating life.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "dating"]
      },
      {
        content: "Switch seats with the person you find the most intimidating in the room, or drink 2 sips.",
        type: "action",
        sips: 2,
        target: "current",
        tags: ["dare", "social"]
      },
      {
        content: "Waterfall: You start drinking, and everyone must drink in order. No one can stop until the person before them stops!",
        type: "action",
        sips: 3,
        target: "all",
        tags: ["drinking", "waterfall"]
      }
    ]
  },

  // 2. SPICY CONFESSIONS & DEBAUCHERY (18+)
  {
    id: "spicy-confessions",
    title: "Late Night Debauchery (18+)",
    name: "Late Night Debauchery (18+)",
    description: "Unfiltered adult secrets, spicy bedroom dilemmas, and provocative dares.",
    icon: "🔥",
    isMature: true,
    category: "Spicy",
    defaultTimerDuration: 30,
    cards: [
      {
        content: "Confess your biggest red flag in relationships, or take 3 heavy sips.",
        type: "confession",
        sips: 3,
        target: "current",
        tags: ["spicy", "confession"]
      },
      {
        content: "Whisper your most scandalous secret into the ear of the person on your left. If they laugh or gasp, everyone drinks.",
        type: "action",
        sips: 2,
        target: "current",
        tags: ["whisper", "secret"]
      },
      {
        content: "Who in this room would you pick as your emergency partner if you had to marry by sunrise?",
        type: "vote",
        sips: 2,
        target: "current",
        tags: ["spicy", "marriage"]
      },
      {
        content: "Would you rather show your entire saved camera roll to the group or let them read your last 3 Instagram DMs out loud?",
        type: "dilemma",
        sips: 3,
        target: "current",
        options: ["Camera Roll", "Last 3 DMs"],
        tags: ["dilemma", "phone"]
      },
      {
        content: "Never have I ever hooked up with someone whose name I forgot the next morning.",
        type: "confession",
        sips: 2,
        target: "all",
        tags: ["spicy", "confession"]
      },
      {
        content: "Rate your own kissing ability out of 10. The group votes whether they believe you. If voted down, finish your drink.",
        type: "action",
        sips: 3,
        target: "current",
        tags: ["spicy", "rating"]
      },
      {
        content: "The Eye Contact Curse: For the next round, whenever you speak you must look directly into the eyes of the player to your right without looking away.",
        type: "rule",
        sips: 1,
        target: "current",
        isCurse: true,
        tags: ["curse", "tension"]
      },
      {
        content: "Point at the person in the room who looks innocent but has the wildest hidden wild side.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "spicy"]
      },
      {
        content: "Let another player text any one-word message to your ex or take 3 sips.",
        type: "action",
        sips: 3,
        target: "current",
        tags: ["dare", "ex"]
      },
      {
        content: "Drink 2 sips if you have ever had a crush on someone currently sitting in this room.",
        type: "confession",
        sips: 2,
        target: "all",
        tags: ["confession", "tension"]
      },
      {
        content: "Would you rather sleep with your best friend's ex or get caught kissing your boss at a work party?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Best Friend's Ex", "Boss at Work Party"],
        tags: ["dilemma", "scandal"]
      },
      {
        content: "Give a 15-second seductive sales pitch for an ordinary object in the room (e.g. a water bottle or shoe).",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 20,
        tags: ["dare", "comedy"]
      }
    ]
  },

  // 3. FRIEND GROUP ROAST & COURT
  {
    id: "friend-group-roast",
    title: "Friend Group Kangaroo Court",
    name: "Friend Group Kangaroo Court",
    description: "Point fingers, settle petty group feuds, and roast each other's worst habits.",
    icon: "⚖️",
    isMature: false,
    category: "Roast",
    defaultTimerDuration: 30,
    cards: [
      {
        content: "Point at the player who takes the longest to text back in the group chat.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["roast", "texting"]
      },
      {
        content: "Point at the person most likely to get everyone kicked out of a venue.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["roast", "party"]
      },
      {
        content: "Roast the outfit of the person sitting to your right in 10 seconds or less. They judge if it was funny. If not, you drink 2 sips.",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 15,
        tags: ["roast", "improv"]
      },
      {
        content: "Who in the group would be the first to die in a zombie apocalypse?",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "survival"]
      },
      {
        content: "Would you rather lend $500 to the person on your left or let the person on your right manage your social media for 24 hours?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Lend $500", "Social Media Takeover"],
        tags: ["dilemma", "trust"]
      },
      {
        content: "The Accent Curse: You must speak in a posh British accent for the next 2 rounds. Fail = drink 1 sip per sentence.",
        type: "rule",
        sips: 1,
        target: "current",
        isCurse: true,
        tags: ["curse", "accent"]
      },
      {
        content: "Never have I ever lied about being 'on my way' when I hadn't even gotten out of bed yet.",
        type: "confession",
        sips: 1,
        target: "all",
        tags: ["confession", "relatable"]
      },
      {
        content: "Point at the friend with the most questionable music taste.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "music"]
      },
      {
        content: "Reveal the most embarrassing purchase you made in the last 6 months or drink 2 sips.",
        type: "confession",
        sips: 2,
        target: "current",
        tags: ["confession", "money"]
      },
      {
        content: "Speed Roast: Name one annoying habit of 3 different people in the room within 15 seconds.",
        type: "action",
        sips: 3,
        target: "current",
        timerSeconds: 15,
        tags: ["roast", "speed"]
      },
      {
        content: "Point at the person most likely to cry during an emotional movie trailer.",
        type: "vote",
        sips: 1,
        target: "point",
        tags: ["vote", "emotional"]
      },
      {
        content: "Everyone who has ever ghosted someone they met through a dating app must drink 2 sips.",
        type: "confession",
        sips: 2,
        target: "all",
        tags: ["confession", "dating"]
      }
    ]
  },

  // 4. OFFICE / SFW ICEBREAKER LOUNGE
  {
    id: "office-icebreaker",
    title: "Office Happy Hour (SFW)",
    name: "Office Happy Hour (SFW)",
    description: "Workplace-safe icebreakers, hilarious job confessions, and friendly team debates.",
    icon: "💼",
    isMature: false,
    category: "Casual",
    defaultTimerDuration: 30,
    cards: [
      {
        content: "Two Truths and a Lie: State two true facts and one lie about your career. Group votes on the lie!",
        type: "action",
        sips: 1,
        target: "current",
        timerSeconds: 45,
        tags: ["icebreaker", "trivia"]
      },
      {
        content: "Never have I ever sent a Slack/Teams message complaining about someone to the exact person I was complaining about.",
        type: "confession",
        sips: 2,
        target: "all",
        tags: ["work", "slack"]
      },
      {
        content: "Would you rather have a 4-day workweek with 10-hour days or a 5-day workweek with 6-hour days?",
        type: "dilemma",
        sips: 1,
        target: "current",
        options: ["4-Day (10hr) Week", "5-Day (6hr) Week"],
        tags: ["dilemma", "career"]
      },
      {
        content: "Point at the person most likely to answer an email at 11:30 PM on a Friday night.",
        type: "vote",
        sips: 1,
        target: "point",
        tags: ["vote", "workaholic"]
      },
      {
        content: "Jargon Ban: You cannot say the words 'synergy', 'pivot', 'bandwidth', or 'circle back' for the rest of the game. Drink 1 sip if caught.",
        type: "rule",
        sips: 1,
        target: "all",
        isCurse: true,
        tags: ["curse", "jargon"]
      },
      {
        content: "Deliver a 20-second elevator pitch for an imaginary product: 'A pillow that automatically silences your alarm clock'.",
        type: "action",
        sips: 1,
        target: "current",
        timerSeconds: 25,
        tags: ["improv", "pitch"]
      },
      {
        content: "Never have I ever nodded and smiled in a meeting when I had zero idea what anyone was talking about.",
        type: "confession",
        sips: 1,
        target: "all",
        tags: ["confession", "meetings"]
      },
      {
        content: "Point at the person whose desk or laptop desktop is guaranteed to be pure organized chaos.",
        type: "vote",
        sips: 1,
        target: "point",
        tags: ["vote", "habits"]
      },
      {
        content: "Would you rather never have another Zoom camera call or never have another 9 AM Monday meeting?",
        type: "dilemma",
        sips: 1,
        target: "current",
        options: ["No More Zoom Cameras", "No 9 AM Mondays"],
        tags: ["dilemma", "workplace"]
      },
      {
        content: "Rapid Fire: Name 5 professions you would be completely terrible at in 10 seconds.",
        type: "trivia",
        sips: 1,
        target: "current",
        timerSeconds: 15,
        tags: ["speed", "funny"]
      },
      {
        content: "Point at the person who always brings the best snacks to gatherings.",
        type: "vote",
        sips: 1,
        target: "point",
        tags: ["vote", "food"]
      },
      {
        content: "Share your very first paid job title and your worst memory from it, or drink 1 sip.",
        type: "confession",
        sips: 1,
        target: "current",
        tags: ["career", "story"]
      }
    ]
  },

  // 5. POP-CULTURE & STAN SHOWDOWN
  {
    id: "stan-wars",
    title: "Pop-Culture & Stan Showdown",
    name: "Pop-Culture & Stan Showdown",
    description: "Debates between iconic pop stars, cinema trivia duels, and viral trend roasts.",
    icon: "🎤",
    isMature: false,
    category: "Culture",
    defaultTimerDuration: 30,
    cards: [
      {
        content: "Would you rather have lifetime front-row tickets to Taylor Swift's Eras Tour or VIP passes to Coachella for the rest of your life?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Eras Tour VIP", "Lifetime Coachella"],
        tags: ["music", "dilemma"]
      },
      {
        content: "Give a 10-second dramatic reenactment of an iconic movie scene (The Godfather, Titanic, or Marvel). Room votes on accuracy.",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 20,
        tags: ["acting", "cinema"]
      },
      {
        content: "Point at the person with the most unhinged celebrity crush.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "celebrity"]
      },
      {
        content: "Hum a famous pop song of your choice. The first player to guess it assigns 2 sips. If nobody guesses in 20 seconds, you drink 2 sips.",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 25,
        tags: ["music", "singing"]
      },
      {
        content: "Would you rather be stuck on a 14-hour flight next to Kanye West or Logan Paul?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Kanye West", "Logan Paul"],
        tags: ["dilemma", "celebs"]
      },
      {
        content: "Never have I ever spent money on a celebrity or creator's merchandise that I now deeply regret.",
        type: "confession",
        sips: 1,
        target: "all",
        tags: ["confession", "merch"]
      },
      {
        content: "The Paparazzi Curse: For the next round, another player can snap an unflattering candid photo of you at any second without warning.",
        type: "rule",
        sips: 1,
        target: "current",
        isCurse: true,
        tags: ["curse", "paparazzi"]
      },
      {
        content: "Speed Quiz: Name 4 Drake songs in 7 seconds or drink 2 sips.",
        type: "trivia",
        sips: 2,
        target: "current",
        timerSeconds: 10,
        tags: ["speed", "drake"]
      },
      {
        content: "Point at the person who spends the most screen time on TikTok or Instagram Reels.",
        type: "vote",
        sips: 2,
        target: "point",
        tags: ["vote", "screentime"]
      },
      {
        content: "Defend an indefensibly bad movie (e.g. Cats, Morbius, Twilight) with complete seriousness for 30 seconds.",
        type: "action",
        sips: 2,
        target: "current",
        timerSeconds: 30,
        tags: ["speech", "movies"]
      },
      {
        content: "Would you rather give up Spotify/Apple Music forever or Netflix/streaming forever?",
        type: "dilemma",
        sips: 2,
        target: "current",
        options: ["Give Up Music", "Give Up Streaming"],
        tags: ["dilemma", "media"]
      },
      {
        content: "Everyone who has ever defended a celebrity online in an argument must take 2 sips.",
        type: "confession",
        sips: 2,
        target: "all",
        tags: ["confession", "stan"]
      }
    ]
  }
]
