#!/usr/bin/env python3
"""Turn raw Wikidata pulls into the game seed dataset (JSON + TypeScript)."""
import json, os, re, unicodedata, collections
from urllib.parse import unquote, quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
SRC = os.path.join(ROOT, "src")

GENDER = {"male": "male", "female": "female", "trans woman": "female", "trans man": "male",
          "non-binary": "non-binary", "intersex": "other", "genderfluid": "other",
          "agender": "other", "bigender": "other"}

CATEGORY_FALLBACK = {  # safety net when a bucket has no explicit category
    "bollywood": "bollywood", "hollywood": "hollywood", "actors": "actors",
    "singers": "singers", "athletes": "athletes", "scientists": "scientists",
    "tech": "tech", "models": "models", "glamour": "glamour", "creators": "creators",
    "history": "history", "writers": "writers", "artists": "artists", "fantasy": "fantasy",
}

BUCKET_TAGS = {
    "bollywood": ["indian-cinema", "bollywood"],
    "hollywood": ["hollywood", "cinema"],
    "actors": ["actor", "screen"],
    "singers": ["music", "stage"],
    "athletes": ["sport", "competition"],
    "scientists": ["science", "research"],
    "tech": ["technology", "business"],
    "models": ["modelling", "fashion"],
    "glamour": ["modelling", "adult"],
    "creators": ["internet", "creator"],
    "history": ["history", "leadership"],
    "india": ["india", "public-figure"],
    "writers": ["literature", "words"],
    "artists": ["art", "creative"],
    "fantasy": ["fictional", "pop-culture"],
}

ADJ = {
    "United States of America": "american", "United States": "american", "India": "indian",
    "United Kingdom": "british", "England": "english", "Canada": "canadian",
    "Australia": "australian", "France": "french", "Germany": "german", "Italy": "italian",
    "Spain": "spanish", "Japan": "japanese", "South Korea": "south-korean", "China": "chinese",
    "Brazil": "brazilian", "Mexico": "mexican", "Russia": "russian", "Ireland": "irish",
    "Scotland": "scottish", "Wales": "welsh", "New Zealand": "new-zealand", "Sweden": "swedish",
    "Norway": "norwegian", "Denmark": "danish", "Netherlands": "dutch", "Poland": "polish",
    "Argentina": "argentine", "Portugal": "portuguese", "Nigeria": "nigerian",
    "South Africa": "south-african", "Pakistan": "pakistani", "Bangladesh": "bangladeshi",
    "Sri Lanka": "sri-lankan", "Israel": "israeli", "Turkey": "turkish", "Egypt": "egyptian",
    "Greece": "greek", "Iran": "iranian", "Ukraine": "ukrainian", "Switzerland": "swiss",
    "Austria": "austrian", "Belgium": "belgian", "Colombia": "colombian", "Chile": "chilean",
    "Peru": "peruvian", "Cuba": "cuban", "Jamaica": "jamaican", "Kenya": "kenyan",
    "Philippines": "filipino", "Indonesia": "indonesian", "Thailand": "thai",
    "Vietnam": "vietnamese", "Malaysia": "malaysian", "Nepal": "nepali",
    "Czech Republic": "czech", "Czechia": "czech", "Hungary": "hungarian",
    "Romania": "romanian", "Finland": "finnish", "Iceland": "icelandic",
    "Singapore": "singaporean", "Hong Kong": "hong-kong", "Taiwan": "taiwanese",
    "Saudi Arabia": "saudi", "United Arab Emirates": "emirati", "Morocco": "moroccan",
    "Ghana": "ghanaian", "Ethiopia": "ethiopian", "Algeria": "algerian",
    "Estonia": "estonian", "Latvia": "latvian", "Lithuania": "lithuanian", "Bulgaria": "bulgarian",
    "Croatia": "croatian", "Serbia": "serbian", "Slovenia": "slovenian", "Slovakia": "slovak",
    "Bosnia and Herzegovina": "bosnian", "North Macedonia": "macedonian", "Albania": "albanian",
    "Moldova": "moldovan", "Belarus": "belarusian", "Georgia": "georgian", "Armenia": "armenian",
    "Azerbaijan": "azerbaijani", "Kazakhstan": "kazakh", "Uzbekistan": "uzbek",
    "Venezuela": "venezuelan", "Ecuador": "ecuadorian", "Bolivia": "bolivian", "Uruguay": "uruguayan",
    "Paraguay": "paraguayan", "Costa Rica": "costa rican", "Panama": "panamanian",
    "Guatemala": "guatemalan", "Dominican Republic": "dominican", "Puerto Rico": "puerto rican",
    "Trinidad and Tobago": "trinidadian", "Bahamas": "bahamian", "Senegal": "senegalese",
    "Cameroon": "cameroonian", "Ivory Coast": "ivorian", "Tanzania": "tanzanian",
    "Uganda": "ugandan", "Zimbabwe": "zimbabwean", "Zambia": "zambian", "Angola": "angolan",
    "Tunisia": "tunisian", "Libya": "libyan", "Sudan": "sudanese", "Syria": "syrian",
    "Lebanon": "lebanese", "Jordan": "jordanian", "Iraq": "iraqi", "Kuwait": "kuwaiti",
    "Qatar": "qatari", "Bahrain": "bahraini", "Oman": "omani", "Yemen": "yemeni",
    "Afghanistan": "afghan", "Myanmar": "burmese", "Cambodia": "cambodian", "Laos": "lao",
    "Mongolia": "mongolian", "North Korea": "north korean", "Cuba": "cuban",
    "Soviet Union": "soviet", "Russian Empire": "russian", "Yugoslavia": "yugoslav",
    "Czechoslovakia": "czechoslovak", "Kingdom of Denmark": "danish", "Kingdom of Italy": "italian",
    "Kingdom of England": "english", "Republic of Ireland": "irish", "Scotland": "scottish",
    "Ottoman Empire": "ottoman", "Austria-Hungary": "austro-hungarian", "Prussia": "prussian",
    "Weimar Republic": "german", "Nazi Germany": "german", "East Germany": "east german",
    "Kingdom of the Netherlands": "dutch", "Republic of China": "chinese",
}

