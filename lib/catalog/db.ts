import { DatabaseSync } from "node:sqlite"
import fs from "node:fs"
import path from "node:path"

let instance: DatabaseSync | null = null

export function getDatabasePath(): string {
  if (process.env.CATALOG_DB_PATH) {
    return process.env.CATALOG_DB_PATH
  }
  // Store db in project root ./data/stiritup.db
  const dataDir = path.resolve(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true })
    } catch {
      // In read-only environments (e.g. some serverless containers), fallback to /tmp or memory
      const tmpDir = path.resolve("/tmp", "stiritup")
      if (!fs.existsSync(tmpDir)) {
        try {
          fs.mkdirSync(tmpDir, { recursive: true })
          return path.join(tmpDir, "stiritup.db")
        } catch {
          return ":memory:"
        }
      }
      return path.join(tmpDir, "stiritup.db")
    }
  }
  return path.join(dataDir, "stiritup.db")
}

export function runMigrations(db: DatabaseSync) {
  // 1. Create migration tracker table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _applied_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `)

  const migrationsDir = path.resolve(process.cwd(), "migrations")
  let migrationFiles: string[] = []

  if (fs.existsSync(migrationsDir)) {
    migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
  }

  const checkStmt = db.prepare("SELECT name FROM _applied_migrations WHERE name = ?")
  const recordStmt = db.prepare(
    "INSERT INTO _applied_migrations (name, applied_at) VALUES (?, ?)"
  )

  for (const filename of migrationFiles) {
    const existing = checkStmt.get(filename)
    if (!existing) {
      const filePath = path.join(migrationsDir, filename)
      const sql = fs.readFileSync(filePath, "utf-8")
      
      // Execute migration
      db.exec(sql)
      recordStmt.run(filename, new Date().toISOString())
      console.log(`[Database] Applied migration: ${filename}`)
    }
  }
}

export function getDb(customPath?: string): DatabaseSync {
  if (instance) {
    return instance
  }

  const dbPath = customPath || getDatabasePath()
  instance = new DatabaseSync(dbPath)

  // Configure SQLite pragmas for optimal concurrency & integrity
  instance.exec("PRAGMA journal_mode = WAL;")
  instance.exec("PRAGMA foreign_keys = ON;")

  // Automatically ensure migrations are applied
  runMigrations(instance)

  return instance
}

export function closeDb(): void {
  if (instance) {
    try {
      instance.close()
    } catch (e) {
      console.error("[Database] Error closing database:", e)
    }
    instance = null
  }
}

export function resetDbForTesting(): DatabaseSync {
  closeDb()
  const db = new DatabaseSync(":memory:")
  db.exec("PRAGMA foreign_keys = ON;")
  runMigrations(db)
  instance = db
  return db
}
