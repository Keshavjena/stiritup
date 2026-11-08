#!/usr/bin/env python3
"""Fill in images for characters that lack a Wikidata P18, using English Wikipedia page images.
Polite: serial, 1 request/second, honours Retry-After, caches every result."""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (personal game data; contact: user@example.com)"})
CACHE = os.path.join(DATA, "char_images.json")

TITLES_Q = """SELECT ?c ?article WHERE {{
  VALUES ?c {{ {vals} }}
  ?article schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> .
}}"""


def enwiki_titles(qids):
    out = {}
    for i in range(0, len(qids), 120):
        for a in range(3):
            try:
                rows = sparql(TITLES_Q.format(vals=" ".join("wd:" + q for q in qids[i:i + 120])), timeout=150)
                for r in rows:
                    c = r["c"]["value"].rsplit("/", 1)[-1]
                    out[c] = r["article"]["value"].split("/wiki/", 1)[-1].replace("_", " ")
                break
            except Exception as e:
                print("  sparql retry", str(e)[:50], flush=True)
                time.sleep(3)
    return out


def fetch_images(titles):
    """titles: list of page titles -> {title: thumbnail_url}"""
    out = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i:i + 40]
        for a in range(6):
            try:
                r = S.get("https://en.wikipedia.org/w/api.php", params={
                    "action": "query", "titles": "|".join(chunk), "prop": "pageimages",
                    "piprop": "thumbnail", "pithumbsize": 480, "format": "json",
                    "redirects": 1, "formatversion": 2}, timeout=45)
                if r.status_code == 429:
                    wait = int(r.headers.get("Retry-After", 5)) + a * 5
                    print(f"   429, waiting {wait}s", flush=True)
                    time.sleep(wait)
                    continue
                if r.status_code != 200:
                    raise RuntimeError(r.status_code)
                data = r.json().get("query", {})
                pages = data.get("pages", [])
                pages = pages if isinstance(pages, list) else list(pages.values())
                by_title = {p.get("title"): p for p in pages}
                # resolve redirects/normalisation
                redirects = {x["from"]: x["to"] for x in data.get("redirects", [])}
                normal = {x["from"]: x["to"] for x in data.get("normalized", [])}
                for t in chunk:
                    tt = redirects.get(normal.get(t, t), normal.get(t, t))
                    p = by_title.get(tt) or by_title.get(t)
                    if p and p.get("thumbnail"):
                        out[t] = p["thumbnail"]["source"]
                break
            except Exception as e:
                print("   wp retry", str(e)[:60], flush=True)
                time.sleep(3 * (a + 1))
        time.sleep(1.0)
    return out


def main():
    raw = json.load(open(os.path.join(DATA, "characters_raw.json")))["characters"]
    det = json.load(open(os.path.join(DATA, "details.json")))
    chars = {q: sl for q, sl in raw.items() if sl >= 2}
    usable = [q for q in chars if (det.get(q) or {}).get("pLabel") and (det.get(q) or {}).get("gLabel")]
    need = [q for q in usable if not (det.get(q) or {}).get("image")]
    print(f"usable {len(usable)} | missing image {len(need)}", flush=True)

    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    print("cached images:", len(cache))
    todo = [q for q in need if q not in cache]
    if not todo:
        print("nothing to fetch")
    else:
        titles = enwiki_titles(todo)
        print("titles resolved:", len(titles))
        got = fetch_images(list(titles.values()))
        for q, t in titles.items():
            if t in got:
                cache[q] = got[t]
            else:
                cache.setdefault(q, None)
        json.dump(cache, open(CACHE, "w"))
        print("cached after run:", sum(1 for v in cache.values() if v))
    have = sum(1 for q in usable if (det.get(q) or {}).get("image") or cache.get(q))
    print(f"characters with an image: {have}/{len(usable)}")


if __name__ == "__main__":
    main()
