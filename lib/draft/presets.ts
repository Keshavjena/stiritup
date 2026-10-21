import { DraftPreset, DraftItem } from "./types"

export const DRAFT_PRESETS: DraftPreset[] = [
  {
    id: "football-legends",
    title: "World Football Ultimate Squad",
    description: "Assemble a championship 7-player squad under a strict $100M salary cap.",
    icon: "⚽",
    theme: "football",
    currencySymbol: "$",
    currencyName: "Million",
    startingBudget: 100,
    minBidIncrement: 1,
    timerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "fwd_1", name: "Striker / Forward", required: true, allowedCategories: ["Forward"] },
      { id: "fwd_2", name: "Winger / Forward", required: true, allowedCategories: ["Forward"] },
      { id: "mid_1", name: "Playmaker", required: true, allowedCategories: ["Midfielder"] },
      { id: "mid_2", name: "Central Midfielder", required: true, allowedCategories: ["Midfielder"] },
      { id: "def_1", name: "Center Back", required: true, allowedCategories: ["Defender"] },
      { id: "def_2", name: "Fullback / Defender", required: true, allowedCategories: ["Defender"] },
      { id: "gk_1", name: "Goalkeeper", required: true, allowedCategories: ["Goalkeeper"] }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "fb_messi",
        name: "Lionel Messi",
        category: "Forward",
        subtitle: "Inter Miami / Argentina",
        description: "8x Ballon d'Or winner with unmatched dribbling and vision.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/440px-Lionel_Messi_20180626.jpg",
        baseValuation: 28,
        stats: { Pace: 85, Shooting: 92, Passing: 94, Dribbling: 95, OVR: 93 },
        tags: ["La Liga", "Argentina", "World Cup Champion", "Playmaker"]
      },
      {
        id: "fb_ronaldo",
        name: "Cristiano Ronaldo",
        category: "Forward",
        subtitle: "Al Nassr / Portugal",
        description: "All-time greatest goalscorer with lethal aerial threat and clutch instinct.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/440px-Cristiano_Ronaldo_2018.jpg",
        baseValuation: 27,
        stats: { Pace: 87, Shooting: 94, Passing: 80, Physical: 88, OVR: 92 },
        tags: ["Premier League", "La Liga", "Portugal", "UCL Legend"]
      },
      {
        id: "fb_mbappe",
        name: "Kylian Mbappé",
        category: "Forward",
        subtitle: "Real Madrid / France",
        description: "Blistering acceleration and world-class finishing on the grandest stages.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg/440px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg",
        baseValuation: 25,
        stats: { Pace: 97, Shooting: 90, Passing: 82, Dribbling: 92, OVR: 91 },
        tags: ["Ligue 1", "La Liga", "France", "World Cup Champion"]
      },
      {
        id: "fb_haaland",
        name: "Erling Haaland",
        category: "Forward",
        subtitle: "Manchester City / Norway",
        description: "Physical powerhouse and ruthless penalty box poacher.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Erling_Haaland_2023_%28cropped%29.jpg/440px-Erling_Haaland_2023_%28cropped%29.jpg",
        baseValuation: 24,
        stats: { Pace: 89, Shooting: 93, Passing: 66, Physical: 88, OVR: 90 },
        tags: ["Premier League", "Norway", "UCL Champion"]
      },
      {
        id: "fb_vinicius",
        name: "Vinícius Júnior",
        category: "Forward",
        subtitle: "Real Madrid / Brazil",
        description: "Explosive 1v1 trickery, electric bursts down the left wing.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Vinicius_Junior_2021.jpg/440px-Vinicius_Junior_2021.jpg",
        baseValuation: 22,
        stats: { Pace: 95, Shooting: 84, Passing: 81, Dribbling: 91, OVR: 89 },
        tags: ["La Liga", "Brazil", "UCL Champion"]
      },
      {
        id: "fb_debruyne",
        name: "Kevin De Bruyne",
        category: "Midfielder",
        subtitle: "Manchester City / Belgium",
        description: "Master tactician with laser-guided passes and venomous long shots.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_201807091.jpg/440px-Kevin_De_Bruyne_201807091.jpg",
        baseValuation: 23,
        stats: { Pace: 72, Shooting: 88, Passing: 95, Dribbling: 87, OVR: 91 },
        tags: ["Premier League", "Belgium", "Playmaker", "UCL Champion"]
      },
      {
        id: "fb_bellingham",
        name: "Jude Bellingham",
        category: "Midfielder",
        subtitle: "Real Madrid / England",
        description: "Complete box-to-box maestro with uncanny maturity and clutch goals.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Jude_Bellingham_2023.jpg/440px-Jude_Bellingham_2023.jpg",
        baseValuation: 22,
        stats: { Pace: 80, Shooting: 86, Passing: 88, Physical: 85, OVR: 90 },
        tags: ["La Liga", "England", "UCL Champion"]
      },
      {
        id: "fb_modric",
        name: "Luka Modrić",
        category: "Midfielder",
        subtitle: "Real Madrid / Croatia",
        description: "Golden Ball winner, eternal engine, exquisite outside-of-the-boot passing.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Luka_Modric_Interview_2021_%28cropped%29.jpg/440px-Luka_Modric_Interview_2021_%28cropped%29.jpg",
        baseValuation: 18,
        stats: { Pace: 70, Shooting: 77, Passing: 91, Dribbling: 89, OVR: 88 },
        tags: ["La Liga", "Croatia", "UCL Legend", "Playmaker"]
      },
      {
        id: "fb_rodri",
        name: "Rodri Hernández",
        category: "Midfielder",
        subtitle: "Manchester City / Spain",
        description: "The midfield anchor of modern football, Euro 2024 MVP.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rodri_2023.jpg/440px-Rodri_2023.jpg",
        baseValuation: 20,
        stats: { Pace: 66, Shooting: 80, Passing: 86, Defending: 87, Physical: 85, OVR: 90 },
        tags: ["Premier League", "Spain", "UCL Champion"]
      },
      {
        id: "fb_vandijk",
        name: "Virgil van Dijk",
        category: "Defender",
        subtitle: "Liverpool / Netherlands",
        description: "Imposing commanding center-back, dominant in aerial duels and positioning.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Virgil_van_Dijk_2021.jpg/440px-Virgil_van_Dijk_2021.jpg",
        baseValuation: 20,
        stats: { Pace: 78, Defending: 91, Physical: 89, Passing: 72, OVR: 89 },
        tags: ["Premier League", "Netherlands", "UCL Champion"]
      },
      {
        id: "fb_ramos",
        name: "Sergio Ramos",
        category: "Defender",
        subtitle: "Spain Legend",
        description: "Aggressive defending titan, master of header goals in 93rd minutes.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sergio_Ramos_2018.jpg/440px-Sergio_Ramos_2018.jpg",
        baseValuation: 17,
        stats: { Pace: 72, Defending: 88, Physical: 86, Shooting: 70, OVR: 87 },
        tags: ["La Liga", "Spain", "World Cup Champion", "UCL Legend"]
      },
      {
        id: "fb_davies",
        name: "Alphonso Davies",
        category: "Defender",
        subtitle: "Bayern Munich / Canada",
        description: "Roadrunner pace down the flank, recovery speed second to none.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Alphonso_Davies_2023.jpg/440px-Alphonso_Davies_2023.jpg",
        baseValuation: 16,
        stats: { Pace: 95, Defending: 78, Passing: 77, Dribbling: 84, OVR: 85 },
        tags: ["Bundesliga", "Canada", "UCL Champion"]
      },
      {
        id: "fb_alisson",
        name: "Alisson Becker",
        category: "Goalkeeper",
        subtitle: "Liverpool / Brazil",
        description: "Calm, heroic 1v1 stops and pinpoint distribution under pressure.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Alisson_Becker_2018.jpg/440px-Alisson_Becker_2018.jpg",
        baseValuation: 16,
        stats: { Diving: 86, Handling: 85, Reflexes: 89, Speed: 56, OVR: 89 },
        tags: ["Premier League", "Brazil", "UCL Champion"]
      },
      {
        id: "fb_neuer",
        name: "Manuel Neuer",
        category: "Goalkeeper",
        subtitle: "Bayern Munich / Germany",
        description: "Pioneered the modern sweeper-keeper, World Cup and treble winner.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Manuel_Neuer_2018.jpg/440px-Manuel_Neuer_2018.jpg",
        baseValuation: 15,
        stats: { Diving: 87, Handling: 88, Reflexes: 88, Kicking: 91, OVR: 89 },
        tags: ["Bundesliga", "Germany", "World Cup Champion", "UCL Legend"]
      }
    ]
  },
  {
    id: "superheroes",
    title: "Multiverse Super Team Auction",
    description: "Bid on cosmic heavyweights, tech geniuses, and street brawlers to protect reality.",
    icon: "🦸",
    theme: "superhero",
    currencySymbol: "⚡",
    currencyName: "Power Credits",
    startingBudget: 100,
    minBidIncrement: 2,
    timerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "slot_leader", name: "Tactical Leader", required: true, allowedCategories: ["Leader", "Tactician"] },
      { id: "slot_brawler", name: "Vanguard / Brawler", required: true, allowedCategories: ["Brawler", "Cosmic"] },
      { id: "slot_tech", name: "Tech & Intellect", required: true, allowedCategories: ["Genius", "Tech"] },
      { id: "slot_mystic", name: "Mystic / Reality Bender", required: true, allowedCategories: ["Mystic", "Cosmic"] },
      { id: "slot_wildcard", name: "Wildcard Specialist", required: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.6,
      fullRosterBonus: 30,
      synergyMultiplier: 10
    },
    items: [
      {
        id: "sh_batman",
        name: "Batman (Bruce Wayne)",
        category: "Leader",
        subtitle: "DC Universe / Gotham",
        description: "Master strategist, peak human martial artist, contingency plan for everything.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Batman_Cosplay_2017.jpg/440px-Batman_Cosplay_2017.jpg",
        baseValuation: 24,
        stats: { Intellect: 98, Combat: 95, Tactics: 99, Stealth: 96, OVR: 97 },
        tags: ["DC", "Justice League", "Street Tier", "Prep God"]
      },
      {
        id: "sh_ironman",
        name: "Iron Man (Tony Stark)",
        category: "Genius",
        subtitle: "Marvel / Avengers",
        description: "Billionaire tech prodigy armed with nanotech armor and orbital strike arrays.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg/440px-Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg",
        baseValuation: 25,
        stats: { Intellect: 99, Firepower: 94, Mobility: 90, Tech: 99, OVR: 95 },
        tags: ["Marvel", "Avengers", "Tech", "Billionaire"]
      },
      {
        id: "sh_thor",
        name: "Thor Odinson",
        category: "Cosmic",
        subtitle: "Asgard / God of Thunder",
        description: "Immortal Asgardian god wielding lightning and planetary-cracking Stormbreaker.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Thor_cosplay_2019.jpg/440px-Thor_cosplay_2019.jpg",
        baseValuation: 28,
        stats: { Strength: 98, Durability: 96, Energy: 95, Combat: 90, OVR: 96 },
        tags: ["Marvel", "Avengers", "God", "Cosmic"]
      },
      {
        id: "sh_superman",
        name: "Superman (Clark Kent)",
        category: "Brawler",
        subtitle: "Krypton / Metropolis",
        description: "The Man of Steel. Solar-powered invulnerability, heat vision, and FTL flight.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Superman_Cosplay_2016.jpg/440px-Superman_Cosplay_2016.jpg",
        baseValuation: 30,
        stats: { Strength: 100, Speed: 98, Durability: 100, Firepower: 96, OVR: 99 },
        tags: ["DC", "Justice League", "Cosmic", "Solar"]
      },
      {
        id: "sh_spiderman",
        name: "Spider-Man (Peter Parker)",
        category: "Wildcard",
        subtitle: "Marvel / Queens",
        description: "Proportional spider agility, precognitive spider-sense, and heart of gold.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Spider-Man_Cosplay_2019.jpg/440px-Spider-Man_Cosplay_2019.jpg",
        baseValuation: 20,
        stats: { Agility: 98, Reflexes: 99, Intellect: 90, Strength: 85, OVR: 92 },
        tags: ["Marvel", "Avengers", "Street Tier", "Acrobat"]
      },
      {
        id: "sh_wanda",
        name: "Scarlet Witch (Wanda)",
        category: "Mystic",
        subtitle: "Marvel / Chaos Magic",
        description: "Wields reality-warping chaos magic capable of rewriting universal timelines.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Scarlet_Witch_Cosplay_2019.jpg/440px-Scarlet_Witch_Cosplay_2019.jpg",
        baseValuation: 27,
        stats: { Magic: 100, RealityWarp: 99, Durability: 75, Intellect: 88, OVR: 96 },
        tags: ["Marvel", "Avengers", "Mystic", "Reality Bender"]
      },
      {
        id: "sh_wolverine",
        name: "Wolverine (Logan)",
        category: "Brawler",
        subtitle: "X-Men / Weapon X",
        description: "Indestructible adamantium skeleton, regenerative healing factor, feral berserker.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Wolverine_Cosplay_Comic_Con_2017.jpg/440px-Wolverine_Cosplay_Comic_Con_2017.jpg",
        baseValuation: 21,
        stats: { Healing: 99, Combat: 95, Tenacity: 100, Strength: 84, OVR: 92 },
        tags: ["Marvel", "X-Men", "Mutant", "Brawler"]
      },
      {
        id: "sh_doctorstrange",
        name: "Doctor Strange",
        category: "Mystic",
        subtitle: "Marvel / Sorcerer Supreme",
        description: "Master of Eldritch arts, astral projection, and mirror dimension shields.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Doctor_Strange_Cosplay_2018.jpg/440px-Doctor_Strange_Cosplay_2018.jpg",
        baseValuation: 24,
        stats: { Magic: 98, Intellect: 94, Tactics: 92, Versatility: 96, OVR: 95 },
        tags: ["Marvel", "Avengers", "Mystic", "Sorcerer"]
      },
      {
        id: "sh_thanos",
        name: "Thanos the Mad Titan",
        category: "Leader",
        subtitle: "Titan / Infinity Conqueror",
        description: "Incalculable physical power, philosophical willpower, conqueror of worlds.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Thanos_Cosplay_MCM_2018.jpg/440px-Thanos_Cosplay_MCM_2018.jpg",
        baseValuation: 29,
        stats: { Strength: 99, Intellect: 95, Tactics: 97, Durability: 98, OVR: 98 },
        tags: ["Marvel", "Villain", "Cosmic", "Warlord"]
      },
      {
        id: "sh_joker",
        name: "The Joker",
        category: "Wildcard",
        subtitle: "DC / Clown Prince of Crime",
        description: "Unfathomable psychological warfare, chemical anarchy, chaos incarnate.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Joker_Cosplay_2019.jpg/440px-Joker_Cosplay_2019.jpg",
        baseValuation: 17,
        stats: { Chaos: 100, Intellect: 90, Unpredictable: 100, Combat: 75, OVR: 89 },
        tags: ["DC", "Villain", "Chaos", "Street Tier"]
      }
    ]
  },
  {
    id: "celebrity-icons",
    title: "Global Celebrity Dream Syndicate",
    description: "Build an unstoppable media and cultural empire from Hollywood, pop music, tech & cinema.",
    icon: "🌟",
    theme: "celebrity",
    currencySymbol: "⭐",
    currencyName: "Star Credits",
    startingBudget: 100,
    minBidIncrement: 1,
    timerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "slot_hollywood", name: "A-List Movie Star", required: true },
      { id: "slot_music", name: "Global Music Icon", required: true },
      { id: "slot_tech", name: "Visionary Founder / Tech", required: true },
      { id: "slot_chaos", name: "Cultural Chaos / Wildcard", required: true },
      { id: "slot_nextgen", name: "Next-Gen Sensation", required: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "celeb_dicaprio",
        name: "Leonardo DiCaprio",
        category: "Hollywood",
        subtitle: "Oscar Winner / Cinema Titan",
        description: "Unmatched box office prestige, Titanic to Wolf of Wall Street.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/440px-Leonardo_Dicaprio_Cannes_2019.jpg",
        baseValuation: 24,
        stats: { StarPower: 96, Acting: 98, BoxOffice: 95, Charisma: 94, OVR: 96 },
        tags: ["Hollywood", "Oscar Winner", "A-List"]
      },
      {
        id: "celeb_taylor",
        name: "Taylor Swift",
        category: "Music",
        subtitle: "Global Pop Phenomenon",
        description: "Eras Tour record breaker, cultural economy mover, songwriting powerhouse.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards.png/440px-191125_Taylor_Swift_at_the_2019_American_Music_Awards.png",
        baseValuation: 28,
        stats: { StarPower: 100, Fans: 100, CulturalImpact: 99, NetWorth: 92, OVR: 98 },
        tags: ["Music", "Pop", "Billionaire", "Grammy Winner"]
      },
      {
        id: "celeb_elon",
        name: "Elon Musk",
        category: "Tech",
        subtitle: "Tesla / SpaceX / xAI",
        description: "Rockets, electric vehicles, neural chips, and global social media presence.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop1%29.jpg/440px-Elon_Musk_Royal_Society_%28crop1%29.jpg",
        baseValuation: 26,
        stats: { NetWorth: 100, TechInfluence: 99, Chaos: 97, Fame: 95, OVR: 97 },
        tags: ["Tech", "Billionaire", "Visionary", "Chaos"]
      },
      {
        id: "celeb_srk",
        name: "Shah Rukh Khan",
        category: "Hollywood",
        subtitle: "King of Bollywood / Global Icon",
        description: "The King Khan, universally beloved by billions worldwide.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_book_%2725_Years_Of_A_Life_In_Cinema%27_21.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_the_book_%2725_Years_Of_A_Life_In_Cinema%27_21.jpg",
        baseValuation: 25,
        stats: { StarPower: 98, Fans: 99, BoxOffice: 95, Charisma: 98, OVR: 97 },
        tags: ["Bollywood", "Cinema", "Global Icon"]
      },
      {
        id: "celeb_beyonce",
        name: "Beyoncé",
        category: "Music",
        subtitle: "Queen Bey / Renaissance",
        description: "Most awarded Grammy artist in music history, untouchable stage majesty.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png/440px-Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png",
        baseValuation: 25,
        stats: { Vocals: 99, StagePresence: 100, CulturalImpact: 96, Royalty: 98, OVR: 97 },
        tags: ["Music", "Pop", "Grammy Winner", "A-List"]
      },
      {
        id: "celeb_keanu",
        name: "Keanu Reeves",
        category: "Hollywood",
        subtitle: "The Matrix / John Wick",
        description: "Internet's most wholesome action legend, bullet-time hero.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Keanu_Reeves_%28crop_and_levels_%28cropped%29%29.jpg/440px-Keanu_Reeves_%28crop_and_levels_%28cropped%29%29.jpg",
        baseValuation: 21,
        stats: { Likability: 100, Action: 95, CoolFactor: 98, CultStatus: 99, OVR: 95 },
        tags: ["Hollywood", "Action", "Cult Icon"]
      },
      {
        id: "celeb_zendaya",
        name: "Zendaya",
        category: "NextGen",
        subtitle: "Euphoria / Dune / Challengers",
        description: "Fashion icon, Emmy-winning acting powerhouse, gen-Z superstar.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/440px-Zendaya_-_2019_by_Glenn_Francis.jpg",
        baseValuation: 20,
        stats: { Fashion: 100, Acting: 92, YouthAppeal: 99, MediaReach: 94, OVR: 94 },
        tags: ["Hollywood", "Fashion", "NextGen", "Emmy Winner"]
      },
      {
        id: "celeb_ramsay",
        name: "Gordon Ramsay",
        category: "Chaos",
        subtitle: "Michelin Star / Hell's Kitchen",
        description: "Explosive culinary perfectionist, idiot sandwich meme lord.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gordon_Ramsay.jpg/440px-Gordon_Ramsay.jpg",
        baseValuation: 18,
        stats: { Temper: 100, Cooking: 98, Entertainment: 94, Memes: 97, OVR: 92 },
        tags: ["Culinary", "TV Icon", "Chaos"]
      }
    ]
  },
  {
    id: "dream-estates",
    title: "Billionaire Dream Real Estate Auction",
    description: "Design an ultra-luxurious billionaire lifestyle estate with prime locations and secret amenities.",
    icon: "🏰",
    theme: "luxury",
    currencySymbol: "🏛️$",
    currencyName: "Million",
    startingBudget: 100,
    minBidIncrement: 2,
    timerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "slot_loc", name: "Prime Global Location", required: true },
      { id: "slot_arch", name: "Architectural Mega-Mansion", required: true },
      { id: "slot_amenity", name: "Ultra-Luxury Amenity", required: true },
      { id: "slot_garage", name: "Supercar & Yacht Fleet", required: true },
      { id: "slot_secret", name: "Secret Bunker / Facility", required: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 20,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "est_amalfi",
        name: "Cliffside Amalfi Coast Villa",
        category: "Location",
        subtitle: "Positano, Italy",
        description: "Perched 200m above azure Mediterranean waters with private funicular to private cove.",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Scenery: 99, Romance: 98, Exclusivity: 95, Resale: 92, OVR: 96 },
        tags: ["Italy", "Coastal", "Historic"]
      },
      {
        id: "est_beverly",
        name: "Beverly Hills Modern Glass Citadel",
        category: "Architecture",
        subtitle: "Los Angeles, CA",
        description: "25,000 sq ft cantilevered infinity pool compound overlooking DTLA skyline.",
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Modernism: 98, Size: 96, Prestige: 97, PartyReady: 100, OVR: 97 },
        tags: ["USA", "Modern", "Celebrity Enclave"]
      },
      {
        id: "est_tokyo",
        name: "Tokyo Cyberpunk Triplex Penthouse",
        category: "Architecture",
        subtitle: "Roppongi Hills, Tokyo",
        description: "3-story penthouse with private rooftop helipad and panoramic Mount Fuji view.",
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Tech: 99, CityView: 99, Design: 95, Nightlife: 98, OVR: 95 },
        tags: ["Japan", "Urban", "Tech"]
      },
      {
        id: "est_island",
        name: "Private Bahamian Outer Atoll",
        category: "Location",
        subtitle: "Exumas, Bahamas",
        description: "120-acre private island with private airstrip, pink sand beaches, and coral reefs.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { Privacy: 100, Nature: 99, Security: 96, Luxury: 97, OVR: 98 },
        tags: ["Caribbean", "Private Island", "Secluded"]
      },
      {
        id: "est_fleet",
        name: "Hypercar Vault & 80m Megayacht",
        category: "Supercar & Yacht Fleet",
        subtitle: "Monaco Harbor Dockage",
        description: "Bugatti Chiron, Pagani Huayra, plus 80-meter yacht with cinema and spa.",
        imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Speed: 100, Flex: 100, SeaWorthiness: 95, Fun: 98, OVR: 97 },
        tags: ["Monaco", "Vehicles", "Yacht"]
      },
      {
        id: "est_bunker",
        name: "Subterranean Doomsday Command Bunker",
        category: "Secret Facility",
        subtitle: "Swiss Alps Deep Granite",
        description: "EMP-shielded luxury bunker with hydroponic greenhouse and 100-year wine cellar.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Security: 100, SelfSufficiency: 99, Tech: 94, Mystery: 98, OVR: 96 },
        tags: ["Switzerland", "Alpine", "Bunker", "Secret"]
      }
    ]
  }
]

// Add name and nominationTimerSeconds aliases to presets
DRAFT_PRESETS.forEach((p) => {
  if (!p.name) p.name = p.title
  if (!p.nominationTimerSeconds) p.nominationTimerSeconds = p.timerSeconds
})

export const DEFAULT_PRESETS = DRAFT_PRESETS

export function getPresetById(id: string): DraftPreset | undefined {
  return DRAFT_PRESETS.find((p) => p.id === id)
}
