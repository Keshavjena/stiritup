import { DraftItem, DraftPreset } from "./types"

export interface KMKPersonalityItem {
  id: string
  name: string
  category: string
  subtitle: string
  description: string
  imageUrl: string
  baseValuation: number
  stats: Record<string, number>
  tags: string[]
}

/**
 * Verified portrait and asset links for KMK database figures
 */
export const SUPERHERO_POOL: KMKPersonalityItem[] = [
  {
    id: "sh_batman",
    name: "Batman (Bruce Wayne)",
    category: "Vigilante Strategist",
    subtitle: "DC Universe / Gotham City",
    description: "Peak human tactician with unmatched intellect, martial mastery, and contingency plans for cosmic threats.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Batman_Cosplay_2017.jpg/440px-Batman_Cosplay_2017.jpg",
    baseValuation: 26,
    stats: { Power: 88, Intellect: 99, Tactics: 98, Combat: 96, OVR: 96 },
    tags: ["DC", "Justice League", "Street Tier", "Prep God"]
  },
  {
    id: "sh_superman",
    name: "Superman (Clark Kent)",
    category: "Cosmic Vanguard",
    subtitle: "DC Universe / Metropolis",
    description: "The Man of Steel. Solar-powered invulnerability, light-speed flight, and planetary striking strength.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Superman_Cosplay_2016.jpg/440px-Superman_Cosplay_2016.jpg",
    baseValuation: 30,
    stats: { Power: 100, Speed: 98, Durability: 100, Firepower: 96, OVR: 99 },
    tags: ["DC", "Justice League", "Cosmic", "Solar"]
  },
  {
    id: "sh_spiderman",
    name: "Spider-Man (Peter Parker)",
    category: "Agile Striker",
    subtitle: "Marvel / Queens",
    description: "Proportional spider strength, precognitive spider-sense, rapid web mobility, and relentless heart.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Spider-Man_Cosplay_2019.jpg/440px-Spider-Man_Cosplay_2019.jpg",
    baseValuation: 22,
    stats: { Power: 86, Agility: 99, Reflexes: 98, Intellect: 92, OVR: 93 },
    tags: ["Marvel", "Avengers", "Web Slinger", "Street Tier"]
  },
  {
    id: "sh_ironman",
    name: "Iron Man (Tony Stark)",
    category: "Tech Genius",
    subtitle: "Marvel / Avengers",
    description: "Billionaire visionary in bleeding-edge nanotech armor with repulsor cannons and satellite support.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg/440px-Iron_Man_cosplay_at_MCM_London_Comic_Con.jpg",
    baseValuation: 27,
    stats: { Power: 92, Tech: 100, Firepower: 95, Intellect: 99, OVR: 96 },
    tags: ["Marvel", "Avengers", "Tech", "Billionaire"]
  },
  {
    id: "sh_thor",
    name: "Thor Odinson",
    category: "Mythic Heavy",
    subtitle: "Asgard / God of Thunder",
    description: "Immortal Norse thunder god wielding Stormbreaker, summoning continental electrical storms.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Thor_cosplay_2019.jpg/440px-Thor_cosplay_2019.jpg",
    baseValuation: 28,
    stats: { Power: 98, Durability: 97, Energy: 96, Combat: 92, OVR: 96 },
    tags: ["Marvel", "Avengers", "God", "Cosmic"]
  },
  {
    id: "sh_wolverine",
    name: "Wolverine (Logan)",
    category: "Wildcard Berserker",
    subtitle: "X-Men / Weapon X",
    description: "Indestructible adamantium skeleton, razor-sharp claws, and an inexhaustible mutant healing factor.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Hugh_Jackman_by_Gage_Skidmore_3.jpg/440px-Hugh_Jackman_by_Gage_Skidmore_3.jpg",
    baseValuation: 24,
    stats: { Power: 91, Durability: 99, Combat: 95, Instinct: 96, OVR: 95 },
    tags: ["Marvel", "X-Men", "Mutant", "Healer"]
  },
  {
    id: "sh_wonderwoman",
    name: "Wonder Woman (Diana Prince)",
    category: "Warrior Demigod",
    subtitle: "DC Universe / Themyscira",
    description: "Amazonian warrior princess blessed with godlike combat prowess, Lasso of Truth, and unbreakable bracers.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Gal_Gadot_by_Gage_Skidmore_2.jpg/440px-Gal_Gadot_by_Gage_Skidmore_2.jpg",
    baseValuation: 27,
    stats: { Power: 95, Combat: 98, Speed: 92, Leadership: 94, OVR: 96 },
    tags: ["DC", "Justice League", "Amazon", "Demigod"]
  },
  {
    id: "sh_deadpool",
    name: "Deadpool (Wade Wilson)",
    category: "Chaotic Enforcer",
    subtitle: "Marvel / Merc with a Mouth",
    description: "Regenerative mutant assassin who breaks the fourth wall, duel-wields katanas, and cannot die.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg/440px-Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_%28cropped%29.jpg",
    baseValuation: 21,
    stats: { Power: 88, Chaos: 100, Regeneration: 100, Humor: 100, OVR: 93 },
    tags: ["Marvel", "Anti-Hero", "Mercenary", "Regeneration"]
  },
  {
    id: "sh_scarletwitch",
    name: "Scarlet Witch (Wanda)",
    category: "Reality Bender",
    subtitle: "Marvel / Chaos Magic",
    description: "Master of reality-warping chaos magic capable of disintegrating armies and reshaping entire multiverses.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Elizabeth_Olsen_by_Gage_Skidmore_2.jpg/440px-Elizabeth_Olsen_by_Gage_Skidmore_2.jpg",
    baseValuation: 29,
    stats: { Power: 99, RealityWarp: 100, Energy: 98, Psyche: 85, OVR: 97 },
    tags: ["Marvel", "Avengers", "Mystic", "Chaos Magic"]
  },
  {
    id: "sh_blackpanther",
    name: "Black Panther (T'Challa)",
    category: "Tactical Monarch",
    subtitle: "Marvel / Wakanda",
    description: "Vibranium-weave habit, heart-shaped herb superhuman agility, and the resources of the world's richest nation.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Chadwick_Boseman_by_Gage_Skidmore_July_2014.jpg/440px-Chadwick_Boseman_by_Gage_Skidmore_July_2014.jpg",
    baseValuation: 25,
    stats: { Power: 90, Tech: 96, Leadership: 97, Agility: 94, OVR: 95 },
    tags: ["Marvel", "Wakanda", "Avenger", "Vibranium"]
  },
  {
    id: "sh_drstrange",
    name: "Doctor Strange (Stephen)",
    category: "Sorcerer Supreme",
    subtitle: "Marvel / Kamar-Taj",
    description: "Master of the mystic arts, temporal manipulation, dimensional portals, and eldritch shields.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/BCdrstrange.jpg/440px-BCdrstrange.jpg",
    baseValuation: 26,
    stats: { Power: 96, Magic: 100, Intellect: 97, Dimensions: 98, OVR: 96 },
    tags: ["Marvel", "Sorcerer", "Mystic", "Time"]
  },
  {
    id: "sh_gojo",
    name: "Satoru Gojo",
    category: "Limitless Sorcerer",
    subtitle: "Jujutsu Kaisen / Tokyo",
    description: "The strongest modern sorcerer. Limitless spatial barrier, Six Eyes perception, and Hollow Purple annihilation.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Superman_Cosplay_2016.jpg/440px-Superman_Cosplay_2016.jpg",
    baseValuation: 29,
    stats: { Power: 100, Infinity: 100, Speed: 99, Perception: 100, OVR: 99 },
    tags: ["Anime", "JJK", "Infinity", "Special Grade"]
  }
]

