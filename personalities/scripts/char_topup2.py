#!/usr/bin/env python3
"""Curated top-up: the household-name characters the franchise sweep + P31 sweep missed (Mickey Mouse,
Naruto, Wolverine, Black Widow, John Wick, ...). Wikidata Q-id -> Fandom artwork -> characters.json."""
import json, os, re, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (character top-up)"})

FIC = re.compile(r"fictional|superhero|supervillain|comics|character|video game|manga|anime|tv series|film series", re.I)

# (display name, wikidata search term, fandom wiki, fandom page title)
WANT = [
    ("Mickey Mouse", "Mickey Mouse", "disney", "Mickey Mouse"),
    ("Naruto Uzumaki", "Naruto Uzumaki", "naruto", "Naruto Uzumaki"),
    ("Sakura Haruno", "Sakura Haruno", "naruto", "Sakura Haruno"),
    ("Levi Ackerman", "Levi Ackerman", "attackontitan", "Levi Ackerman"),
    ("Eren Yeager", "Eren Yeager", "attackontitan", "Eren Yeager"),
    ("Mikasa Ackerman", "Mikasa Ackerman", "attackontitan", "Mikasa Ackerman"),
    ("Light Yagami", "Light Yagami", "deathnote", "Light Yagami"),
    ("L", "L (Death Note)", "deathnote", "L"),
    ("Edward Elric", "Edward Elric", "fma", "Edward Elric"),
    ("Sailor Moon", "Sailor Moon", "sailormoon", "Sailor Moon"),
    ("Link", "Link (The Legend of Zelda)", "zelda", "Link"),
    ("Princess Zelda", "Princess Zelda", "zelda", "Princess Zelda"),
    ("Mario", "Mario", "mario", "Mario"),
    ("Black Widow", "Black Widow (Natasha Romanova)", "marvel", "Black Widow"),
    ("Wolverine", "Wolverine (character)", "marvel", "Wolverine"),
    ("Black Panther", "Black Panther (T'Challa)", "marvel", "Black Panther"),
    ("Star-Lord", "Star-Lord", "marvel", "Star-Lord"),
    ("Professor X", "Professor X", "marvel", "Professor X"),
    ("Winter Soldier", "Winter Soldier (comics)", "marvel", "Winter Soldier"),
    ("Rocket Raccoon", "Rocket Raccoon", "marvel", "Rocket Raccoon"),
    ("Ultron", "Ultron", "marvel", "Ultron"),
    ("Mystique", "Mystique (character)", "marvel", "Mystique"),
    ("Storm", "Storm (Marvel Comics)", "marvel", "Storm"),
    ("Gambit", "Gambit (comics)", "marvel", "Gambit"),
    ("Doctor Octopus", "Doctor Octopus", "marvel", "Doctor Octopus"),
    ("Green Goblin", "Green Goblin", "marvel", "Green Goblin"),
    ("Mary Jane Watson", "Mary Jane Watson", "marvel", "Mary Jane Watson"),
    ("Gwen Stacy", "Gwen Stacy", "marvel", "Gwen Stacy"),
    ("The Flash", "Flash (Barry Allen)", "dc", "Flash (Barry Allen)"),
    ("Green Lantern", "Hal Jordan", "dc", "Hal Jordan"),
    ("Supergirl", "Supergirl", "dc", "Supergirl"),
    ("Nightwing", "Nightwing", "dc", "Nightwing"),
    ("Penguin", "Penguin (character)", "dc", "Penguin"),
    ("Shazam", "Shazam (DC Comics)", "dc", "Shazam"),
    ("Darkseid", "Darkseid", "dc", "Darkseid"),
    ("Ross Geller", "Ross Geller", "friends", "Ross Geller"),
    ("Tommy Shelby", "Tommy Shelby", "peaky-blinders", "Thomas Shelby"),
    ("Dexter Morgan", "Dexter Morgan", "dexter", "Dexter Morgan"),
    ("Jim Halpert", "Jim Halpert", "theoffice", "Jim Halpert"),
    ("Gus Fring", "Gus Fring", "breakingbad", "Gus Fring"),
    ("Edward Cullen", "Edward Cullen", "twilight", "Edward Cullen"),
    ("Jacob Black", "Jacob Black", "twilight", "Jacob Black"),
    ("Peeta Mellark", "Peeta Mellark", "the-hungergames", "Peeta Mellark"),
    ("Pennywise", "Pennywise (character)", "stephenking", "It (character)"),
    ("Carrie White", "Carrie White", "stephenking", "Carrie White"),
    ("Chucky", "Chucky (Child's Play)", "chucky", "Chucky"),
    ("Patrick Bateman", "Patrick Bateman", "americanpsycho", "Patrick Bateman"),
    ("John Wick", "John Wick (character)", "johnwick", "John Wick"),
    ("Ethan Hunt", "Ethan Hunt", "missionimpossible", "Ethan Hunt"),
    ("Terminator", "Terminator (character)", "terminator", "T-800"),
]


