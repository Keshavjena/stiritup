export interface Celebrity {
  name: string
  gender: "female" | "male"
  category: "bollywood" | "hollywood" | "popstars" | "adultstars" | "fantasy" | "creators" | "athletes" | "f1" | "combat" | "wwe" | "viral" | "tech" | "scientists" | "history"
  tags?: string[]
}

export const FEMALE_CELEBRITIES: Celebrity[] = [
  // Bollywood Actresses
  { name: "Deepika Padukone", gender: "female", category: "bollywood" },
  { name: "Katrina Kaif", gender: "female", category: "bollywood" },
  { name: "Alia Bhatt", gender: "female", category: "bollywood" },
  { name: "Priyanka Chopra", gender: "female", category: "bollywood" },
  { name: "Kiara Advani", gender: "female", category: "bollywood" },
  { name: "Shraddha Kapoor", gender: "female", category: "bollywood" },
  { name: "Kriti Sanon", gender: "female", category: "bollywood" },
  { name: "Disha Patani", gender: "female", category: "bollywood" },
  { name: "Janhvi Kapoor", gender: "female", category: "bollywood" },
  { name: "Kareena Kapoor", gender: "female", category: "bollywood" },
  { name: "Aishwarya Rai", gender: "female", category: "bollywood" },
  { name: "Ananya Panday", gender: "female", category: "bollywood" },
  { name: "Tripti Dimri", gender: "female", category: "bollywood" },
  { name: "Tara Sutaria", gender: "female", category: "bollywood" },
  { name: "Rashmika Mandanna", gender: "female", category: "bollywood" },
  { name: "Samantha Ruth Prabhu", gender: "female", category: "bollywood" },
  { name: "Nora Fatehi", gender: "female", category: "bollywood" },

  // Hollywood Actresses
  { name: "Margot Robbie", gender: "female", category: "hollywood" },
  { name: "Sydney Sweeney", gender: "female", category: "hollywood" },
  { name: "Ana de Armas", gender: "female", category: "hollywood" },
  { name: "Scarlett Johansson", gender: "female", category: "hollywood" },
  { name: "Zendaya", gender: "female", category: "hollywood" },
  { name: "Gal Gadot", gender: "female", category: "hollywood" },
  { name: "Jennifer Lawrence", gender: "female", category: "hollywood" },
  { name: "Emma Stone", gender: "female", category: "hollywood" },
  { name: "Alexandra Daddario", gender: "female", category: "hollywood" },
  { name: "Salma Hayek", gender: "female", category: "hollywood" },
  { name: "Megan Fox", gender: "female", category: "hollywood" },
  { name: "Emma Watson", gender: "female", category: "hollywood" },
  { name: "Florence Pugh", gender: "female", category: "hollywood" },
  { name: "Elizabeth Olsen", gender: "female", category: "hollywood" },
  { name: "Angelina Jolie", gender: "female", category: "hollywood" },

  // Pop Stars & Music Artists
  { name: "Dua Lipa", gender: "female", category: "popstars" },
  { name: "Taylor Swift", gender: "female", category: "popstars" },
  { name: "Ariana Grande", gender: "female", category: "popstars" },
  { name: "Rihanna", gender: "female", category: "popstars" },
  { name: "Sabrina Carpenter", gender: "female", category: "popstars" },
  { name: "Billie Eilish", gender: "female", category: "popstars" },
  { name: "Blackpink Lisa", gender: "female", category: "popstars" },
  { name: "Olivia Rodrigo", gender: "female", category: "popstars" },
  { name: "Selena Gomez", gender: "female", category: "popstars" },
  { name: "Katy Perry", gender: "female", category: "popstars" },
  { name: "Shakira", gender: "female", category: "popstars" },
  { name: "Camila Cabello", gender: "female", category: "popstars" },

  // Creators & Influencers
  { name: "Charli D'Amelio", gender: "female", category: "creators", tags: ["tiktok", "influencer"] },
  { name: "Addison Rae", gender: "female", category: "creators", tags: ["tiktok", "actress"] },
  { name: "Emma Chamberlain", gender: "female", category: "creators", tags: ["youtube", "fashion"] },
  { name: "Pokimane", gender: "female", category: "creators", tags: ["twitch", "streamer"] },
  { name: "Alix Earle", gender: "female", category: "creators", tags: ["tiktok", "grwm"] },
  { name: "Tana Mongeau", gender: "female", category: "creators", tags: ["youtube", "cancelled"] },

  // OnlyFans Models & Adult Stars
  { name: "Bhad Bhabie", gender: "female", category: "adultstars", tags: ["onlyfans", "viral"] },
  { name: "Corinna Kopf", gender: "female", category: "adultstars", tags: ["onlyfans", "vlog-squad"] },
  { name: "Amouranth", gender: "female", category: "adultstars", tags: ["onlyfans", "twitch"] },
  { name: "Sophie Rain", gender: "female", category: "adultstars", tags: ["onlyfans", "viral"] },
  { name: "Bryce Adams", gender: "female", category: "adultstars", tags: ["onlyfans", "fitness"] },
  { name: "Belle Delphine", gender: "female", category: "adultstars", tags: ["onlyfans", "bath-water"] },
  { name: "Mia Khalifa", gender: "female", category: "adultstars" },
  { name: "Riley Reid", gender: "female", category: "adultstars" },
  { name: "Abella Danger", gender: "female", category: "adultstars" },
  { name: "Lana Rhoades", gender: "female", category: "adultstars" },
  { name: "Angela White", gender: "female", category: "adultstars" },
  { name: "Eva Elfie", gender: "female", category: "adultstars" },
  { name: "Kendra Lust", gender: "female", category: "adultstars" },

  // WWE / Combat / Sports
  { name: "Rhea Ripley", gender: "female", category: "athletes", tags: ["wwe", "mami"] },
  { name: "Becky Lynch", gender: "female", category: "athletes", tags: ["wwe", "the-man"] },
  { name: "Ronda Rousey", gender: "female", category: "athletes", tags: ["ufc", "wwe"] },
  { name: "Serena Williams", gender: "female", category: "athletes", tags: ["tennis", "goat"] },

  // Viral / Memorable Personalities
  { name: "Haliey Welch", gender: "female", category: "creators", tags: ["hawk-tuah", "viral"] },
  { name: "Gypsy Rose Blanchard", gender: "female", category: "creators", tags: ["true-crime", "viral"] },
  { name: "Monica Lewinsky", gender: "female", category: "hollywood", tags: ["pop-culture", "activist"] },

  // Anime & Fantasy Characters
  { name: "Mikasa Ackerman", gender: "female", category: "fantasy" },
  { name: "Hinata Hyuga", gender: "female", category: "fantasy" },
  { name: "Tsunade", gender: "female", category: "fantasy" },
  { name: "Nami (One Piece)", gender: "female", category: "fantasy" },
  { name: "Nico Robin", gender: "female", category: "fantasy" },
  { name: "Wonder Woman", gender: "female", category: "fantasy" },
  { name: "Harley Quinn", gender: "female", category: "fantasy" },
  { name: "Black Widow", gender: "female", category: "fantasy" },
  { name: "Catwoman", gender: "female", category: "fantasy" },
  { name: "Daenerys Targaryen", gender: "female", category: "fantasy" },
  { name: "Wednesday Addams", gender: "female", category: "fantasy" },
  { name: "2B (NieR Automata)", gender: "female", category: "fantasy" }
]