export const HOLLYWOOD_POOL: KMKPersonalityItem[] = [
  {
    id: "hol_leo",
    name: "Leonardo DiCaprio",
    category: "Method A-Lister",
    subtitle: "Oscar Winner / Inception & Titanic",
    description: "Generational cinematic leading man with unmatched dramatic intensity and box-office prestige.",
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
    category: "Charming Leading Man",
    subtitle: "Drive / La La Land / Barbie",
    description: "Acclaimed versatile star known for deadpan comedic brilliance, intense neo-noirs, and viral musical numbers.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Ryan_Gosling_in_2018.jpg/440px-Ryan_Gosling_in_2018.jpg",
    baseValuation: 24,
    stats: { Fame: 96, Acting: 95, ScreenPresence: 98, Musicality: 90, OVR: 95 },
    tags: ["Barbie", "La La Land", "Drive", "Heartthrob"]
  },
  {
    id: "hol_cillian",
    name: "Cillian Murphy",
    category: "Transformative Master",
    subtitle: "Oppenheimer / Peaky Blinders",
    description: "Best Actor Oscar winner with piercing presence, master of quiet fury and cerebral dramatic tension.",
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
    description: "Beloved global action superstar celebrated for practical stunt mastery, neo-noir grit, and wholesome culture.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Keanu_Reeves_%28Crop_and_Levels%29_%28cropped%29.jpg/440px-Keanu_Reeves_%28Crop_and_Levels%29_%28cropped%29.jpg",
    baseValuation: 25,
    stats: { Fame: 97, Combat: 96, Likability: 100, Longevity: 96, OVR: 96 },
    tags: ["Matrix", "John Wick", "Action", "Icon"]
  },
  {
    id: "hol_timothee",
    name: "Timothée Chalamet",
    category: "Modern Leading Man",
    subtitle: "Dune / Wonka",
    description: "Generational box office titan leading back-to-back global blockbusters Dune: Part Two and Wonka.",
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
    description: "Hollywood's fastest rising producer and dramatic powerhouse driving modern romantic comedies and thrillers.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sydney_Sweeney_at_Berlinale_2023.jpg/440px-Sydney_Sweeney_at_Berlinale_2023.jpg",
    baseValuation: 23,
    stats: { Fame: 96, Charisma: 97, Producer: 92, Hype: 98, OVR: 94 },
    tags: ["Euphoria", "Producer", "Rom-Com", "Breakout"]
  }
]

export const POPSTAR_POOL: KMKPersonalityItem[] = [
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
    description: "Spotify record-holder for the #1 billboard hit of all time Blinding Lights, blending dark RnB with 80s synth.",
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
    description: "Most charted singles in Billboard history with unmatched hitmaking continuity across two decades.",
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
    description: "Billionaire cosmetics and fashion empire founder, nine-time Grammy winner with 14 number-one hits.",
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
    description: "Youngest double Oscar winner in history with genre-bending whispers, bass-heavy anthems, and authenticity.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Billie_Eilish_at_the_2024_Golden_Globes.jpg/440px-Billie_Eilish_at_the_2024_Golden_Globes.jpg",
    baseValuation: 26,
    stats: { Fame: 97, Artistry: 98, Oscar: 99, Production: 95, OVR: 96 },
    tags: ["Grammy", "Oscar Winner", "Alt Pop", "Visionary"]
  },
  {
    id: "pop_bruno",
    name: "Bruno Mars",
    category: "Funk & Soul Virtuoso",
    subtitle: "Silk Sonic / 15x Grammy Winner",
    description: "Unmatched live showman, retro funk genius, and multi-instrumentalist behind timeless chart toppers.",
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
    description: "Three-time Grammy winner whose electric disco grooves dominated dancefloors and airwaves worldwide.",
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
    description: "Diamond-certified hip-hop immortal, rapid-fire lyrical technician, and Oscar-winning cultural juggernaut.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%282%29_%28cropped%29.jpg/440px-Eminem_-_Concert_for_Valor_in_Washington%2C_D.C._Nov._11%2C_2014_%282%29_%28cropped%29.jpg",
    baseValuation: 27,
    stats: { Fame: 98, LyricalSpeed: 100, Legacy: 99, Technicality: 99, OVR: 98 },
    tags: ["Slim Shady", "Rap God", "Oscar Winner", "Hip Hop"]
  },
  {
    id: "pop_ariana",
    name: "Ariana Grande",
    category: "Whistle Register Virtuoso",
    subtitle: "Wicked / Positions",
    description: "Four-octave vocal virtuoso with unmatched whistle-register agility, star of Wicked and pop juggernaut.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ariana_Grande_at_the_2020_Grammy_Awards.png/440px-Ariana_Grande_at_the_2020_Grammy_Awards.png",
    baseValuation: 25,
    stats: { Fame: 98, VocalRange: 100, Agility: 97, Wicked: 96, OVR: 96 },
    tags: ["Grammy", "Wicked", "Whistle Note", "Vocal Queen"]
  }
]

