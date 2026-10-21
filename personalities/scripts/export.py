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
HISTORY_OCCS = {"politician", "monarch", "military officer", "revolutionary", "philosopher", "diplomat",
                "activist", "explorer", "astronaut"}
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
    """Category from a Wikidata one-liner, which is far more reliable than raw occupations."""
    d = " " + (desc or "").lower() + " "
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
    if o & SINGER_OCCS:
        return "singers"
    if o & SCIENTIST_OCCS:
        return "scientists"
    if o & MODEL_OCCS:
        return "models"
    if o & CREATOR_OCCS:
        return "creators"
    if o & TECH_OCCS:
        return "tech"
    if o & HISTORY_OCCS:
        return "history"
    if o & WRITER_OCCS:
        return "writers"
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


IMG_OK = re.compile(r"\.(jpe?g|png)$", re.I)


def normalize_image(raw):
    """Turn a Commons FilePath URL into a clean https URL, or None."""
    if not raw:
        return None
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


def main():
    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    pick_cats = json.load(open(os.path.join(DATA, "pick_cats.json"))) if os.path.exists(
        os.path.join(DATA, "pick_cats.json")) else {}
    pick_names = json.load(open(os.path.join(DATA, "pick_names.json"))) if os.path.exists(
        os.path.join(DATA, "pick_names.json")) else {}

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
        for c in countries:                       # prefer the citizenship the description mentions
            a = ADJ.get(c)
            if a and a in desc_raw:
                country = c
                break
        birth = (d.get("birth") or "")[:4]
        birth_year = int(birth) if birth.isdigit() else None

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
        if base["cat"] not in ("fantasy",):
            bc = best_category(d.get("desc"), kept, occs, country)
            if bc:
                base["cat"] = bc
        if base["cat"] == "india":                 # too small to be a category of its own
            base["cat"] = "icons"
        if not image and base["cat"] != "fantasy":
            dropped["no_image"] += 1
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
            "image": image,
            "popularity": base.get("sitelinks", 0),
            "country": country,
            "birthYear": birth_year,
            "occupations": kept,
            "aliases": aliases[:6],
        })

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

    for r in unique:
        r.pop("_pick", None)
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
