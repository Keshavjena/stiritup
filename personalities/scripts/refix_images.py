#!/usr/bin/env python3
"""Re-resolve character images whose URL now 404s (deleted/renamed Fandom files).

Order: Fandom wiki again (subdomain taken from the dead URL) -> Wikidata P18 on Commons -> drop.
"""
import json, os, re, sys, time
from urllib.parse import quote
import requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from char_topup2 import fandom_image
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (compatible; PersonalityDatasetBuilder/1.0)"})


def commons_image(qid):
    rows = sparql(f"""SELECT ?img WHERE {{ wd:{qid} wdt:P18 ?img . }} LIMIT 1""", timeout=60)
    if not rows:
        return None
    url = rows[0]["img"]["value"]                      # .../Special:FilePath/File_name.jpg
    name = url.rsplit("/", 1)[-1]
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(name.replace(" ", "_"), safe="(),'!&-_.%")


def main():
    dead = [x for x in json.load(open(os.path.join(DATA, "dead_images.json"))) if x["status"] == "404"]
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    by_id = {c["id"]: c for c in chars}
    cache = json.load(open(os.path.join(DATA, "char_images.json")))
    fixed, dropped = 0, []
    for i, x in enumerate(dead, 1):
        c = by_id.get(x["id"])
        if not c:
            continue
        host = x["image"].split("/")[2]                 # e.g. static.wikia.nocookie.net
        wiki = None
        if "fandom.com" not in host and "nocookie.net" in host:
            wiki = x["image"].split("/")[3]             # /kirby/images/... -> kirby
        img = fandom_image(wiki, c["name"]) if wiki else None
        time.sleep(0.2)
        if not img:
            img = commons_image(c["id"])
            time.sleep(0.2)
        if img:
            c["image"] = img
            cache[c["id"]] = img
            fixed += 1
        else:
            dropped.append(c["id"])
        if i % 40 == 0:
            print(f"  {i}/{len(dead)} fixed={fixed} dropped={len(dropped)}", flush=True)
    keep = [c for c in chars if c["id"] not in set(dropped)]
    json.dump(keep, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    print(f"fixed {fixed} | dropped {len(dropped)} | characters {len(chars)} -> {len(keep)}")


if __name__ == "__main__":
    main()