export const BOLLYWOOD_POOL: KMKPersonalityItem[] = [
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
    description: "India's highest-paid leading actress, Time 100 honoree, and international fashion and cinema royalty.",
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
    description: "Celebrated for peerless dance virtuosity, Greek-god screen presence, and high-octane action thrillers.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Hrithik_at_Rado_launch.jpg/440px-Hrithik_at_Rado_launch.jpg",
    baseValuation: 27,
    stats: { Stardom: 97, Dancing: 100, Action: 98, ScreenCharm: 98, OVR: 97 },
    tags: ["Greek God", "Dance Legend", "War", "Action"]
  },
  {
    id: "bol_alia",
    name: "Alia Bhatt",
    category: "National Award Powerhouse",
    subtitle: "Gangubai Kathiawadi / RRR",
    description: "National Award-winning actress celebrated for transformative dramatic weight, versatility, and Met Gala glamour.",
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
    description: "Effortless method brilliance, starring in the historic blockbuster Animal and modern classics.",
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
    description: "Explosive, theatrical chameleon with boundary-pushing fashion, raw hip-hop passion, and magnetic intensity.",
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
    description: "One of the most mass-adored box-office titans in film history with unmatched single-screen fandom.",
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
    description: "The Star of the Millennium, iconic baritone voice, and defining pillar of Indian cultural history.",
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
    description: "Miss World 2000 winner, Hollywood franchise lead in Citadel, producer, and international entrepreneur.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Priyanka_Chopra_at_Bulgary_launch%2C_2024.jpg/440px-Priyanka_Chopra_at_Bulgary_launch%2C_2024.jpg",
    baseValuation: 26,
    stats: { Stardom: 97, GlobalReach: 99, Charisma: 98, Adaptability: 96, OVR: 96 },
    tags: ["Miss World", "Citadel", "Global", "Trailblazer"]
  },
  {
    id: "bol_katrina",
    name: "Katrina Kaif",
    category: "Blockbuster Dance Siren",
    subtitle: "Tiger 3 / Chikni Chameli / Kay Beauty",
    description: "Blockbuster action star, Bollywood's defining dance siren, and founder of beauty giant Kay Beauty.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Katrina_Kaif_promoting_Bharat_in_2019.jpg/440px-Katrina_Kaif_promoting_Bharat_in_2019.jpg",
    baseValuation: 24,
    stats: { Stardom: 96, Dancing: 99, ScreenGlam: 99, Business: 94, OVR: 95 },
    tags: ["Tiger", "Dance", "Kay Beauty", "Superstar"]
  }
]

