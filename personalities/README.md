# Personality Seed Dataset — 18,193 records, every one with a portrait, nobody over 70

Built for **Kiss Marry Kill** and **Draft** style rounds. Three hard rules are enforced on every
record:

1. **Age ≤ 70** — age now for the living, age at death for the deceased.
2. **A portrait image must exist** — 18,193 / 18,193 have one (100%). No `image: null` anywhere.
3. **Recognisable only** — every person clears a fame bar (Wikipedia sitelinks, or the fame of
   their best-known show / film / team). Fictional characters come only from A-tier franchises.

Plus a **`beauty` signal** so "only beautiful people" rounds are possible, and the dataset is split
into a **visual pool** (default) vs **non-visual** and **opt-in** pools.

---

## Pools

| pool | size | who |
|---|---|---|
| `EXPANDED_PERSONALITIES` | **16,133** | default: actors, singers, athletes, models, glamour/18+, creators, fictional characters — `visual: true` |
| `NON_VISUAL_PERSONALITIES` | 1,353 | writers, tech, icons, art figures — recognisable but not a looks round |
| `OPT_IN_PERSONALITIES` | 707 | scientists (140) + history (567), **A+ only**, never in a default round |
| `ALL_PERSONALITIES` | 18,193 | everything |
| `beautyFirst()` | 3,191 | `beauty === 2`: models, pageant winners, adult/OnlyFans performers |

`beauty` is `2` when looks are the profession, `1` for visual performers (actors, singers,
athletes, creators, characters), `0` for writers/tech/icons.

---

## Coverage

| category | records | | category | records |
|---|---|---|---|---|
| hollywood | 3,910 | | creators & influencers | 403 |
| **fictional characters** | **3,494** | | bollywood | 244 |
| athletes | 3,487 | | icons *(non-visual)* | 192 |
| singers | 1,463 | | scientists *(opt-in, A+)* | 140 |
| glamour / 18+ | 1,140 | | tech *(non-visual)* | 99 |
| actors | 1,025 | | | |
| writers *(non-visual)* | 1,007 | | | |
| models & pageant | 600 | | | |
| artists | 422 | | | |
| history *(opt-in, A+)* | 567 | | | |

**4,455 A+ · 13,738 A · average age 47.6 · 16,133 visual · 100% portraits.**

Full name-by-name list per category: **[`FAMOUS.md`](FAMOUS.md)**.

### Fictional characters (3,494)

Harvested from Wikidata (`P1441` "present in work" + `P179` "part of the series") across **133
franchises**, then topped up with curated household names.

| franchise | characters | | franchise | characters |
|---|---|---|---|---|
| Pokémon | 279 | | Street Fighter | 69 |
| Star Wars | 274 | | Smallville | 68 |
| Harry Potter | 242 | | Game of Thrones | 60 |
| The Lord of the Rings | 173 | | One Piece | 60 |
| The Simpsons | 159 | | Bleach | 59 |
| Star Trek | 128 | | Genshin Impact | 58 |
| Doctor Who | 88 | | DC Extended Universe | 57 |
| Marvel Cinematic Universe | 88 | | Tekken | 57 |
| Dragon Ball | 84 | | Arrow (TV) | 56 |
| Mortal Kombat | 80 | | The Wheel of Time | 56 |

Also: Final Fantasy, Transformers, The Walking Dead, Resident Evil, Naruto, Demon Slayer, Jujutsu
Kaisen, Attack on Titan, Death Note, Sailor Moon, Hunter × Hunter, Spy × Family, Chainsaw Man,
Zelda, Mario, Sonic, Halo, God of War, The Last of Us, Red Dead, Overwatch, Minecraft, Disney,
Pixar, Shrek, Breaking Bad, Friends, The Office, Dexter, Peaky Blinders, Stranger Things, Squid
Game, Twilight, The Hunger Games, Indiana Jones, James Bond, Back to the Future, Alien,
Terminator, Halloween, Scream, Saw, Stephen King, plus comics icons (Spider-Man, Iron Man, Batman,
Superman, Joker, Wolverine, Deadpool, Harley Quinn, Black Widow, The Flash, Green Lantern…).

**2,211 characters use artwork from Fandom wikis, 1,108 from Wikimedia Commons**, 175 from
Wikipedia fair-use thumbnails. All 2,211 Fandom URLs were re-checked live (HTTP 200). Characters that could not be matched to an image were **dropped** — no
character in the dataset is imageless.

---

## Schema

```ts
export interface Personality {
  id: string                 // Wikidata Q-id
  name: string
  gender: "male" | "female" | "non-binary" | "other"
  category: Category
  tags: string[]             // includes the franchise slug for characters
  description: string        // one-liner hint
  image: string              // guaranteed portrait
  popularity: number         // Wikipedia editions about the person / character
  workFame: number           // ...and about their most famous show/film/song/team
  tier: "A" | "A+"           // A+ = household name
  beauty: 0 | 1 | 2          // 2 = looks are the job
  visual: boolean            // belongs in the default pool
  optIn: boolean             // scientists / history only
  age: number | null         // ≤ 70, null for fictional characters / BCE
  birthYear: number | null
  deathYear: number | null
  country: string | null
  occupations: string[]
  aliases: string[]          // up to 6, for answer checking ("The Joker" -> "Joker")
}
```