def qid_for(term, tries=4):
    for n in range(tries):
        try:
            r = S.get("https://www.wikidata.org/w/api.php",
                      params={"action": "wbsearchentities", "search": term, "language": "en",
                              "format": "json", "limit": 5}, timeout=25)
            j = r.json()
        except Exception:
            time.sleep(3 * (n + 1))
            continue
        hits = j.get("search", [])
        for hit in hits:
            if FIC.search(hit.get("description", "") or ""):
                return hit["id"]
        if hits:
            return hits[0]["id"]
        time.sleep(2)
    return None


def fandom_image(wiki, title):
    for params in ({"action": "query", "titles": title, "prop": "pageimages", "piprop": "thumbnail",
                    "pithumbsize": 480, "format": "json", "redirects": 1},
                   {"action": "query", "generator": "search", "gsrsearch": title, "gsrlimit": 1,
                    "prop": "pageimages", "piprop": "thumbnail", "pithumbsize": 480, "format": "json"}):
        try:
            j = S.get(f"https://{wiki}.fandom.com/api.php", params=params, timeout=25).json()
        except Exception:
            continue
        pages = (j.get("query") or {}).get("pages", {})
        for p in (pages if isinstance(pages, list) else pages.values()):
            if p.get("thumbnail"):
                return p["thumbnail"]["source"]
    return None


def main():
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    cache = json.load(open(os.path.join(DATA, "char_images.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    have_ids = {c["id"] for c in chars}
    have_names = {c["name"].lower() for c in chars}
    qids = {}
    for name, term, wiki, title in WANT:
        if name.lower() in have_names:
            print(f"= {name} already present")
            continue
        q = qid_for(term)
        time.sleep(0.6)
        if not q:
            print(f"! {name}: no wikidata match for {term!r}")
            continue
        qids[q] = (name, wiki, title)
    missing = [q for q in qids if q not in det or not det[q].get("pLabel")]
    for i in range(0, len(missing), 40):
        for r in phase2(missing[i:i + 40]):
            det[r["p"]["value"].rsplit("/", 1)[-1]] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    sl = {}
    try:
        j = S.get("https://www.wikidata.org/w/api.php", params={
            "action": "wbgetentities", "ids": "|".join(list(qids)[:50]), "props": "sitelinks",
            "format": "json"}, timeout=30).json()
        for q, ent in j.get("entities", {}).items():
            sl[q] = len(ent.get("sitelinks", {}))
    except Exception as e:
        print("sitelinks failed:", str(e)[:60])
    added = 0
    for q, (name, wiki, title) in qids.items():
        if q in have_ids:
            continue
        d = det.get(q) or {}
        img = fandom_image(wiki, title) or d.get("image")
        if not (d.get("desc") or "").strip():
            print(f"? {name}: empty description")
        time.sleep(0.15)
        if not img:
            print(f"! {name}: no image")
            continue
        cache[q] = img
        chars.append(dict(id=q, name=name, gender=d.get("gLabel") or "other",
                          desc=d.get("desc", ""), image=img, sitelinks=sl.get(q, 40),
                          occupations=d.get("occs", "")))
        added += 1
        print(f"+ {name} ({q})")
    json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    print(f"added {added} | characters {len(chars)}")


if __name__ == "__main__":
    main()