export const ATHLETE_POOL: KMKPersonalityItem[] = [
  {
    id: "ath_messi",
    name: "Lionel Messi",
    category: "Playmaking Maestro",
    subtitle: "World Cup Champion / 8x Ballon d'Or",
    description: "The consensus greatest footballer of all time with celestial dribbling vision, precision, and world glory.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/440px-Lionel_Messi_20180626.jpg",
    baseValuation: 30,
    stats: { Vision: 100, Dribbling: 100, Finishing: 96, Clutch: 99, OVR: 99 },
    tags: ["GOAT", "World Cup", "Ballon d'Or", "Playmaker"]
  },
  {
    id: "ath_ronaldo",
    name: "Cristiano Ronaldo",
    category: "Lethal Finisher",
    subtitle: "CR7 / All-Time International Top Scorer",
    description: "Physical specimen, 5x Ballon d'Or winner, and unmatched clutch goalscorer with global dominance.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/440px-Cristiano_Ronaldo_2018.jpg",
    baseValuation: 29,
    stats: { Athleticism: 99, Finishing: 99, Aerial: 100, Determination: 100, OVR: 98 },
    tags: ["CR7", "GOAT", "UCL Legend", "Goalscorer"]
  },
  {
    id: "ath_kohli",
    name: "Virat Kohli",
    category: "Run Machine & King",
    subtitle: "King Kohli / ICC Chase Master",
    description: "Modern cricket titan, 50 ODI centuries, highest run-scorer in World Cup history with unyielding chase grit.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Virat_Kohli_during_the_India_vs_Australia_5th_ODI_match_at_Feroz_Shah_Kotla.jpg/440px-Virat_Kohli_during_the_India_vs_Australia_5th_ODI_match_at_Feroz_Shah_Kotla.jpg",
    baseValuation: 28,
    stats: { Chasing: 100, Fitness: 99, Intensity: 99, Batting: 99, OVR: 98 },
    tags: ["King Kohli", "Cricket GOAT", "Run Machine", "Chase Master"]
  },
  {
    id: "ath_lebron",
    name: "LeBron James",
    category: "All-Time Scorer",
    subtitle: "The King / 4x NBA Champion",
    description: "NBA all-time scoring leader, 21-season longevity king, combining freight-train power with point guard vision.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/440px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg",
    baseValuation: 28,
    stats: { BasketballIQ: 100, Power: 98, Longevity: 100, Playmaking: 97, OVR: 98 },
    tags: ["King James", "NBA GOAT", "Lakers", "Bulls"]
  },
  {
    id: "ath_jordan",
    name: "Michael Jordan",
    category: "Clutch Assassin",
    subtitle: "Chicago Bulls / 6x Finals MVP",
    description: "Six-for-six in NBA Finals, defensive terror, and the defining global icon of competitive obsession.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/440px-Michael_Jordan_in_2014.jpg",
    baseValuation: 30,
    stats: { Clutch: 100, Scoring: 100, Defense: 96, Willpower: 100, OVR: 99 },
    tags: ["Air Jordan", "NBA GOAT", "Bulls", "6 Rings"]
  },
  {
    id: "ath_federer",
    name: "Roger Federer",
    category: "Grace Maestro",
    subtitle: "20x Grand Slam Champion / Switzerland",
    description: "Effortless aesthetic perfection on tennis grass and hardcourts with unmatched balletic fluidity.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Roger_Federer_2019.jpg/440px-Roger_Federer_2019.jpg",
    baseValuation: 26,
    stats: { Elegance: 100, Forehand: 98, Precision: 99, Temperament: 98, OVR: 97 },
    tags: ["Wimbledon", "Tennis GOAT", "Elegance", "Maestro"]
  },
  {
    id: "ath_serena",
    name: "Serena Williams",
    category: "Dominant Powerhouse",
    subtitle: "23x Grand Slam Singles Champion",
    description: "Revolutionized women's tennis with explosive baseline power, legendary 128mph serve, and champion mentality.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Serena_Williams_US_Open_2013.jpg/440px-Serena_Williams_US_Open_2013.jpg",
    baseValuation: 28,
    stats: { Serve: 100, Power: 100, MentalToughness: 100, Athleticism: 97, OVR: 98 },
    tags: ["Tennis GOAT", "Grand Slam", "Power", "Champion"]
  },
  {
    id: "ath_bolt",
    name: "Usain Bolt",
    category: "Fastest Man in History",
    subtitle: "9.58s Record / 8x Olympic Gold",
    description: "Officially the fastest human alive, shattering sprint records with electric charisma and world dominance.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Usain_Bolt_after_400_m_hurdles_at_2013_World_Championships_in_Athletics.jpg/440px-Usain_Bolt_after_400_m_hurdles_at_2013_World_Championships_in_Athletics.jpg",
    baseValuation: 27,
    stats: { Speed: 100, Acceleration: 100, Charisma: 98, Showmanship: 99, OVR: 98 },
    tags: ["Lightning Bolt", "Olympics", "World Record", "Sprint"]
  },
  {
    id: "ath_ali",
    name: "Muhammad Ali",
    category: "The Greatest",
    subtitle: "Heavyweight Champion / Cultural Giant",
    description: "Float like a butterfly, sting like a bee. Transcended sports to become the most culturally courageous athlete.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Muhammad_Ali_NYWTS.jpg/440px-Muhammad_Ali_NYWTS.jpg",
    baseValuation: 29,
    stats: { Speed: 99, Heart: 100, Charisma: 100, Resilience: 99, OVR: 99 },
    tags: ["The Greatest", "Boxing GOAT", "Heavyweight", "Icon"]
  },
  {
    id: "ath_hamilton",
    name: "Lewis Hamilton",
    category: "7x F1 World Champion",
    subtitle: "Most Grand Prix Wins in F1 History",
    description: "Record 103+ Formula 1 race victories, master in wet conditions, relentless pace, and global cultural voice.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2022_Bahrain.jpg/440px-Lewis_Hamilton_2022_Bahrain.jpg",
    baseValuation: 25,
    stats: { Racecraft: 100, Reflexes: 99, WetWeather: 100, Consistency: 97, OVR: 97 },
    tags: ["F1", "Champion", "Mercedes", "Speed"]
  }
]