SCIENTIST_OCCS = {"physicist", "chemist", "mathematician", "biologist", "astronomer", "inventor",
                  "neuroscientist", "computer scientist", "physician", "engineer"}
TECH_OCCS = {"entrepreneur", "businessperson", "chief executive officer", "investor", "programmer",
             "engineer", "computer scientist"}
POLITIC_OCCS = {"politician", "monarch", "military officer", "diplomat", "revolutionary", "activist"}

# ---------------------------------------------------------------
# Fame pruning: keep only genuinely recognisable names.
# A record survives if it is
#   * in a "keep everything" category (science / history), or
#   * one of the hand-picked names in data/pick_titles.txt, or
#   * its own fame, or the fame of the work it is known for, clears FAME_RULES.
# Lower those numbers and re-run export.py
# to get a bigger list back - no re-fetching needed.
# ---------------------------------------------------------------
OPT_IN_CATEGORIES = {"scientists", "history"}   # A+ only, excluded from default pools

# A record is kept when EITHER its own fame clears the bar, OR it is attached to something
# famous (the show / film / song / band / team that made it recognisable).
#   solo      -> minimum sitelinks of the person
#   with_work -> lower personal bar, allowed only if `work` (best attached work) clears its bar
FAME_RULES = {
    "scientists":  dict(solo=80, with_work=None, work=None),   # A+ only
    "history":     dict(solo=80, with_work=None, work=None),   # A+ only
    "athletes":    dict(solo=40, with_work=15, work=40),
    "creators":    dict(solo=6,  with_work=4,  work=8),
    "glamour":     dict(solo=6,  with_work=3,  work=8),
    "models":      dict(solo=10, with_work=6,  work=12),
    "fantasy":     dict(solo=30, with_work=12, work=30),
    "bollywood":   dict(solo=40, with_work=15, work=25),
    "hollywood":   dict(solo=40, with_work=15, work=25),
    "actors":      dict(solo=40, with_work=15, work=25),
    "singers":     dict(solo=40, with_work=15, work=25),
    "writers":     dict(solo=40, with_work=15, work=25),
    "artists":     dict(solo=40, with_work=15, work=25),
    "tech":        dict(solo=40, with_work=15, work=25),
    "icons":       dict(solo=40, with_work=15, work=25),
}
FAME_RULE_DEFAULT = dict(solo=40, with_work=15, work=25)