export const MALE_CELEBRITIES: Celebrity[] = [
  // Bollywood Actors
  { name: "Shah Rukh Khan", gender: "male", category: "bollywood" },
  { name: "Hrithik Roshan", gender: "male", category: "bollywood" },
  { name: "Ranbir Kapoor", gender: "male", category: "bollywood" },
  { name: "Ranveer Singh", gender: "male", category: "bollywood" },
  { name: "Shahid Kapoor", gender: "male", category: "bollywood" },
  { name: "Sidharth Malhotra", gender: "male", category: "bollywood" },
  { name: "Vicky Kaushal", gender: "male", category: "bollywood" },
  { name: "Salman Khan", gender: "male", category: "bollywood" },
  { name: "Kartik Aaryan", gender: "male", category: "bollywood" },
  { name: "Aditya Roy Kapur", gender: "male", category: "bollywood" },
  { name: "Akshay Kumar", gender: "male", category: "bollywood" },
  { name: "Varun Dhawan", gender: "male", category: "bollywood" },
  { name: "Prabhas", gender: "male", category: "bollywood" },
  { name: "Vijay Deverakonda", gender: "male", category: "bollywood" },

  // Hollywood Actors
  { name: "Henry Cavill", gender: "male", category: "hollywood" },
  { name: "Ryan Gosling", gender: "male", category: "hollywood" },
  { name: "Brad Pitt", gender: "male", category: "hollywood" },
  { name: "Leonardo DiCaprio", gender: "male", category: "hollywood" },
  { name: "Chris Hemsworth", gender: "male", category: "hollywood" },
  { name: "Timothée Chalamet", gender: "male", category: "hollywood" },
  { name: "Cillian Murphy", gender: "male", category: "hollywood" },
  { name: "Tom Hardy", gender: "male", category: "hollywood" },
  { name: "Pedro Pascal", gender: "male", category: "hollywood" },
  { name: "Keanu Reeves", gender: "male", category: "hollywood" },
  { name: "Robert Downey Jr.", gender: "male", category: "hollywood" },
  { name: "Tom Cruise", gender: "male", category: "hollywood" },
  { name: "Tom Holland", gender: "male", category: "hollywood" },
  { name: "The Rock", gender: "male", category: "hollywood", tags: ["wwe", "actor"] },
  { name: "John Cena", gender: "male", category: "hollywood", tags: ["wwe", "actor"] },

  // Pop Stars & Music Artists
  { name: "The Weeknd", gender: "male", category: "popstars" },
  { name: "Drake", gender: "male", category: "popstars" },
  { name: "Harry Styles", gender: "male", category: "popstars" },
  { name: "Justin Bieber", gender: "male", category: "popstars" },
  { name: "Eminem", gender: "male", category: "popstars" },
  { name: "Kendrick Lamar", gender: "male", category: "popstars" },
  { name: "Bruno Mars", gender: "male", category: "popstars" },
  { name: "Post Malone", gender: "male", category: "popstars" },

  // Creators & YouTubers & Influencers
  { name: "MrBeast", gender: "male", category: "creators", tags: ["youtube", "king-of-youtube"] },
  { name: "PewDiePie", gender: "male", category: "creators", tags: ["youtube", "gaming"] },
  { name: "IShowSpeed", gender: "male", category: "creators", tags: ["streamer", "speed"] },
  { name: "Kai Cenat", gender: "male", category: "creators", tags: ["twitch", "streamer"] },
  { name: "Logan Paul", gender: "male", category: "creators", tags: ["youtube", "wwe"] },
  { name: "Jake Paul", gender: "male", category: "creators", tags: ["boxing", "youtube"] },
  { name: "KSI", gender: "male", category: "creators", tags: ["sidemen", "youtube"] },
  { name: "xQc", gender: "male", category: "creators", tags: ["twitch", "kick"] },
  { name: "Joe Rogan", gender: "male", category: "creators", tags: ["podcast", "ufc"] },
  { name: "Theo Von", gender: "male", category: "creators", tags: ["comedian", "podcast"] },
  { name: "Adin Ross", gender: "male", category: "creators", tags: ["streamer", "kick"] },
  { name: "Gordon Ramsay", gender: "male", category: "creators", tags: ["chef", "viral"] },

  // Formula 1 Stars
  { name: "Max Verstappen", gender: "male", category: "athletes", tags: ["f1", "champion"] },
  { name: "Lewis Hamilton", gender: "male", category: "athletes", tags: ["f1", "goat"] },
  { name: "Charles Leclerc", gender: "male", category: "athletes", tags: ["f1", "ferrari"] },
  { name: "Lando Norris", gender: "male", category: "athletes", tags: ["f1", "mclaren"] },
  { name: "Fernando Alonso", gender: "male", category: "athletes", tags: ["f1", "legend"] },

  // UFC & Combat Sports
  { name: "Conor McGregor", gender: "male", category: "athletes", tags: ["ufc", "notorious"] },
  { name: "Khabib Nurmagomedov", gender: "male", category: "athletes", tags: ["ufc", "eagle"] },
  { name: "Jon Jones", gender: "male", category: "athletes", tags: ["ufc", "goat"] },
  { name: "Sean O'Malley", gender: "male", category: "athletes", tags: ["ufc", "suga"] },
  { name: "Alex Pereira", gender: "male", category: "athletes", tags: ["ufc", "poatan"] },
  { name: "Mike Tyson", gender: "male", category: "athletes", tags: ["boxing", "iron-mike"] },
  { name: "Floyd Mayweather", gender: "male", category: "athletes", tags: ["boxing", "money"] },

  // WWE Superstars
  { name: "Roman Reigns", gender: "male", category: "athletes", tags: ["wwe", "tribal-chief"] },
  { name: "The Undertaker", gender: "male", category: "athletes", tags: ["wwe", "deadman"] },
  { name: "Stone Cold Steve Austin", gender: "male", category: "athletes", tags: ["wwe", "316"] },
  { name: "Cody Rhodes", gender: "male", category: "athletes", tags: ["wwe", "american-nightmare"] },
  { name: "Randy Orton", gender: "male", category: "athletes", tags: ["wwe", "rko"] },
  { name: "Brock Lesnar", gender: "male", category: "athletes", tags: ["wwe", "ufc"] },

  // Popular Sports Stars
  { name: "Lionel Messi", gender: "male", category: "athletes", tags: ["football", "goat"] },
  { name: "Cristiano Ronaldo", gender: "male", category: "athletes", tags: ["football", "cr7"] },
  { name: "Kylian Mbappé", gender: "male", category: "athletes", tags: ["football", "real-madrid"] },
  { name: "Neymar Jr", gender: "male", category: "athletes", tags: ["football", "brazil"] },
  { name: "Erling Haaland", gender: "male", category: "athletes", tags: ["football", "man-city"] },
  { name: "David Beckham", gender: "male", category: "athletes", tags: ["football", "legend"] },
  { name: "LeBron James", gender: "male", category: "athletes", tags: ["basketball", "goat"] },
  { name: "Michael Jordan", gender: "male", category: "athletes", tags: ["basketball", "goat"] },
  { name: "Stephen Curry", gender: "male", category: "athletes", tags: ["basketball", "warriors"] },
  { name: "Kobe Bryant", gender: "male", category: "athletes", tags: ["basketball", "mamba"] },
  { name: "Virat Kohli", gender: "male", category: "athletes", tags: ["cricket", "king"] },
  { name: "MS Dhoni", gender: "male", category: "athletes", tags: ["cricket", "thala"] },
  { name: "Roger Federer", gender: "male", category: "athletes", tags: ["tennis", "legend"] },
  { name: "Usain Bolt", gender: "male", category: "athletes", tags: ["athletics", "fastest"] },

  // Viral / Memorable Personalities
  { name: "Chesley Sullenberger", gender: "male", category: "hollywood", tags: ["miracle-on-hudson", "hero"] },
  { name: "Salt Bae", gender: "male", category: "creators", tags: ["viral", "salt-bae"] },
  { name: "Hasbulla Magomedov", gender: "male", category: "creators", tags: ["hasbulla", "viral"] },

  // Anime & Fantasy Characters
  { name: "Goku", gender: "male", category: "fantasy" },
  { name: "Naruto Uzumaki", gender: "male", category: "fantasy" },
  { name: "Monkey D. Luffy", gender: "male", category: "fantasy" },
  { name: "Gojo Satoru", gender: "male", category: "fantasy" },
  { name: "Levi Ackerman", gender: "male", category: "fantasy" },
  { name: "Batman (Bruce Wayne)", gender: "male", category: "fantasy" },
  { name: "Superman (Clark Kent)", gender: "male", category: "fantasy" },
  { name: "Spider-Man (Peter Parker)", gender: "male", category: "fantasy" },
  { name: "Iron Man (Tony Stark)", gender: "male", category: "fantasy" },
  { name: "Deadpool (Wade Wilson)", gender: "male", category: "fantasy" },
  { name: "Walter White", gender: "male", category: "fantasy" },
  { name: "Thomas Shelby", gender: "male", category: "fantasy" }
]