export const CREATOR_POOL: KMKPersonalityItem[] = [
  {
    id: "crt_mrbeast",
    name: "MrBeast",
    category: "YouTube Kingpin",
    subtitle: "300M+ Subscribers / Philanthropy Titan",
    description: "Jimmy Donaldson, undisputed king of digital video production, massive prize giveaways, and viral philanthropy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/MrBeast_2023_%28cropped%29.jpg/440px-MrBeast_2023_%28cropped%29.jpg",
    baseValuation: 30,
    stats: { Reach: 100, Production: 100, Virality: 100, Budget: 99, OVR: 99 },
    tags: ["YouTube", "MrBeast", "Creator", "Viral"]
  },
  {
    id: "crt_speed",
    name: "IShowSpeed",
    category: "Chaos Energy Streamer",
    subtitle: "Darren Watkins Jr / Global Phenomenon",
    description: "Explosive live streaming sensation, premier CR7 enthusiast, and viral world traveler with unmatched raw energy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/IShowSpeed_at_the_2024_Ballon_d%27Or.jpg/440px-IShowSpeed_at_the_2024_Ballon_d%27Or.jpg",
    baseValuation: 27,
    stats: { Energy: 100, Virality: 99, Entertainment: 98, Unpredictability: 100, OVR: 97 },
    tags: ["Speed", "Streamer", "YouTube", "Viral"]
  },
  {
    id: "crt_kai",
    name: "Kai Cenat",
    category: "Twitch Record Breaker",
    subtitle: "2x Streamer of the Year / AMP",
    description: "All-time Twitch subathon record holder, high-energy cultural tastemaker, and host of A-list celebrity live streams.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kai_Cenat_2024_%28cropped%29.jpg/440px-Kai_Cenat_2024_%28cropped%29.jpg",
    baseValuation: 28,
    stats: { Charisma: 99, StarPower: 98, Community: 100, Clout: 98, OVR: 98 },
    tags: ["Twitch", "AMP", "KaiCenat", "Subathon"]
  },
  {
    id: "crt_pewdiepie",
    name: "PewDiePie",
    category: "OG Gaming Emperor",
    subtitle: "Felix Kjellberg / 111M Subscribers",
    description: "Legendary Swedish creator who pioneered modern YouTube gaming culture and led the platform for over a decade.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/PewDiePie_at_PAX_2015.jpg/440px-PewDiePie_at_PAX_2015.jpg",
    baseValuation: 26,
    stats: { Longevity: 100, Loyalty: 99, Humour: 96, Influence: 98, OVR: 97 },
    tags: ["PewDiePie", "OG", "Gaming", "YouTube"]
  },
  {
    id: "crt_loganpaul",
    name: "Logan Paul",
    category: "PRIME & Combat Mogul",
    subtitle: "WWE US Champion / Impaulsive",
    description: "Multi-hyphenate viral pioneer, WWE high-flyer, Impaulsive podcast host, and billionaire beverage co-founder.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logan_Paul_March_2020.jpg/440px-Logan_Paul_March_2020.jpg",
    baseValuation: 26,
    stats: { Marketing: 99, Athleticism: 96, Controversy: 95, Clout: 96, OVR: 96 },
    tags: ["LoganPaul", "PRIME", "WWE", "Impaulsive"]
  },
  {
    id: "crt_ksi",
    name: "KSI",
    category: "Sidemen Commander",
    subtitle: "JJ Olatunji / Music & Misfits Boxing",
    description: "Leader of the British digital wave, chart-topping musician, YouTuber, and combat entertainer.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/KSI_at_the_2024_World_Athletics_Relays.jpg/440px-KSI_at_the_2024_World_Athletics_Relays.jpg",
    baseValuation: 25,
    stats: { Drive: 98, Showmanship: 97, Versatility: 98, Audience: 97, OVR: 96 },
    tags: ["KSI", "Sidemen", "PRIME", "YouTube"]
  },
  {
    id: "crt_xqc",
    name: "xQc",
    category: "The Juicer / Grindset",
    subtitle: "Félix Lengyel / Kick & Twitch",
    description: "Marathon 16-hour streaming powerhouse, Overwatch pro veteran, and twitch chat kingpin.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/XQc_at_TwitchCon_2022.jpg/440px-XQc_at_TwitchCon_2022.jpg",
    baseValuation: 25,
    stats: { Stamina: 100, Reactions: 98, Degeneracy: 99, Engagement: 97, OVR: 95 },
    tags: ["xQc", "Juicer", "Twitch", "Kick"]
  },
  {
    id: "crt_pokimane",
    name: "Pokimane",
    category: "First Lady of Twitch",
    subtitle: "Imane Anys / OfflineTV",
    description: "The most-followed female streamer in live streaming history and digital lifestyle entrepreneur.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pokimane_at_TwitchCon_2019.jpg/440px-Pokimane_at_TwitchCon_2019.jpg",
    baseValuation: 24,
    stats: { BrandSafety: 98, Community: 97, Consistency: 96, Longevity: 96, OVR: 94 },
    tags: ["Pokimane", "Twitch", "Gaming", "Creator"]
  },
  {
    id: "crt_charli",
    name: "Charli D'Amelio",
    category: "TikTok Pioneer",
    subtitle: "150M+ Followers / Dance Icon",
    description: "First creator to break 100M TikTok followers, redefining modern short-form virality and dance culture.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Charli_D%27Amelio_2021.jpg/440px-Charli_D%27Amelio_2021.jpg",
    baseValuation: 25,
    stats: { Followers: 100, Virality: 98, Rhythm: 96, Appeal: 96, OVR: 95 },
    tags: ["TikTok", "Charli", "Dance", "GenZ"]
  },
  {
    id: "crt_rogan",
    name: "Joe Rogan",
    category: "Podcast Sovereign",
    subtitle: "The Joe Rogan Experience / Spotify",
    description: "Host of the world's most dominant audio broadcast, veteran UFC commentator, and stand-up comic.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Joe_Rogan_2020.jpg/440px-Joe_Rogan_2020.jpg",
    baseValuation: 29,
    stats: { AudioInfluence: 100, Inquisitiveness: 98, UFCKnowledge: 97, Reach: 99, OVR: 98 },
    tags: ["JRE", "Podcast", "UFC", "Spotify"]
  }
]

