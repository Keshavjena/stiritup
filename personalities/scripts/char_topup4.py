#!/usr/bin/env python3
"""Final character top-up + safety filter: rejects non-character Wikidata items (games, franchises,
disambiguation pages) and fills the anime/game icons the earlier sweeps missed."""
import json, os, re, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from char_topup2 import fandom_image, qid_for
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (character top-up)"})

BAD_DESC = re.compile(r"disambiguation|media franchise|video game developed|arcade game|"
                      r"film series|animated series|television series$|novel by", re.I)

WANT = [  # (display name, wikidata search term, fandom wiki)
    ("Pac-Man", "Pac-Man (character)", "pacman"),
    ("Freddy Fazbear", "Freddy Fazbear", "fivenightsatfreddys"),
    ("Joel Miller", "Joel (The Last of Us)", "thelastofus"),
    ("Killua Zoldyck", "Killua Zoldyck", "hunterxhunter"),
    ("Tanjiro Kamado", "Tanjiro Kamado", "kimetsu-no-yaiba"),
    ("Nezuko Kamado", "Nezuko Kamado", "kimetsu-no-yaiba"),
    ("Zenitsu Agatsuma", "Zenitsu Agatsuma", "kimetsu-no-yaiba"),
    ("Makima", "Makima (Chainsaw Man)", "chainsaw-man"),
    ("Anya Forger", "Anya Forger", "spy-x-family"),
    ("Seong Gi-hun", "Seong Gi-hun", "squid-game"),
    ("Vecna", "Vecna (Stranger Things)", "strangerthings"),
    ("Odin", "Odin (Marvel Comics)", "marvel"),
    ("Ghostface", "Ghostface (Scream)", "scream"),
    ("Xenomorph", "Xenomorph", "alien"),
    ("Doc Brown", "Emmett Brown", "backtothefuture"),
    ("Marty McFly", "Marty McFly", "backtothefuture"),
]


def main():
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    cache = json.load(open(os.path.join(DATA, "char_images.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))

    bad = [c for c in chars if BAD_DESC.search(c.get("desc") or "")]
    if bad:
        print("removing non-character items:", [c["name"] for c in bad])
        chars = [c for c in chars if c not in bad]

    have = {c["id"] for c in chars}
    names = {c["name"].lower() for c in chars}
    found = {}
    for name, term, wiki in WANT:
        if name.lower() in names:
            print(f"= {name}")
            continue
        q = qid_for(term)
        time.sleep(0.7)
        if not q:
            print(f"! {name}: no wikidata match")
            continue
        found[q] = (name, wiki)
    missing = [q for q in found if q not in det or not det[q].get("pLabel")]
    for i in range(0, len(missing), 40):
        for r in phase2(missing[i:i + 40]):
            det[r["p"]["value"].rsplit("/", 1)[-1]] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)

    added = 0
    for q, (name, wiki) in found.items():
        if q in have:
            continue
        d = det.get(q) or {}
        if BAD_DESC.search(d.get("desc") or ""):
            print(f"! {name}: skipped ({d.get('desc', '')[:40]})")
            continue
        img = fandom_image(wiki, name) or d.get("image")
        time.sleep(0.2)
        if not img:
            print(f"! {name}: no image")
            continue
        cache[q] = img
        chars.append(dict(id=q, name=name, gender=d.get("gLabel") or "other", desc=d.get("desc", ""),
                          image=img, sitelinks=45, occupations=d.get("occs", "")))
        added += 1
        print(f"+ {name} ({q}) {d.get('desc', '')[:38]}")

    json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    print(f"added {added} | characters {len(chars)}")


if __name__ == "__main__":
    main()
