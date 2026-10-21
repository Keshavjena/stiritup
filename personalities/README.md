# Personality Seed Dataset — 32,389 records, 30,604 with portraits

A drop-in replacement / expansion for your `EXPANDED_PERSONALITIES` array: **32,389 people and
characters** across 15 categories, each with **gender, tags, a one-line description, a stable id,
a popularity score, aliases and a portrait image URL (94.5% coverage)**.

Generated from **Wikidata** (CC0) with images from **Wikimedia Commons** (free licences only).
The whole pipeline is re-runnable, so the dataset can be refreshed or extended any time.

> Want more? Raise the caps in `scripts/build.py` and re-run the commands at the bottom — the
> pipeline is cached and resumable, so a top-up only fetches what's new.

---

## What's in the box

| Path | What it is |
|---|---|
| `src/index.ts` | `EXPANDED_PERSONALITIES`, `PERSONALITIES_BY_CATEGORY`, helpers (`sample`, `byCategory`, `byGender`, `imageUrl`) |
| `src/types.ts` | `Personality`, `SeedPersonality`, `Category`, `Gender` |
| `src/seed/*.ts` | One typed array per category (`Bollywood`, `Hollywood`, `Athletes`, …) |
| `data/personalities.json` | The whole dataset as one JSON array (~14 MB) |
| `data/json/<category>.json` | Same data split per category — lazy-load only what a round needs |
| `data/json/index.json` | `{ "bollywood": 1394, "athletes": 6112, …, "_total": 32389 }` |
| `data/report.md` | QA report (validation results, distributions, live image check) |
| `gallery.html` | Self-contained visual sample sheet (top 6 of every category, images inlined) |
| `data/pick_titles.txt` | The hand-curated "must be present" list (206 titles, incl. your original cast) |
| `scripts/` | `build.py`, `picks.py`, `aliases.py`, `export.py`, `gen_ts.py`, `validate.py`, `gallery.py`, `discover.py` |
| `data/p1/`, `data/details.json`, `data/phase1.json` | Raw caches so re-runs only fetch what's missing |

---

## Schema

```ts
export interface Personality {
  id: string            // Wikidata Q-id — stable unique key ("Q9535")
  name: string          // display name ("Shah Rukh Khan")
  gender: "male" | "female" | "non-binary" | "other"
  category: Category     // see table below
  tags: string[]        // 3-10 lowercase slug tags: ["film-actor","indian","bollywood","legend"]
  description: string   // one sentence, safe to show as a hint
  image: string | null  // Commons portrait URL (null for a few characters with no free image)
  popularity: number    // number of Wikipedia language editions — your difficulty knob
  country: string | null
  birthYear: number | null
  occupations: string[] // raw Wikidata occupations (English)
  aliases: string[]     // up to 6 alternative names — use for search + answer checking
}
```

A record looks like this:

```json
{
  "id": "Q9535",
  "name": "Shah Rukh Khan",
  "gender": "male",
  "category": "bollywood",
  "tags": ["film-actor", "television-actor", "film-producer", "musician", "actor", "indian", "indian-cinema", "bollywood", "legend"],
  "description": "Indian actor, producer and television personality.",
  "image": "https://commons.wikimedia.org/wiki/Special:FilePath/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg",
  "popularity": 136,
  "country": "India",
  "birthYear": 1965,
  "occupations": ["film actor", "television actor", "film producer", "musician", "actor"],
  "aliases": ["King Khan", "SRK"]
}
```

---

## Category coverage

| category | records | what's inside |
|---|---|---|
| athletes | 6,112 | football, cricket, basketball, tennis, boxing, F1, athletics, … |
| history | 4,112 | rulers, politicians, generals, philosophers, activists, explorers |
| singers | 3,701 | singers, rappers, DJs, composers, producers |
| hollywood | 2,732 | US/UK/CA/AU/IE film & TV |
| writers | 2,680 | writers, poets, novelists, journalists |
| fantasy | 2,630 | superheroes, anime/manga, video-game & TV characters |
| actors | 2,116 | world cinema — Korea, Japan, Europe, LatAm, Africa, South Asia… |
| scientists | 1,728 | physicists, chemists, mathematicians, biologists, inventors, physicians |
| glamour | 1,610 | adult-film performers and glamour/erotic models |
| bollywood | 1,394 | Indian film, music and TV |
| artists | 1,154 | painters, directors, comedians, photographers, designers, chefs |
| creators | 928 | YouTubers, streamers, TikTokers, internet celebrities |
| models | 625 | fashion models, Playboy Playmates, glamour models |
| tech | 476 | founders, CEOs, investors, engineers |
| icons | 391 | globally famous figures that don't fit one bucket (da Vinci, Joan of Arc, …) |

Gender split: 21,033 male · 11,302 female · 54 non-binary/other. 94.5% have a portrait.
21,424 records carry at least one alias.