export const COMBAT_POOL: KMKPersonalityItem[] = [
  {
    id: "cbt_conor",
    name: "Conor McGregor",
    category: "The Notorious",
    subtitle: "First Simultaneous 2-Division UFC Champ",
    description: "Combat sports cash king, devastating left hand, and razor-sharp psychological warfare maestro.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Conor_McGregor_2018.jpg/440px-Conor_McGregor_2018.jpg",
    baseValuation: 30,
    stats: { Striking: 99, TrashTalk: 100, StarPower: 100, LeftHand: 99, OVR: 99 },
    tags: ["UFC", "ChampChamp", "MMA", "Notorious"]
  },
  {
    id: "cbt_khabib",
    name: "Khabib Nurmagomedov",
    category: "The Eagle / 29-0",
    subtitle: "Undefeated UFC Lightweight Champion",
    description: "Mauler from Dagestan with suffocating sambo wrestling who never bled or lost a round in modern MMA.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Khabib_Nurmagomedov_in_2018.jpg/440px-Khabib_Nurmagomedov_in_2018.jpg",
    baseValuation: 29,
    stats: { Grappling: 100, Pressure: 100, Smother: 100, Discipline: 99, OVR: 99 },
    tags: ["UFC", "Undefeated", "Dagestan", "Eagle"]
  },
  {
    id: "cbt_jonjones",
    name: "Jon Jones",
    category: "Octagon GOAT",
    subtitle: "Heavyweight & Light Heavyweight Champion",
    description: "Unprecedented fight IQ, creative oblique kicks, wrestling domination, and two-decade championship reign.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Jon_Jones_2019.jpg/440px-Jon_Jones_2019.jpg",
    baseValuation: 29,
    stats: { FightIQ: 100, Range: 99, Versatility: 99, Ruthlessness: 98, OVR: 99 },
    tags: ["UFC", "Bones", "GOAT", "Champion"]
  },
  {
    id: "cbt_omalley",
    name: "Sean O'Malley",
    category: "Suga Sean",
    subtitle: "UFC Bantamweight Champion / Sniper",
    description: "Pinpoint distance management, walk-off right hand knockouts, and vibrant modern superstar flair.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sean_O%27Malley_2023.jpg/440px-Sean_O%27Malley_2023.jpg",
    baseValuation: 26,
    stats: { Accuracy: 99, Footwork: 98, Swag: 98, Speed: 96, OVR: 96 },
    tags: ["UFC", "Suga", "Knockout", "Sniper"]
  },
  {
    id: "cbt_pereira",
    name: "Alex Pereira",
    category: "Poatan / Chama",
    subtitle: "2-Division UFC Champion & Glory Kickboxing Champ",
    description: "Stone-faced left-hook assassin who conquered middleweight and light heavyweight with ancient power.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Alex_Pereira_2023.jpg/440px-Alex_Pereira_2023.jpg",
    baseValuation: 28,
    stats: { Power: 100, LeftHook: 100, LowKicks: 99, Aura: 99, OVR: 98 },
    tags: ["UFC", "Poatan", "Chama", "Kickboxing"]
  },
  {
    id: "cbt_therock",
    name: "The Rock",
    category: "The People's Champion",
    subtitle: "Dwayne Johnson / Most Electrifying Man",
    description: "The People's Eyebrow, Rock Bottom, unmatched microphone dominance, and global Hollywood alpha.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Dwayne_%22The_Rock%22_Johnson_Visits_the_Pentagon_%28cropped%29.jpg/440px-Dwayne_%22The_Rock%22_Johnson_Visits_the_Pentagon_%28cropped%29.jpg",
    baseValuation: 29,
    stats: { MicSkills: 100, Electricity: 100, Charisma: 100, Presence: 100, OVR: 99 },
    tags: ["WWE", "TheRock", "AttitudeEra", "Hollywood"]
  },
  {
    id: "cbt_johncena",
    name: "John Cena",
    category: "16x World Champion",
    subtitle: "Hustle, Loyalty, Respect / Big Match John",
    description: "Franchise standard-bearer who headlined WrestleMania across decades with unbreakable championship resolve.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/John_Cena_July_2018.jpg/440px-John_Cena_July_2018.jpg",
    baseValuation: 28,
    stats: { Clutch: 99, Resilience: 100, Strength: 98, PopCulture: 99, OVR: 98 },
    tags: ["WWE", "JohnCena", "16xChamp", "NeverGiveUp"]
  },
  {
    id: "cbt_romanreigns",
    name: "Roman Reigns",
    category: "The Tribal Chief",
    subtitle: "Head of the Table / 1,316 Day Champion",
    description: "Leader of The Bloodline who carried WWE through a historic multi-year undefeated championship reign.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Roman_Reigns_Tribute_to_the_Troops_2016.jpg/440px-Roman_Reigns_Tribute_to_the_Troops_2016.jpg",
    baseValuation: 28,
    stats: { Dominance: 99, Aura: 100, Spear: 98, Durability: 98, OVR: 98 },
    tags: ["WWE", "Bloodline", "TribalChief", "AcknowledgeMe"]
  },
  {
    id: "cbt_undertaker",
    name: "The Undertaker",
    category: "The Deadman / 21-0",
    subtitle: "Phenom of WrestleMania",
    description: "Three-decade supernatural locker room general, Tombstone Piledriver master, and greatest gimmick in history.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/The_Undertaker_in_April_2014.jpg/440px-The_Undertaker_in_April_2014.jpg",
    baseValuation: 27,
    stats: { TheStreak: 100, Intimidation: 100, Tombstone: 99, Loyalty: 99, OVR: 98 },
    tags: ["WWE", "Undertaker", "Deadman", "WrestleMania"]
  },
  {
    id: "cbt_tyson",
    name: "Mike Tyson",
    category: "Iron Mike",
    subtitle: "Youngest Heavyweight Champion in History",
    description: "Ferocious peek-a-boo style, thunderous combinations, and the most feared heavyweight aura ever seen.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mike_Tyson_2019_by_Glenn_Francis.jpg/440px-Mike_Tyson_2019_by_Glenn_Francis.jpg",
    baseValuation: 28,
    stats: { KnockoutPower: 100, Speed: 98, Intimidation: 100, HeadMovement: 97, OVR: 98 },
    tags: ["Boxing", "Tyson", "IronMike", "Heavyweight"]
  }
]

