import { Category, Gender } from "./types"

export interface SeedPersonality {
  name: string
  gender: Gender
  category: Category
  tags: string[]
  description: string
}

export const EXPANDED_PERSONALITIES: SeedPersonality[] = [
  // ==========================================
  // SCIENTISTS & THINKERS (45)
  // ==========================================
  { name: "Albert Einstein", gender: "male", category: "scientists", tags: ["physics", "nobel", "relativity", "genius"], description: "Theoretical physicist who developed the theory of relativity." },
  { name: "Marie Curie", gender: "female", category: "scientists", tags: ["physics", "chemistry", "nobel", "radioactivity"], description: "Pioneering physicist and chemist, first person to win two Nobel Prizes." },
  { name: "Nikola Tesla", gender: "male", category: "scientists", tags: ["inventor", "electricity", "ac-power", "genius"], description: "Serbian-American inventor and electrical engineer renowned for alternating current." },
  { name: "Isaac Newton", gender: "male", category: "scientists", tags: ["physics", "calculus", "gravity", "classical"], description: "Polymath who formulated the laws of motion and universal gravitation." },
  { name: "Alan Turing", gender: "male", category: "scientists", tags: ["computing", "cryptography", "ai", "enigma"], description: "Father of modern computing and artificial intelligence, Enigma codebreaker." },
  { name: "J. Robert Oppenheimer", gender: "male", category: "scientists", tags: ["physics", "manhattan-project", "atomic"], description: "Theoretical physicist known as the 'father of the atomic bomb'." },
  { name: "Stephen Hawking", gender: "male", category: "scientists", tags: ["cosmology", "black-holes", "physics", "author"], description: "Cosmologist, theoretical physicist, and author of A Brief History of Time." },
  { name: "Richard Feynman", gender: "male", category: "scientists", tags: ["quantum", "physics", "nobel", "lecturer"], description: "Nobel-winning physicist known for quantum electrodynamics and playful genius." },
  { name: "Ada Lovelace", gender: "female", category: "scientists", tags: ["computing", "math", "pioneer"], description: "Mathematician regarded as the world's first computer programmer." },
  { name: "Galileo Galilei", gender: "male", category: "scientists", tags: ["astronomy", "telescope", "physics"], description: "Astronomer and physicist considered the father of observational astronomy." },
  { name: "Charles Darwin", gender: "male", category: "scientists", tags: ["biology", "evolution", "natural-selection"], description: "Naturalist who proposed the theory of evolution by natural selection." },
  { name: "Carl Sagan", gender: "male", category: "scientists", tags: ["astronomy", "cosmos", "science-communicator"], description: "Astronomer, planetary scientist, and creator of the Cosmos series." },
  { name: "Rosalind Franklin", gender: "female", category: "scientists", tags: ["chemistry", "dna", "xray-crystallography"], description: "Chemist whose X-ray diffraction images led to the discovery of the DNA double helix." },
  { name: "Niels Bohr", gender: "male", category: "scientists", tags: ["physics", "atomic-model", "quantum", "nobel"], description: "Physicist who made foundational contributions to atomic structure and quantum theory." },
  { name: "Archimedes", gender: "male", category: "scientists", tags: ["ancient", "math", "physics", "eureka"], description: "Ancient Greek mathematician, physicist, and inventor of antiquity." },
  { name: "Erwin Schrödinger", gender: "male", category: "scientists", tags: ["physics", "quantum", "wave-mechanics", "cat"], description: "Nobel-winning physicist famous for quantum wave mechanics and Schrödinger's cat." },
  { name: "Louis Pasteur", gender: "male", category: "scientists", tags: ["biology", "vaccines", "pasteurization"], description: "Microbiologist renowned for discoveries of the principles of vaccination." },
  { name: "Alexander Fleming", gender: "male", category: "scientists", tags: ["medicine", "penicillin", "antibiotics", "nobel"], description: "Biologist and pharmacologist who discovered penicillin." },
  { name: "Michael Faraday", gender: "male", category: "scientists", tags: ["physics", "chemistry", "electromagnetism"], description: "Scientist who contributed to the study of electromagnetism and electrochemistry." },
  { name: "Max Planck", gender: "male", category: "scientists", tags: ["physics", "quantum-theory", "nobel"], description: "Theoretical physicist whose discovery of energy quanta won the 1918 Nobel Prize." },
  { name: "James Clerk Maxwell", gender: "male", category: "scientists", tags: ["physics", "electromagnetism", "equations"], description: "Scientist who formulated the classical theory of electromagnetic radiation." },
  { name: "Katherine Johnson", gender: "female", category: "scientists", tags: ["nasa", "math", "space-flight", "hidden-figures"], description: "NASA mathematician whose orbital calculations were critical to crewed spaceflights." },
  { name: "Jane Goodall", gender: "female", category: "scientists", tags: ["primatology", "anthropology", "conservation"], description: "World's foremost expert on chimpanzees and dedicated conservationist." },
  { name: "Johannes Kepler", gender: "male", category: "scientists", tags: ["astronomy", "planetary-motion", "math"], description: "Astronomer best known for his laws of planetary motion." },
  { name: "Dmitri Mendeleev", gender: "male", category: "scientists", tags: ["chemistry", "periodic-table"], description: "Chemist who formulated the Periodic Law and created the periodic table." },
  { name: "A. P. J. Abdul Kalam", gender: "male", category: "scientists", tags: ["aerospace", "missile-man", "india", "president"], description: "Aerospace scientist and 11th President of India, known as the Missile Man." },
  { name: "Homi Bhabha", gender: "male", category: "scientists", tags: ["nuclear", "physics", "india"], description: "Nuclear physicist known as the father of the Indian nuclear programme." },
  { name: "Srinivasa Ramanujan", gender: "male", category: "scientists", tags: ["mathematics", "genius", "infinity"], description: "Legendary Indian mathematician who made extraordinary mathematical contributions." },
  { name: "C. V. Raman", gender: "male", category: "scientists", tags: ["physics", "raman-effect", "nobel", "india"], description: "Physicist who discovered Raman scattering, winning the 1930 Nobel Prize in Physics." },
  { name: "Satyendra Nath Bose", gender: "male", category: "scientists", tags: ["physics", "bose-einstein", "boson"], description: "Theoretical physicist best known for Bose-Einstein statistics and bosons." },
  { name: "Subrahmanyan Chandrasekhar", gender: "male", category: "scientists", tags: ["astrophysics", "chandrasekhar-limit", "nobel"], description: "Nobel laureate astrophysicist known for the Chandrasekhar limit of white dwarfs." },
  { name: "John von Neumann", gender: "male", category: "scientists", tags: ["math", "computing", "game-theory", "polymath"], description: "Legendary mathematician and polymath who pioneered modern computer architecture." },
  { name: "Werner Heisenberg", gender: "male", category: "scientists", tags: ["physics", "quantum", "uncertainty-principle"], description: "Physicist who discovered the uncertainty principle in quantum mechanics." },
  { name: "Enrico Fermi", gender: "male", category: "scientists", tags: ["physics", "nuclear", "fermi-paradox", "nobel"], description: "Physicist and creator of the world's first nuclear reactor." },
  { name: "Chien-Shiung Wu", gender: "female", category: "scientists", tags: ["physics", "nuclear", "first-lady-physics"], description: "Experimental physicist known as the 'First Lady of Physics' for parity violation experiments." },
  { name: "Lise Meitner", gender: "female", category: "scientists", tags: ["physics", "nuclear-fission"], description: "Physicist who helped discover nuclear fission." },

  // ==========================================
  // TECH & INNOVATION (15)
  // ==========================================
  { name: "Steve Jobs", gender: "male", category: "tech", tags: ["apple", "visionary", "design", "iphone"], description: "Co-founder of Apple Inc. and pioneer of the personal computer revolution." },
  { name: "Elon Musk", gender: "male", category: "tech", tags: ["spacex", "tesla", "neuralink", "x"], description: "Entrepreneur and engineer leading SpaceX, Tesla, and xAI." },
  { name: "Bill Gates", gender: "male", category: "tech", tags: ["microsoft", "software", "philanthropy"], description: "Co-founder of Microsoft and global philanthropist." },
  { name: "Sam Altman", gender: "male", category: "tech", tags: ["openai", "ai", "chatgpt"], description: "CEO of OpenAI and prominent Silicon Valley entrepreneur." },
  { name: "Jensen Huang", gender: "male", category: "tech", tags: ["nvidia", "gpus", "ai", "hardware"], description: "Co-founder and CEO of NVIDIA, pioneer of GPU computing and AI hardware." },
  { name: "Satya Nadella", gender: "male", category: "tech", tags: ["microsoft", "cloud", "ceo"], description: "Chairman and CEO of Microsoft who transformed the company into cloud and AI leadership." },
  { name: "Sundar Pichai", gender: "male", category: "tech", tags: ["google", "alphabet", "ceo"], description: "CEO of Alphabet and Google leading search, Android, and AI initiatives." },
  { name: "Mark Zuckerberg", gender: "male", category: "tech", tags: ["meta", "facebook", "social-media"], description: "Founder and CEO of Meta Platforms." },
  { name: "Jeff Bezos", gender: "male", category: "tech", tags: ["amazon", "blue-origin", "e-commerce"], description: "Founder of Amazon and space exploration company Blue Origin." },
  { name: "Linus Torvalds", gender: "male", category: "tech", tags: ["linux", "git", "open-source"], description: "Creator of the Linux kernel and the Git version control system." },

  // ==========================================
  // BOLLYWOOD (45)
  // ==========================================
  { name: "Shah Rukh Khan", gender: "male", category: "bollywood", tags: ["king-khan", "actor", "romance"], description: "Iconic superstar of Indian cinema known globally as King Khan." },
  { name: "Deepika Padukone", gender: "female", category: "bollywood", tags: ["actress", "cannes", "producer"], description: "One of the highest-paid actresses in India, global fashion and cinema icon." },
  { name: "Alia Bhatt", gender: "female", category: "bollywood", tags: ["actress", "national-award", "cannes"], description: "Acclaimed Indian actress and producer known for powerhouse performances." },
  { name: "Priyanka Chopra", gender: "female", category: "bollywood", tags: ["actress", "miss-world", "hollywood", "global"], description: "Global Indian actress, singer, and Miss World 2000 winner." },
  { name: "Katrina Kaif", gender: "female", category: "bollywood", tags: ["actress", "dance", "star"], description: "Celebrated Indian actress known for blockbuster hits and iconic dance tracks." },
  { name: "Ranbir Kapoor", gender: "male", category: "bollywood", tags: ["actor", "star", "rockstar"], description: "Versatile actor known for critically acclaimed and blockbuster performances." },
  { name: "Ranveer Singh", gender: "male", category: "bollywood", tags: ["actor", "energy", "star"], description: "Energetic and flamboyant Indian actor with versatile blockbuster filmography." },
  { name: "Hrithik Roshan", gender: "male", category: "bollywood", tags: ["actor", "greek-god", "dance"], description: "Indian actor celebrated for his dance ability, charisma, and dramatic roles." },
  { name: "Salman Khan", gender: "male", category: "bollywood", tags: ["bhaijaan", "blockbuster", "superstar"], description: "One of the most commercially successful superstars in Indian film history." },
  { name: "Aamir Khan", gender: "male", category: "bollywood", tags: ["mr-perfectionist", "dangal", "cinema"], description: "Actor and filmmaker recognized for thoughtful, socially resonant blockbusters." },
  { name: "Amitabh Bachchan", gender: "male", category: "bollywood", tags: ["shahenshah", "legend", "angry-young-man"], description: "Legendary Indian actor known as the Shahenshah of Bollywood." },
  { name: "Kareena Kapoor", gender: "female", category: "bollywood", tags: ["bebo", "fashion", "actress"], description: "Iconic Bollywood actress celebrated for her versatile roles and style." },
  { name: "Anushka Sharma", gender: "female", category: "bollywood", tags: ["actress", "producer", "clean-slate"], description: "Acclaimed Indian actress and film producer." },
  { name: "Kriti Sanon", gender: "female", category: "bollywood", tags: ["actress", "national-award", "mimi"], description: "National Award-winning Indian actress and entrepreneur." },
  { name: "Kiara Advani", gender: "female", category: "bollywood", tags: ["actress", "blockbuster", "shershaah"], description: "Popular Bollywood star known for top-grossing romantic and dramatic hits." },
  { name: "Shraddha Kapoor", gender: "female", category: "bollywood", tags: ["actress", "stree", "singer"], description: "One of Bollywood's most followed stars, known for horror-comedy and musicals." },
  { name: "Janhvi Kapoor", gender: "female", category: "bollywood", tags: ["actress", "dhadak", "mili"], description: "Young Bollywood leading actress known for challenging character choices." },
  { name: "Sara Ali Khan", gender: "female", category: "bollywood", tags: ["actress", "kedarnath", "simmba"], description: "Popular Indian actress known for her spontaneous wit and films." },
  { name: "Disha Patani", gender: "female", category: "bollywood", tags: ["actress", "fitness", "action"], description: "Indian actress and fitness icon known for action blockbusters." },
  { name: "Aishwarya Rai", gender: "female", category: "bollywood", tags: ["miss-world", "beauty", "cannes", "legend"], description: "Miss World 1994, international beauty symbol, and celebrated actress." },
  { name: "Madhuri Dixit", gender: "female", category: "bollywood", tags: ["dance", "dhak-dhak", "legend"], description: "Legendary Indian actress celebrated for her unmatched expressive dancing." },
  { name: "Vicky Kaushal", gender: "male", category: "bollywood", tags: ["actor", "uri", "sam-bahadur", "national-award"], description: "National Award-winning actor celebrated for transformative biographical portrayals." },
  { name: "Kartik Aaryan", gender: "male", category: "bollywood", tags: ["actor", "monologue", "comedy", "heartthrob"], description: "Popular Bollywood star known for comedic timing and mass appeal." },
  { name: "Ayushmann Khurrana", gender: "male", category: "bollywood", tags: ["actor", "andhadhun", "national-award"], description: "Actor and singer acclaimed for socially unconventional, pathbreaking films." },
  { name: "Rajkummar Rao", gender: "male", category: "bollywood", tags: ["actor", "method", "national-award"], description: "Critically revered actor known for gritty realism and comedic brilliance." },
  { name: "Pankaj Tripathi", gender: "male", category: "bollywood", tags: ["actor", "mirzapur", "kaleen-bhaiya"], description: "Revered character actor beloved for effortless naturalism." },
  { name: "Samantha Ruth Prabhu", gender: "female", category: "bollywood", tags: ["south", "actress", "pan-india", "family-man"], description: "Leading South and Pan-Indian actress renowned for versatile roles." },
  { name: "Nayanthara", gender: "female", category: "bollywood", tags: ["lady-superstar", "actress", "south"], description: "Revered as the Lady Superstar of South Indian cinema." },
  { name: "Rashmika Mandanna", gender: "female", category: "bollywood", tags: ["national-crush", "pushpa", "animal"], description: "Pan-Indian leading actress known as the National Crush." },

  // ==========================================
  // HOLLYWOOD (60)
  // ==========================================
  { name: "Leonardo DiCaprio", gender: "male", category: "hollywood", tags: ["actor", "oscar", "titanic", "inception"], description: "Academy Award-winning actor and environmentalist." },
  { name: "Brad Pitt", gender: "male", category: "hollywood", tags: ["actor", "oscar", "fight-club", "producer"], description: "Academy Award-winning superstar actor and Plan B producer." },
  { name: "Ryan Gosling", gender: "male", category: "hollywood", tags: ["actor", "barbie", "la-la-land", "drive"], description: "Acclaimed Canadian actor celebrated for dramatic depth and comedic charm." },
  { name: "Margot Robbie", gender: "female", category: "hollywood", tags: ["actress", "barbie", "harley-quinn", "producer"], description: "Australian actress and LuckyChap producer behind modern cinematic hits." },
  { name: "Sydney Sweeney", gender: "female", category: "hollywood", tags: ["actress", "euphoria", "white-lotus"], description: "American actress and producer recognized for breakout dramatic roles." },
  { name: "Ana de Armas", gender: "female", category: "hollywood", tags: ["actress", "knives-out", "blonde", "bond"], description: "Cuban-Spanish actress nominated for an Academy Award." },
  { name: "Scarlett Johansson", gender: "female", category: "hollywood", tags: ["actress", "black-widow", "oscar-nominee"], description: "Highest-grossing actress of all time and Marvel superhero icon." },
  { name: "Gal Gadot", gender: "female", category: "hollywood", tags: ["actress", "wonder-woman", "action"], description: "Israeli actress and model world-renowned as Wonder Woman." },
  { name: "Zendaya", gender: "female", category: "hollywood", tags: ["actress", "emmy", "dune", "euphoria"], description: "Emmy-winning actress, singer, and modern fashion icon." },
  { name: "Florence Pugh", gender: "female", category: "hollywood", tags: ["actress", "oppenheimer", "midsommar"], description: "Academy Award-nominated British actress known for raw dramatic range." },
  { name: "Timothée Chalamet", gender: "male", category: "hollywood", tags: ["actor", "dune", "wonka", "oscar-nominee"], description: "Generational leading actor acclaimed for Dune, Wonka, and Call Me by Your Name." },
  { name: "Cillian Murphy", gender: "male", category: "hollywood", tags: ["actor", "oscar", "oppenheimer", "peaky-blinders"], description: "Academy Award-winning Irish actor celebrated for Oppenheimer and Tommy Shelby." },
  { name: "Henry Cavill", gender: "male", category: "hollywood", tags: ["superman", "witcher", "geek-icon"], description: "British actor renowned for portraying Superman and Geralt of Rivia." },
  { name: "Keanu Reeves", gender: "male", category: "hollywood", tags: ["matrix", "john-wick", "wholesome"], description: "Beloved action superstar known for The Matrix and John Wick." },
  { name: "Tom Cruise", gender: "male", category: "hollywood", tags: ["action", "mission-impossible", "top-gun"], description: "Legendary action superstar famous for death-defying practical stunts." },
  { name: "Robert Downey Jr.", gender: "male", category: "hollywood", tags: ["iron-man", "marvel", "oscar", "oppenheimer"], description: "Academy Award-winning actor who defined the Marvel Cinematic Universe as Tony Stark." },
  { name: "Christian Bale", gender: "male", category: "hollywood", tags: ["batman", "method-actor", "oscar"], description: "Transformative method actor known for The Dark Knight trilogy and The Fighter." },
  { name: "Johnny Depp", gender: "male", category: "hollywood", tags: ["jack-sparrow", "actor", "pirates"], description: "Actor renowned for eccentric, iconic characters including Captain Jack Sparrow." },
  { name: "Pedro Pascal", gender: "male", category: "hollywood", tags: ["last-of-us", "mandalorian", "internet-daddy"], description: "Charming leading actor star of The Last of Us and The Mandalorian." },
  { name: "Emma Stone", gender: "female", category: "hollywood", tags: ["actress", "oscar", "poor-things", "la-la-land"], description: "Two-time Academy Award-winning actress celebrated for bold creative choices." },
  { name: "Jennifer Lawrence", gender: "female", category: "hollywood", tags: ["actress", "oscar", "hunger-games"], description: "Academy Award-winning actress and star of The Hunger Games franchise." },
  { name: "Anne Hathaway", gender: "female", category: "hollywood", tags: ["actress", "oscar", "devil-wears-prada"], description: "Academy Award-winning actress with wide range across comedy and musical drama." },
  { name: "Angelina Jolie", gender: "female", category: "hollywood", tags: ["actress", "oscar", "humanitarian", "tomb-raider"], description: "Global superstar actress, filmmaker, and dedicated humanitarian." },
  { name: "Anya Taylor-Joy", gender: "female", category: "hollywood", tags: ["actress", "queens-gambit", "furiosa"], description: "Distinctive actress acclaimed for The Queen's Gambit and Furiosa." },
  { name: "Jenna Ortega", gender: "female", category: "hollywood", tags: ["actress", "wednesday", "scream"], description: "Breakout young actress known as modern horror scream queen and Wednesday Addams." },
  { name: "Elizabeth Olsen", gender: "female", category: "hollywood", tags: ["actress", "scarlet-witch", "marvel"], description: "Critically acclaimed actress renowned as Wanda Maximoff / Scarlet Witch." },
  { name: "Salma Hayek", gender: "female", category: "hollywood", tags: ["actress", "frida", "producer"], description: "Mexican-American actress and producer who broke Hollywood barriers." },
  { name: "Penélope Cruz", gender: "female", category: "hollywood", tags: ["actress", "oscar", "spain", "almodovar"], description: "Academy Award-winning Spanish actress celebrated in European and American cinema." },
  { name: "Monica Bellucci", gender: "female", category: "hollywood", tags: ["actress", "matrix", "beauty", "italy"], description: "Italian actress and fashion model regarded as a global cinematic icon." },
  { name: "Chris Hemsworth", gender: "male", category: "hollywood", tags: ["thor", "marvel", "action"], description: "Australian action star world-famous for portraying Thor in the MCU." },
  { name: "Chris Evans", gender: "male", category: "hollywood", tags: ["captain-america", "marvel", "actor"], description: "Actor beloved worldwide as Captain America / Steve Rogers." },
  { name: "Tom Hardy", gender: "male", category: "hollywood", tags: ["actor", "venom", "mad-max", "bane"], description: "Intense English actor acclaimed for gritty, transformative screen presence." },
  { name: "Matthew McConaughey", gender: "male", category: "hollywood", tags: ["actor", "oscar", "interstellar"], description: "Academy Award-winning actor celebrated for Dallas Buyers Club and Interstellar." },
  { name: "Joaquin Phoenix", gender: "male", category: "hollywood", tags: ["actor", "oscar", "joker", "method"], description: "Academy Award-winning method actor revered for dark, deeply committed performances." },
  { name: "Denzel Washington", gender: "male", category: "hollywood", tags: ["actor", "oscar", "training-day", "legend"], description: "Two-time Academy Award-winning legend of American cinema and theater." },
  { name: "Morgan Freeman", gender: "male", category: "hollywood", tags: ["actor", "voice-of-god", "shawshank", "legend"], description: "Beloved veteran actor known for his iconic, authoritative voice." },
  { name: "Samuel L. Jackson", gender: "male", category: "hollywood", tags: ["pulp-fiction", "nick-fury", "legend"], description: "Prolific, culturally iconic actor with over 150 film appearances." },
  { name: "Hugh Jackman", gender: "male", category: "hollywood", tags: ["wolverine", "musical", "broadway"], description: "Australian star who defined Wolverine and dazzles on the Broadway stage." },
  { name: "Tom Holland", gender: "male", category: "hollywood", tags: ["spider-man", "marvel", "dance"], description: "British actor world-famous as Peter Parker / Spider-Man." },
  { name: "Andrew Garfield", gender: "male", category: "hollywood", tags: ["spider-man", "actor", "oscar-nominee"], description: "Versatile British-American actor acclaimed for stage and cinema." },
  { name: "Austin Butler", gender: "male", category: "hollywood", tags: ["elvis", "dune", "oscar-nominee"], description: "Academy Award-nominated actor acclaimed for Elvis and Dune: Part Two." },
  { name: "Paul Mescal", gender: "male", category: "hollywood", tags: ["gladiator", "normal-people", "oscar-nominee"], description: "Irish breakout dramatic star of Normal People and Gladiator II." },

  // ==========================================
  // POP STARS & MUSICIANS (30)
  // ==========================================
  { name: "Taylor Swift", gender: "female", category: "popstars", tags: ["singer", "grammy", "eras-tour", "songwriter"], description: "Global musical phenomenon and 14-time Grammy Award winner." },
  { name: "Beyoncé", gender: "female", category: "popstars", tags: ["queen-bey", "grammy", "icon", "performer"], description: "Most awarded artist in Grammy history and cultural icon." },
  { name: "Rihanna", gender: "female", category: "popstars", tags: ["fenty", "singer", "fashion", "billionaire"], description: "Billionaire music superstar, fashion mogul, and Fenty founder." },
  { name: "Dua Lipa", gender: "female", category: "popstars", tags: ["pop", "grammy", "dance", "future-nostalgia"], description: "Grammy-winning British-Albanian pop powerhouse behind Future Nostalgia." },
  { name: "Ariana Grande", gender: "female", category: "popstars", tags: ["vocalist", "grammy", "wicked", "pop"], description: "Virtuoso vocalist with four-octave range and pop chart dominance." },
  { name: "Billie Eilish", gender: "female", category: "popstars", tags: ["grammy", "oscar", "alt-pop", "singer"], description: "Nine-time Grammy and two-time Oscar-winning singer-songwriter." },
  { name: "Selena Gomez", gender: "female", category: "popstars", tags: ["rare-beauty", "singer", "actress"], description: "Singer, Rare Beauty founder, and star of Only Murders in the Building." },
  { name: "Lady Gaga", gender: "female", category: "popstars", tags: ["grammy", "oscar", "poker-face", "actress"], description: "Versatile music icon, Oscar winner, and transformative live performer." },
  { name: "The Weeknd", gender: "male", category: "popstars", tags: ["rnb", "blinding-lights", "grammy"], description: "Chart-topping Canadian singer behind Blinding Lights and Starboy." },
  { name: "Drake", gender: "male", category: "popstars", tags: ["hip-hop", "ovo", "rap", "billboard"], description: "Record-breaking Canadian rapper and one of the highest-selling artists of all time." },
  { name: "Eminem", gender: "male", category: "popstars", tags: ["rap-god", "hip-hop", "oscar", "grammy"], description: "Legendary rapper recognized as one of the greatest lyricists in hip-hop history." },
  { name: "Kendrick Lamar", gender: "male", category: "popstars", tags: ["pulitzer", "rap", "grammy", "hip-hop"], description: "Pulitzer Prize and Grammy-winning visionary rapper and cultural voice." },
  { name: "Michael Jackson", gender: "male", category: "popstars", tags: ["king-of-pop", "thriller", "dance", "legend"], description: "The King of Pop, one of the most culturally significant 20th-century figures." },
  { name: "Freddie Mercury", gender: "male", category: "popstars", tags: ["queen", "rock-legend", "bohemian-rhapsody"], description: "Legendary Queen frontman renowned for flamboyant stagecraft and four-octave voice." },
  { name: "Harry Styles", gender: "male", category: "popstars", tags: ["grammy", "fashion", "pop", "one-direction"], description: "Grammy-winning British singer-songwriter and fashion icon." },
  { name: "Justin Bieber", gender: "male", category: "popstars", tags: ["pop", "belieber", "grammy"], description: "Canadian pop superstar with massive worldwide musical influence." },
  { name: "Bruno Mars", gender: "male", category: "popstars", tags: ["funk", "grammy", "silk-sonic", "performer"], description: "15-time Grammy-winning singer, songwriter, and dynamic showman." },
  { name: "Olivia Rodrigo", gender: "female", category: "popstars", tags: ["grammy", "drivers-license", "sour", "guts"], description: "Multi-Grammy-winning pop-rock singer-songwriter behind SOUR and GUTS." },
  { name: "Sabrina Carpenter", gender: "female", category: "popstars", tags: ["espresso", "pop", "please-please-please"], description: "Chart-topping pop artist behind viral smash hits Espresso and Taste." },
  { name: "Shakira", gender: "female", category: "popstars", tags: ["hips-dont-lie", "latin-pop", "dance"], description: "The Queen of Latin Music, multi-Grammy-winning global sensation." },

  // ==========================================
  // ATHLETES (20)
  // ==========================================
  { name: "Cristiano Ronaldo", gender: "male", category: "athletes", tags: ["football", "cr7", "ballon-dor", "portugal"], description: "All-time leading goalscorer in international football and 5-time Ballon d'Or winner." },
  { name: "Lionel Messi", gender: "male", category: "athletes", tags: ["football", "goat", "world-cup", "ballon-dor"], description: "World Cup champion and 8-time Ballon d'Or winner widely considered the greatest footballer." },
  { name: "Virat Kohli", gender: "male", category: "athletes", tags: ["cricket", "king-kohli", "india", "run-machine"], description: "Indian cricket legend celebrated as one of the greatest batsmen in history." },
  { name: "MS Dhoni", gender: "male", category: "athletes", tags: ["cricket", "captain-cool", "thala", "india"], description: "Iconic former Indian captain who won all three ICC white-ball trophies." },
  { name: "LeBron James", gender: "male", category: "athletes", tags: ["basketball", "nba", "king-james", "lakers"], description: "All-time leading scorer in NBA history and 4-time NBA Champion." },
  { name: "Michael Jordan", gender: "male", category: "athletes", tags: ["basketball", "goat", "bulls", "air-jordan"], description: "Bulls legend widely acclaimed as the greatest basketball player of all time." },
  { name: "Serena Williams", gender: "female", category: "athletes", tags: ["tennis", "grand-slam", "goat"], description: "23-time Grand Slam singles champion who revolutionized women's tennis." },
  { name: "Roger Federer", gender: "male", category: "athletes", tags: ["tennis", "grand-slam", "elegance", "switzerland"], description: "Swiss tennis maestro revered for effortless elegance and 20 Grand Slam titles." },
  { name: "Rafael Nadal", gender: "male", category: "athletes", tags: ["tennis", "king-of-clay", "grand-slam", "spain"], description: "The King of Clay, 22-time Grand Slam champion with legendary warrior spirit." },
  { name: "Usain Bolt", gender: "male", category: "athletes", tags: ["athletics", "sprint", "fastest-man", "olympics"], description: "Eight-time Olympic gold medalist, officially the fastest human in history." },
  { name: "Muhammad Ali", gender: "male", category: "athletes", tags: ["boxing", "the-greatest", "champion", "activist"], description: "Heavyweight boxing icon known as 'The Greatest', famous for cultural courage." },
  { name: "Lewis Hamilton", gender: "male", category: "athletes", tags: ["formula-1", "f1", "champion", "racing"], description: "Seven-time Formula 1 World Champion and all-time record race winner." },

  // ==========================================
  // HISTORICAL FIGURES (15)
  // ==========================================
  { name: "Cleopatra", gender: "female", category: "history", tags: ["egypt", "queen", "ancient", "pharaoh"], description: "Last active ruler of the Ptolemaic Kingdom of Egypt, famous for intellect and charisma." },
  { name: "Julius Caesar", gender: "male", category: "history", tags: ["rome", "general", "dictator", "rubicon"], description: "Roman general and statesman whose actions led to the rise of the Roman Empire." },
  { name: "Alexander the Great", gender: "male", category: "history", tags: ["macedon", "conqueror", "ancient"], description: "King of Macedonia who created one of the largest empires of the ancient world." },
  { name: "Napoleon Bonaparte", gender: "male", category: "history", tags: ["france", "emperor", "military-genius"], description: "French military and political leader who dominated European affairs." },
  { name: "Abraham Lincoln", gender: "male", category: "history", tags: ["president", "usa", "emancipation"], description: "16th US President who preserved the Union and abolished slavery." },
  { name: "Mahatma Gandhi", gender: "male", category: "history", tags: ["india", "non-violence", "freedom"], description: "Leader of the Indian independence movement through non-violent resistance." },
  { name: "Nelson Mandela", gender: "male", category: "history", tags: ["south-africa", "anti-apartheid", "nobel"], description: "Anti-apartheid revolutionary and first Black president of South Africa." },
  { name: "Leonardo da Vinci", gender: "male", category: "history", tags: ["renaissance", "mona-lisa", "polymath", "inventor"], description: "Renaissance polymath who painted the Mona Lisa and designed flying machines." },
  { name: "Marcus Aurelius", gender: "male", category: "history", tags: ["rome", "philosopher-king", "stoicism"], description: "Roman emperor and Stoic philosopher author of Meditations." },
  { name: "Joan of Arc", gender: "female", category: "history", tags: ["france", "heroine", "saint"], description: "Patron saint of France who led the French army to victory during the Hundred Years' War." },

  // ==========================================
  // ANIME & POP CULTURE ICONS (25)
  // ==========================================
  { name: "Goku (Dragon Ball)", gender: "male", category: "anime", tags: ["saiyan", "kamehameha", "dbz"], description: "Saiyan warrior and defender of Earth from the Dragon Ball franchise." },
  { name: "Naruto Uzumaki", gender: "male", category: "anime", tags: ["ninja", "hokage", "rasengan"], description: "Determined ninja of the Hidden Leaf who became the Seventh Hokage." },
  { name: "Monkey D. Luffy", gender: "male", category: "anime", tags: ["pirate", "one-piece", "straw-hat"], description: "Captain of the Straw Hat Pirates striving to become King of the Pirates." },
  { name: "Levi Ackerman", gender: "male", category: "anime", tags: ["attack-on-titan", "scout-regiment", "humanity-strongest"], description: "Humanity's strongest soldier in Attack on Titan." },
  { name: "Satoru Gojo", gender: "male", category: "anime", tags: ["jujutsu-kaisen", "infinity", "six-eyes"], description: "The strongest Jujutsu sorcerer possessing the Limitless and Six Eyes." },
  { name: "Batman (Bruce Wayne)", gender: "male", category: "fantasy", tags: ["dc", "dark-knight", "superhero"], description: "Billionaire vigilante and protector of Gotham City." },
  { name: "Superman (Clark Kent)", gender: "male", category: "fantasy", tags: ["dc", "man-of-steel", "superhero"], description: "The Man of Steel and ultimate symbol of hope." },
  { name: "Spider-Man (Peter Parker)", gender: "male", category: "fantasy", tags: ["marvel", "web-slinger", "superhero"], description: "Your friendly neighborhood web-slinger from Queens." },
  { name: "Iron Man (Tony Stark)", gender: "male", category: "fantasy", tags: ["marvel", "avenger", "genius"], description: "Genius, billionaire, playboy, philanthropist in powered armor." },
  { name: "Deadpool (Wade Wilson)", gender: "male", category: "fantasy", tags: ["marvel", "merc-with-a-mouth", "fourth-wall"], description: "The unhinged, fourth-wall breaking Merc with a Mouth." },
  { name: "The Joker", gender: "male", category: "fantasy", tags: ["dc", "clown-prince", "villain"], description: "The Clown Prince of Crime and Batman's greatest psychological nemesis." },
  { name: "Harley Quinn", gender: "female", category: "fantasy", tags: ["dc", "anti-hero", "baseball-bat"], description: "Chaotic anti-hero and fan-favorite Gotham wildcard." },
  { name: "Shrek", gender: "male", category: "fantasy", tags: ["ogre", "swamp", "onion", "icon"], description: "Beloved green ogre who values swamp privacy and true love." },
  { name: "Walter White", gender: "male", category: "fantasy", tags: ["breaking-bad", "heisenberg", "chemistry"], description: "High school chemistry teacher turned ruthless methamphetamine kingpin Heisenberg." },
  { name: "Thomas Shelby", gender: "male", category: "fantasy", tags: ["peaky-blinders", "birmingham", "cillian-murphy"], description: "Calculated leader of the Peaky Blinders criminal empire." }
]
