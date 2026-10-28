import { DraftPreset } from "./types"
import { CREATOR_POOL, COMBAT_POOL, F1_POOL, GLAMOUR_POOL } from "./kmk-draft-dataset"

export const DRAFT_PRESETS: DraftPreset[] = [
  // 1. SUPERHEROES (KMK DATABASE: CREATE YOUR OWN SUPERHERO TEAM)
  {
    id: "superheroes",
    title: "Create Your Own Superhero Team",
    name: "Create Your Own Superhero Team",
    description: "Draft 5 legendary heroes, cosmic titans, and vigilantes into your dream squad.",
    icon: "Shield",
    theme: "superhero",
    currencySymbol: "⚡",
    currencyName: "Power Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "slot_leader", name: "Tactical Leader", required: true, isWildcard: true },
      { id: "slot_brawler", name: "Vanguard / Brawler", required: true, isWildcard: true },
      { id: "slot_tech", name: "Tech & Intellect", required: true, isWildcard: true },
      { id: "slot_mystic", name: "Mystic / Reality Bender", required: true, isWildcard: true },
      { id: "slot_wildcard", name: "Wildcard Specialist", required: true, isWildcard: true }
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
        subtitle: "DC Universe / Gotham City",
        description: "Master strategist, peak human martial artist, contingency plan for everything.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Batman_Cosplay_2017.jpg/440px-Batman_Cosplay_2017.jpg",
        baseValuation: 24,
        stats: { Intellect: 98, Combat: 95, Tactics: 99, Stealth: 96, OVR: 97 },
        tags: ["DC", "Justice League", "Street Tier", "Prep God"]
      },
      {
        id: "sh_ironman",
        name: "Iron Man (Tony Stark)",
        category: "Tech",
        subtitle: "Marvel / Avengers",
        description: "Billionaire tech prodigy armed with nanotech armor and orbital strike arrays.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg/440px-Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg",
        baseValuation: 25,
        stats: { Intellect: 99, Firepower: 94, Mobility: 90, Tech: 99, OVR: 95 },
        tags: ["Marvel", "Avengers", "Tech", "Billionaire"]
      },
      {
        id: "sh_superman",
        name: "Superman (Clark Kent)",
        category: "Brawler",
        subtitle: "DC Universe / Metropolis",
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
        id: "sh_thor",
        name: "Thor Odinson",
        category: "Brawler",
        subtitle: "Asgard / God of Thunder",
        description: "Immortal Asgardian god wielding lightning and planetary-cracking Stormbreaker.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Thor_cosplay_2019.jpg/440px-Thor_cosplay_2019.jpg",
        baseValuation: 28,
        stats: { Strength: 98, Durability: 96, Energy: 95, Combat: 90, OVR: 96 },
        tags: ["Marvel", "Avengers", "God", "Cosmic"]
      },
      {
        id: "sh_wolverine",
        name: "Wolverine (Logan)",
        category: "Brawler",
        subtitle: "X-Men / Weapon X",
        description: "Adamantium skeleton, razor claws, berserker rage, and inexhaustible healing.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hugh_Jackman_by_Gage_Skidmore_3.jpg/440px-Hugh_Jackman_by_Gage_Skidmore_3.jpg",
        baseValuation: 24,
        stats: { Power: 91, Durability: 99, Combat: 95, Instinct: 96, OVR: 95 },
        tags: ["Marvel", "X-Men", "Mutant", "Healer"]
      },
      {
        id: "sh_wonderwoman",
        name: "Wonder Woman (Diana Prince)",
        category: "Leader",
        subtitle: "DC Universe / Themyscira",
        description: "Amazonian warrior princess with divine combat grace and Lasso of Truth.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Gal_Gadot_by_Gage_Skidmore_2.jpg/440px-Gal_Gadot_by_Gage_Skidmore_2.jpg",
        baseValuation: 27,
        stats: { Power: 95, Combat: 98, Speed: 92, Leadership: 94, OVR: 96 },
        tags: ["DC", "Justice League", "Amazon", "Demigod"]
      },
      {
        id: "sh_deadpool",
        name: "Deadpool (Wade Wilson)",
        category: "Wildcard",
        subtitle: "Marvel / Merc with a Mouth",
        description: "Chaotic regenerative assassin who breaks the fourth wall and cannot die.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/440px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg",
        baseValuation: 21,
        stats: { Power: 88, Chaos: 100, Regeneration: 100, Humor: 100, OVR: 93 },
        tags: ["Marvel", "Anti-Hero", "Mercenary", "Regeneration"]
      },
      {
        id: "sh_scarletwitch",
        name: "Scarlet Witch (Wanda)",
        category: "Mystic",
        subtitle: "Marvel / Chaos Magic",
        description: "Reality-warping sorceress wielding cosmic chaos magic capable of reshaping reality.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Elizabeth_Olsen_by_Gage_Skidmore_2.jpg/440px-Elizabeth_Olsen_by_Gage_Skidmore_2.jpg",
        baseValuation: 29,
        stats: { Power: 99, RealityWarp: 100, Energy: 98, Psyche: 85, OVR: 97 },
        tags: ["Marvel", "Avengers", "Mystic", "Chaos Magic"]
      },
      {
        id: "sh_blackpanther",
        name: "Black Panther (T'Challa)",
        category: "Tech",
        subtitle: "Marvel / Wakanda",
        description: "Vibranium-weave habit, superhuman agility, and the royal intellect of Wakanda.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Chadwick_Boseman_by_Gage_Skidmore_July_2014.jpg/440px-Chadwick_Boseman_by_Gage_Skidmore_July_2014.jpg",
        baseValuation: 25,
        stats: { Power: 90, Tech: 96, Leadership: 97, Agility: 94, OVR: 95 },
        tags: ["Marvel", "Wakanda", "Avenger", "Vibranium"]
      }
    ]
  },

  // 2. WORLD FOOTBALL / GOAT ATHLETES SQUAD
  {
    id: "football-legends",
    title: "World Football Ultimate Squad",
    name: "World Football Ultimate Squad",
    description: "Assemble a championship 6-player squad under a strict $100M salary cap.",
    icon: "Trophy",
    theme: "football",
    currencySymbol: "$",
    currencyName: "Million",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "fwd_1", name: "Striker / Forward", required: true, isWildcard: true },
      { id: "fwd_2", name: "Winger / Forward", required: true, isWildcard: true },
      { id: "mid_1", name: "Playmaker", required: true, isWildcard: true },
      { id: "mid_2", name: "Central Midfielder", required: true, isWildcard: true },
      { id: "def_1", name: "Center Back", required: true, isWildcard: true },
      { id: "def_2", name: "Fullback / Defender", required: true, isWildcard: true },
      { id: "gk_1", name: "Goalkeeper", required: true, isWildcard: true }
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
        id: "fb_rodri",
        name: "Rodri Hernández",
        category: "Midfielder",
        subtitle: "Manchester City / Spain",
        description: "The midfield anchor of modern football, Euro 2024 MVP.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rodri_2023.jpg/440px-Rodri_2023.jpg",
        baseValuation: 20,
        stats: { Pace: 66, Shooting: 80, Passing: 86, Defending: 87, OVR: 90 },
        tags: ["Premier League", "Spain", "UCL Champion"]
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
      }
    ]
  },

  // 3. HOLLYWOOD A-LISTERS & SUPERSTARS
  {
    id: "celebrity-icons",
    title: "Hollywood A-Listers & Superstars",
    name: "Hollywood A-Listers & Superstars",
    description: "Draft 5 generational cinematic titans, Oscar winners, and box-office champions.",
    icon: "Star",
    theme: "hollywood",
    currencySymbol: "⭐",
    currencyName: "Star Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "hol_lead", name: "Leading Star / Anchor", required: true, isWildcard: true },
      { id: "hol_method", name: "Dramatic / Method Master", required: true, isWildcard: true },
      { id: "hol_action", name: "Action / Blockbuster Lead", required: true, isWildcard: true },
      { id: "hol_producer", name: "Power Producer / Visionary", required: true, isWildcard: true },
      { id: "hol_wildcard", name: "Wildcard Talent Slot", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "hol_leo",
        name: "Leonardo DiCaprio",
        category: "Method Lead",
        subtitle: "Oscar Winner / Inception & Titanic",
        description: "Generational leading man with unmatched dramatic intensity and box-office prestige.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Leonardo_DiCaprio_2014.jpg/440px-Leonardo_DiCaprio_2014.jpg",
        baseValuation: 28,
        stats: { Fame: 99, Acting: 98, Charisma: 96, BoxOffice: 95, OVR: 97 },
        tags: ["Oscar Winner", "A-List", "Drama", "Blockbuster"]
      },
      {
        id: "hol_margot",
        name: "Margot Robbie",
        category: "Powerhouse Producer",
        subtitle: "Barbie / Harley Quinn",
        description: "Billion-dollar box office phenomenon, celebrated producer, and modern cinematic icon.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Margot_Robbie_at_Somerset_House_in_2013_%28cropped%29.jpg/440px-Margot_Robbie_at_Somerset_House_in_2013_%28cropped%29.jpg",
        baseValuation: 27,
        stats: { Fame: 98, Charisma: 99, Producer: 96, Range: 95, OVR: 97 },
        tags: ["Barbie", "LuckyChap", "A-List", "Global Star"]
      },
      {
        id: "hol_brad",
        name: "Brad Pitt",
        category: "Hollywood Royalty",
        subtitle: "Fight Club / Once Upon a Time",
        description: "Two-time Oscar winner, Hollywood legend, and effortless charisma machine.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Brad_Pitt_2019_by_Glenn_Francis.jpg/440px-Brad_Pitt_2019_by_Glenn_Francis.jpg",
        baseValuation: 25,
        stats: { Fame: 97, Charisma: 99, CoolFactor: 98, Range: 92, OVR: 95 },
        tags: ["Oscar Winner", "Legend", "Fight Club", "Plan B"]
      },
      {
        id: "hol_ryan",
        name: "Ryan Gosling",
        category: "Charming Lead",
        subtitle: "Drive / La La Land / Barbie",
        description: "Acclaimed versatile star known for comedic brilliance, intense neo-noirs, and viral musical numbers.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Ryan_Gosling_in_2018.jpg/440px-Ryan_Gosling_in_2018.jpg",
        baseValuation: 24,
        stats: { Fame: 96, Acting: 95, ScreenPresence: 98, Musicality: 90, OVR: 95 },
        tags: ["Barbie", "La La Land", "Drive", "Heartthrob"]
      },
      {
        id: "hol_cillian",
        name: "Cillian Murphy",
        category: "Dramatic Master",
        subtitle: "Oppenheimer / Peaky Blinders",
        description: "Best Actor Oscar winner with piercing presence, master of quiet fury and dramatic tension.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Cillian_Murphy_Press_Conference_Oppenheimer.jpg/440px-Cillian_Murphy_Press_Conference_Oppenheimer.jpg",
        baseValuation: 26,
        stats: { Fame: 95, Acting: 100, Intensity: 99, Discipline: 96, OVR: 97 },
        tags: ["Oscar Winner", "Oppenheimer", "Peaky Blinders", "Master"]
      },
      {
        id: "hol_zendaya",
        name: "Zendaya",
        category: "Generational Icon",
        subtitle: "Euphoria / Dune / Spider-Man",
        description: "Two-time Emmy-winning actress, global fashion pioneer, and unstoppable young superstar.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/440px-Zendaya_-_2019_by_Glenn_Francis.jpg",
        baseValuation: 26,
        stats: { Fame: 99, Style: 100, Acting: 94, Influence: 98, OVR: 97 },
        tags: ["Emmy Winner", "Dune", "Fashion Icon", "Euphoria"]
      },
      {
        id: "hol_scarlett",
        name: "Scarlett Johansson",
        category: "Blockbuster Titan",
        subtitle: "Black Widow / Marriage Story",
        description: "Highest-grossing leading actress of all time with two Academy Award nominations in a single year.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg/440px-Scarlett_Johansson_by_Gage_Skidmore_2_%28cropped%29.jpg",
        baseValuation: 26,
        stats: { Fame: 98, BoxOffice: 100, Acting: 95, Action: 93, OVR: 96 },
        tags: ["Marvel", "Avenger", "A-List", "Highest Grossing"]
      },
      {
        id: "hol_keanu",
        name: "Keanu Reeves",
        category: "Action Legend",
        subtitle: "John Wick / The Matrix",
        description: "Beloved global action superstar celebrated for practical stunt mastery and wholesome culture.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Keanu_Reeves_%28Crop_and_Levels%29_%28cropped%29.jpg/440px-Keanu_Reeves_%28Crop_and_Levels%29_%28cropped%29.jpg",
        baseValuation: 25,
        stats: { Fame: 97, Combat: 96, Likability: 100, Longevity: 96, OVR: 96 },
        tags: ["Matrix", "John Wick", "Action", "Icon"]
      },
      {
        id: "hol_timothee",
        name: "Timothée Chalamet",
        category: "Leading Man",
        subtitle: "Dune / Wonka",
        description: "Generational box office titan leading back-to-back blockbusters Dune: Part Two and Wonka.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Timoth%C3%A9e_Chalamet_2019.jpg/440px-Timoth%C3%A9e_Chalamet_2019.jpg",
        baseValuation: 25,
        stats: { Fame: 97, Acting: 96, BoxOffice: 95, Trendsetter: 97, OVR: 96 },
        tags: ["Dune", "Wonka", "Oscar Nominee", "Leading Man"]
      },
      {
        id: "hol_sweeney",
        name: "Sydney Sweeney",
        category: "Breakout Star",
        subtitle: "Euphoria / Anyone But You",
        description: "Fastest rising producer and dramatic powerhouse driving modern box office hits.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sydney_Sweeney_at_Berlinale_2023.jpg/440px-Sydney_Sweeney_at_Berlinale_2023.jpg",
        baseValuation: 23,
        stats: { Fame: 96, Charisma: 97, Producer: 92, Hype: 98, OVR: 94 },
        tags: ["Euphoria", "Producer", "Rom-Com", "Breakout"]
      }
    ]
  },

  // 4. GLOBAL POP STARS SUPERGROUP
  {
    id: "popstars",
    title: "Global Pop Stars Supergroup",
    name: "Global Pop Stars Supergroup",
    description: "Draft 5 chart-topping musical legends, Grammy sovereigns, and stadium headliners.",
    icon: "Mic",
    theme: "popstars",
    currencySymbol: "♫",
    currencyName: "Platinum Records",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "pop_headliner", name: "Main Stadium Headliner", required: true, isWildcard: true },
      { id: "pop_vocalist", name: "Powerhouse Vocalist", required: true, isWildcard: true },
      { id: "pop_lyricist", name: "Master Lyricist / Rapper", required: true, isWildcard: true },
      { id: "pop_producer", name: "Sonic Producer / Showman", required: true, isWildcard: true },
      { id: "pop_wildcard", name: "Wildcard Supergroup Slot", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "pop_taylor",
        name: "Taylor Swift",
        category: "Cultural Phenom",
        subtitle: "The Eras Tour / 14x Grammy Winner",
        description: "Billionaire music industry sovereign, defining pop culture storytelling and historic stadium tours.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards.png/440px-191125_Taylor_Swift_at_the_2019_American_Music_Awards.png",
        baseValuation: 30,
        stats: { Fame: 100, Songwriting: 99, Empire: 100, Fanbase: 100, OVR: 100 },
        tags: ["Eras Tour", "Grammy", "Billionaire", "Icon"]
      },
      {
        id: "pop_beyonce",
        name: "Beyoncé",
        category: "Vocal Sovereign",
        subtitle: "Renaissance / 32x Grammy Winner",
        description: "Most decorated Grammy artist in music history, master choreographer and undisputed live performer.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png/440px-Beyonc%C3%A9_at_The_Lion_King_European_Premiere_2019.png",
        baseValuation: 29,
        stats: { Fame: 99, Vocals: 100, StagePresence: 100, Legacy: 99, OVR: 99 },
        tags: ["Queen Bey", "Grammy Legend", "Renaissance", "Performer"]
      },
      {
        id: "pop_weeknd",
        name: "The Weeknd (Abel)",
        category: "Synth Pop King",
        subtitle: "Blinding Lights / After Hours",
        description: "Spotify record-holder for the #1 billboard hit of all time Blinding Lights.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/The_Weeknd_Cannes_2023.png/440px-The_Weeknd_Cannes_2023.png",
        baseValuation: 27,
        stats: { Fame: 98, Streaming: 100, Production: 96, Vocals: 95, OVR: 97 },
        tags: ["Blinding Lights", "Starboy", "Billboard #1", "RnB"]
      },
      {
        id: "pop_drake",
        name: "Drake (Champagne Papi)",
        category: "Hip-Hop Megastar",
        subtitle: "OVO Sound / Billboard Record Holder",
        description: "Most charted singles in Billboard history with unmatched hitmaking continuity.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drake_July_2016.jpg/440px-Drake_July_2016.jpg",
        baseValuation: 26,
        stats: { Fame: 98, Hits: 99, Flow: 94, Culture: 97, OVR: 96 },
        tags: ["OVO", "Billboard", "Rap", "Hitmaker"]
      },
      {
        id: "pop_rihanna",
        name: "Rihanna",
        category: "Mogul & Superstar",
        subtitle: "Fenty / Diamonds",
        description: "Billionaire cosmetics and fashion empire founder, nine-time Grammy winner.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_Fenty_2018.png/440px-Rihanna_Fenty_2018.png",
        baseValuation: 28,
        stats: { Fame: 99, Style: 100, Hits: 96, Business: 99, OVR: 98 },
        tags: ["Fenty", "Super Bowl", "Diamonds", "Billionaire"]
      },
      {
        id: "pop_billie",
        name: "Billie Eilish",
        category: "Alt-Pop Prodigy",
        subtitle: "9x Grammy & 2x Oscar Winner",
        description: "Youngest double Oscar winner in history with genre-bending anthems and authenticity.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Billie_Eilish_at_the_2024_Golden_Globes.jpg/440px-Billie_Eilish_at_the_2024_Golden_Globes.jpg",
        baseValuation: 26,
        stats: { Fame: 97, Artistry: 98, Oscar: 99, Production: 95, OVR: 96 },
        tags: ["Grammy", "Oscar Winner", "Alt Pop", "Visionary"]
      },
      {
        id: "pop_bruno",
        name: "Bruno Mars",
        category: "Funk Virtuoso",
        subtitle: "Silk Sonic / 15x Grammy Winner",
        description: "Unmatched live showman, retro funk genius, and multi-instrumentalist.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bruno_Mars_in_2017.jpg/440px-Bruno_Mars_in_2017.jpg",
        baseValuation: 25,
        stats: { Fame: 96, Showmanship: 100, Vocals: 98, Funk: 99, OVR: 96 },
        tags: ["Silk Sonic", "Grammy", "Funk", "Showman"]
      },
      {
        id: "pop_dua",
        name: "Dua Lipa",
        category: "Nu-Disco Queen",
        subtitle: "Future Nostalgia / Radical Optimism",
        description: "Three-time Grammy winner whose electric disco grooves dominated dancefloors worldwide.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Dua_Lipa_at_the_2024_Golden_Globes_%28cropped%29.jpg/440px-Dua_Lipa_at_the_2024_Golden_Globes_%28cropped%29.jpg",
        baseValuation: 24,
        stats: { Fame: 96, Dance: 97, Bops: 96, Glamour: 98, OVR: 95 },
        tags: ["Future Nostalgia", "Grammy", "Disco Pop", "Global"]
      },
      {
        id: "pop_eminem",
        name: "Eminem (Slim Shady)",
        category: "Rap God",
        subtitle: "8 Mile / Greatest Lyricist",
        description: "Diamond-certified hip-hop immortal, rapid-fire lyrical technician, and Oscar winner.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%282%29_%28cropped%29.jpg/440px-Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%282%29_%28cropped%29.jpg",
        baseValuation: 27,
        stats: { Fame: 98, LyricalSpeed: 100, Legacy: 99, Technicality: 99, OVR: 98 },
        tags: ["Slim Shady", "Rap God", "Oscar Winner", "Hip Hop"]
      },
      {
        id: "pop_ariana",
        name: "Ariana Grande",
        category: "Vocal Virtuoso",
        subtitle: "Wicked / Positions",
        description: "Four-octave vocal virtuoso with whistle-register agility, star of Wicked.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ariana_Grande_at_the_2020_Grammy_Awards.png/440px-Ariana_Grande_at_the_2020_Grammy_Awards.png",
        baseValuation: 25,
        stats: { Fame: 98, VocalRange: 100, Agility: 97, Wicked: 96, OVR: 96 },
        tags: ["Grammy", "Wicked", "Whistle Note", "Vocal Queen"]
      }
    ]
  },

  // 5. BOLLYWOOD BLOCKBUSTER DREAM TEAM
  {
    id: "bollywood",
    title: "Bollywood Blockbuster Dream Team",
    name: "Bollywood Blockbuster Dream Team",
    description: "Draft 5 iconic Indian cinema legends, megastars, and national award winners.",
    icon: "Sparkles",
    theme: "bollywood",
    currencySymbol: "₹",
    currencyName: "Crores",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "bol_hero", name: "King / Alpha Hero", required: true, isWildcard: true },
      { id: "bol_heroine", name: "Leading Lady / Siren", required: true, isWildcard: true },
      { id: "bol_dancer", name: "High-Energy Showstopper", required: true, isWildcard: true },
      { id: "bol_legend", name: "Veteran Legend / Mentor", required: true, isWildcard: true },
      { id: "bol_wildcard", name: "Wildcard Blockbuster Pick", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "bol_srk",
        name: "Shah Rukh Khan",
        category: "King of Romance",
        subtitle: "King Khan / Jawan & DDLJ",
        description: "Global superstar of Indian cinema, breaking all-time box office records with historic charisma.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg",
        baseValuation: 30,
        stats: { Stardom: 100, Charisma: 100, BoxOffice: 99, Romance: 100, OVR: 99 },
        tags: ["King Khan", "SRK", "Blockbuster", "Global Icon"]
      },
      {
        id: "bol_deepika",
        name: "Deepika Padukone",
        category: "Global Megastar",
        subtitle: "Padmaavat / Kalki / Cannes",
        description: "India's highest-paid leading actress, Time 100 honoree, and international fashion royalty.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Deepika_Padukone_Cannes_2019.jpg/440px-Deepika_Padukone_Cannes_2019.jpg",
        baseValuation: 28,
        stats: { Stardom: 99, Grace: 100, Acting: 97, GlobalReach: 98, OVR: 98 },
        tags: ["Cannes", "Time 100", "Blockbuster", "Queen"]
      },
      {
        id: "bol_hrithik",
        name: "Hrithik Roshan",
        category: "Greek God Dancer",
        subtitle: "War / Krrish / Dhoom 2",
        description: "Celebrated for peerless dance virtuosity, Greek-god screen presence, and high-octane action.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hrithik_at_Rado_launch.jpg/440px-Hrithik_at_Rado_launch.jpg",
        baseValuation: 27,
        stats: { Stardom: 97, Dancing: 100, Action: 98, ScreenCharm: 98, OVR: 97 },
        tags: ["Greek God", "Dance Legend", "War", "Action"]
      },
      {
        id: "bol_alia",
        name: "Alia Bhatt",
        category: "National Award Star",
        subtitle: "Gangubai Kathiawadi / RRR",
        description: "National Award-winning actress celebrated for transformative dramatic weight and versatility.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Alia_Bhatt_at_Berlinale_2022.jpg/440px-Alia_Bhatt_at_Berlinale_2022.jpg",
        baseValuation: 27,
        stats: { Stardom: 98, Acting: 99, Versatility: 98, CriticalAcclaim: 98, OVR: 98 },
        tags: ["National Award", "Gangubai", "Met Gala", "RRR"]
      },
      {
        id: "bol_ranbir",
        name: "Ranbir Kapoor",
        category: "Actor's Actor",
        subtitle: "Animal / Rockstar / Barfi",
        description: "Effortless method brilliance, starring in the historic blockbuster Animal.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ranbir_Kapoor_promoting_Brahmastra.jpg/440px-Ranbir_Kapoor_promoting_Brahmastra.jpg",
        baseValuation: 26,
        stats: { Stardom: 97, Acting: 99, Intensity: 97, Range: 98, OVR: 97 },
        tags: ["Animal", "Rockstar", "Method", "Superstar"]
      },
      {
        id: "bol_ranveer",
        name: "Ranveer Singh",
        category: "High-Voltage Dynamo",
        subtitle: "Bajirao Mastani / Gully Boy",
        description: "Explosive, theatrical chameleon with boundary-pushing fashion and raw passion.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ranveer_Singh_in_2023.jpg/440px-Ranveer_Singh_in_2023.jpg",
        baseValuation: 25,
        stats: { Stardom: 96, Energy: 100, Transformation: 98, Fashion: 100, OVR: 96 },
        tags: ["Gully Boy", "Energy", "Chameleon", "Style"]
      },
      {
        id: "bol_salman",
        name: "Salman Khan",
        category: "Bhaijaan of Bollywood",
        subtitle: "Tiger / Bajrangi Bhaijaan",
        description: "One of the most mass-adored box-office titans in film history with unmatched fandom.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Salman_Khan_at_Tubelight_trailer_launch.jpg/440px-Salman_Khan_at_Tubelight_trailer_launch.jpg",
        baseValuation: 27,
        stats: { Stardom: 99, MassAppeal: 100, Fandom: 100, Swag: 98, OVR: 97 },
        tags: ["Bhaijaan", "Tiger", "Mass Hero", "Megastar"]
      },
      {
        id: "bol_amitabh",
        name: "Amitabh Bachchan",
        category: "Shahenshah of Cinema",
        subtitle: "Sholay / Deewaar / Piku",
        description: "The Star of the Millennium, iconic baritone voice, and defining pillar of Indian culture.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Indian_actor_Amitabh_Bachchan.jpg/440px-Indian_actor_Amitabh_Bachchan.jpg",
        baseValuation: 29,
        stats: { Stardom: 100, Voice: 100, Gravitas: 100, Legacy: 100, OVR: 99 },
        tags: ["Shahenshah", "Big B", "Legend", "Millennium Star"]
      },
      {
        id: "bol_priyanka",
        name: "Priyanka Chopra",
        category: "Global Trailblazer",
        subtitle: "Citadel / Barfi! / Miss World",
        description: "Miss World 2000 winner, Hollywood franchise lead in Citadel, and international producer.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Priyanka_Chopra_at_Bulgary_launch%2C_2024.jpg/440px-Priyanka_Chopra_at_Bulgary_launch%2C_2024.jpg",
        baseValuation: 26,
        stats: { Stardom: 97, GlobalReach: 99, Charisma: 98, Adaptability: 96, OVR: 96 },
        tags: ["Miss World", "Citadel", "Global", "Trailblazer"]
      },
      {
        id: "bol_katrina",
        name: "Katrina Kaif",
        category: "Blockbuster Siren",
        subtitle: "Tiger 3 / Chikni Chameli / Kay Beauty",
        description: "Blockbuster action star, Bollywood's defining dance siren, and founder of Kay Beauty.",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Katrina_Kaif_promoting_Bharat_in_2019.jpg/440px-Katrina_Kaif_promoting_Bharat_in_2019.jpg",
        baseValuation: 24,
        stats: { Stardom: 96, Dancing: 99, ScreenGlam: 99, Business: 94, OVR: 95 },
        tags: ["Tiger", "Dance", "Kay Beauty", "Superstar"]
      }
    ]
  },

  // 6. DREAM ESTATES & MANSIONS
  {
    id: "dream-estates",
    title: "Ultra-Luxury Mansions & Estates",
    name: "Ultra-Luxury Mansions & Estates",
    description: "Draft 5 jaw-dropping architectural marvels, private islands, and megayachts.",
    icon: "Home",
    theme: "luxury",
    currencySymbol: "$",
    currencyName: "Million",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "est_primary", name: "Crown Mega-Mansion", required: true, isWildcard: true },
      { id: "est_island", name: "Private Tropical Atoll", required: true, isWildcard: true },
      { id: "est_penthouse", name: "Skyscraper Glass Penthouse", required: true, isWildcard: true },
      { id: "est_villa", name: "Cliffside Riviera Villa", required: true, isWildcard: true },
      { id: "est_wildcard", name: "Wildcard Luxury Estate", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "est_antilia",
        name: "The Mumbai Sky Citadel",
        category: "Crown Mega-Mansion",
        subtitle: "27-Storey Private Skyscraper",
        description: "Helipads, ballroom, 50-seat cinema, and snow room high above the Arabian Sea.",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
        baseValuation: 30,
        stats: { Luxury: 100, Security: 99, Prestige: 100, Scale: 99, OVR: 99 },
        tags: ["Skyscraper", "Megacity", "Helipad", "Billionaire"]
      },
      {
        id: "est_belair",
        name: "Bel-Air Billionaire Compound",
        category: "Crown Mega-Mansion",
        subtitle: "Los Angeles Hills Panorama",
        description: "Infinity pools, auto gallery, wellness pavilion, and panoramic city views.",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Luxury: 98, Views: 99, Style: 97, Space: 96, OVR: 97 },
        tags: ["Los Angeles", "Hills", "Modern", "Infinity Pool"]
      },
      {
        id: "est_maldives",
        name: "Overwater Private Atoll",
        category: "Private Tropical Atoll",
        subtitle: "Maldives Deep Blue",
        description: "Private marine reserve, sub-ocean wine cellar, and private sea-plane terminal.",
        imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Privacy: 100, Scenery: 100, Wellness: 98, Luxury: 96, OVR: 98 },
        tags: ["Maldives", "Ocean", "Lagoon", "Island"]
      },
      {
        id: "est_manhattan",
        name: "Central Park Triplex Penthouse",
        category: "Skyscraper Glass Penthouse",
        subtitle: "Billionaires' Row, Manhattan",
        description: "1,400 feet above NYC with 360-degree vistas of Central Park and the Atlantic horizon.",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Views: 100, Prestige: 98, Location: 100, Design: 96, OVR: 98 },
        tags: ["New York", "Penthouse", "Skyline", "Central Park"]
      },
      {
        id: "est_como",
        name: "Lake Como Renaissance Villa",
        category: "Cliffside Riviera Villa",
        subtitle: "Lombardy, Italy",
        description: "Frescoed ballrooms, botanical terraces, and private boat dock frequented by royalty.",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Heritage: 100, Beauty: 100, Waterfront: 97, Elegance: 99, OVR: 98 },
        tags: ["Italy", "Lake Como", "Historic", "Palace"]
      },
      {
        id: "est_swiss",
        name: "Zermatt Matterhorn Chalet",
        category: "Cliffside Riviera Villa",
        subtitle: "Swiss Alps Luxury Retreat",
        description: "Ski-in/ski-out chalet with geothermal spa, heated glass balconies, and Matterhorn face views.",
        imageUrl: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Coziness: 100, Scenery: 99, Wellness: 96, Exclusive: 97, OVR: 96 },
        tags: ["Swiss Alps", "Ski Resort", "Chalet", "Matterhorn"]
      },
      {
        id: "est_yacht",
        name: "Solaris 140m Giga-Yacht",
        category: "Wildcard Luxury Estate",
        subtitle: "Deep Ocean Floating Palace",
        description: "Twin helicopter pads, submarine bay, beach club, and dual swimming pools.",
        imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { Mobility: 100, Luxury: 99, Technology: 97, Freedom: 100, OVR: 98 },
        tags: ["Yacht", "Ocean", "Helipad", "Billionaire"]
      },
      {
        id: "est_kyoto",
        name: "Kyoto Forest Zen Sanctuary",
        category: "Wildcard Luxury Estate",
        subtitle: "Arashiyama Bamboo Grove",
        description: "Cedarwood pavilions, private natural hot-spring onsen, and rock gardens.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Serenity: 100, Nature: 100, Craftsmanship: 98, Peace: 100, OVR: 96 },
        tags: ["Japan", "Kyoto", "Onsen", "Zen"]
      },
      {
        id: "est_monaco",
        name: "Monaco Port Palace Residence",
        category: "Cliffside Riviera Villa",
        subtitle: "Monte Carlo Harbourfront",
        description: "Front-row balcony overlooking the Grand Prix circuit and superyacht harbour.",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Glamour: 100, TaxHaven: 100, F1Views: 100, Luxury: 97, OVR: 97 },
        tags: ["Monaco", "Monte Carlo", "F1", "Harbour"]
      },
      {
        id: "est_bora",
        name: "Bora Bora Deep Lagoon Villa",
        category: "Private Tropical Atoll",
        subtitle: "French Polynesia",
        description: "Glass floor over shark sanctuary, private catamaran dock, and coral gardens.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Tropical: 100, Lagoon: 100, Seclusion: 98, Sunsets: 100, OVR: 97 },
        tags: ["Bora Bora", "Lagoon", "Polynesia", "Overwater"]
      }
    ]
  },

  // 7. SCI-FI STARSHIPS
  {
    id: "sci-fi-starships",
    title: "Sci-Fi Starships & Cosmic Fleet",
    description: "Assemble a galactic armada with legendary faster-than-light vessels and dreadnoughts.",
    icon: "🚀",
    theme: "starships",
    currencySymbol: "⬡",
    currencyName: "Hyper-Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "ship_flagship", name: "Command Flagship", required: true, isWildcard: true },
      { id: "ship_cruiser", name: "Heavy Battlecruiser", required: true, isWildcard: true },
      { id: "ship_escort", name: "Fast Strike Escort", required: true, isWildcard: true },
      { id: "ship_stealth", name: "Stealth / Recon Vessel", required: true, isWildcard: true },
      { id: "ship_wildcard", name: "Wildcard Armada Ship", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "ship_falcon",
        name: "Millennium Falcon",
        category: "Smuggler / Escort",
        subtitle: "YT-1300 Light Freighter",
        description: "Made the Kessel Run in less than 12 parsecs. Unmatched hyperdrive agility and quad-laser punch.",
        imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Speed: 99, Firepower: 84, Evasion: 96, Armor: 82, OVR: 95 },
        tags: ["Star Wars", "Rebel", "Smuggler", "Legendary"]
      },
      {
        id: "ship_enterprise",
        name: "USS Enterprise NCC-1701-D",
        category: "Command Flagship",
        subtitle: "Galaxy-Class Starfleet Flagship",
        description: "Equipped with quantum torpedoes, holodecks, saucer separation, and exploration sensors.",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Science: 100, Shields: 95, Diplomacy: 98, Firepower: 90, OVR: 97 },
        tags: ["Star Trek", "Starfleet", "Flagship", "Science"]
      },
      {
        id: "ship_stardestroyer",
        name: "Imperial Star Destroyer",
        category: "Heavy Battlecruiser",
        subtitle: "Imperial II-Class Dreadnought",
        description: "1,600-meter wedge of terror armed with 60 heavy turbolasers and full TIE-fighter wings.",
        imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Firepower: 98, Armor: 96, Intimidation: 100, Speed: 68, OVR: 94 },
        tags: ["Star Wars", "Empire", "Dreadnought", "Heavy"]
      },
      {
        id: "ship_normandy",
        name: "SSV Normandy SR-2",
        category: "Stealth / Recon Vessel",
        subtitle: "Deep-Space Stealth Frigate",
        description: "Tantalus drive core completely hides thermal heat emissions. Thanix cannon shreds Reaper armor.",
        imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Stealth: 100, Agility: 94, Firepower: 91, Tech: 96, OVR: 95 },
        tags: ["Mass Effect", "Alliance", "Stealth", "Spectre"]
      },
      {
        id: "ship_razorcrest",
        name: "The Razor Crest",
        category: "Bounty Hunter Ship",
        subtitle: "Pre-Empire Military Gunship",
        description: "Twin sub-light engines, carbon-freezing chamber, and rugged armor built for outer-rim tracking.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Durability: 91, Tracking: 94, Combat: 88, Stealth: 75, OVR: 89 },
        tags: ["Star Wars", "Mandalorian", "Bounty Hunter", "Gunship"]
      },
      {
        id: "ship_bebop",
        name: "The Bebop",
        category: "Smuggler / Escort",
        subtitle: "Modified Interplanetary Fishing Trawler",
        description: "Floating workshop and home base for the solar system's smoothest bounty hunters.",
        imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=600&q=80",
        baseValuation: 19,
        stats: { Charm: 99, Utility: 90, Hangar: 92, Speed: 74, OVR: 88 },
        tags: ["Anime", "Bebop", "Solar System", "Classic"]
      },
      {
        id: "ship_pillar",
        name: "UNSC Pillar of Autumn",
        category: "Heavy Battlecruiser",
        subtitle: "Halcyon-Class Light Cruiser",
        description: "Honeycomb internal titanium armor with magnetic accelerator cannon capable of slugging Covenant ships.",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Armor: 99, Firepower: 93, Tenacity: 98, Speed: 72, OVR: 93 },
        tags: ["Halo", "UNSC", "Military", "Cruiser"]
      },
      {
        id: "ship_heartofgold",
        name: "Heart of Gold",
        category: "Experimental Starship",
        subtitle: "Infinite Improbability Drive Vessel",
        description: "Passes through every point in the universe simultaneously, transforming missiles into whales.",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Improbability: 100, Chaos: 99, Speed: 100, Logic: 10, OVR: 92 },
        tags: ["Sci-Fi", "Comedy", "Cosmic", "Experimental"]
      },
      {
        id: "ship_serenity",
        name: "Serenity (Firefly Class)",
        category: "Smuggler / Escort",
        subtitle: "Mid-Bulk Transport 03-K64",
        description: "No weapons, but she'll stay in the air when she oughta fall down. Powered by pure grit and loyalty.",
        imageUrl: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?auto=format&fit=crop&w=600&q=80",
        baseValuation: 18,
        stats: { Heart: 100, Evasion: 89, Cargo: 92, Armor: 76, OVR: 87 },
        tags: ["Firefly", "Outlaw", "Transport", "Classic"]
      },
      {
        id: "ship_tardis",
        name: "The TARDIS (Type 40)",
        category: "Command Flagship",
        subtitle: "Time and Relative Dimension in Space",
        description: "Bigger on the inside, transcends 11 dimensions, chronologically invulnerable police box.",
        imageUrl: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=600&q=80",
        baseValuation: 30,
        stats: { TimeTravel: 100, Defense: 99, Mystique: 100, Versatility: 99, OVR: 99 },
        tags: ["Doctor Who", "Time Lord", "Cosmic", "Transcendent"]
      }
    ]
  },

  // 2. MYTHICAL BEASTS & LEGENDARY CREATURES
  {
    id: "mythical-beasts",
    title: "Mythical Beasts & Legendary Monsters",
    description: "Draft an elemental menagerie of catastrophic beasts and mythical familiars.",
    icon: "🐉",
    theme: "mythical",
    currencySymbol: "🪙",
    currencyName: "Dragon Gold",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "beast_apex", name: "Apex World-Eater", required: true, isWildcard: true },
      { id: "beast_aerial", name: "Celestial / Winged Terror", required: true, isWildcard: true },
      { id: "beast_guardian", name: "Underworld Guardian", required: true, isWildcard: true },
      { id: "beast_aquatic", name: "Abyssal Sea Titan", required: true, isWildcard: true },
      { id: "beast_wildcard", name: "Mythic Familiar", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "beast_dragon",
        name: "Ancient Pyroclastic Dragon",
        category: "Apex World-Eater",
        subtitle: "Scourge of the Mountains",
        description: "Wing span obscuring the sun, scales harder than diamond, breath that vaporizes stone.",
        imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Firepower: 99, Durability: 96, Terror: 98, Flight: 92, OVR: 97 },
        tags: ["Fire", "Dragon", "Apex", "Ancient"]
      },
      {
        id: "beast_phoenix",
        name: "Immortal Solar Phoenix",
        category: "Celestial / Winged Terror",
        subtitle: "Bird of Rebirth & Solar Flame",
        description: "Reborn from its own ash with healing tears that cure any mortal wound.",
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Rebirth: 100, Healing: 98, Speed: 94, Radiance: 96, OVR: 96 },
        tags: ["Holy", "Celestial", "Immortal", "Fire"]
      },
      {
        id: "beast_cerberus",
        name: "Three-Headed Cerberus",
        category: "Underworld Guardian",
        subtitle: "Gatekeeper of Hades",
        description: "Three jaws dripping with toxic saliva, barbed serpent tail, and unbreakable underworld loyalty.",
        imageUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Vigilance: 100, Ferocity: 94, Guard: 98, Strength: 91, OVR: 93 },
        tags: ["Dark", "Underworld", "Guardian", "Beast"]
      },
      {
        id: "beast_kraken",
        name: "Abyssal Sea Kraken",
        category: "Abyssal Sea Titan",
        subtitle: "Crusher of Fleets",
        description: "Tentacles capable of pulling whole galleons into the abyss beneath a whirlpool vortex.",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Crushing: 99, Camouflage: 92, Size: 100, WaterControl: 95, OVR: 96 },
        tags: ["Water", "Abyss", "Sea Monster", "Titan"]
      },
      {
        id: "beast_griffin",
        name: "Royal Golden Griffin",
        category: "Celestial / Winged Terror",
        subtitle: "Sovereign of Earth and Sky",
        description: "Head and talons of an eagle, muscular body of a golden lion. Sacred guardian of treasures.",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { AerialCombat: 92, Honor: 96, Speed: 90, Strength: 88, OVR: 91 },
        tags: ["Noble", "Winged", "Guardian", "Beast"]
      },
      {
        id: "beast_hydra",
        name: "Lernean Nine-Headed Hydra",
        category: "Apex World-Eater",
        subtitle: "Endless Venom Multiplier",
        description: "Sever one head and two grow back. Exhales clouds of corrosive acid mist.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Regeneration: 99, Poison: 98, Tenacity: 97, Fear: 92, OVR: 95 },
        tags: ["Poison", "Swamp", "Mythic", "Regen"]
      },
      {
        id: "beast_leviathan",
        name: "Primordial Leviathan",
        category: "Abyssal Sea Titan",
        subtitle: "Continental Trench Lord",
        description: "Armored plate skin thicker than mountain granite. Creates tidal waves with a swish of its tail.",
        imageUrl: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Mass: 100, Defense: 99, WavePower: 97, Ancient: 95, OVR: 96 },
        tags: ["Water", "Ancient", "Apex", "Titan"]
      },
      {
        id: "beast_pegasus",
        name: "Divine Celestial Pegasus",
        category: "Celestial / Winged Terror",
        subtitle: "Steed of the Muses",
        description: "Snow-white divine winged horse whose hooves carve springs of eternal creative inspiration.",
        imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { Agility: 99, Purity: 100, Grace: 98, Speed: 94, OVR: 92 },
        tags: ["Holy", "Celestial", "Winged", "Divine"]
      },
      {
        id: "beast_basilisk",
        name: "Stone-Gaze Basilisk",
        category: "Underworld Guardian",
        subtitle: "King of Serpents",
        description: "One glance into its yellow eyes turns flesh into solid petrified stone in an instant.",
        imageUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Lethality: 100, Stealth: 93, Petrify: 100, Armor: 86, OVR: 94 },
        tags: ["Poison", "Petrify", "Serpent", "Lethal"]
      },
      {
        id: "beast_yeti",
        name: "Abominable Glacier Yeti",
        category: "Underworld Guardian",
        subtitle: "Terror of the High Passes",
        description: "Unstoppable blizzard camouflage and brute strength that can uproot ancient pine forests.",
        imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 19,
        stats: { FrostPower: 94, Strength: 93, Camouflage: 95, Roar: 90, OVR: 90 },
        tags: ["Ice", "Blizzard", "Beast", "Alpine"]
      }
    ]
  },

  // 3. GOD-TIER VIDEO GAME WEAPONS & RELICS
  {
    id: "game-weapons",
    title: "God-Tier Video Game Weapons",
    description: "Equip an arsenal of the most devastating, iconic, and reality-breaking weapons in gaming.",
    icon: "⚔️",
    theme: "videogames",
    currencySymbol: "💎",
    currencyName: "Gamer Gems",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "wpn_melee", name: "Primary Melee Artifact", required: true, isWildcard: true },
      { id: "wpn_ranged", name: "Devastating Heavy Ranged", required: true, isWildcard: true },
      { id: "wpn_spatial", name: "Physics / Spatial Tool", required: true, isWildcard: true },
      { id: "wpn_special", name: "Mythic Special Gear", required: true, isWildcard: true },
      { id: "wpn_wildcard", name: "Wildcard Arsenal Slot", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "wpn_mastersword",
        name: "The Master Sword",
        category: "Primary Melee Artifact",
        subtitle: "The Blade of Evil's Bane",
        description: "Forged by the ancient Goddess Hylia. Emits divine holy beams at full health.",
        imageUrl: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { HolyDamage: 100, Durability: 96, Heritage: 100, EvilBane: 100, OVR: 98 },
        tags: ["Zelda", "Nintendo", "Holy", "Legendary"]
      },
      {
        id: "wpn_bfg9000",
        name: "BFG 9000",
        category: "Devastating Heavy Ranged",
        subtitle: "Big Freaking Gun (UAC Heavy Weapon)",
        description: "Shoots massive green plasma spheres that tether electrical death to every demon in line of sight.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { AreaOfEffect: 100, RawPower: 100, Chaos: 97, Splash: 98, OVR: 98 },
        tags: ["DOOM", "FPS", "Heavy", "Explosive"]
      },
      {
        id: "wpn_portalgun",
        name: "Aperture Science Portal Gun",
        category: "Physics / Spatial Tool",
        subtitle: "ASHPD Quantum Tunnel Projector",
        description: "Creates linked blue and orange portals on flat surfaces. Conserves momentum across spatial bounds.",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Utility: 100, BrainPower: 99, Mobility: 100, Versatility: 98, OVR: 97 },
        tags: ["Portal", "Valve", "Physics", "Sci-Fi"]
      },
      {
        id: "wpn_bustersword",
        name: "Cloud's Buster Sword",
        category: "Primary Melee Artifact",
        subtitle: "6-Foot Broadsword with Materia Slots",
        description: "Passed down through Angeal and Zack. Dual materia slots channel apocalyptic magical limit breaks.",
        imageUrl: "https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Cleave: 96, MateriaSynergy: 95, IconicFactor: 100, HeavyStance: 92, OVR: 95 },
        tags: ["Final Fantasy", "Square Enix", "Melee", "Iconic"]
      },
      {
        id: "wpn_gravitygun",
        name: "Zero Point Energy Gravity Gun",
        category: "Physics / Spatial Tool",
        subtitle: "Black Mesa Field Manipulator",
        description: "Picks up sawblades, cars, or energy spheres and hurls them with devastating ballistic acceleration.",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Physics: 100, FunFactor: 99, ResourceFree: 96, CrowdControl: 94, OVR: 94 },
        tags: ["Half-Life", "Valve", "Physics", "Sci-Fi"]
      },
      {
        id: "wpn_bladesofchaos",
        name: "Blades of Chaos",
        category: "Primary Melee Artifact",
        subtitle: "Chained Primordial Fire Blades",
        description: "Chained directly into Kratos' flesh. Whirling whirlwind of scorching fire that butchers pantheons.",
        imageUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Rage: 100, ComboRate: 98, FlameDamage: 96, Brutality: 100, OVR: 96 },
        tags: ["God of War", "PlayStation", "Fire", "Mythic"]
      },
      {
        id: "wpn_raygun",
        name: "The Mystery Box Ray Gun",
        category: "Devastating Heavy Ranged",
        subtitle: "Porter's X2 Ray Gun Classic",
        description: "Revive me, I have the Ray Gun! Shoots turquoise splash-damage rings that turn zombies to mist.",
        imageUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { MemeFactor: 100, Splash: 94, RapidFire: 91, Nostalgia: 99, OVR: 93 },
        tags: ["Call of Duty", "Zombies", "FPS", "Cult"]
      },
      {
        id: "wpn_diamondsword",
        name: "Enchanted Diamond Sword",
        category: "Primary Melee Artifact",
        subtitle: "Sharpness V, Fire Aspect II, Looting III",
        description: "Solid forged Minecraft diamond infused with nether fire and sweeping edge enchantments.",
        imageUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { Sharpness: 95, Durability: 98, Looting: 99, Recognition: 100, OVR: 92 },
        tags: ["Minecraft", "Enchanted", "Crafting", "Classic"]
      },
      {
        id: "wpn_energysword",
        name: "Type-1 Energy Sword",
        category: "Primary Melee Artifact",
        subtitle: "Sangheili Honor Blade",
        description: "Twin curved blades of magnetically shaped superheated plasma. Instant one-hit lunging kill.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { LungeRange: 96, ArmorPierce: 99, SoundFX: 100, Style: 98, OVR: 94 },
        tags: ["Halo", "Xbox", "Plasma", "Alien"]
      },
      {
        id: "wpn_hiddenblade",
        name: "Assassin's Hidden Blade",
        category: "Mythic Special Gear",
        subtitle: "Brotherhood Wrist Spring Blade",
        description: "Concealed beneath the bracer, deadly in silence. Nothing is true; everything is permitted.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 19,
        stats: { Stealth: 100, Precision: 98, Concealment: 100, Speed: 92, OVR: 91 },
        tags: ["Assassins Creed", "Stealth", "Historical", "Iconic"]
      }
    ]
  },

  // 4. ICONIC MOVIE & POP-CULTURE VEHICLES
  {
    id: "movie-vehicles",
    title: "Iconic Movie & Cinema Vehicles",
    description: "Bid on the most famous, turbo-charged, time-hopping vehicles in cinematic history.",
    icon: "🏎️",
    theme: "vehicles",
    currencySymbol: "⚡",
    currencyName: "Nitro Bucks",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "veh_tactical", name: "Tactical Combat Cruiser", required: true, isWildcard: true },
      { id: "veh_timewarp", name: "Time / Sci-Fi Cruiser", required: true, isWildcard: true },
      { id: "veh_agent", name: "Secret Agent Luxury Ride", required: true, isWildcard: true },
      { id: "veh_cyber", name: "Futuristic Two-Wheeler / Bike", required: true, isWildcard: true },
      { id: "veh_wildcard", name: "Pop Culture Wildcard", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "veh_batmobile",
        name: "The Tumbler Batmobile",
        category: "Tactical Combat Cruiser",
        subtitle: "The Dark Knight Military Prototype",
        description: "5.7L V8 engine, dual forward autocannons, jump hydraulics, and ejectable Batpod bike.",
        imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Armor: 99, Weaponry: 96, Intimidation: 100, Speed: 88, OVR: 97 },
        tags: ["Batman", "DC", "Tactical", "Iconic"]
      },
      {
        id: "veh_delorean",
        name: "DeLorean Time Machine",
        category: "Time / Sci-Fi Cruiser",
        subtitle: "DMC-12 Flux Capacitor Rig",
        description: "Stainless steel body, gull-wing doors, and Mr. Fusion reactor. Hits 88 MPH into 1955 or 2015.",
        imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { TimeTravel: 100, Nostalgia: 100, Style: 98, Speed: 88, OVR: 98 },
        tags: ["Back To The Future", "Sci-Fi", "80s", "Classic"]
      },
      {
        id: "veh_astonmartin",
        name: "Aston Martin DB5 (007 Edition)",
        category: "Secret Agent Luxury Ride",
        subtitle: "MI6 Special Equipment Division",
        description: "Passenger ejector seat, revolving license plates, rear bulletproof shield, and twin machine guns.",
        imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Class: 100, Gadgets: 97, Prestige: 99, Agility: 86, OVR: 96 },
        tags: ["James Bond", "007", "British", "Luxury"]
      },
      {
        id: "veh_ecto1",
        name: "Ghostbusters Ecto-1",
        category: "Pop Culture Wildcard",
        subtitle: "1959 Cadillac Miller-Meteor Ambulance",
        description: "Equipped with roof-mounted muon sniffers, proton pack racks, and the most iconic siren ever.",
        imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Paranormal: 100, Charm: 98, Storage: 94, SirenVolume: 100, OVR: 92 },
        tags: ["Ghostbusters", "Comedy", "80s", "Vintage"]
      },
      {
        id: "veh_madmax",
        name: "V8 Pursuit Special Interceptor",
        category: "Tactical Combat Cruiser",
        subtitle: "Mad Max Australian Falcon XB GT",
        description: "Supercharged V8 with dashboard toggle blower. The last of the V8s patrolling wasteland roads.",
        imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Grit: 100, Acceleration: 95, Durability: 96, Sound: 98, OVR: 94 },
        tags: ["Mad Max", "Wasteland", "Muscle", "V8"]
      },
      {
        id: "veh_akira",
        name: "Kaneda's Cyber-Bike",
        category: "Futuristic Two-Wheeler / Bike",
        subtitle: "Neo-Tokyo High-Performance Cruiser",
        description: "Ceramic double-rotor 200HP electric engine with computer-controlled reverse gear and power slide brake.",
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { SlideFactor: 100, Cyberpunk: 100, Speed: 96, Handling: 95, OVR: 96 },
        tags: ["Akira", "Anime", "Cyberpunk", "Cult"]
      },
      {
        id: "veh_tron",
        name: "TRON Neon 5th-Gen Lightcycle",
        category: "Futuristic Two-Wheeler / Bike",
        subtitle: "The Grid Digital Vehicle",
        description: "Pure liquid neon energy stream wheels. Drops a lethal light ribbon wall that de-rezzes rivals.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Cornering: 100, GlowFactor: 100, Lethality: 94, Speed: 97, OVR: 95 },
        tags: ["TRON", "Sci-Fi", "Digital", "Neon"]
      },
      {
        id: "veh_jurassic",
        name: "Jurassic Park Tour Jeep #29",
        category: "Pop Culture Wildcard",
        subtitle: "InGen Automated Island Explorer",
        description: "Safari roll-cage, amber fossil cane mount, and high-traction mud tires built to outrun a T-Rex.",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Offroad: 96, Nostalgia: 97, EscapeSpeed: 91, Survival: 88, OVR: 91 },
        tags: ["Jurassic Park", "Dinosaurs", "90s", "Iconic"]
      },
      {
        id: "veh_charger",
        name: "1970 Dodge Charger R/T",
        category: "Tactical Combat Cruiser",
        subtitle: "Dom Toretto's 900HP Blower Beast",
        description: "Lifts both front wheels off the asphalt from sheer wheel torque. Built on family and high octane.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { FamilyFactor: 100, Wheelie: 98, Torque: 99, Speed: 92, OVR: 93 },
        tags: ["Fast and Furious", "Muscle", "V8", "American"]
      },
      {
        id: "veh_mystery",
        name: "The Mystery Machine",
        category: "Pop Culture Wildcard",
        subtitle: "Mystery Inc. Psychedelic Van",
        description: "Groovy floral paint job, disguised trap compartments, and endless Scooby Snack storage in the back.",
        imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=600&q=80",
        baseValuation: 18,
        stats: { MysterySolving: 98, SnackStorage: 100, Charm: 99, Disguise: 88, OVR: 89 },
        tags: ["Scooby Doo", "Cartoon", "Vintage", "Van"]
      }
    ]
  },

  // 5. LEGENDARY FANTASY KINGDOMS & REALMS
  {
    id: "fantasy-realms",
    title: "Legendary Fantasy Realms & Citadels",
    description: "Claim sovereignty over world wonders, enchanted magical sanctuaries, and ancient citadels.",
    icon: "🏰",
    theme: "realms",
    currencySymbol: "👑",
    currencyName: "Crown Sovereigns",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "rlm_magical", name: "Magical Sanctuary", required: true, isWildcard: true },
      { id: "rlm_citadel", name: "Imperial War Citadel", required: true, isWildcard: true },
      { id: "rlm_sunken", name: "Subaquatic / Elemental Realm", required: true, isWildcard: true },
      { id: "rlm_sky", name: "Skyborn / Celestial Kingdom", required: true, isWildcard: true },
      { id: "rlm_wildcard", name: "Wildcard Province", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "rlm_rivendell",
        name: "Rivendell (Imladris)",
        category: "Magical Sanctuary",
        subtitle: "The Last Homely House East of the Sea",
        description: "Hidden elven valley guarded by Lord Elrond and the power of Vilya. Eternal autumn waterfalls.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Beauty: 100, Healing: 99, Wisdom: 100, Peace: 98, OVR: 98 },
        tags: ["Lord of the Rings", "Elves", "Sanctuary", "Magic"]
      },
      {
        id: "rlm_hogwarts",
        name: "Hogwarts Castle & Grounds",
        category: "Magical Sanctuary",
        subtitle: "School of Witchcraft and Wizardry",
        description: "Moving staircases, room of requirement, great hall enchanted ceiling, and Forbidden Forest.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { MagicLore: 100, Secrets: 99, DefenseWards: 95, Prestige: 100, OVR: 98 },
        tags: ["Harry Potter", "Magic", "Castle", "Wizards"]
      },
      {
        id: "rlm_asgard",
        name: "Golden Citadel of Asgard",
        category: "Skyborn / Celestial Kingdom",
        subtitle: "Realm of the Allfather and Bifrost",
        description: "Spire of Odin connected to the Nine Realms by the Rainbow Bridge guarded by Heimdall.",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { DivinePower: 100, BifrostMobility: 100, GoldenBeauty: 97, WarFleet: 94, OVR: 97 },
        tags: ["Norse", "Marvel", "Gods", "Celestial"]
      },
      {
        id: "rlm_atlantis",
        name: "Sunken Kingdom of Atlantis",
        category: "Subaquatic / Elemental Realm",
        subtitle: "Advanced Sub-Oceanic Civilization",
        description: "Bioluminescent coral spires protected by magnetic pressure shields and ancient hydromancy.",
        imageUrl: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { OceanDominance: 100, AncientTech: 96, Secrecy: 98, Defense: 93, OVR: 96 },
        tags: ["Ocean", "Mythology", "Sunken", "Advanced"]
      },
      {
        id: "rlm_wakanda",
        name: "Wakanda Golden Citadel",
        category: "Imperial War Citadel",
        subtitle: "Vibranium Monarchy Fortress",
        description: "Hidden behind holographic jungle cloaks. Powered by the great vibranium meteorite mound.",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { VibraniumTech: 100, DefenseShields: 99, Wealth: 100, Culture: 96, OVR: 97 },
        tags: ["Marvel", "Sci-Fi", "Vibranium", "African"]
      },
      {
        id: "rlm_nightcity",
        name: "Cyberpunk Night City",
        category: "Imperial War Citadel",
        subtitle: "Neon Metropolis of Free Enterprise",
        description: "Where megacorporations rule the sky and netrunners jack into the dark net in back alleys.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { ChromeTech: 98, Chaos: 100, Nightlife: 100, Economy: 93, OVR: 94 },
        tags: ["Cyberpunk", "Sci-Fi", "Neon", "Urban"]
      },
      {
        id: "rlm_olympus",
        name: "Mount Olympus Throne Hall",
        category: "Skyborn / Celestial Kingdom",
        subtitle: "Seat of the Twelve Olympians",
        description: "Above the highest clouds, carved from marble and lightning. Ambrosia and nectar flow freely.",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Immortality: 100, StormControl: 98, Prestige: 99, Hubris: 100, OVR: 96 },
        tags: ["Greek", "Gods", "Throne", "Celestial"]
      },
      {
        id: "rlm_winterfell",
        name: "Winterfell Ancient Keep",
        category: "Imperial War Citadel",
        subtitle: "Stronghold of the Kings in the North",
        description: "Double granite walls warmed by subterranean hot springs, crowned by the heart tree godswood.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Resilience: 100, WinterHardy: 99, Loyalty: 97, Heritage: 92, OVR: 93 },
        tags: ["Game of Thrones", "North", "Castle", "Grit"]
      },
      {
        id: "rlm_cloudcity",
        name: "Cloud City of Bespin",
        category: "Skyborn / Celestial Kingdom",
        subtitle: "Tibanna Gas Floating Metropolis",
        description: "Suspended in the clouds of Bespin, gleaming white promenade decks with sunset horizons.",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Scenery: 100, Luxury: 96, GasMining: 94, Elevation: 98, OVR: 94 },
        tags: ["Star Wars", "Bespin", "Sci-Fi", "Sky"]
      },
      {
        id: "rlm_eldorado",
        name: "El Dorado The City of Gold",
        category: "Magical Sanctuary",
        subtitle: "Lost Amazonian Golden Empire",
        description: "Entire temples, roads, and monuments sculpted from pure solar gold, protected by dense mist.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { PureWealth: 100, Mystique: 99, Traps: 94, Architecture: 95, OVR: 95 },
        tags: ["Mythology", "Gold", "Lost City", "Treasure"]
      }
    ]
  },

  // 6. ULTIMATE MIDNIGHT FEASTS & COMFORT FOODS
  {
    id: "midnight-feasts",
    title: "Ultimate Midnight Feasts & Comfort Foods",
    description: "Assemble the most mouth-watering, sinful, five-star food spread imaginable.",
    icon: "🍔",
    theme: "food",
    currencySymbol: "🍕",
    currencyName: "Flavor Tokens",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "food_savory", name: "Apex Savory Main", required: true, isWildcard: true },
      { id: "food_slice", name: "Woodfired Cheesy Slice", required: true, isWildcard: true },
      { id: "food_noodle", name: "Comfort Broth / Pasta", required: true, isWildcard: true },
      { id: "food_fried", name: "Crispy Fried Munchie", required: true, isWildcard: true },
      { id: "food_dessert", name: "Decadent Dessert Crown", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "food_burger",
        name: "Double Truffle Wagyu Smashburger",
        category: "Apex Savory Main",
        subtitle: "A5 Wagyu / Black Truffle Aioli / Brioche",
        description: "Crispy lacy edges, melted aged Gruyère, bone marrow butter, caramelized shallot jam.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Juiciness: 100, Umami: 99, Crunch: 95, Craving: 100, OVR: 98 },
        tags: ["Burger", "Wagyu", "Truffle", "Midnight"]
      },
      {
        id: "food_pizza",
        name: "Woodfired Neapolitan Burrata Pizza",
        category: "Woodfired Cheesy Slice",
        subtitle: "San Marzano / Fresh Burrata / Basil Oil",
        description: "Cooked in 90 seconds at 900°F. Pillowy leopard-spotted crust dripping with creamy burrata.",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { CheesePull: 100, CrustPerfection: 98, Freshness: 97, Aroma: 99, OVR: 97 },
        tags: ["Pizza", "Italian", "Cheesy", "Woodfired"]
      },
      {
        id: "food_ramen",
        name: "24-Hour Tonkotsu Chashu Ramen",
        category: "Comfort Broth / Pasta",
        subtitle: "Silky Pork Bone Broth / Ajitama Egg",
        description: "Simmered for 24 hours until rich and velvety. Hand-pulled noodles and melt-in-your-mouth pork belly.",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { BrothDepth: 100, Comfort: 100, ChashuTender: 99, SlurpScore: 98, OVR: 98 },
        tags: ["Ramen", "Japanese", "Broth", "Comfort"]
      },
      {
        id: "food_tomahawk",
        name: "24k Gold Tomahawk Ribeye",
        category: "Apex Savory Main",
        subtitle: "45-Day Dry Aged Prime Bone-In",
        description: "Cast-iron butter basted with fresh rosemary and garlic cloves. Wrapped in edible 24k gold leaf.",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { FlexLevel: 100, SearCrust: 99, Tenderness: 98, Smoke: 95, OVR: 97 },
        tags: ["Steak", "Luxury", "Gold", "Meat"]
      },
      {
        id: "food_hotchicken",
        name: "Nashville Crispy Hot Chicken Sando",
        category: "Crispy Fried Munchie",
        subtitle: "Double Cayenne Dipped / Dill Pickles",
        description: "Audibly crunchy buttermilk-fried thigh dunked in red chili oil on toasted potato bun with comeback sauce.",
        imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { CrunchSound: 100, HeatKick: 96, Addictiveness: 99, Flavor: 95, OVR: 95 },
        tags: ["Chicken", "Spicy", "Crispy", "Southern"]
      },
      {
        id: "food_nachos",
        name: "Skillet Loaded Carnitas Nachos",
        category: "Crispy Fried Munchie",
        subtitle: "Queso Blanco / Guacamole / Jalapeños",
        description: "Mountain of stone-ground tortilla chips smothered in slow-braised citrus pork, pico, and crema.",
        imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { SharingJoy: 100, CheeseCoverage: 98, Crunch: 94, Zest: 93, OVR: 93 },
        tags: ["Mexican", "Cheesy", "Party", "Munchies"]
      },
      {
        id: "food_lavacake",
        name: "Molten Valrhona Chocolate Lava Volcano",
        category: "Decadent Dessert Crown",
        subtitle: "Madagascar Vanilla Bean Gelato",
        description: "Warm dark chocolate crust that bursts open with steaming liquid ganache at first spoon dip.",
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { GooeyFactor: 100, SweetnessBalance: 98, ChocolateRichness: 100, Warmth: 97, OVR: 96 },
        tags: ["Chocolate", "Dessert", "Warm", "Decadent"]
      },
      {
        id: "food_waffle",
        name: "Belgian Pearl Sugar Waffle Tower",
        category: "Decadent Dessert Crown",
        subtitle: "Nutella Drizzle / Wild Berries",
        description: "Caramelized pearl sugar crunches in every bite, topped with chantilly cream and warm maple butter.",
        imageUrl: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Sweetness: 96, Texture: 98, MorningOrNight: 100, BerryTartness: 90, OVR: 92 },
        tags: ["Waffle", "Breakfast", "Sweet", "Comfort"]
      },
      {
        id: "food_tacos",
        name: "Baja Beer-Battered Lobster Tacos",
        category: "Apex Savory Main",
        subtitle: "Charred Corn Tortillas / Chipotle Crema",
        description: "Crispy Maine lobster tail chunks with shredded lime slaw, pickled red onions, and fresh cilantro.",
        imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Freshness: 99, Crunch: 95, Zing: 97, SeafoodFlavor: 98, OVR: 94 },
        tags: ["Tacos", "Seafood", "Baja", "Crispy"]
      },
      {
        id: "food_churros",
        name: "Cinnamon Sugar Dulce de Leche Churros",
        category: "Decadent Dessert Crown",
        subtitle: "Fresh From the Fryer / Thick Mexican Hot Chocolate",
        description: "Ridged golden rods rolled in fragrant cinnamon sugar, dipped in deep warm caramel.",
        imageUrl: "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { Warmth: 99, DipFactor: 100, SweetCrunch: 96, Nostalgia: 94, OVR: 91 },
        tags: ["Churros", "Caramel", "StreetFood", "Dessert"]
      }
    ]
  },

  // 7. ZOMBIE APOCALYPSE SURVIVAL LOADOUT
  {
    id: "zombie-survival",
    title: "Zombie Apocalypse Survival Loadout",
    description: "Equip vehicles, silent weapons, survival K9s, and fortress bunkers to thrive past Day 1.",
    icon: "🧟",
    theme: "survival",
    currencySymbol: "🥫",
    currencyName: "Ration Cans",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "srv_fortress", name: "Safehouse / Fortress", required: true, isWildcard: true },
      { id: "srv_rig", name: "Armored Rig / Transport", required: true, isWildcard: true },
      { id: "srv_silent", name: "Silent Melee / Ranged", required: true, isWildcard: true },
      { id: "srv_companion", name: "K9 Companion / Scout", required: true, isWildcard: true },
      { id: "srv_wildcard", name: "Wildcard Survival Tech", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "srv_bunker",
        name: "EMP-Shielded Geothermal Bunker",
        category: "Safehouse / Fortress",
        subtitle: "10-Year Self-Sustaining Underground Vault",
        description: "Hydroponic garden bays, air filtration scrubbing, and reinforced blast doors that withstand nukes.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { Security: 100, SelfSufficiency: 99, Isolation: 98, Comfort: 92, OVR: 98 },
        tags: ["Fortress", "Bunker", "Survival", "Essential"]
      },
      {
        id: "srv_warrig",
        name: "Reinforced Cow-Catcher War Rig",
        category: "Armored Rig / Transport",
        subtitle: "All-Terrain 8x8 Survival Beast",
        description: "Plows through entire hordes without losing momentum. Rooftop sniper nest and fuel auxiliary tanks.",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { RammingPower: 100, Armor: 98, FuelRange: 92, Utility: 95, OVR: 96 },
        tags: ["Vehicle", "Heavy", "Transport", "Armored"]
      },
      {
        id: "srv_crossbow",
        name: "Tactical Carbon-Fiber Crossbow",
        category: "Silent Melee / Ranged",
        subtitle: "Whisper-Quiet Headshot Specialist",
        description: "200-pound draw weight, lighted nock arrows, and laser rangefinder. Zero sound signature.",
        imageUrl: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Stealth: 100, AmmoRecovery: 98, Precision: 96, Reliability: 95, OVR: 95 },
        tags: ["Weapon", "Silent", "Stealth", "Ranged"]
      },
      {
        id: "srv_k9",
        name: "Combat-Trained Belgian Malinois K9",
        category: "K9 Companion / Scout",
        subtitle: "Night Scent Tracker & Horde Early-Warning",
        description: "Detects infected scent 500 meters upwind. Kevlar vest equipped and loyal unto death.",
        imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Loyalty: 100, EarlyWarning: 99, Speed: 95, MoraleBoost: 100, OVR: 97 },
        tags: ["Companion", "K9", "Scout", "Loyalty"]
      },
      {
        id: "srv_katanas",
        name: "Twin High-Carbon Titanium Katanas",
        category: "Silent Melee / Ranged",
        subtitle: "Never Jams, Never Needs Reloading",
        description: "Razor edge that slices neck vertebrae cleanly without getting lodged in bone. No ammo needed.",
        imageUrl: "https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Decapitation: 98, Silent: 100, Durability: 96, Weight: 94, OVR: 93 },
        tags: ["Melee", "Sword", "Silent", "Fast"]
      },
      {
        id: "srv_flamethrower",
        name: "Mil-Spec Heavy Flamethrower",
        category: "Silent Melee / Ranged",
        subtitle: "Clearing Swarms & Contaminated Nests",
        description: "Thick napalm gel spray that clings to flesh and creates an impenetrable wall of fire.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { SwarmClear: 100, Fear: 98, Heat: 100, AmmoWeight: 68, OVR: 92 },
        tags: ["Fire", "CrowdControl", "Heavy", "Area"]
      },
      {
        id: "srv_drone",
        name: "Thermal Recon Quadcopter Drone",
        category: "Wildcard Survival Tech",
        subtitle: "Over-the-Horizon Surveillance Eye",
        description: "Solar charging dock, FLIR heat vision, and loudspeaker module to lure hordes away from your base.",
        imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Intel: 100, Range: 95, NightVision: 99, LureTactics: 96, OVR: 94 },
        tags: ["Drone", "Tech", "Recon", "Tactical"]
      },
      {
        id: "srv_medkit",
        name: "Military Field Surgical Trauma Rig",
        category: "Wildcard Survival Tech",
        subtitle: "Antibiotics, QuikClot & Antivenom",
        description: "Complete sterile field kit with surgical staples, broad-spectrum penicillins, and blood expanders.",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Lifesaving: 100, InfectionCure: 98, Utility: 95, Compact: 90, OVR: 92 },
        tags: ["Medical", "Survival", "Health", "Essential"]
      },
      {
        id: "srv_waterpurifier",
        name: "Industrial Reverse Osmosis Rig",
        category: "Wildcard Survival Tech",
        subtitle: "10,000 Gallons Per Day Clean Water",
        description: "Transforms contaminated stagnant swamp sludge or radioactive runoff into pure crisp drinking water.",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { Sustenance: 100, Purity: 100, Output: 96, Lifespan: 94, OVR: 92 },
        tags: ["Water", "Survival", "Base", "Resource"]
      },
      {
        id: "srv_flarelauncher",
        name: "Airdrop Beacon & Flare Mortar",
        category: "Wildcard Survival Tech",
        subtitle: "High-Altitude Emergency Resupply",
        description: "Calls down military cargo drop crates with fresh rations, 5.56 ammo cans, and tactical radios.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 19,
        stats: { SupplyJackpot: 98, Range: 96, SignalStrength: 99, SurpriseFactor: 90, OVR: 90 },
        tags: ["Supply", "Emergency", "Beacon", "AirDrop"]
      }
    ]
  },

  // 8. OVERPOWERED ANIME POWERS & JUTSU
  {
    id: "anime-powers",
    title: "Overpowered Anime Powers & Artifacts",
    description: "Claim god-shattering anime abilities, ocular dojutsu, and universe-bending artifacts.",
    icon: "⚡",
    theme: "anime",
    currencySymbol: "💥",
    currencyName: "Spiritual Ki",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "anm_ultimate", name: "Cataclysmic Ultimate", required: true, isWildcard: true },
      { id: "anm_ocular", name: "Ocular / Visual Jutsu", required: true, isWildcard: true },
      { id: "anm_spatial", name: "Domain / Spatial Control", required: true, isWildcard: true },
      { id: "anm_artifact", name: "Cursed / Divine Artifact", required: true, isWildcard: true },
      { id: "anm_wildcard", name: "Wildcard Awakening", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "anm_deathnote",
        name: "The Death Note",
        category: "Cursed / Divine Artifact",
        subtitle: "Notebook of the Shinigami",
        description: "The human whose name is written in this note shall die. Specify time, cause, and circumstances.",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        baseValuation: 30,
        stats: { AbsoluteLethality: 100, Secrecy: 100, PsychologicalWar: 99, Reach: 100, OVR: 99 },
        tags: ["Death Note", "Shinigami", "Mind", "Artifact"]
      },
      {
        id: "anm_ultrainstinct",
        name: "Mastered Ultra Instinct Aura",
        category: "Cataclysmic Ultimate",
        subtitle: "Technique of the Angels",
        description: "Body dodges and strikes automatically without conscious brain lag. Silver hair and galaxy aura.",
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { AutoDodge: 100, StrikeSpeed: 100, GodKi: 99, PowerScaling: 100, OVR: 99 },
        tags: ["Dragon Ball", "Saiyan", "God Tier", "Combat"]
      },
      {
        id: "anm_domain",
        name: "Domain Expansion: Unlimited Void",
        category: "Domain / Spatial Control",
        subtitle: "Gojo Satoru's Absolute Information Flood",
        description: "Forces infinite knowledge and perception into targets' brains, completely immobilizing their nervous system.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { SureHitEffect: 100, BrainLock: 100, VisualSplendor: 98, Coolness: 100, OVR: 98 },
        tags: ["Jujutsu Kaisen", "Domain", "Infinity", "OP"]
      },
      {
        id: "anm_theworld",
        name: "Stand: The World [Time Stop]",
        category: "Cataclysmic Ultimate",
        subtitle: "DIO's Stand: 9 Seconds of Frozen Time",
        description: "ZA WARUDO! Freezes the flow of universal time for 9 seconds to set up untargetable counter-strikes.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { TimeStop: 100, MemePower: 100, CloseCombat: 97, FearFactor: 98, OVR: 97 },
        tags: ["JoJo", "Stand", "TimeStop", "Iconic"]
      },
      {
        id: "anm_sharingan",
        name: "Eternal Mangekyo Sharingan",
        category: "Ocular / Visual Jutsu",
        subtitle: "Amaterasu Black Flames & Perfect Susanoo",
        description: "Casts inextinguishable black fire that burns for 7 days, and summons an armored colossal chakra avatar.",
        imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { BlackFlames: 98, SusanooArmor: 99, Genjutsu: 96, Tracking: 98, OVR: 97 },
        tags: ["Naruto", "Uchiha", "Ocular", "Flame"]
      },
      {
        id: "anm_geass",
        name: "Geass: Eye of Absolute Command",
        category: "Ocular / Visual Jutsu",
        subtitle: "Lelouch vi Britannia's Sovereign Will",
        description: "Anyone who makes eye contact must obey any single vocal command without moral hesitation.",
        imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { MindControl: 100, Strategy: 99, EyePower: 98, Charisma: 96, OVR: 96 },
        tags: ["Code Geass", "MindControl", "Royal", "Strategic"]
      },
      {
        id: "anm_bankai",
        name: "Bankai: Zanka no Tachi",
        category: "Cataclysmic Ultimate",
        subtitle: "Yamamoto's 15 Million Degree Blade",
        description: "Compresses all soul reaper flames into the tip of the katana. One slash erases atoms from existence.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { HeatOutput: 100, Erasure: 99, SpiritualPressure: 100, SunPower: 98, OVR: 97 },
        tags: ["Bleach", "Bankai", "Fire", "SoulReaper"]
      },
      {
        id: "anm_oneforall",
        name: "One For All 100% Full Cowl",
        category: "Cataclysmic Ultimate",
        subtitle: "Stockpiled Quirk Power of 9 Generations",
        description: "Shatters storm clouds with the air pressure of a single punch. Rewires atmospheric weather patterns.",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { RawPunch: 100, Speed: 96, Heroism: 100, BlastRadius: 94, OVR: 95 },
        tags: ["MHA", "SuperStrength", "Hero", "Smash"]
      },
      {
        id: "anm_excalibur",
        name: "Excalibur: Sword of Promised Victory",
        category: "Cursed / Divine Artifact",
        subtitle: "Artoria Pendragon's Holy Light Pillar",
        description: "Fires a concentrated beam of divine holy energy that incinerates sea monsters and demon gods.",
        imageUrl: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { HolyBeam: 99, NoblePhantasm: 98, Chivalry: 99, Cleave: 94, OVR: 95 },
        tags: ["Fate", "NoblePhantasm", "Holy", "Sword"]
      },
      {
        id: "anm_gear5",
        name: "Gear 5: Sun God Nika Awakening",
        category: "Cataclysmic Ultimate",
        subtitle: "The Warrior of Liberation & Drums of Joy",
        description: "Turns surroundings and enemies into rubber, ignores the laws of cartoon physics, laughs in the face of doom.",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { ToonForce: 100, JoyFactor: 100, RubberPhysics: 99, Freedom: 100, OVR: 98 },
        tags: ["One Piece", "Nika", "JoyBoy", "Awakening"]
      }
    ]
  },

  // 9. BILLIONAIRE ULTRA-LUXURY ESCAPES
  {
    id: "luxury-estates",
    title: "Billionaire Dream Real Estate & Havens",
    description: "Curate a portfolio of private islands, cliffside palaces, superyacht fleets, and secret vaults.",
    icon: "🏝️",
    theme: "luxury",
    currencySymbol: "🏛️$",
    currencyName: "Million",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "est_coastal", name: "Coastal / Island Jewel", required: true, isWildcard: true },
      { id: "est_mansion", name: "Architectural Citadel", required: true, isWildcard: true },
      { id: "est_fleet", name: "Supercar & Yacht Armada", required: true, isWildcard: true },
      { id: "est_bunker", name: "Secret Alpine Compound", required: true, isWildcard: true },
      { id: "est_wildcard", name: "Wildcard Luxury Asset", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "est_amalfi",
        name: "Cliffside Amalfi Coast Villa",
        category: "Coastal / Island Jewel",
        subtitle: "Positano, Italy",
        description: "Perched 200m above Mediterranean waters with a private funicular down to an azure cove.",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Scenery: 100, Romance: 99, Exclusivity: 96, WineCellar: 95, OVR: 97 },
        tags: ["Italy", "Coastal", "Historic", "Luxury"]
      },
      {
        id: "est_island",
        name: "Private Bahamian Outer Atoll",
        category: "Coastal / Island Jewel",
        subtitle: "Exumas, Bahamas",
        description: "120-acre coral atoll with private airstrip, pink sand beaches, and deepwater mega-yacht moorings.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { Privacy: 100, Beaches: 100, Airstrip: 98, Reefs: 97, OVR: 98 },
        tags: ["Bahamas", "Island", "Private", "Tropical"]
      },
      {
        id: "est_beverly",
        name: "Beverly Hills Glass Compound",
        category: "Architectural Citadel",
        subtitle: "Los Angeles, CA",
        description: "30,000 sq ft cantilevered infinity pool compound overlooking DTLA skyline with 20-car gallery.",
        imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Modernism: 99, SkylineView: 100, PartyReady: 100, Security: 94, OVR: 97 },
        tags: ["USA", "Modern", "Mansion", "VIP"]
      },
      {
        id: "est_tokyo",
        name: "Tokyo Cyberpunk Neon Penthouse",
        category: "Architectural Citadel",
        subtitle: "Roppongi Hills Sky Sanctuary",
        description: "3-story penthouse with private rooftop helipad, panoramic Mount Fuji view, and onsen pool.",
        imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { NightView: 100, HighTech: 99, CityAccess: 98, Design: 96, OVR: 96 },
        tags: ["Japan", "Urban", "Skyline", "Penthouse"]
      },
      {
        id: "est_fleet",
        name: "100m Monaco Mega-Yacht & Hypercars",
        category: "Supercar & Yacht Armada",
        subtitle: "Monaco Harbor Port Hercules Berth",
        description: "Includes Bugatti Chiron, Pagani Huayra, plus 100-meter yacht with submarine dock and IMAX cinema.",
        imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Flex: 100, Speed: 99, SeaWorthiness: 97, Prestige: 100, OVR: 98 },
        tags: ["Monaco", "Yacht", "Hypercars", "Elite"]
      },
      {
        id: "est_chalet",
        name: "Swiss Zermatt Ski-In Heli-Chalet",
        category: "Secret Alpine Compound",
        subtitle: "Matterhorn Panoramic Estate",
        description: "Private helipad, heated outdoor thermal lagoon, cedar saunas, and Michelin-chef kitchen.",
        imageUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { AlpineCozy: 100, SkiAccess: 100, Helipad: 97, Views: 98, OVR: 96 },
        tags: ["Switzerland", "Alps", "Ski", "Chalet"]
      },
      {
        id: "est_bunker",
        name: "Subterranean Doomsday Command Vault",
        category: "Secret Alpine Compound",
        subtitle: "Swiss Granite Mountain Cavern",
        description: "EMP-shielded luxury bunker with hydroponic farming, bowling alley, and 50-year aged vintage cellar.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { BlastProof: 100, SelfSufficiency: 99, WineStock: 97, Mystery: 98, OVR: 95 },
        tags: ["Security", "Bunker", "Secret", "Fortified"]
      },
      {
        id: "est_borabora",
        name: "Bora Bora Glass Overwater Villa",
        category: "Coastal / Island Jewel",
        subtitle: "Mount Otemanu Lagoon Deck",
        description: "Glass floor panels looking into stingray reefs, cantilevered plunge pool, and private catamaran.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { WaterClarity: 100, Relaxation: 100, Sunset: 99, Romance: 98, OVR: 95 },
        tags: ["BoraBora", "Overwater", "Tropical", "Paradise"]
      },
      {
        id: "est_kyoto",
        name: "Kyoto 400-Year-Old Zen Temple Estate",
        category: "Secret Alpine Compound",
        subtitle: "Arashiyama Bamboo Sanctuary",
        description: "Private bamboo forest paths, koi ponds with 80-year-old fish, and cedar tea pavilions.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Zen: 100, Heritage: 100, Quiet: 100, Craftsmanship: 96, OVR: 94 },
        tags: ["Japan", "Zen", "Historic", "Garden"]
      },
      {
        id: "est_scottish",
        name: "Scottish Highlands Castle & Loch",
        category: "Architectural Citadel",
        subtitle: "Isle of Skye 1,000-Acre Domain",
        description: "Turreted 15th-century stone fortress with private salmon river, whiskey distillery, and falconry mews.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Atmosphere: 99, LandMass: 98, Distillery: 96, History: 97, OVR: 93 },
        tags: ["Scotland", "Castle", "Highlands", "Historic"]
      }
    ]
  },

  // 10. RETRO 90S NOSTALGIA & ARCADES
  {
    id: "retro-nostalgia",
    title: "Retro 80s/90s Arcades & Nostalgia Relics",
    description: "Relive the golden era of pixel CRT gaming, cassette tapes, arcades, and neon mall culture.",
    icon: "🕹️",
    theme: "retro",
    currencySymbol: "🪙",
    currencyName: "Arcade Tokens",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "ret_arcade", name: "Original Arcade Cabinet", required: true, isWildcard: true },
      { id: "ret_handheld", name: "Handheld / Console Grail", required: true, isWildcard: true },
      { id: "ret_audio", name: "Analog Music / Boombox", required: true, isWildcard: true },
      { id: "ret_toy", name: "Classic 90s Virtual Toy", required: true, isWildcard: true },
      { id: "ret_wildcard", name: "Nostalgia Wildcard", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "ret_sf2",
        name: "Street Fighter II Arcade Cabinet",
        category: "Original Arcade Cabinet",
        subtitle: "Original 1991 Capcom Big Blue",
        description: "Heavy clicky Japanese joysticks, cigarette burns on the marquee, and the echoing Hadouken audio chip.",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Competition: 100, ButtonClick: 100, Nostalgia: 100, CRTScanlines: 98, OVR: 97 },
        tags: ["Capcom", "Arcade", "Fighting", "90s"]
      },
      {
        id: "ret_gameboy",
        name: "Game Boy Color (Atomic Purple)",
        category: "Handheld / Console Grail",
        subtitle: "With Pokémon Red & Blue Cartridges",
        description: "Translucent purple casing where you can see the motherboard capacitors. Endless car-ride road trips.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { BatteryLife: 100, Portability: 98, CulturalImpact: 100, LinkCable: 96, OVR: 98 },
        tags: ["Nintendo", "Pokemon", "Handheld", "AtomicPurple"]
      },
      {
        id: "ret_walkman",
        name: "Sony Walkman Cassette Player",
        category: "Analog Music / Boombox",
        subtitle: "Original TPS-L2 with Orange Foam Headphones",
        description: "The tape player that changed music forever. Satisfying physical mechanical click of the play button.",
        imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { AnalogWarmth: 99, DesignIcon: 100, MixtapeVibes: 100, TactileClick: 97, OVR: 96 },
        tags: ["Sony", "Audio", "Cassette", "80s"]
      },
      {
        id: "ret_n64",
        name: "Nintendo 64 + GoldenEye 007",
        category: "Handheld / Console Grail",
        subtitle: "4-Player Split-Screen Facility Brawls",
        description: "Slappers only, no Oddjob! Four controllers tangled in knots on the basement carpet.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { MultiplayerJoy: 100, ProximityMines: 98, ControllerShape: 94, FriendshipRuiner: 99, OVR: 96 },
        tags: ["Nintendo", "N64", "GoldenEye", "SplitScreen"]
      },
      {
        id: "ret_jukebox",
        name: "Wurlitzer Neon Bubble Jukebox",
        category: "Analog Music / Boombox",
        subtitle: "100 45-RPM Vinyl Carousel",
        description: "Rising bubbles of warm illuminated neon liquid with mechanical turntable arm selecting records.",
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Aesthetics: 100, VinylWarmth: 98, PartyCenterpiece: 99, Mechanism: 95, OVR: 94 },
        tags: ["Vinyl", "Jukebox", "Vintage", "Neon"]
      },
      {
        id: "ret_tamagotchi",
        name: "Original 1996 Bandai Tamagotchi",
        category: "Classic 90s Virtual Toy",
        subtitle: "First-Gen Egg Keychain Pet",
        description: "Beeps in class demanding to be fed and cleaned. Keep it alive or face the angel gravestone screen.",
        imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Anxiety: 100, Attachment: 98, BeepLoudness: 95, PixelCharm: 99, OVR: 92 },
        tags: ["Tamagotchi", "Bandai", "VirtualPet", "90s"]
      },
      {
        id: "ret_polaroid",
        name: "Polaroid OneStep 600 Camera",
        category: "Nostalgia Wildcard",
        subtitle: "Instant Film Rainbow Stripe",
        description: "Snap the shutter, hear the mechanical whir, and watch colors magically materialize on the white frame.",
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { MagicFactor: 99, GrainVibes: 98, Spontaneity: 96, TactileMemory: 97, OVR: 93 },
        tags: ["Polaroid", "Camera", "Vintage", "Instant"]
      },
      {
        id: "ret_lasertag",
        name: "90s Neon Fog Laser Tag Arena Pass",
        category: "Nostalgia Wildcard",
        subtitle: "Full Vest & Phaser System with Blacklights",
        description: "Thumping euro-synth bass, dry-ice smoke corridors, and the robotic voice saying 'SYSTEM ACTIVATED'.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { Adrenaline: 98, BlacklightGlow: 100, NeonHype: 97, ChildhoodMemory: 95, OVR: 91 },
        tags: ["LaserTag", "Neon", "90s", "Party"]
      },
      {
        id: "ret_blockbuster",
        name: "Laminated Blockbuster Gold Membership",
        category: "Nostalgia Wildcard",
        subtitle: "Free Friday Night Rentals For Life",
        description: "Smell of buttered microwave popcorn, candy displays at checkout, and 'Be Kind, Please Rewind' blue stickers.",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
        baseValuation: 19,
        stats: { PureNostalgia: 100, VHSComfort: 99, FridayVibes: 100, RewindSpeed: 90, OVR: 90 },
        tags: ["Blockbuster", "VHS", "Movies", "Memories"]
      },
      {
        id: "ret_mallarcade",
        name: "All-Day Free-Play Neon Mall Pass",
        category: "Nostalgia Wildcard",
        subtitle: "Endless Tokens & Slushies",
        description: "Unlimited Dance Dance Revolution credits, Time Crisis foot pedals, and air hockey showdowns.",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
        baseValuation: 20,
        stats: { FunTimes: 100, TicketJackpot: 97, SlushieFreeze: 95, Energy: 98, OVR: 92 },
        tags: ["Arcade", "Tokens", "Mall", "Youth"]
      }
    ]
  },

  // 11. MULTIVERSE SUPERPOWERS & ABILITIES
  {
    id: "superpowers",
    title: "Multiverse Superpowers & Mutations",
    description: "Build an unstoppable meta-human superpower loadout to dominate combat and travel.",
    icon: "🦸",
    theme: "superpowers",
    currencySymbol: "⚡",
    currencyName: "Power Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "pow_mobility", name: "Supreme Mobility / Flight", required: true, isWildcard: true },
      { id: "pow_temporal", name: "Time / Space Manipulation", required: true, isWildcard: true },
      { id: "pow_defense", name: "Invulnerability / Regeneration", required: true, isWildcard: true },
      { id: "pow_psychic", name: "Telekinesis / Psionic Might", required: true, isWildcard: true },
      { id: "pow_wildcard", name: "Wildcard Superpower", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "pow_teleport",
        name: "Instant Line-of-Sight Teleportation",
        category: "Supreme Mobility / Flight",
        subtitle: "Nightcrawler / Jumper Physics",
        description: "Instant vanishing in a puff of brimstone or blue electricity. Jump across cities in a millisecond.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Speed: 100, Infiltrate: 100, Escape: 100, Agility: 98, OVR: 98 },
        tags: ["Mobility", "Teleport", "OP", "Utility"]
      },
      {
        id: "pow_timerewind",
        name: "30-Second Temporal Rewind",
        category: "Time / Space Manipulation",
        subtitle: "Undo Any Mistake, Loss, or Trap",
        description: "Hit the cosmic rewind switch. Retain all future memory while the physical world flows backward.",
        imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { CheatDeath: 100, Knowledge: 100, Omniscience: 98, Control: 99, OVR: 99 },
        tags: ["Time", "Rewind", "GodTier", "Temporal"]
      },
      {
        id: "pow_regen",
        name: "Cellular Hyper-Regeneration",
        category: "Invulnerability / Regeneration",
        subtitle: "Wolverine / Deadpool Healing Factor",
        description: "Rebuilds limbs, tissue, and internal organs in seconds. Completely immune to poisons and biological aging.",
        imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Longevity: 100, Survival: 100, PainTolerance: 98, Regeneration: 100, OVR: 97 },
        tags: ["Defense", "Healing", "Immortal", "Mutant"]
      },
      {
        id: "pow_telekinesis",
        name: "Class-Omega Telekinesis",
        category: "Telekinesis / Psionic Might",
        subtitle: "Matter Levitation & Molecular Crushing",
        description: "Rip skyscrapers out of their foundations, crush submarines into pebbles, or fly via personal levitation.",
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { RawWeight: 100, ForceShields: 98, Precision: 97, Versatility: 100, OVR: 98 },
        tags: ["Psychic", "Psionic", "Omega", "Force"]
      },
      {
        id: "pow_mach5flight",
        name: "Supersonic Mach-5 Flight & Aura",
        category: "Supreme Mobility / Flight",
        subtitle: "Atmospheric Breaker Flight",
        description: "Break the sound barrier with frictionless bio-kinetic shields. Cross continents in minutes.",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Velocity: 99, Elevation: 98, SonicBoom: 95, Freedom: 100, OVR: 95 },
        tags: ["Flight", "Speed", "Aerial", "Sound"]
      },
      {
        id: "pow_invulnerable",
        name: "Absolute Kinetic Invulnerability",
        category: "Invulnerability / Regeneration",
        subtitle: "Superman / Juggernaut Density",
        description: "Bullets flatten like pennies against your skin. Artillery shells bounce off without leaving a bruise.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { ArmorRating: 100, BlastResist: 100, Tenacity: 98, Immovable: 97, OVR: 97 },
        tags: ["Defense", "Invulnerable", "Tank", "Heavy"]
      },
      {
        id: "pow_mindreading",
        name: "Omnipresent Mind Reading & Empathy",
        category: "Telekinesis / Psionic Might",
        subtitle: "Professor X Global Cerebro Reach",
        description: "Hear every unspoken secret, lie, password, and tactical plan before it is ever formed in speech.",
        imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { TruthDetection: 100, Intel: 100, Influence: 96, Stealth: 98, OVR: 96 },
        tags: ["Telepathy", "Intel", "Psychic", "Strategy"]
      },
      {
        id: "pow_lightning",
        name: "Thunder & Lightning Summoning",
        category: "Wildcard Superpower",
        subtitle: "Atmospheric Zeus Stormcaller",
        description: "Channel 1 billion volts through your fingertips. Call down orbital lightning bolts with zero storm delay.",
        imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Voltage: 100, ShockAOE: 99, Intimidation: 98, Elemental: 96, OVR: 96 },
        tags: ["Elemental", "Lightning", "Storm", "Power"]
      },
      {
        id: "pow_invisibility",
        name: "Quantum Phase Invisibility & Walk",
        category: "Wildcard Superpower",
        subtitle: "Phase Through Solid Steel & Stone",
        description: "Complete visual, infrared, and radar invisibility combined with the power to walk through walls.",
        imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { Infiltration: 100, GhostMode: 100, Evasion: 99, Stealth: 100, OVR: 95 },
        tags: ["Stealth", "Ghost", "Phase", "Invisibility"]
      },
      {
        id: "pow_shapeshift",
        name: "Metamorphic Cellular Shapeshifting",
        category: "Wildcard Superpower",
        subtitle: "Mystique / Copycat Form Replication",
        description: "Replicate any animal, creature, or person down to retinal scans, voice frequency, and thumbprints.",
        imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { Deception: 100, Adaptation: 98, Infiltration: 99, Biology: 96, OVR: 94 },
        tags: ["Shapeshift", "Deception", "Infiltrate", "Versatile"]
      }
    ]
  },

  // 12. HYPERCARS & AUTOMOTIVE MASTERPIECES
  {
    id: "hypercars",
    title: "Hypercars & Automotive Masterpieces",
    description: "Draft a fleet of 300-MPH engineering marvels, twin-turbo V12s, and Le Mans icons.",
    icon: "🏁",
    theme: "hypercars",
    currencySymbol: "🏁",
    currencyName: "Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "car_speed", name: "Top-Speed World Record Breaker", required: true, isWildcard: true },
      { id: "car_track", name: "Pure Track Weapon / Aerodynamic", required: true, isWildcard: true },
      { id: "car_classic", name: "Historic Le Mans Classic", required: true, isWildcard: true },
      { id: "car_art", name: "Carbon-Fiber Sculpted Art", required: true, isWildcard: true },
      { id: "car_wildcard", name: "Wildcard Hypercar", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "car_chiron",
        name: "Bugatti Chiron Super Sport 300+",
        category: "Top-Speed World Record Breaker",
        subtitle: "8.0L Quad-Turbo W16 (1,577 HP)",
        description: "First production car to break the 300 MPH barrier (304.77 MPH). Longtail carbon-fiber body.",
        imageUrl: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { TopSpeed: 100, Horsepower: 100, Luxury: 98, Engineering: 100, OVR: 99 },
        tags: ["Bugatti", "W16", "Record", "Hypercar"]
      },
      {
        id: "car_jesko",
        name: "Koenigsegg Jesko Absolut",
        category: "Top-Speed World Record Breaker",
        subtitle: "5.0L Twin-Turbo V8 (1,600 HP on E85)",
        description: "0.278 drag coefficient and 9-speed Light Speed Transmission that shifts in near-zero milliseconds.",
        imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Aerodynamics: 100, PowerToWeight: 99, ShiftSpeed: 100, Innovation: 99, OVR: 98 },
        tags: ["Koenigsegg", "Swedish", "Fastest", "TwinTurbo"]
      },
      {
        id: "car_huayra",
        name: "Pagani Huayra BC Tempesta",
        category: "Carbon-Fiber Sculpted Art",
        subtitle: "6.0L AMG Twin-Turbo V12",
        description: "Sculpted titanium-carbon weave, active aerodynamic wing flaps, and quad-pipe titanium exhaust music.",
        imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { Artistry: 100, ExhaustSound: 99, Handling: 97, CarbonCraft: 100, OVR: 97 },
        tags: ["Pagani", "Italian", "V12", "Handcrafted"]
      },
      {
        id: "car_mclarenf1",
        name: "McLaren F1 LM (Papaya Orange)",
        category: "Historic Le Mans Classic",
        subtitle: "Naturally Aspirated BMW V12 / Gold Engine Bay",
        description: "Central driving seat position with two passenger seats flanking. Holds NA speed record forever.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        baseValuation: 30,
        stats: { LegendStatus: 100, Purity: 100, ValueAppreciation: 100, V12Scream: 99, OVR: 99 },
        tags: ["McLaren", "Icon", "NaturallyAspirated", "Classic"]
      },
      {
        id: "car_f40",
        name: "Ferrari F40 Twin-Turbo Classic",
        category: "Historic Le Mans Classic",
        subtitle: "Enzo Ferrari's Final Masterpiece",
        description: "Raw Kevlar and carbon body, green glue showing through weave, twin-turbo V8 with gated 5-speed shifter.",
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { RawFeel: 100, TurboBoost: 99, Heritage: 100, Pininfarina: 98, OVR: 97 },
        tags: ["Ferrari", "Italian", "TwinTurbo", "Vintage"]
      },
      {
        id: "car_valkyrie",
        name: "Aston Martin Valkyrie AMR Pro",
        category: "Pure Track Weapon / Aerodynamic",
        subtitle: "Cosworth 6.5L V12 (11,100 RPM Redline)",
        description: "Designed by F1 aerodynamic wizard Adrian Newey. Generates more downforce than the car weighs.",
        imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { Downforce: 100, RedlineRPM: 100, F1DNA: 99, CorneringG: 100, OVR: 97 },
        tags: ["AstonMartin", "Track", "F1", "Cosworth"]
      },
      {
        id: "car_918",
        name: "Porsche 918 Spyder Weissach",
        category: "Pure Track Weapon / Aerodynamic",
        subtitle: "Hybrid V8 AWD Ring Legend",
        description: "Top-exit exhaust pipes shooting blue flames behind headrests. Sub-7-minute Nürburgring king.",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { LaunchControl: 100, HybridTech: 98, Reliability: 99, ExhaustPlumes: 97, OVR: 96 },
        tags: ["Porsche", "German", "Hybrid", "Weissach"]
      },
      {
        id: "car_lfa",
        name: "Lexus LFA Nürburgring Edition",
        category: "Carbon-Fiber Sculpted Art",
        subtitle: "4.8L Yamaha-Tuned V10 (Formula 1 Note)",
        description: "Engine revs from idle to 9,000 RPM in 0.6 seconds—too fast for an analog gauge so digital was invented.",
        imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { ExhaustSound: 100, RevSpeed: 100, Precision: 99, CultStatus: 98, OVR: 95 },
        tags: ["Lexus", "V10", "YamahaSound", "JDM"]
      },
      {
        id: "car_countach",
        name: "Lamborghini Countach LP5000 QV",
        category: "Historic Le Mans Classic",
        subtitle: "Gandini Wedge & Scissor Doors",
        description: "The poster on every 80s kid's bedroom wall. Raw naturally aspirated V12 bellowing with Weber carbs.",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { PosterFactor: 100, ScissorDoors: 100, Attitude: 98, Sound: 95, OVR: 93 },
        tags: ["Lamborghini", "Countach", "80s", "Wedge"]
      },
      {
        id: "car_fordgt",
        name: "Ford GT Heritage Gulf Edition",
        category: "Historic Le Mans Classic",
        subtitle: "Twin-Turbo EcoBoost Carbon Monocoque",
        description: "Iconic blue-and-orange Gulf livery celebrating back-to-back 1968-1969 Le Mans championships.",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
        baseValuation: 23,
        stats: { LeMansHeritage: 99, AeroButtresses: 98, LiveryLove: 100, Speed: 94, OVR: 94 },
        tags: ["Ford", "LeMans", "Gulf", "American"]
      }
    ]
  },

  // 13. PIRATE KINGS & HIGH SEAS ARMADAS
  {
    id: "pirate-armada",
    title: "Pirate Kings & Cursed High Seas",
    description: "Plunder legendary ghost galleons, summon sea sirens, and conquer the Caribbean trade routes.",
    icon: "🏴‍☠️",
    theme: "pirates",
    currencySymbol: "💀",
    currencyName: "Doubloons",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 15,
    nominationTimerSeconds: 15,
    antiSnipingSeconds: 5,
    rosterSlots: [
      { id: "pir_flagship", name: "Ghost / War Galleon", required: true, isWildcard: true },
      { id: "pir_relic", name: "Cursed Abyssal Relic", required: true, isWildcard: true },
      { id: "pir_haven", name: "Hidden Smuggler Cove", required: true, isWildcard: true },
      { id: "pir_beast", name: "Sea Monster Familiar", required: true, isWildcard: true },
      { id: "pir_wildcard", name: "Wildcard Pirate Plunder", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.5,
      fullRosterBonus: 25,
      synergyMultiplier: 8
    },
    items: [
      {
        id: "pir_blackpearl",
        name: "The Black Pearl Ghost Frigate",
        category: "Ghost / War Galleon",
        subtitle: "Fastest Ship in the Caribbean",
        description: "Black timber hull and shredded black sails that catch the faintest breath of wind. Outruns the Dutchman.",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 28,
        stats: { Speed: 100, StealthInFog: 98, BroadsideGuns: 95, Legend: 100, OVR: 97 },
        tags: ["Pirates", "BlackPearl", "GhostShip", "Speed"]
      },
      {
        id: "pir_flyingdutchman",
        name: "The Flying Dutchman",
        category: "Ghost / War Galleon",
        subtitle: "Davy Jones' Submersible Terror",
        description: "Submerges beneath waves to bypass naval blockades and surfaces directly into broadside range.",
        imageUrl: "https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=600&q=80",
        baseValuation: 29,
        stats: { Submersible: 100, Fear: 100, TripleChasers: 96, Curse: 98, OVR: 98 },
        tags: ["Cursed", "Abyss", "GhostShip", "DavyJones"]
      },
      {
        id: "pir_trident",
        name: "Trident of the Ocean Depths",
        category: "Cursed Abyssal Relic",
        subtitle: "Poseidon's Authority Over Tides",
        description: "Commands sea currents, shatters tidal reefs, and calms or whips category-5 hurricane squalls.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        baseValuation: 27,
        stats: { WaterControl: 100, Storms: 99, SeaRule: 100, Power: 96, OVR: 97 },
        tags: ["Relic", "Poseidon", "Ocean", "Magic"]
      },
      {
        id: "pir_aztecgold",
        name: "Cursed Aztec Gold Chest",
        category: "Cursed Abyssal Relic",
        subtitle: "Cortés Gold / Skeletal Moonlight Curse",
        description: "Whoever steals a piece cannot die by mortal weapons, showing their skeletal form under moonlight.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { Immortality: 98, Terror: 99, GreedLure: 96, Wealth: 97, OVR: 95 },
        tags: ["Curse", "Aztec", "Gold", "Undead"]
      },
      {
        id: "pir_krakenhorn",
        name: "Kraken-Summoning Bone Whistle",
        category: "Sea Monster Familiar",
        subtitle: "Deep Trench Leviathan Beacon",
        description: "Blow into this whalebone whistle to summon the colossal Kraken directly under enemy ships.",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { FleetDestroyer: 100, CallSpeed: 96, ShockValue: 99, Terror: 100, OVR: 96 },
        tags: ["Kraken", "Beast", "Summon", "Lethal"]
      },
      {
        id: "pir_tortuga",
        name: "Tortuga Smuggler Haven & Tavern",
        category: "Hidden Smuggler Cove",
        subtitle: "Free Port of Outlaws & Scoundrels",
        description: "Where naval admirals fear to tread. Infinite rum barrels, hidden coves for ship careening and repair.",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
        baseValuation: 22,
        stats: { RumSupply: 100, SafeHaven: 96, CrewRecruits: 98, Brawls: 97, OVR: 93 },
        tags: ["Haven", "Port", "Rum", "Pirates"]
      },
      {
        id: "pir_compass",
        name: "Jack Sparrow's Desire Compass",
        category: "Cursed Abyssal Relic",
        subtitle: "Points Directly to What You Want Most",
        description: "Doesn't point north. Points unerringly straight toward whatever your heart desires most in the world.",
        imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        baseValuation: 24,
        stats: { Navigation: 100, Luck: 99, Wit: 98, Desire: 97, OVR: 95 },
        tags: ["Compass", "Magic", "JackSparrow", "Relic"]
      },
      {
        id: "pir_queenanne",
        name: "Queen Anne's Revenge",
        category: "Ghost / War Galleon",
        subtitle: "Blackbeard's Flagship of Greek Fire",
        description: "Fires siphon canisters of Greek fire from the bow and hangs smoking fuses in Blackbeard's beard.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        baseValuation: 25,
        stats: { GreekFire: 99, Intimidation: 100, CannonCount: 95, Legend: 96, OVR: 95 },
        tags: ["Blackbeard", "Fire", "Pirates", "Warship"]
      },
      {
        id: "pir_siren",
        name: "Coral Reef Siren Familiar",
        category: "Sea Monster Familiar",
        subtitle: "Enchanting Song That Wrecks Fleets",
        description: "Sings irresistible melodies from jagged rocks that cause rival captains to steer ships into shoals.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        baseValuation: 21,
        stats: { Enchantment: 100, ShipwreckPower: 97, Beauty: 99, Secrecy: 92, OVR: 92 },
        tags: ["Siren", "Mythic", "Ocean", "Magic"]
      },
      {
        id: "pir_chest",
        name: "Davy Jones' Secret Dead Man's Chest",
        category: "Wildcard Pirate Plunder",
        subtitle: "The Beating Heart of the Sea Lord",
        description: "Whoever holds this beating heart controls Davy Jones and the Flying Dutchman itself.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        baseValuation: 26,
        stats: { UltimateLeverage: 100, DutchmanControl: 100, DarkMagic: 98, Secrecy: 95, OVR: 96 },
        tags: ["Heart", "Leverage", "DavyJones", "Relic"]
      }
    ]
  },
  // CONTENT CREATORS & STREAMERS
  {
    id: "content-creators",
    title: "Draft Your Dream Content House",
    name: "Draft Your Dream Content House",
    description: "Build an unstoppable media empire of top YouTubers, Twitch subathon kings, and viral influencers.",
    icon: "Tv",
    theme: "creators",
    currencySymbol: "💎",
    currencyName: "Clout Credits",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "slot_anchor", name: "Main Channel Headliner", required: true, isWildcard: true },
      { id: "slot_streamer", name: "Live Streamer / Grinder", required: true, isWildcard: true },
      { id: "slot_viral", name: "Short-Form Virality", required: true, isWildcard: true },
      { id: "slot_podcast", name: "Audio / Podcast Star", required: true, isWildcard: true },
      { id: "slot_wildcard", name: "House Wildcard", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.6,
      fullRosterBonus: 30,
      synergyMultiplier: 10,
      allowAudienceVoting: true
    },
    items: CREATOR_POOL
  },
  // UFC & WWE COMBAT TITANS
  {
    id: "ufc-wwe",
    title: "Combat Titans: UFC & WWE Roster",
    name: "Combat Titans: UFC & WWE Roster",
    description: "Assemble the ultimate combat promotion drafting UFC undisputed champions and WWE WrestleMania headliners.",
    icon: "Flame",
    theme: "combat",
    currencySymbol: "🏆",
    currencyName: "Fight Purse",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "slot_mainevent", name: "Pay-Per-View Main Event", required: true, isWildcard: true },
      { id: "slot_striker", name: "Striking / Knockout Artist", required: true, isWildcard: true },
      { id: "slot_grappler", name: "Grappling / Ground Master", required: true, isWildcard: true },
      { id: "slot_showman", name: "Mic General / Showman", required: true, isWildcard: true },
      { id: "slot_wildcard", name: "Cage / Ring Enforcer", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.6,
      fullRosterBonus: 30,
      synergyMultiplier: 10,
      allowAudienceVoting: true
    },
    items: COMBAT_POOL
  },
  // FORMULA 1 SPEED DEMONS
  {
    id: "f1-racing",
    title: "Formula 1: Dream Constructor Grid",
    name: "Formula 1: Dream Constructor Grid",
    description: "Sign World Champions, qualifying masters, and fearless racecraft titans into your championship team.",
    icon: "Car",
    theme: "f1",
    currencySymbol: "🏁",
    currencyName: "Constructor Millions",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "slot_lead", name: "Lead Championship Driver", required: true, isWildcard: true },
      { id: "slot_qualifying", name: "One-Lap Qualifying Specialist", required: true, isWildcard: true },
      { id: "slot_rain", name: "Wet Weather Master", required: true, isWildcard: true },
      { id: "slot_tactician", name: "Smooth Race Tactician", required: true, isWildcard: true },
      { id: "slot_wildcard", name: "Reserve / Overtaking Gunner", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.6,
      fullRosterBonus: 30,
      synergyMultiplier: 10,
      allowAudienceVoting: true
    },
    items: F1_POOL
  },
  // ONLYFANS & GLAMOUR STARS
  {
    id: "onlyfans-glamour",
    title: "OnlyFans & Glamour Mega-Stars",
    name: "OnlyFans & Glamour Mega-Stars",
    description: "Draft top-earning subscription moguls, viral glamour queens, and entertainment trailblazers.",
    icon: "Sparkles",
    theme: "glamour",
    currencySymbol: "💋",
    currencyName: "VIP Tokens",
    startingBudget: 100,
    minStartingBid: 1,
    minBidIncrement: 1,
    timerSeconds: 0,
    nominationTimerSeconds: 0,
    antiSnipingSeconds: 0,
    rosterSlots: [
      { id: "slot_topgrossing", name: "Top-Grossing Headliner", required: true, isWildcard: true },
      { id: "slot_viral", name: "Internet Virality Star", required: true, isWildcard: true },
      { id: "slot_hof", name: "Industry Hall of Famer", required: true, isWildcard: true },
      { id: "slot_crossover", name: "Mainstream Crossover", required: true, isWildcard: true },
      { id: "slot_wildcard", name: "Glamour Wildcard", required: true, isWildcard: true }
    ],
    scoringConfig: {
      budgetBonusPerUnit: 0.6,
      fullRosterBonus: 30,
      synergyMultiplier: 10,
      allowAudienceVoting: true
    },
    items: GLAMOUR_POOL
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