EXTRA_ALIASES = {
    "napoleon": ["Napoleon Bonaparte"],
    "batman": ["Bruce Wayne"],
    "superman": ["Clark Kent"],
    "spiderman": ["Peter Parker"],
    "ironman": ["Tony Stark"],
    "deadpool": ["Wade Wilson"],
    "goku": ["Goku (Dragon Ball)"],
    "thejoker": ["Joker"],
    "msdhoni": ["Mahendra Singh Dhoni", "M.S. Dhoni"],
    "abdulkalam": ["A. P. J. Abdul Kalam", "APJ Abdul Kalam"],
}

MAX_AGE = 70
CURRENT_YEAR = 2026

# Looks signal: "is this person's appeal partly/entirely visual?"
BEAUTY_STRONG = {"model", "fashion model", "erotic photography model", "glamour model",
                 "Playboy Playmate", "OnlyFans model", "pornographic film actor",
                 "beauty pageant contestant", "vedette", "pin-up girl", "bikini model"}
BEAUTY_SOME = {"actor", "actress", "film actor", "television actor", "stage actor", "voice actor",
               "singer", "rapper", "singer-songwriter", "musician", "dancer", "ballet dancer",
               "television presenter", "presenter", "comedian", "YouTuber", "TikToker",
               "online streamer", "Internet celebrity", "professional gamer", "influencer",
               "association football player", "cricketer", "basketball player", "tennis player",
               "boxer", "racing driver", "racing automobile driver", "Formula One driver",
               "athlete", "swimmer", "gymnast", "volleyball player", "badminton player",
               "amateur wrestler", "mixed martial arts fighter", "professional wrestler",
               "golfer", "field hockey player", "sprinter", "figure skater", "model"}
BEAUTY_CATEGORY = {"models": 2, "glamour": 2, "bollywood": 1, "hollywood": 1, "actors": 1,
                   "singers": 1, "athletes": 1, "creators": 1, "fantasy": 1}


def beauty_score(kept, occs, category):
    o = set(kept) | set(occs)
    if o & BEAUTY_STRONG or category in ("models", "glamour"):
        return 2
    if o & BEAUTY_SOME or category in BEAUTY_CATEGORY:
        return 1
    return 0


def age_of(birth_year, death_year):
    """Age now (living) or at death, or None when the dates are unusable (fiction, BCE, ...)."""
    if not birth_year or birth_year < 1000:
        return None
    if death_year and death_year > birth_year:
        return death_year - birth_year
    age = CURRENT_YEAR - birth_year
    return age if 0 <= age <= 120 else None


ACTOR_OCCS = {"actor", "actress", "film actor", "television actor", "stage actor", "voice actor"}
SPORT_OCCS = {"association football player", "cricketer", "basketball player", "tennis player", "boxer",
              "racing driver", "athlete", "swimmer", "amateur wrestler", "mixed martial arts fighter",
              "golfer", "badminton player", "field hockey player", "volleyball player",
              "athletics competitor", "sprinter", "racing driver", "cyclist"}
SINGER_OCCS = {"singer", "singer-songwriter", "songwriter", "rapper", "musician", "record producer",
               "composer", "disc jockey"}
MODEL_OCCS = {"model", "fashion model", "glamour model", "erotic photography model",
              "pornographic film actor", "Playboy Playmate"}
CREATOR_OCCS = {"YouTuber", "online streamer", "TikToker", "Internet celebrity"}
ARTIST_OCCS = {"painter", "architect", "photographer", "comedian", "film director", "fashion designer",
               "cook", "sculptor", "illustrator", "cartoonist"}
WRITER_OCCS = {"writer", "poet", "novelist", "journalist", "screenwriter", "essayist"}
HISTORY_OCCS = {"politician", "monarch", "military officer", "army officer", "revolutionary",
                "philosopher", "diplomat", "activist", "explorer", "astronaut", "statesperson",
                "theologian", "priest", "reformer", "saint", "nobleman", "noblewoman"}
US_UK_NAMES = {"United States of America", "United States", "United Kingdom", "England", "Canada",
               "Australia", "Ireland", "Scotland", "Wales", "New Zealand"}