**Difficulty tiers** (from `popularity`): 6,317 "A" (60+ wiki editions) · 14,758 "B" (25–59) ·
8,513 "C" (10–24) · 2,801 "D" (<10). Use A/B for easy rounds and C/D for hard rounds.

Categories come from keyword scoring over each person's Wikidata description (with the raw
occupation list as a fallback), so Mozart lands in *singers*, Messi in *athletes*, van Gogh in
*artists* — rather than inheriting whatever their widest occupation happened to be.

---

## Using it

### TypeScript / bundler

```ts
import { EXPANDED_PERSONALITIES, sample, imageUrl } from "./src"

const round = sample(5, (p) => p.category === "bollywood" && p.popularity >= 25)
round.forEach((p) => console.log(p.name, imageUrl(p, 480)))
```

`src/index.ts` still exports the original name `EXPANDED_PERSONALITIES`, so an existing
`import { EXPANDED_PERSONALITIES } from "./seed"` keeps working — point it at `src/index.ts`
or copy the files over your current one. The original minimal shape is preserved
(`SeedPersonality`); `Personality` just adds fields.

### Plain JS / no bundler

```js
const rows = await (await fetch("/data/json/singers.json")).json()
```

Load one category (100 KB–2 MB) instead of the full ~14 MB file.

### Answer checking with aliases

```ts
const guess = userInput.trim().toLowerCase()
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
const ok = [p.name, ...p.aliases].some((n) => n.toLowerCase() === guess || norm(n) === norm(guess))
```

### Images

`image` is a Wikimedia Commons `Special:FilePath` URL; append `?width=NNN` for a thumbnail
(the helper `imageUrl(p, 480)` does this). It redirects to `upload.wikimedia.org`, so:

* set a descriptive `User-Agent` if you proxy/curl images;
* for production, **cache thumbnails on your own CDN** (download once at `?width=400`, save as
  `public/people/<id>.jpg`, rewrite `image`) — Wikimedia asks that you don't hotlink at volume;
* image licences vary (CC BY-SA, CC BY, public domain, …). If the game shows images publicly,
  keep an "Image: Wikimedia Commons" credit line, or store per-file licence info via
  `https://commons.wikimedia.org/w/api.php?action=query&titles=File:…&prop=imageinfo&iiprop=extmetadata`.

---

## How it was built (and how to extend it)

```bash
python3 scripts/build.py      # Wikidata pull -> data/p1 + data/details.json (cached, resumable)
python3 scripts/picks.py      # guarantees the hand-picked names in data/pick_titles.txt
python3 scripts/aliases.py    # adds English aliases (skos:altLabel)
python3 scripts/export.py     # cleans, dedupes, tags, derives categories -> data/personalities.json
python3 scripts/gen_ts.py     # -> src/seed/*.ts, src/index.ts, data/json/*.json
python3 scripts/validate.py --check-images    # QA report -> data/report.md
python3 scripts/gallery.py    # visual sample sheet -> gallery.html
```

Coverage strategy: flat occupation lists **plus** the subclass closure of each root occupation
(so "theoretical physicist" counts as a physicist), country-scoped fame sweeps for ~20 countries,
a fictional-character sweep by `instance of`, and a curated 206-name pick list that overrides
everything else. Records whose occupation doesn't map to a bucket land in `icons`.

Extending: edit `BUCKETS` / `CLOSURE_ROOTS` in `scripts/build.py` (occupation Q-ids, a cap, a
minimum number of Wikipedia editions, an optional SPARQL filter), delete the matching
`data/p1/<key>.json`, and re-run. Occupation Q-ids are easy to find with `scripts/discover.py`.
Add names to `data/pick_titles.txt` (English Wikipedia titles) to force them in.

---

## Caveats worth knowing

* **Notability varies.** A/B-tier names are globally recognisable; C/D-tier entries (mostly in
  `glamour`, `models`, `creators`, `athletes`) are real, verified, imaged people but obscure —
  great as hard-mode distractors, risky as "who is this?" answers.
* **Categories are approximate.** Someone who is equally a singer and an actress lands in one
  bucket; `occupations` and `description` give you the raw signal if you want stricter rules.
* **Fictional characters** often have no portrait (`image: null`) and no `birthYear`; they're kept
  anyway because they're popular game answers (Naruto, Batman, Tommy Shelby…).
* **Descriptions are Wikidata one-liners**, expanded to "<nationality> <occupation>." when too
  short. Hint-safe, though a few are bland; `tags` and `birthYear` add more guessable surface.
* **Portraits are whatever Wikidata's `P18` says** — no guarantees on framing, age, or flattery.
* **Names use Wikidata's English (or multilingual) label**, with a short-name override for
  hand-picked entries (e.g. "C. V. Raman", whose full name sits in `aliases`).
* Data is a snapshot of Wikidata at build time; the scripts let you refresh it whenever.
