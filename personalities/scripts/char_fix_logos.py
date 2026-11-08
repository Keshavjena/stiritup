#!/usr/bin/env python3
"""Replace generic franchise-logo fallbacks (Pokémon logo, Star Wars logo, ...) with real character art."""
import json, os, re, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fandom_images import WIKI

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (compatible; PersonalityDatasetBuilder/1.0)"})

BAD = re.compile(r"(International_Pok|Star_Wars_Yellow_Logo|Street_Fighter_Logo|LEGO_Harry_Potter_Logo"
                 r"|U\.N\.I\.T_logo|Toy_Story_logo|House_logo_new|Doctor_Who_logo|Red_Ribbon_Army_Logo"
                 r"|_logo\.|_Logo\.)", re.I)
# franchise name -> wiki override when the generic map has no entry
FIX = {"Pokémon": "pokemon", "Star Wars": "starwars", "Street Fighter": "streetfighter",
       "Harry Potter": "harrypotter", "Doctor Who": "tardis", "Toy Story": "pixar",
       "House (TV series)": "house", "Red Ribbon Army": "dragonball"}


def wiki_for(qid, mapping, desc):
    names = mapping.get(qid) or []
    names = names if isinstance(names, list) else [names]
    for n in names:
        if n in WIKI:
            return WIKI[n]
        if n in FIX:
            return FIX[n]
    d = (desc or "").lower()
    for key, sub in (("pokémon", "pokemon"), ("star wars", "starwars"), ("harry potter", "harrypotter"),
                     ("naruto", "naruto"), ("one piece", "onepiece"), ("dragon ball", "dragonball"),
                     ("doctor who", "tardis"), ("marvel", "marvel"), ("dc comics", "dc")):
        if key in d:
            return sub
    return None


def lookup(wiki, name):
    for params in ({"action": "query", "titles": name, "prop": "pageimages", "piprop": "thumbnail",
                    "pithumbsize": 480, "format": "json", "redirects": 1},
                   {"action": "query", "generator": "search", "gsrsearch": name, "gsrlimit": 1,
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
    mapping = json.load(open(os.path.join(DATA, "characters_raw.json")))["mapping"]
    bad = [c for c in chars if BAD.search(c.get("image") or "")]
    print("logo fallbacks:", len(bad))
    fixed, dropped = 0, []
    for i, c in enumerate(bad, 1):
        wiki = wiki_for(c["id"], mapping, c.get("desc"))
        img = lookup(wiki, c["name"]) if wiki else None
        time.sleep(0.12)
        if img:
            c["image"] = img
            cache[c["id"]] = img
            fixed += 1
        else:
            dropped.append(c["id"])
        if i % 50 == 0:
            print(f"  {i}/{len(bad)} fixed={fixed} dropped={len(dropped)}", flush=True)
            json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    keep = [c for c in chars if c["id"] not in set(dropped)]
    json.dump(keep, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    print(f"fixed {fixed} | dropped {len(dropped)} | characters {len(chars)} -> {len(keep)}")


if __name__ == "__main__":
    main()
