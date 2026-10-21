import { getDb } from "../lib/catalog/db"
import { matchImageForPerson } from "../lib/catalog/matching-pipeline"

const POPULAR_STARS = [
  // Bollywood Actresses & Actors
  "Deepika Padukone",
  "Alia Bhatt",
  "Priyanka Chopra",
  "Katrina Kaif",
  "Kareena Kapoor",
  "Shah Rukh Khan",
  "Hrithik Roshan",
  "Ranbir Kapoor",
  "Ranveer Singh",
  // Hollywood Actresses & Actors
  "Margot Robbie",
  "Sydney Sweeney",
  "Ana de Armas",
  "Scarlett Johansson",
  "Zendaya",
  "Gal Gadot",
  "Henry Cavill",
  "Ryan Gosling",
  "Brad Pitt",
  "Leonardo DiCaprio",
  "Cillian Murphy",
  "Timothée Chalamet",
  // Popstars
  "Taylor Swift",
  "Dua Lipa",
  "Ariana Grande",
  "Rihanna",
  "Billie Eilish",
  "The Weeknd",
  "Harry Styles"
]

async function enrich() {
  const db = getDb()
  console.log(`[Catalog Enrichment] Starting automated image matching for ${POPULAR_STARS.length} top celebrities...`)

  let matchedCount = 0

  for (const name of POPULAR_STARS) {
    const person = db.prepare("SELECT id FROM people WHERE name = ?").get(name) as any
    if (!person) {
      console.log(`- Skipping ${name} (not found in database)`)
      continue
    }

    try {
      const result = await matchImageForPerson(person.id, { autoAttachHighConfidence: true })
      if (result.status === "matched" && result.selectedCandidate?.candidate?.primaryCandidateImage?.url) {
        matchedCount++
        console.log(`✓ Matched ${name}: ${result.selectedCandidate.candidate.primaryCandidateImage.fileName} (Score: ${result.selectedCandidate.score})`)
      } else {
        console.log(`- ${name}: ${result.status} (Score: ${result.selectedCandidate?.score || 0})`)
      }
    } catch (err: any) {
      console.warn(`! Error matching ${name}:`, err.message)
    }

    // Small delay to respect Wikimedia API rate limits
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`[Catalog Enrichment] Finished. Successfully enriched ${matchedCount} celebrities with dynamic portraits!`)
}

enrich()