CAT_WORDS = [
    ("glamour", ["pornographic", "porn star", "adult film", "erotic model", "erotic photography",
                 "glamour model", "av actress", "av idol"]),
    ("creators", ["youtuber", "streamer", "influencer", "internet personality", "tiktoker", "vlogger",
                  "content creator", "internet celebrity", "video blogger"]),
    ("athletes", ["footballer", "football player", "football manager", "soccer player", "cricketer",
                  "cricket", "basketball player", "tennis player", "boxer", "athlete", "racing driver",
                  "racing car", "formula one", "olympic", "sportsperson", "golfer", "swimmer", "wrestler",
                  "mixed martial", "badminton", "hockey player", "volleyball", "sprinter", "weightlifter",
                  "cyclist", "skier", "skater", "sportsman", "sportswoman", "sports executive",
                  "football club", "jockey"]),
    ("singers", ["singer", "rapper", "musician", "songwriter", "composer", "vocalist", "band member",
                 "disc jockey", "record producer", "lyricist", "conductor", "pop star", "recording artist",
                 "music producer", "operatic", "musical artist"]),
    ("writers", ["writer", "poet", "novelist", "journalist", "author", "playwright", "essayist",
                 "screenwriter", "columnist", "dramatist", "literary", "diarist"]),
    ("scientists", ["physicist", "chemist", "mathematician", "biologist", "scientist", "astronomer",
                    "inventor", "neuroscientist", "physician", "astronaut", "engineer", "geologist",
                    "botanist", "zoologist", "geneticist", "pharmacologist", "microbiologist",
                    "psychologist", "psychiatrist", "psychoanalyst", "neurologist", "economist",
                    "statistician", "paleontologist", "mathematics", "anthropologist"]),
    ("actors", ["actor", "actress", "film star", "movie star", "performer", "comedian", "voice actor",
                "television presenter", "presenter"]),
    ("history", ["politician", "president", "prime minister", "monarch", "king", "queen", "emperor",
                 "empress", "general", "military", "philosopher", "activist", "revolutionary", "explorer",
                 "diplomat", "statesman", "stateswoman", "royal", "prince", "princess", "saint", "pope",
                 "nobleman", "noblewoman", "warrior", "revolutionist", "independence", "leader of",
                 "head of state", "governor", "senator", "mayor", "chancellor", "minister",
                 "member of parliament", "first lady", "first minister"]),
    ("tech", ["entrepreneur", "businessman", "businesswoman", "business magnate", "magnate",
              "business executive", "chief executive", "ceo", "investor", "programmer", "industrialist",
              "billionaire", "computer scientist", "software", "merchant", "banker", "businessperson"]),
    ("artists", ["painter", "artist", "sculptor", "architect", "film director", "director",
                 "photographer", "designer", "chef", "illustrator", "cartoonist", "animator",
                 "graphic", "fashion designer"]),
]

MODEL_WORDS = ["model", "playmate", "playboy", "vedette"]


POLYMATH = ("polymath", "renaissance man", "renaissance humanist")


def best_category(desc, kept, occs, country):
    """Category from a Wikidata one-liner, which is far more reliable than raw occupations.

    Wikidata descriptions read "<nationality> <main job>, <other jobs>", so the first clause is
    the strongest signal - that keeps "German priest, theologian, hymnwriter" out of *singers*.
    """
    full = " " + (desc or "").lower() + " "
    head = " " + (desc or "").split(",")[0].lower() + " "
    for scope in (head, full):
        cat = _match_category(scope, country)
        if cat:
            return cat
    return None


def _match_category(d, country):
    if any(k in d for k in POLYMATH):
        return "icons"
    if any(re.search(r"\b" + re.escape(w) + r"\b", d) for w in MODEL_WORDS) and \
            not re.search(r"\b(actor|actress)\b", d):
        return "models"
    for cat, words in CAT_WORDS:
        if any(re.search(r"\b" + re.escape(w) + r"\b", d) for w in words):
            if cat == "actors":
                if country == "India":
                    return "bollywood"
                if country in US_UK_NAMES:
                    return "hollywood"
                return "actors"
            return cat
    return None


def derive_category(kept, occs, country):
    """Pick a category from raw occupations (used for the fame safety-net buckets)."""
    o = set(kept) | set(occs)
    if o & ACTOR_OCCS:
        if country == "India":
            return "bollywood"
        return "hollywood" if country in US_UK_NAMES else "actors"
    if o & SPORT_OCCS:
        return "athletes"
    if o & MODEL_OCCS:
        return "models"
    if o & CREATOR_OCCS:
        return "creators"
    if o & SCIENTIST_OCCS:
        return "scientists"
    if o & HISTORY_OCCS:
        return "history"
    if o & WRITER_OCCS:
        return "writers"
    if o & SINGER_OCCS:
        return "singers"
    if o & TECH_OCCS:
        return "tech"
    if o & ARTIST_OCCS:
        return "artists"
    return "icons"


