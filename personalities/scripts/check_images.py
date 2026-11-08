#!/usr/bin/env python3
"""HEAD-check every image URL in the export; report the dead ones (rate-limit 429s are ignored)."""
import json, os, sys, collections
from concurrent.futures import ThreadPoolExecutor
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = json.load(open(os.path.join(ROOT, "data", "personalities.json")))
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (compatible; PersonalityDatasetBuilder/1.0)"})


def check(r):
    for _ in range(2):
        try:
            resp = S.get(r["image"], timeout=20, stream=True)
            resp.close()
            code = resp.status_code
        except Exception as e:
            code = type(e).__name__
        if code != 429:
            return r, code
    return r, 429


def main():
    with ThreadPoolExecutor(max_workers=10) as ex:
        results = list(ex.map(check, rows))
    counts = collections.Counter(str(c) for _, c in results)
    dead = [(r, c) for r, c in results if str(c) not in ("200",)]
    print(dict(counts))
    json.dump([{"id": r["id"], "name": r["name"], "category": r["category"],
                "image": r["image"], "status": str(c)} for r, c in dead],
              open(os.path.join(ROOT, "data", "dead_images.json"), "w"), indent=1)
    print("written", len(dead), "non-200 to data/dead_images.json")


if __name__ == "__main__":
    main()
