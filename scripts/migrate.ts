import { getDb, runMigrations } from "../lib/catalog/db"
import { seedInitialCatalog } from "../lib/catalog/service"

console.log("[Migration Runner] Initializing database and running migrations...")
const db = getDb()
runMigrations(db)
console.log("[Migration Runner] Seeding default catalog...")
const result = seedInitialCatalog()
console.log(`[Migration Runner] Completed. Seeded: ${result.seeded}, Existing: ${result.existing}`)
process.exit(0)