CAT_PHRASE = {
    "history": "historical figure", "writers": "writer", "scientists": "scientist",
    "artists": "artist", "singers": "music artist", "athletes": "sportsperson",
    "tech": "business figure", "models": "model", "glamour": "model",
    "creators": "internet personality", "fantasy": "fictional character",
    "bollywood": "film personality", "hollywood": "film personality",
    "actors": "film personality", "india": "public figure", "icons": "public figure",
}

OCC_KEEP = {
    "film actor", "television actor", "stage actor", "voice actor", "actor", "actress",
    "singer", "singer-songwriter", "songwriter", "rapper", "musician", "record producer",
    "composer", "disc jockey", "model", "fashion model", "glamour model",
    "association football player", "cricketer", "basketball player", "tennis player",
    "boxer", "racing driver", "athlete", "swimmer", "amateur wrestler",
    "mixed martial arts fighter", "golfer", "badminton player", "field hockey player",
    "volleyball player", "physicist", "chemist", "mathematician", "biologist", "astronomer",
    "inventor", "neuroscientist", "physician", "computer scientist", "engineer",
    "programmer", "entrepreneur", "businessperson", "chief executive officer", "investor",
    "philosopher", "historian", "writer", "poet", "novelist", "journalist", "painter",
    "architect", "comedian", "film director", "photographer", "fashion designer",
    "YouTuber", "online streamer", "TikToker", "Internet celebrity", "politician",
    "monarch", "military officer", "revolutionary", "diplomat", "activist", "astronaut",
    "explorer", "cook", "pornographic film actor", "erotic photography model",
    "Playboy Playmate", "film producer", "screenwriter", "television producer",
}

BAD_NAME = re.compile(r"^(list of|unknown|anonymous|unnamed)", re.I)
PAREN = re.compile(r"\s*\((?:born|b\.|fl\.)?\s*(?:c\.\s*)?[0-9]{3,4}(?:[–-][0-9]{3,4})?\)\s*$")


def slug(s):
    s = s.lower().strip()
    s = s.replace("&", " and ").replace("+", " plus ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")


def norm_name(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s.lower())


IMG_OK = re.compile(r"\.(jpe?g|png|svg|webp)$", re.I)


def normalize_image(raw):
    """Turn a Commons FilePath URL into a clean https URL, or None."""
    if not raw:
        return None
    if raw.startswith("http://"):
        raw = "https://" + raw[len("http://"):]
    if "thumb.wikimedia.org" in raw:
        return raw.replace("thumb.wikimedia.org", "upload.wikimedia.org")
    if "wikia.nocookie.net" in raw:      # Fandom needs its ?cb=...&path-prefix=... query
        return raw
    if "upload.wikimedia.org" in raw:
        return raw.split("?")[0]
    uri = unquote(raw)
    if "Special:FilePath/" not in uri:
        return None
    fname = uri.split("Special:FilePath/", 1)[1]
    if not IMG_OK.search(fname):
        return None
    fname = fname.replace(" ", "_")
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(fname, safe="(),'!&-_.")


def clean_desc(d, fallback):
    if not d:
        return fallback
    d = PAREN.sub("", d).strip()
    d = d.replace("..", ".")
    if not d:
        return fallback
    d = d[0].upper() + d[1:]
    if not d.endswith("."):
        d += "."
    return d




CHAR_TITLES = ("The ", "Professor ", "Captain ", "Princess ", "Prince ", "Dr. ", "Mr. ", "Mrs. ",
               "Sir ", "Lord ", "Lady ", "King ", "Queen ", "Aunt ", "Uncle ", "General ")


def char_aliases(name):
    """Answer-checking aliases for a character: 'The Joker' -> 'Joker', 'Monkey D. Luffy' -> 'Luffy'."""
    out = []
    for t in CHAR_TITLES:
        if name.startswith(t) and len(name) - len(t) >= 3:
            out.append(name[len(t):])
    if "(" in name and ")" in name:              # 'Batman (Bruce Wayne)'
        head, inner = name.split("(", 1)
        out += [head.strip(), inner.rsplit(")", 1)[0].strip()]
    parts = name.replace(".", "").split()
    if len(parts) >= 3 and len(parts[-1]) >= 3:  # 'Monkey D. Luffy' -> 'Luffy'
        out.append(parts[-1])
    seen, keep = set(), []
    for a in out:
        if a and norm_name(a) != norm_name(name) and a not in seen:
            seen.add(a)
            keep.append(a)
    return keep[:4]


