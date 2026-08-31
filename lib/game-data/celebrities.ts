export interface Celebrity {
  name: string
  gender: "female" | "male"
  category: "bollywood" | "hollywood" | "popstars" | "adultstars" | "fantasy"
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

  // Adult Stars & Models
  { name: "Mia Khalifa", gender: "female", category: "adultstars" },
  { name: "Riley Reid", gender: "female", category: "adultstars" },
  { name: "Abella Danger", gender: "female", category: "adultstars" },
  { name: "Lana Rhoades", gender: "female", category: "adultstars" },
  { name: "Angela White", gender: "female", category: "adultstars" },
  { name: "Mia Malkova", gender: "female", category: "adultstars" },
  { name: "Eva Elfie", gender: "female", category: "adultstars" },
  { name: "Kendra Lust", gender: "female", category: "adultstars" },
  { name: "Sweetie Fox", gender: "female", category: "adultstars" },
  { name: "Nicole Aniston", gender: "female", category: "adultstars" },

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
  { name: "Zac Efron", gender: "male", category: "hollywood" },
  { name: "Keanu Reeves", gender: "male", category: "hollywood" },
  { name: "Robert Pattinson", gender: "male", category: "hollywood" },
  { name: "Tom Holland", gender: "male", category: "hollywood" },
  { name: "Jacob Elordi", gender: "male", category: "hollywood" },

  // Pop Stars & Music Artists
  { name: "The Weeknd", gender: "male", category: "popstars" },
  { name: "Drake", gender: "male", category: "popstars" },
  { name: "Harry Styles", gender: "male", category: "popstars" },
  { name: "Justin Bieber", gender: "male", category: "popstars" },
  { name: "Zayn Malik", gender: "male", category: "popstars" },
  { name: "BTS Jungkook", gender: "male", category: "popstars" },
  { name: "Bad Bunny", gender: "male", category: "popstars" },
  { name: "Shawn Mendes", gender: "male", category: "popstars" },
  { name: "Post Malone", gender: "male", category: "popstars" },
  { name: "Bruno Mars", gender: "male", category: "popstars" },

  // Adult Stars / Male Models
  { name: "Johnny Sins", gender: "male", category: "adultstars" },
  { name: "Jordi El Nino Polla", gender: "male", category: "adultstars" },
  { name: "Manuel Ferrara", gender: "male", category: "adultstars" },
  { name: "Danny D", gender: "male", category: "adultstars" },

  // Anime & Fantasy Characters
  { name: "Gojo Satoru", gender: "male", category: "fantasy" },
  { name: "Levi Ackerman", gender: "male", category: "fantasy" },
  { name: "Batman (Bruce Wayne)", gender: "male", category: "fantasy" },
  { name: "Superman (Clark Kent)", gender: "male", category: "fantasy" },
  { name: "Thor", gender: "male", category: "fantasy" },
  { name: "Geralt of Rivia", gender: "male", category: "fantasy" },
  { name: "Daemon Targaryen", gender: "male", category: "fantasy" },
  { name: "Spider-Man (Peter Parker)", gender: "male", category: "fantasy" },
  { name: "Iron Man (Tony Stark)", gender: "male", category: "fantasy" },
  { name: "Roronoa Zoro", gender: "male", category: "fantasy" }
]
