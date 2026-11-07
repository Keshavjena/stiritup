# Game content audit

The question API now reads seeded SQLite rows; `questions-db.json` is the legacy seed, and `questions.ts` is the client fallback. Run `npm run questions:inventory` or visit `/question-bank` for exact live counts by source and mode. Before this expansion, some API decks contained as few as 3–11 cards per mode. Both paths now add the modular decks in `party-expansion.ts`, deduplicating within each deck. The new material is built from authored subjects, formats and scenarios: it produces thousands of distinct combinations, rather than thousands of individually written questions. Some formats are deliberately shared across modes, so mode totals should not be added together as unique content.

- Never Have I Ever and Drink If: 90 additional prompts each across the three topic sets.
- Truth or Dare: 1,300 distinct additional truth/dare combinations across modes.
- Most Likely, Hot Seat and Paranoia: 900 additional combinations each across modes.
- If You Had To and Role Roulette: 400 each. Spin the Bottle and Strip or Sip: 400 each, with passing allowed in the new prompts.
- Rapid Fire: 190 comparisons. Emoji Decode: 30 emoji/answer pairs. Would You Rather has 190 fallback comparisons; its normal path still prioritizes synchronized celebrity image rounds, so those fallback questions are only used if image generation fails.
- Indian Drinking Game and Drama-Dol have separate component decks. These now use shuffled new performance and conversation banks rather than their small, sometimes coercive old lists. Cards Against Humanity has 40 original black cards and 60 original white cards added to its existing deck.
- Kiss Marry Kill uses the celebrity catalog and its own round generator, Draft Arena uses draft presets/catalogs, and Custom Game uses player-supplied prompts. These are not normal question decks and were not replaced with unrelated prompts.

Standard content remains selected when mature content is disabled. Existing legacy question and comedy-card banks remain in place and have not been individually safety- or quality-reviewed; some contain adult or drinking references. The new spicy topics are flirtatious rather than explicit. Emoji answers appear on the same card because the current game has no answer-reveal control. Further editorial review and a dedicated reveal UI would improve these games.

The SQLite bank stores concrete game/mode/text rows with stable IDs, source and review status. The seed is idempotent and does not overwrite existing rows. Most rows are template-generated combinations, not individually reviewed questions; the same text may be stored for multiple modes. The authored cards are separately labeled unreviewed. Special component games and person/draft catalogs are not included in the question-bank totals.

To ship a seed update, add the new source cards and bump `seedVersion` in `lib/questions/bank.ts`; inserts are transactional and existing matching rows are not overwritten. Rows are deduplicated by game, mode and normalized text. The current seed is not an editorial CMS: changes to individual database rows are local to that database, and an empty or unavailable deck can fall back to bundled content. Do not rely on deletion alone as a moderation or suppression mechanism.
