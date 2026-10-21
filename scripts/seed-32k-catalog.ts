import { seed32kCatalog } from "../lib/catalog/seed-32k"

export { seed32kCatalog }

// Allow direct execution: `npx tsx scripts/seed-32k-catalog.ts`
if (process.argv[1] && (process.argv[1].endsWith("seed-32k-catalog.ts") || process.argv[1].endsWith("seed-32k-catalog"))) {
  try {
    seed32kCatalog({ logProgress: true })
  } catch (err) {
    console.error("[Seed 32k] Error:", err)
    process.exit(1)
  }
}
