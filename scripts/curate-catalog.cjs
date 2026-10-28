const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('data/stiritup.db');
const db = new DatabaseSync(dbPath);

console.log('[Curate Catalog] Connected to database:', dbPath);

const aPlusScientists = [
  'albert einstein', 'isaac newton', 'nikola tesla', 'marie curie',
  'stephen hawking', 'alan turing', 'galileo galilei', 'charles darwin',
  'j. robert oppenheimer', 'robert oppenheimer', 'oppenheimer', 'leonardo da vinci',
  'archimedes', 'thomas edison', 'alexander graham bell', 'louis pasteur',
  'alexander fleming', 'carl sagan', 'erwin schrodinger', 'erwin schrödinger',
  'richard feynman', 'ada lovelace', 'niels bohr', 'max planck',
  'michael faraday', 'rosalind franklin', 'johannes kepler', 'dmitri mendeleev',
  'aristotle', 'pythagoras'
];

const aPlusHistory = [
  'cleopatra', 'julius caesar', 'alexander the great', 'napoleon bonaparte',
  'napoleon', 'abraham lincoln', 'mahatma gandhi', 'nelson mandela',
  'marcus aurelius', 'joan of arc', 'winston churchill', 'george washington',
  'queen elizabeth ii', 'elizabeth ii', 'martin luther king jr.', 'martin luther king',
  'genghis khan', 'queen victoria', 'john f. kennedy', 'jfk',
  'barack obama', 'donald trump', 'princess diana', 'che guevara',
  'henry viii', 'tutankhamun', 'king tut', 'nero', 'theodore roosevelt',
  'franklin d. roosevelt', 'fdr'
];

const beforeCount = db.prepare('SELECT count(*) as total FROM people').get().total;
console.log('[Curate Catalog] Total people before cleanup:', beforeCount);

const placeholdersSci = aPlusScientists.map(() => '?').join(',');
const placeholdersHist = aPlusHistory.map(() => '?').join(',');

db.exec('BEGIN TRANSACTION;');

try {
  // 1. Delete obscure images first
  const delImg = db.prepare(`
    DELETE FROM person_images
    WHERE person_id IN (
      SELECT id FROM people
      WHERE (category = 'scientists' AND normalized_name NOT IN (${placeholdersSci}))
         OR (category = 'history' AND normalized_name NOT IN (${placeholdersHist}))
         OR (category IN ('writers', 'artists') AND (popularity < 120 OR popularity IS NULL))
         OR (category NOT IN ('scientists', 'history', 'writers', 'artists') AND (popularity < 50 OR popularity IS NULL) AND provider = 'wikidata')
    )
  `).run(...aPlusScientists, ...aPlusHistory);

  // 2. Delete obscure people
  const delPeople = db.prepare(`
    DELETE FROM people
    WHERE (category = 'scientists' AND normalized_name NOT IN (${placeholdersSci}))
       OR (category = 'history' AND normalized_name NOT IN (${placeholdersHist}))
       OR (category IN ('writers', 'artists') AND (popularity < 120 OR popularity IS NULL))
       OR (category NOT IN ('scientists', 'history', 'writers', 'artists') AND (popularity < 50 OR popularity IS NULL) AND provider = 'wikidata')
  `).run(...aPlusScientists, ...aPlusHistory);

  db.exec('COMMIT;');
  console.log(`[Curate Catalog] Pruned ${delPeople.changes} obscure people and ${delImg.changes} associated images.`);
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('[Curate Catalog] Error during prune:', err);
  process.exit(1);
}

const midCount = db.prepare('SELECT count(*) as total FROM people').get().total;
console.log('[Curate Catalog] People after pruning:', midCount);

// 3. Now ensure all local and curated personalities have popularity >= 90
db.prepare(`UPDATE people SET popularity = 95 WHERE provider = 'local' OR popularity = 0 OR popularity IS NULL`).run();

// 4. Print breakdown of categories now in DB
const cats = db.prepare('SELECT category, count(*) as count FROM people GROUP BY category ORDER BY count DESC').all();
console.log('[Curate Catalog] Category breakdown after cleanup:');
console.table(cats);

