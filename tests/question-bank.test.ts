import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runMigrations } from '../lib/catalog/db'
import { seedQuestionBank, readQuestionDeck, getQuestionInventory } from '../lib/questions/bank'
import { GET as getInventory } from '../app/api/questions/inventory/route'
import { GET as getQuestions } from '../app/api/questions/route'
import { NextRequest } from 'next/server'

test('seed persists concrete cards, is idempotent and preserves edits', () => {
  const dir = mkdtempSync(join(tmpdir(), 'party-bank-'))
  const path = join(dir, 'bank.db')
  try {
    let db = new DatabaseSync(path)
    runMigrations(db)
    seedQuestionBank(db)
    const count = (db.prepare('SELECT COUNT(*) AS count FROM question_bank').get() as { count: number }).count
    assert.ok(count > 10000, `expected thousands of stored rows, got ${count}`)
    const before = readQuestionDeck(db, 'hot-seat', 'standard')
    assert.ok(before.includes('What small act of kindness do you still remember?'))
    assert.ok(getQuestionInventory(db).some((row: any) => row.source === 'modular-expansion-v1' && row.reviewStatus === 'generated'))
    db.prepare('DELETE FROM question_bank WHERE game_id = ? AND text = ?').run('hot-seat', 'What small act of kindness do you still remember?')
    seedQuestionBank(db)
    assert.equal(readQuestionDeck(db, 'hot-seat', 'standard').length, before.length - 1)
    db.close()
    db = new DatabaseSync(path)
    runMigrations(db)
    seedQuestionBank(db)
    assert.equal(readQuestionDeck(db, 'hot-seat', 'standard').length, before.length - 1)
    db.close()
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

test('API serves SQLite decks, exposes honest inventory and gates mature modes', async () => {
  const response = await getQuestions(new NextRequest('http://localhost/api/questions?gameId=hot-seat&mature=false&mode=spicy&limit=1000'))
  const data = await response.json()
  assert.equal(data.source, 'sqlite')
  assert.ok(data.questions.includes('What small act of kindness do you still remember?'))
  assert.ok(!data.questions.includes('What kind of compliment actually makes you blush?'))
  const inventory = await (await getInventory()).json()
  assert.ok(inventory.success)
  assert.ok(inventory.decks.some((d: any) => d.gameId === 'hot-seat' && d.mode === 'standard' && d.source === 'authored-v1'))
})
