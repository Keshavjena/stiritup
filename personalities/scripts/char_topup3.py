#!/usr/bin/env python3
"""Third curated character top-up: games, anime and film/TV icons (Mario, Wolverine, Tanjiro, ...).

Resolves each English Wikipedia article -> Wikidata Q-id (REST summary) -> artwork from the
matching Fandom wiki (falls back to the Wikipedia thumbnail). Appends to data/characters.json.
"""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from char_topup2 import fandom_image
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (character top-up)"})

# (display name, enwiki title, fandom wiki)
WANT = [
    ("Wolverine", "Wolverine (character)", "marvel"),
    ("Mario", "Mario", "mario"),
    ("Luigi", "Luigi", "mario"),
    ("Princess Peach", "Princess Peach", "mario"),
    ("Bowser", "Bowser", "mario"),
    ("Yoshi", "Yoshi", "mario"),
    ("Kirby", "Kirby (character)", "kirby"),
    ("Pac-Man", "Pac-Man", "pacman"),
    ("Steve", "Steve (Minecraft)", "minecraft"),
    ("Freddy Fazbear", "Freddy Fazbear", "fivenightsatfreddys"),
    ("Nathan Drake", "Nathan Drake", "uncharted"),
    ("Ellie", "Ellie (The Last of Us)", "thelastofus"),
    ("Joel Miller", "Joel Miller", "thelastofus"),
    ("Arthur Morgan", "Arthur Morgan", "reddead"),
    ("Aloy", "Aloy", "horizon"),
    ("Saitama", "Saitama (One-Punch Man)", "onepunchman"),
    ("Gon Freecss", "Gon Freecss", "hunterxhunter"),
    ("Killua Zoldyck", "Killua Zoldyck", "hunterxhunter"),
    ("Tanjiro Kamado", "Tanjiro Kamado", "kimetsu-no-yaiba"),
    ("Nezuko Kamado", "Nezuko Kamado", "kimetsu-no-yaiba"),
    ("Zenitsu Agatsuma", "Zenitsu Agatsuma", "kimetsu-no-yaiba"),
    ("Yuji Itadori", "Yuji Itadori", "jujutsu-kaisen"),
    ("Makima", "Makima", "chainsaw-man"),
    ("Anya Forger", "Anya Forger", "spy-x-family"),
    ("Seong Gi-hun", "Seong Gi-hun", "squid-game"),
    ("Vecna", "Vecna (Stranger Things)", "strangerthings"),
    ("Meredith Grey", "Meredith Grey", "greysanatomy"),
    ("Glenn Rhee", "Glenn Rhee", "walkingdead"),
    ("Ragnar Lothbrok", "Ragnar Lothbrok", "vikings"),
    ("Odin", "Odin (Marvel Comics)", "marvel"),
    ("Vision", "Vision (Marvel Comics)", "marvel"),
    ("Ghostface", "Ghostface (Scream)", "scream"),
    ("Michael Myers", "Michael Myers (Halloween)", "halloween"),
    ("Xenomorph", "Xenomorph", "alien"),
    ("RoboCop", "RoboCop (character)", "robocop"),
    ("Doc Brown", "Doc Brown", "backtothefuture"),
    ("Marty McFly", "Marty McFly", "backtothefuture"),
    ("Jack Torrance", "Jack Torrance", "stephenking"),
    ("Norman Bates", "Norman Bates", "psycho"),
    ("Hannibal Lecter", "Hannibal Lecter", "hannibal"),
    ("Dexter Morgan", "Dexter Morgan", "dexter"),
]


def qid_image(title):
    try:
        r = S.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}", timeout=25)
        if r.status_code != 200:
            return None, None
        j = r.json()
        src = (j.get("thumbnail") or {}).get("source")
        return j.get("wikibase_item"), (src.split("?")[0] if src else None)
    except Exception:
        return None, None


def main():
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    cache = json.load(open(os.path.join(DATA, "char_images.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    have = {c["id"] for c in chars}
    names = {c["name"].lower() for c in chars}
    found = {}
    for name, title, wiki in WANT:
        if name.lower() in names:
            print(f"= {name}")
            continue
        q, thumb = qid_image(title)
        time.sleep(0.5)
        if not q:
            print(f"! {name}: no article {title!r}")
            continue
        found[q] = (name, wiki, thumb)
    missing = [q for q in found if q not in det or not det[q].get("pLabel")]
    for i in range(0, len(missing), 40):
        for r in phase2(missing[i:i + 40]):
            det[r["p"]["value"].rsplit("/", 1)[-1]] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)
    added = 0
    for q, (name, wiki, thumb) in found.items():
        if q in have:
            continue
        d = det.get(q) or {}
        img = fandom_image(wiki, name) or thumb or d.get("image")
        time.sleep(0.2)
        if not img:
            print(f"! {name}: no image")
            continue
        cache[q] = img
        chars.append(dict(id=q, name=name, gender=d.get("gLabel") or "other", desc=d.get("desc", ""),
                          image=img, sitelinks=50, occupations=d.get("occs", "")))
        added += 1
        print(f"+ {name} ({q}) {d.get('desc', '')[:38]}")
    json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    print(f"added {added} | characters {len(chars)}")


if __name__ == "__main__":
    main()
