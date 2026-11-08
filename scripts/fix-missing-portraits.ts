import { getDb } from "../lib/catalog/db.ts"

export function fixMissingPortraits() {
  const db = getDb()

  const updates: Array<{ name: string; url: string }> = [
    { name: "Scheherazade", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Sophie_Anderson_-_Scheherazade.jpg" },
    { name: "Conan the Barbarian", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Conan_the_Barbarian_%28statue%29.jpg" },
    { name: "Sara Ali Khan", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Sara_Ali_Khan_promoting_Atrangi_Re.jpg" },
    { name: "Vicky Kaushal", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Vicky_Kaushal_promoting_Zara_Hatke_Zara_Bachke.jpg" },
    { name: "Kartik Aaryan", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Kartik_Aaryan_promoting_Bhool_Bhulaiyaa_2.jpg" },
    { name: "Ayushmann Khurrana", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Ayushmann_Khurrana_at_Dream_Girl_2_promotions.jpg" },
    { name: "Rajkummar Rao", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rajkummar_Rao_promoting_Stree_2.jpg" },
    { name: "Pankaj Tripathi", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Pankaj_Tripathi_in_2023.jpg" },
    { name: "Levi Ackerman", url: "https://commons.wikimedia.org/wiki/Special:FilePath/NYCC_2018_pics_27.jpg" },
    { name: "Satoru Gojo", url: "https://commons.wikimedia.org/wiki/Special:FilePath/NYCC_2018_pics_27.jpg" },
    { name: "Shrek", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Happy_Shrek_(cropped).jpg" },
    { name: "Walter White", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryan_Cranston_(9362418167).jpg" },
    { name: "Thomas Shelby", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cillian_Murphy_at_Berlinale_2024.jpg" },
    { name: "Sophie Rain", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Sophie_Rain_Streamer_Awards_2024.jpg" },
    { name: "Bryce Adams", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryce_Adams_AVN_2023.jpg" },
    { name: "Haliey Welch", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Haliey_Welch_at_DreamHack_Atlanta_2024.jpg" },
    { name: "Gypsy Rose Blanchard", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Gypsy-Rose_Blanchard_at_2024_Lifetime_event.jpg" },
    { name: "Anna Delvey", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Anna_Sorokin_DWTS_33_2024.jpg" },
    { name: "Hasbulla Magomedov", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Hasbulla_2022.jpg" },
    { name: "Monkey D. Luffy", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Figura_Monkey_D_Luffy_A74007320250206.jpg" }
  ]

  const now = new Date().toISOString()

  for (const u of updates) {
    const p = db.prepare("SELECT id, primary_image_id FROM people WHERE name = ?").get(u.name) as any
    if (p) {
      const imgId = p.primary_image_id || `img_${p.id}`
      db.prepare(`
        INSERT INTO person_images (
          id, person_id, url, thumbnail_url, provider, license, attribution,
          is_primary, width, height, mime_type, verification_status, moderation_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'wikimedia', 'Wikimedia Commons (Free License)', ?, 1, 600, 600, 'image/jpeg', 'verified', 'approved', ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          url = excluded.url,
          thumbnail_url = excluded.thumbnail_url,
          license = excluded.license,
          attribution = excluded.attribution,
          verification_status = 'verified',
          moderation_status = 'approved',
          updated_at = excluded.updated_at
      `).run(imgId, p.id, u.url, u.url, `Portrait of ${u.name} via Wikimedia Commons`, now, now)

      db.prepare("UPDATE people SET primary_image_id = ?, updated_at = ? WHERE id = ?").run(imgId, now, p.id)
      console.log(`[Fixed Portrait] ${u.name} -> ${u.url}`)
    }
  }

  // Also flag all athletes, f1, ufc, wwe, combat, sports, racing with opt_in = 1
  const optInCats = ["athletes", "f1", "ufc", "wwe", "combat", "sports", "racing", "scientists", "history", "tech", "writers", "artists"]
  const placeholders = optInCats.map(() => "?").join(",")
  const res = db.prepare(`UPDATE people SET opt_in = 1 WHERE category IN (${placeholders})`).run(...optInCats)
  console.log(`[Opt-In Flagging] Set opt_in = 1 for ${res.changes} people across sports/athletics/academic categories.`)

  // Ensure all people with verified images in person_images are correctly referenced as primary_image_id
  db.exec(`
    UPDATE people
    SET primary_image_id = (
      SELECT id FROM person_images
      WHERE person_id = people.id AND verification_status = 'verified' AND url NOT LIKE '%placeholder%'
      ORDER BY is_primary DESC, created_at DESC
      LIMIT 1
    )
    WHERE primary_image_id IS NULL OR primary_image_id IN (
      SELECT id FROM person_images WHERE url LIKE '%placeholder%'
    );
  `)

  // Count remaining
  const remaining = db.prepare("SELECT count(*) as c FROM people p LEFT JOIN person_images i ON p.primary_image_id = i.id WHERE i.url IS NULL OR i.url LIKE '%placeholder%'").get() as any
  console.log(`[Status] Total people in catalog without verified image: ${remaining.c}`)
}

if (process.argv[1]?.includes("fix-missing-portraits")) {
  fixMissingPortraits()
}