def merge_characters(recs, dropped):
    """Append the harvested fictional characters (Marvel/DC/GoT/HP/anime/games/...) as records.

    Every character must have an image; gender comes from P21 or is inferred from the
    description; age is null (they are not people); they are all `visual` so they can appear in
    kiss/marry/kill and draft rounds.
    """
    path = os.path.join(DATA, "characters.json")
    cache_path = os.path.join(DATA, "char_images.json")
    raw_path = os.path.join(DATA, "characters_raw.json")
    if not os.path.exists(path):
        return recs
    chars = json.load(open(path))
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}
    raw = json.load(open(raw_path)) if os.path.exists(raw_path) else {}
    mapping = raw.get("mapping", {})
    char_ids = {c["id"] for c in chars}
    char_names = {norm_name(c["name"]) for c in chars}
    before = len(recs)
    recs = [r for r in recs
            if r["id"] not in char_ids and norm_name(r["name"]) not in char_names]
    if before != len(recs):
        print(f"characters took precedence over {before - len(recs)} human records")
    seen = {norm_name(r["name"]) for r in recs}

    added = 0
    for c in chars:
        qid = c["id"]
        img = normalize_image(c.get("image") or cache.get(qid) or "")
        if not img:
            dropped["char_no_image"] += 1
            continue
        name = (c.get("name") or "").strip()
        if not name or len(name) < 2 or norm_name(name) in seen:
            dropped["char_dupe"] += 1
            continue
        desc = (c.get("desc") or "").strip()
        g = GENDER.get((c.get("gender") or "").lower())
        if not g:
            low = desc.lower()
            g = "female" if "female" in low else "male" if "male" in low else "other"
        franch = mapping.get(qid) or []
        tags = ["fictional", "character"]
        if franch:
            tags.append(slug(franch[0].split(" (")[0]))
        for o in (c.get("occupations") or "").split("|")[:3]:
            if o:
                tags.append(slug(o))
        tags = [t[:31].strip("-") for t in dict.fromkeys(t for t in tags if t)][:8]
        sl = c.get("sitelinks", 0)
        recs.append({
            "_char": True,
            "id": qid,
            "name": name,
            "gender": g,
            "category": "fantasy",
            "tags": tags,
            "description": clean_desc(desc, "Fictional character."),
            "image": img,
            "popularity": max(sl, 1),
            "country": None,
            "birthYear": None,
            "occupations": [],
            "aliases": char_aliases(name),
            "workFame": sl,
            "tier": "A+" if sl >= 60 else "A",
            "optIn": False,
            "age": None,
            "deathYear": None,
            "beauty": 1,
            "visual": True,
        })
        seen.add(norm_name(name))
        added += 1
    print(f"merged {added} fictional characters (with images)")
    return recs