export const F1_POOL: KMKPersonalityItem[] = [
  {
    id: "f1_verstappen",
    name: "Max Verstappen",
    category: "4x World Champion",
    subtitle: "Red Bull Racing / Dutch Maestro",
    description: "Record 19 wins in a single season, ice-cold racecraft, relentless consistency, and devastating pace.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Max_Verstappen_2024.jpg/440px-Max_Verstappen_2024.jpg",
    baseValuation: 30,
    stats: { Racecraft: 100, Pace: 100, Overtaking: 99, MentalStrength: 99, OVR: 99 },
    tags: ["F1", "Champion", "RedBull", "Dutch"]
  },
  {
    id: "f1_hamilton",
    name: "Lewis Hamilton",
    category: "7x World Champion",
    subtitle: "Most Wins & Poles in F1 History",
    description: "103+ Grand Prix victories, qualifying king, wet weather god, and culturally transformative champion.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2022_Bahrain.jpg/440px-Lewis_Hamilton_2022_Bahrain.jpg",
    baseValuation: 29,
    stats: { Racecraft: 99, WetWeather: 100, TireCare: 99, Legacy: 100, OVR: 99 },
    tags: ["F1", "Champion", "Mercedes", "Ferrari", "GOAT"]
  },
  {
    id: "f1_leclerc",
    name: "Charles Leclerc",
    category: "Ferrari Golden Boy",
    subtitle: "Monaco Grand Prix Winner",
    description: "Scuderia Ferrari talisman with peerless one-lap qualifying speed and supreme street-circuit bravery.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Charles_Leclerc_2024.jpg/440px-Charles_Leclerc_2024.jpg",
    baseValuation: 27,
    stats: { OneLapPace: 100, Braking: 98, Passion: 99, Reflexes: 97, OVR: 97 },
    tags: ["F1", "Ferrari", "Monaco", "PolePosition"]
  },
  {
    id: "f1_norris",
    name: "Lando Norris",
    category: "McLaren Striker",
    subtitle: "Race Winner / British Star",
    description: "McLaren franchise driver combining fearless racecraft with massive fan appeal and modern racing speed.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lando_Norris_2024.jpg/440px-Lando_Norris_2024.jpg",
    baseValuation: 26,
    stats: { Speed: 97, Consistency: 96, WheelToWheel: 96, TyreSaving: 95, OVR: 96 },
    tags: ["F1", "McLaren", "Norris", "Britain"]
  },
  {
    id: "f1_alonso",
    name: "Fernando Alonso",
    category: "El Nano / 2x Champ",
    subtitle: "Aston Martin / Ageless Master",
    description: "Two-time F1 World Champion, master tactician, legendary race starter, and 400+ Grand Prix veteran.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Fernando_Alonso_2023.jpg/440px-Fernando_Alonso_2023.jpg",
    baseValuation: 26,
    stats: { RaceStarts: 100, Defending: 100, Adaptability: 99, Grit: 100, OVR: 97 },
    tags: ["F1", "Alonso", "AstonMartin", "Legend"]
  },
  {
    id: "f1_senna",
    name: "Ayrton Senna",
    category: "Brazilian Rain God",
    subtitle: "3x World Champion / Monaco Master",
    description: "Spiritual qualifying genius, 6 Monaco GP wins, and the most revered raw driver in motorsport history.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Ayrton_Senna_8_%28cropped%29.jpg/440px-Ayrton_Senna_8_%28cropped%29.jpg",
    baseValuation: 29,
    stats: { WetWeather: 100, RawSpeed: 100, Commitment: 100, Heart: 100, OVR: 99 },
    tags: ["F1", "Senna", "Brazil", "McLaren", "Legend"]
  },
  {
    id: "f1_schumacher",
    name: "Michael Schumacher",
    category: "The Red Baron",
    subtitle: "7x World Champion / Ferrari Dynasty",
    description: "Relentless German workhorse who redefined driver fitness, testing rigor, and won 5 straight titles with Ferrari.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Michael_Schumacher_2012.jpg/440px-Michael_Schumacher_2012.jpg",
    baseValuation: 29,
    stats: { Fitness: 100, Consistency: 100, Determination: 100, Dominance: 99, OVR: 99 },
    tags: ["F1", "Ferrari", "Schumacher", "7xChampion"]
  },
  {
    id: "f1_sainz",
    name: "Carlos Sainz",
    category: "Smooth Operator",
    subtitle: "Ferrari / Williams Race Winner",
    description: "Cerebral racing tactician, master of in-race strategy calls from the cockpit, and Grand Prix winner.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Carlos_Sainz_Jr_2024.jpg/440px-Carlos_Sainz_Jr_2024.jpg",
    baseValuation: 24,
    stats: { StrategyIQ: 99, Composure: 97, Smoothness: 98, Precision: 95, OVR: 95 },
    tags: ["F1", "Sainz", "SmoothOperator", "Ferrari"]
  },
  {
    id: "f1_ricciardo",
    name: "Daniel Ricciardo",
    category: "The Honey Badger",
    subtitle: "8x Grand Prix Winner / Shoey King",
    description: "The late-braking divebomb specialist whose infectious smile and podium shoe celebrations charmed the world.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Daniel_Ricciardo_2024.jpg/440px-Daniel_Ricciardo_2024.jpg",
    baseValuation: 24,
    stats: { LateBraking: 99, Charisma: 100, Overtakes: 96, Charm: 99, OVR: 95 },
    tags: ["F1", "Ricciardo", "HoneyBadger", "Shoey"]
  },
  {
    id: "f1_russell",
    name: "George Russell",
    category: "Mercedes Precision",
    subtitle: "Grand Prix Winner / Mr. Consistency",
    description: "Laser-focused Mercedes factory pilot with textbook racecraft and immense wheel-to-wheel tenacity.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/George_Russell_2024.jpg/440px-George_Russell_2024.jpg",
    baseValuation: 24,
    stats: { Focus: 97, RawPace: 96, Defense: 96, WorkEthic: 97, OVR: 95 },
    tags: ["F1", "Russell", "Mercedes", "Speed"]
  }
]

