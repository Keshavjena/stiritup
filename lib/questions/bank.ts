import { createHash } from 'node:crypto'
import type { DatabaseSync } from 'node:sqlite'
import { getDb } from '../catalog/db'
import legacy from '../game-data/questions-db.json'
import { authoredQuestions } from '../game-data/authored-questions'
import { expansion } from '../game-data/party-expansion'

export type QuestionMode = 'standard' | 'challenge' | 'spicy'
const modes: QuestionMode[] = ['standard', 'challenge', 'spicy']
// Image games and custom games have their own data and must not be replaced by text-only rounds.
const deckGames = [
  'never-have-i-ever', 'truth-or-dare', 'whos-most-likely', 'would-you-rather',
  'if-you-had-to', 'drink-if', 'hot-seat', 'paranoia', 'spin-the-bottle',
  'rapid-fire', 'strip-or-sip', 'emoji-decode', 'role-roulette',
] as const
const seedVersion = 'question-bank-2026-11-07-v1'
const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase()

/** Insert seed cards exactly once, in a transaction. Existing edits and extra rows survive reseeding. */
export function seedQuestionBank(db: DatabaseSync): void {
  if (db.prepare('SELECT 1 FROM question_seed_versions WHERE version = ?').get(seedVersion)) return
  db.exec('BEGIN IMMEDIATE')
  try {
    // Check again after acquiring the write lock for concurrent startup processes.
    if (!db.prepare('SELECT 1 FROM question_seed_versions WHERE version = ?').get(seedVersion)) {
      const insert = db.prepare(`INSERT OR IGNORE INTO question_bank
        (id, game_id, mode, text, normalized_text, source, review_status) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      const legacyDb = legacy as Record<string, Record<string, string[]>>
      for (const game of deckGames) for (const mode of modes) {
        const sources: [string[], string, string][] = [
          [authoredQuestions[game]?.[mode] ?? [], 'authored-v1', 'unreviewed'],
          [legacyDb[game]?.[mode] ?? [], 'legacy-json', 'legacy'],
          [expansion(game, mode), 'modular-expansion-v1', 'generated'],
        ]
        for (const [cards, source, status] of sources) for (const raw of cards) {
          if (typeof raw !== 'string' || !raw.trim()) continue
          const text = raw.trim().replace(/\s+/g, ' ')
          const key = normalize(text)
          const id = createHash('sha256').update(`${game}\0${mode}\0${key}`).digest('hex')
          insert.run(id, game, mode, text, key, source, status)
        }
      }
      db.prepare('INSERT INTO question_seed_versions (version, applied_at) VALUES (?, ?)').run(seedVersion, new Date().toISOString())
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function getQuestionDb(): DatabaseSync {
  const db = getDb()
  seedQuestionBank(db)
  return db
}

export function readQuestionDeck(db: DatabaseSync, gameId: string, mode: QuestionMode): string[] {
  return (db.prepare('SELECT text FROM question_bank WHERE game_id = ? AND mode = ?').all(gameId, mode) as { text: string }[]).map(row => row.text)
}

export function getQuestionInventory(db: DatabaseSync) {
  return db.prepare(`SELECT game_id AS gameId, mode, source, review_status AS reviewStatus, COUNT(*) AS count
    FROM question_bank GROUP BY game_id, mode, source, review_status ORDER BY game_id, mode, source`).all()
}