def main():
    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    pick_cats = json.load(open(os.path.join(DATA, "pick_cats.json"))) if os.path.exists(
        os.path.join(DATA, "pick_cats.json")) else {}
    pick_names = json.load(open(os.path.join(DATA, "pick_names.json"))) if os.path.exists(
        os.path.join(DATA, "pick_names.json")) else {}
    fame = json.load(open(os.path.join(DATA, "fame.json"))) if os.path.exists(
        os.path.join(DATA, "fame.json")) else {}
    vitals = json.load(open(os.path.join(DATA, "vitals.json"))) if os.path.exists(
        os.path.join(DATA, "vitals.json")) else {}

    recs, dropped = [], collections.Counter()
    for qid, base in p1.items():
        d = det.get(qid) or {}
        name = (d.get("pLabel") or "").strip()
        if not name or len(name) < 2 or BAD_NAME.match(name):
            dropped["no_name"] += 1
            continue
        g = GENDER.get((d.get("gLabel") or "").strip().lower())
        if not g:
            dropped["no_gender"] += 1
            continue
        bucket = base["bucket"]
        image = normalize_image(d.get("image"))

        occs = [o for o in (d.get("occs") or "").split("|") if o]
        kept = [o for o in occs if o in OCC_KEEP][:6]
        countries = [c for c in (d.get("countries") or "").split("|") if c]
        country = countries[0] if countries else None
        desc_raw = (d.get("desc") or "").lower()
        desc_head = desc_raw.split(",")[0]
        for scope in (desc_head, desc_raw):        # prefer the demonym the description leads with
            for c in countries:
                a = ADJ.get(c)
                if a and re.search(r"\b" + re.escape(a) + r"\b", scope):
                    country = c
                    break
            else:
                continue
            break
        birth = (d.get("birth") or "")[:4]
        birth_year = int(birth) if birth.isdigit() else None
        v = vitals.get(qid) or {}
        death_raw = (v.get("death") or "")[:4]
        death_year = int(death_raw) if death_raw.isdigit() else None
        age = age_of(birth_year, death_year)

        tags = []
        for t in (kept or occs[:3]):
            tags.append(slug(t))
        for c in countries[:2]:
            a = ADJ.get(c)
            if a:
                tags.append(slug(a))
        tags += BUCKET_TAGS.get(bucket, [])
        if base.get("sitelinks", 0) >= 60:
            tags.append("legend")
        elif base.get("sitelinks", 0) >= 25:
            tags.append("icon")
        if birth_year:
            if birth_year < 1900:
                tags.append("classic-era")
            elif birth_year >= 1990:
                tags.append("modern")

        seen, clean_tags = set(), []
        for t in tags:
            if t and t not in seen and len(t) < 32:
                seen.add(t)
                clean_tags.append(t)
                if len(clean_tags) >= 10:
                    break
        if not clean_tags:                       # e.g. characters with no listed occupation
            clean_tags = [base["cat"], "pop-culture"] if base["cat"] == "fantasy" else [base["cat"], "public-figure"]

        fallback = {
            "fantasy": "Fictional character from popular culture.",
            "bollywood": "Indian film personality.",
            "hollywood": "Film and television personality.",
            "fame_people": "Notable public figure.",
            "fame_fiction": "Fictional character from popular culture.",
            "icons": "Notable public figure.",
        }.get(bucket, f"Notable {bucket.rstrip('s')} figure.")

        desc = clean_desc(d.get("desc"), fallback)
        if len(desc.split()) < 3:                       # too thin to be a useful hint
            head = desc.rstrip(".").strip().lower() or ((kept[0] if kept else (occs[0] if occs else "")) or "")
            adj = ADJ.get(country or "")
            phrase = CAT_PHRASE.get(bucket, "public figure")
            if adj and head and adj not in head:
                desc = f"{adj.capitalize()} {head}."
            elif head:
                desc = f"{head[0].upper() + head[1:]}."
            elif head and country:
                desc = f"{head.capitalize()} from {country}."
            elif head:
                desc = f"{head.capitalize()}, {phrase}."

        if base["bucket"] == "picks":
            pc = pick_cats.get(qid, "picks")
            base["cat"] = pc if pc != "picks" else derive_category(kept, occs, country)
        if base["bucket"].startswith("fame") or base["bucket"] == "indian":
            base["cat"] = "fantasy" if base["bucket"] == "fame_fiction" else derive_category(kept, occs, country)
        if base["cat"] != "fantasy":
            bc = best_category(d.get("desc"), kept, occs, country) or derive_category(kept, occs, country)
            if bc:
                base["cat"] = bc
        if base["cat"] == "india":                 # too small to be a category of its own
            base["cat"] = "icons"
        if not image:                              # every record must have a portrait
            dropped["no_image"] += 1
            continue
        if age is not None and age > MAX_AGE:      # only faces people can plausibly vote on
            dropped["too_old"] += 1
            continue
        if base["cat"] == "scientists" and not (set(kept) & SCIENTIST_OCCS):
            base["cat"] = "tech" if (set(kept) & TECH_OCCS) else (
                "history" if set(kept) & POLITIC_OCCS else "scientists")
        if base["cat"] == "tech" and not (set(kept) & TECH_OCCS) and (set(kept) & POLITIC_OCCS):
            base["cat"] = "history"

        # English aliases (search / answer checking); drop ones equal to the name
        raw_aliases = [a.strip() for a in (d.get("aliases") or "").split("|") if a.strip()]
        aliases = []
        for a in raw_aliases:
            if norm_name(a) != norm_name(name) and 2 < len(a) < 60 and a not in aliases:
                aliases.append(a)
            if len(aliases) >= 6:
                break

        # a hand-picked title can carry a friendlier display name ("C. V. Raman" vs the full name)
        pn = pick_names.get(qid)
        if pn and "(" not in pn and norm_name(pn) != norm_name(name) and len(pn) < len(name):
            aliases = [name] + [a for a in aliases if norm_name(a) != norm_name(name)]
            name = pn
        elif pn and "(" in pn:                    # "Batman (Bruce Wayne)" -> alias both parts
            inner = pn[pn.index("(") + 1:pn.rindex(")")].strip()
            aliases = [a for a in [pn, inner] if norm_name(a) != norm_name(name)] + aliases
        extra = [a for a in EXTRA_ALIASES.get(norm_name(name), []) if norm_name(a) != norm_name(name)]
        aliases = [a for a in aliases if norm_name(a) != norm_name(name)]
        aliases = list(dict.fromkeys(extra + aliases))

        recs.append({
            "_pick": base["bucket"] == "picks",
            "id": qid,
            "name": name,
            "gender": g,
            "category": base["cat"],
            "tags": clean_tags,
            "description": desc,
            "image": normalize_image(image) or image,
            "popularity": base.get("sitelinks", 0),
            "country": country,
            "birthYear": birth_year,
            "occupations": kept,
            "aliases": aliases[:6],
            "workFame": fame.get(qid, {}).get("work", 0),
            "deathYear": death_year,
            "age": age,
            "beauty": beauty_score(kept, occs, base["cat"]),
        })

    recs = merge_characters(recs, dropped)

    # dedupe by name, keep the most notable
    recs.sort(key=lambda r: (not r.get("_pick"), -r["popularity"]))
    by_name, unique = {}, []
    for r in recs:
        k = norm_name(r["name"])
        if k in by_name:
            dropped["dupe_name"] += 1
            continue
        by_name[k] = True
        unique.append(r)

    order = ["bollywood", "hollywood", "actors", "singers", "athletes", "scientists",
             "tech", "models", "creators", "glamour", "history", "writers", "artists", "fantasy", "icons"]
    unique.sort(key=lambda r: (order.index(r["category"]), -r["popularity"]))

    before = len(unique)
    kept = []
    for r in unique:
        rule = FAME_RULES.get(r["category"], FAME_RULE_DEFAULT)
        solo, work = r["popularity"], r.get("workFame", 0)
        famous = solo >= rule["solo"]
        if not famous and rule["with_work"]:
            famous = solo >= rule["with_work"] and work >= rule["work"]
        if r.get("_pick") and r["category"] not in OPT_IN_CATEGORIES:
            famous = True
        if r.get("_char"):          # characters from A-tier franchises, each with an image
            famous = True
        r["tier"] = "A+" if (solo >= 80 or (solo >= 40 and work >= 60)) else "A"
        r["optIn"] = r["category"] in OPT_IN_CATEGORIES
        # "visual" = the kind of person you can put in a kiss/marry/kill round
        r["visual"] = (not r["optIn"]) and r["beauty"] >= 1
        if famous:
            kept.append(r)
        else:
            dropped["pruned_" + r["category"]] += 1
    unique = kept
    print(f"pruned {before - len(unique)} below-bar records -> {len(unique)} kept")

    for r in unique:
        r.pop("_pick", None)
        r.pop("_char", None)
        if not r["description"] or len(r["description"]) < 12:
            r["description"] = (f"{r['occupations'][0].capitalize()} from {r['country']}."
                                if r["occupations"] and r["country"] else "Notable public figure.")

    os.makedirs(SRC, exist_ok=True)
    os.makedirs(os.path.join(SRC, "data"), exist_ok=True)
    json.dump(unique, open(os.path.join(DATA, "personalities.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(unique, open(os.path.join(SRC, "data", "personalities.json"), "w"), ensure_ascii=False, indent=1)

    stats = collections.Counter(r["category"] for r in unique)
    gstats = collections.Counter(r["gender"] for r in unique)
    print("total", len(unique))
    print("by category", dict(stats))
    print("by gender", dict(gstats))
    print("dropped", dict(dropped))
    print("with image", sum(1 for r in unique if r["image"]))
    print("avg tags", round(sum(len(r["tags"]) for r in unique) / len(unique), 2))
    print("sample:", json.dumps(unique[0], ensure_ascii=False, indent=1))
    print("sample:", json.dumps(unique[3000], ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