---

## Usage

```ts
import { EXPANDED_PERSONALITIES, sample, beautyFirst, aPlus, imageUrl } from "./src"

// kiss marry kill: three famous, attractive, age-appropriate women
const kmk = sample(3, (p) => p.gender === "female" && p.tier === "A+" && p.beauty >= 1)

// draft: five footballers under 30
const draft = sample(5, (p) => p.category === "athletes" && (p.age ?? 99) < 30)

// 18+ round
const spicy = sample(3, (p) => p.category === "glamour")

// characters round (all have images, age is null)
const cartoons = sample(3, (p) => p.category === "fantasy")

// history/science only when the player explicitly picks it
const quiz = sample(3, (p) => p.category === "history", { includeOptIn: true })
```

Per-category JSON for lazy loading: `data/json/<category>.json`; everything: `data/personalities.json`.

Answer checking with `aliases`:

```ts
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
const ok = [p.name, ...p.aliases].some((n) => norm(n) === norm(guess))
```

---

## How the filters work (`scripts/export.py`)

```python
MAX_AGE = 70                       # age now, or age at death for the deceased
# every record must have image != null  (+ characters are dropped if no image is found)
FAME_RULES = {                     # solo = own wiki editions, work = their best-known work's
  "athletes": dict(solo=40, with_work=15, work=40),
  "glamour":  dict(solo=6,  with_work=3,  work=8),    # 18+ pool is deliberately generous
  "creators": dict(solo=6,  with_work=4,  work=8),
  "models":   dict(solo=10, with_work=6,  work=12),
  "fantasy":  dict(solo=30, with_work=12, work=30),   # characters bypass this (curated + franchise)
  "scientists": dict(solo=80, with_work=None, work=None),   # A+ only
  "history":    dict(solo=80, with_work=None, work=None),   # A+ only
  ...
}
```

Tighten or loosen a pool by editing those numbers and re-running `export.py` + `gen_ts.py`
(~60 s, no re-fetching).

---

## Rebuilding

```bash
# people
python3 scripts/build.py --phase1-only   # candidate ids per bucket (cached)
python3 scripts/build.py --no-screen     # details (name, gender, description, image, occupations)
python3 scripts/cast.py                  # casts of famous works (data/famous_works.txt)
python3 scripts/picks.py                 # curated names (data/pick_titles.txt)
python3 scripts/fame.py                  # workFame for everyone
python3 scripts/aliases.py               # English aliases
python3 scripts/vitals.py                # birth + death dates (age filter)

# fictional characters (own cache files, ~1 h from scratch)
python3 scripts/characters.py            # harvest from data/franchises.txt -> characters_raw.json
python3 scripts/characters2.py           # details + Commons images -> characters.json
python3 scripts/fandom_images.py         # Fandom wiki artwork (main source)
python3 scripts/char_images2.py          # Wikipedia REST thumbnails (fallback, resumable)
python3 scripts/characters3.py           # sweep: every fictional character with >=14 sitelinks
python3 scripts/char_topup2.py           # curated comics/anime/TV names + artwork
python3 scripts/char_topup3.py           # curated game/anime/film names
python3 scripts/char_topup4.py           # final gaps + non-character guard
python3 scripts/char_fix_logos.py        # replace franchise-logo fallbacks with real artwork
python3 scripts/char_marvel_dc.py        # last Marvel/DC backfill

# export + QA
python3 scripts/export.py                # filter -> data/personalities.json
python3 scripts/gen_ts.py                # -> src/seed/*.ts, src/index.ts, data/json/*.json
python3 scripts/famous_md.py             # -> FAMOUS.md
python3 scripts/validate.py --check-images  # QA -> data/report.md
python3 scripts/gallery.py               # -> gallery.html
npx tsc -p tsconfig.json                 # type-check the seed files
```

---

## Caveats

* **Beauty is a proxy, not a judgement.** `beauty: 2` = models/pageant/adult performers;
  `beauty: 1` = screen/stage/sport/internet faces. Within those pools, looks are yours to judge.
* **Age filter side effects:** legends older than 70 are gone (De Niro, Streep, Pacino…), and
  quite a few classic Hollywood names with it. If you ever want them back, raise `MAX_AGE` and
  re-run — the underlying data is still cached.
* **Categories are description-based**, so a few odd fits survive (a poet with lyric credits can
  land in *singers*). `occupations` and `description` are there for stricter rules.
* **Fictional characters** have `age: null` (they're not people).
* **Character artwork licensing:** ~2,200 images come from **Fandom fan wikis** and are
  **fair-use** material (copyright belongs to Marvel/DC/Nintendo/Disney/the studios). They are fine
  for internal/personal use — for anything public, keep the wiki attribution and add a
  "character artwork © respective rights holders" disclaimer, or swap to licensed art.
* Wikimedia Commons / Wikipedia portraits are CC or public domain, but licences vary per file —
  cache thumbnails on your own CDN and keep a credit line.