export const GLAMOUR_POOL: KMKPersonalityItem[] = [
  {
    id: "glm_bhadbhabie",
    name: "Bhad Bhabie",
    category: "Record-Breaking Mogul",
    subtitle: "Danielle Bregoli / $50M+ OnlyFans",
    description: "Viral meme sensation who shattered creator economy records by generating $1M in six hours on OnlyFans.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Bhad_Bhabie_2018.png/440px-Bhad_Bhabie_2018.png",
    baseValuation: 28,
    stats: { Earnings: 100, Virality: 100, Clout: 98, Audacity: 98, OVR: 97 },
    tags: ["OnlyFans", "Viral", "RecordBreaker", "Rap"]
  },
  {
    id: "glm_corinna",
    name: "Corinna Kopf",
    category: "Top-Grossing Creator",
    subtitle: "Vlog Squad / $60M+ OnlyFans Titan",
    description: "Digital media star and gaming creator who built one of the highest-revenue subscription empires online.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Corinna_Kopf_2019.jpg/440px-Corinna_Kopf_2019.jpg",
    baseValuation: 27,
    stats: { Revenue: 100, Appeal: 98, SocialReach: 96, Engagement: 97, OVR: 97 },
    tags: ["OnlyFans", "CorinnaKopf", "VlogSquad", "Model"]
  },
  {
    id: "glm_amouranth",
    name: "Amouranth",
    category: "Livestream Mogul",
    subtitle: "Kaitlyn Siragusa / Twitch & OnlyFans",
    description: "Twitch hot-tub category pioneer, savvy real estate investor, gas station owner, and top creator earner.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Amouranth_at_Streamer_Awards_2022.jpg/440px-Amouranth_at_Streamer_Awards_2022.jpg",
    baseValuation: 28,
    stats: { BusinessIQ: 99, WorkEthic: 100, Disruption: 99, Diversification: 98, OVR: 98 },
    tags: ["OnlyFans", "Amouranth", "Twitch", "Business"]
  },
  {
    id: "glm_belle",
    name: "Belle Delphine",
    category: "GamerGirl Icon",
    subtitle: "Bath Water Troll & OnlyFans Mogul",
    description: "Genius internet shock artist who created the iconic GamerGirl Bath Water meme and topped global subscription charts.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Belle_Delphine_2020.jpg/440px-Belle_Delphine_2020.jpg",
    baseValuation: 26,
    stats: { MemePower: 100, ShockValue: 100, Aesthetics: 97, Virality: 99, OVR: 97 },
    tags: ["OnlyFans", "BathWater", "Meme", "Cosplay"]
  },
  {
    id: "glm_mia",
    name: "Mia Khalifa",
    category: "Pop Culture Phenomenon",
    subtitle: "Most Searched Star in History",
    description: "Global viral superstar, media commentator, sports podcaster, and instantly recognizable pop figure.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Mia_Khalifa_in_2019.jpg/440px-Mia_Khalifa_in_2019.jpg",
    baseValuation: 28,
    stats: { GlobalFame: 100, Recognizability: 100, Outspokenness: 97, MediaPresence: 96, OVR: 98 },
    tags: ["AdultStar", "Viral", "PopCulture", "Icon"]
  },
  {
    id: "glm_riley",
    name: "Riley Reid",
    category: "Hall of Fame Legend",
    subtitle: "Multi-Time Performer of the Year",
    description: "Industry hall of fame superstar with an unmatched filmography, multi-award sweep, and mainstream brand.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Riley_Reid_2017.jpg/440px-Riley_Reid_2017.jpg",
    baseValuation: 27,
    stats: { IndustryStatus: 100, Awards: 99, Popularity: 98, Charisma: 96, OVR: 97 },
    tags: ["AdultStar", "HallOfFame", "AwardWinner", "Legend"]
  },
  {
    id: "glm_lana",
    name: "Lana Rhoades",
    category: "Viral Sensation",
    subtitle: "Podcaster / Model / 10M+ Followers",
    description: "Historic video viewership record holder turned lifestyle model, podcaster, and viral internet figure.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lana_Rhoades_2017.jpg/440px-Lana_Rhoades_2017.jpg",
    baseValuation: 26,
    stats: { Views: 100, VisualAppeal: 99, SocialImpact: 96, Influence: 95, OVR: 96 },
    tags: ["AdultStar", "Model", "Viral", "Podcast"]
  },
  {
    id: "glm_angela",
    name: "Angela White",
    category: "Director & Hall of Famer",
    subtitle: "Australian Entertainment Powerhouse",
    description: "Multi-award-winning producer, director, and performer revered for championing high-end creator autonomy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Angela_White_2019.jpg/440px-Angela_White_2019.jpg",
    baseValuation: 26,
    stats: { Directing: 98, IndustryRespect: 100, Longevity: 98, Production: 97, OVR: 96 },
    tags: ["AdultStar", "Director", "HallOfFame", "Australia"]
  },
  {
    id: "glm_eva",
    name: "Eva Elfie",
    category: "Global Gaming Idol",
    subtitle: "Award Winner & Esports Host",
    description: "International entertainment sensation, competitive esports ambassador, and digital creator with worldwide acclaim.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Eva_Elfie_2022.jpg/440px-Eva_Elfie_2022.jpg",
    baseValuation: 25,
    stats: { GlobalAppeal: 98, GamingCulture: 97, Versatility: 95, Charm: 96, OVR: 95 },
    tags: ["AdultStar", "Esports", "Viral", "Gamer"]
  },
  {
    id: "glm_alix",
    name: "Alix Earle",
    category: "TikTok Lifestyle Queen",
    subtitle: "Hot Mess Podcaster / GRWM Queen",
    description: "Breakout digital tastemaker whose unfiltered 'Get Ready With Me' videos sell out products globally in seconds.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Alix_Earle_2023.jpg/440px-Alix_Earle_2023.jpg",
    baseValuation: 26,
    stats: { ConversionRate: 100, Authenticity: 98, Influence: 97, Trendsetting: 99, OVR: 96 },
    tags: ["TikTok", "GRWM", "Influencer", "HotMess"]
  }
]

/**
 * Maps theme ID to its respective pool
 */
export const KMK_POOLS: Record<string, KMKPersonalityItem[]> = {
  superheroes: SUPERHERO_POOL,
  "superhero-team": SUPERHERO_POOL,
  hollywood: HOLLYWOOD_POOL,
  "celebrity-icons": HOLLYWOOD_POOL,
  popstars: POPSTAR_POOL,
  bollywood: BOLLYWOOD_POOL,
  athletes: ATHLETE_POOL,
  "football-legends": ATHLETE_POOL,
  creators: CREATOR_POOL,
  "content-creators": CREATOR_POOL,
  combat: COMBAT_POOL,
  "ufc-wwe": COMBAT_POOL,
  f1: F1_POOL,
  "f1-racing": F1_POOL,
  glamour: GLAMOUR_POOL,
  "onlyfans-glamour": GLAMOUR_POOL,
  adultstars: GLAMOUR_POOL
}

/**
 * Shuffles an array and picks 10 items for the mystery draft pool
 */
export function sample10MysteryItems(themeId: string): DraftItem[] {
  const pool = KMK_POOLS[themeId] || SUPERHERO_POOL
  const items = [...pool]
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = items[i]
    items[i] = items[j]
    items[j] = temp
  }
  const selected = items.slice(0, 10)

  return selected.map((item, idx) => ({
    ...item,
    id: `${item.id}_${idx + 1}`
  }))
}
