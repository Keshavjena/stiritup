const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('data/stiritup.db');
const db = new DatabaseSync(dbPath);

const forbiddenCats = ['writers', 'history', 'scientists', 'tech', 'artists'];
const placeholders = forbiddenCats.map(() => '?').join(',');

console.log('[Purge] Connected to database:', dbPath);
const beforeCount = db.prepare('SELECT count(*) as total FROM people').get().total;
console.log('[Purge] Total people before purge:', beforeCount);

db.exec('BEGIN TRANSACTION;');

try {
  const delImages = db.prepare(`
    DELETE FROM person_images 
    WHERE person_id IN (SELECT id FROM people WHERE category IN (${placeholders}))
  `).run(...forbiddenCats);

  const delPeople = db.prepare(`
    DELETE FROM people 
    WHERE category IN (${placeholders})
  `).run(...forbiddenCats);

  db.exec('COMMIT;');
  console.log('[Purge] Deleted people:', delPeople.changes, '| Deleted images:', delImages.changes);
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('[Purge] Error during purge:', err);
  process.exit(1);
}

const afterCount = db.prepare('SELECT count(*) as total FROM people').get().total;
console.log('[Purge] Total people after purge:', afterCount);

console.log('[Purge] Remaining category breakdown:');
const cats = db.prepare('SELECT category, count(*) as count FROM people GROUP BY category ORDER BY count DESC').all();
console.log(cats);

