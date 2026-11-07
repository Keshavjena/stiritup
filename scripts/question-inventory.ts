import { getQuestionDb, getQuestionInventory } from '../lib/questions/bank'
import { closeDb, getDatabasePath } from '../lib/catalog/db'

const db = getQuestionDb()
const decks = getQuestionInventory(db)
console.log(`Question database: ${getDatabasePath()}`)
console.table(decks)
console.table(db.prepare('SELECT source, review_status AS reviewStatus, COUNT(*) AS count FROM question_bank GROUP BY source, review_status').all())
console.log('Total rows:', (db.prepare('SELECT COUNT(*) AS count FROM question_bank').get() as { count: number }).count)
closeDb()
