#!/usr/bin/env python3
"""Second chance for characters whose Fandom lookup failed: English Wikipedia REST summary."""
import json, os, sys, time, requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CACHE = os.path.join(DATA, "char_images.json")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (personal game data)"})


def main():
    det = json.load(open(os.path.join(DATA, "details.json")))
    raw = json.load(open(os.path.join(DATA, "characters_raw.json")))
    chars, titles_needed = raw["characters"], {}
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

    from wd import sparql
    qids = [q for q in chars if chars[q] >= 2 and (det.get(q) or {}).get("pLabel")]
    fails = [q for q in qids if not det[q].get("image") and not cache.get(q)]
    print("retry with wikipedia REST:", len(fails))
    if not fails:
        return
    # english article titles
    Q = """SELECT ?c ?article WHERE {{ VALUES ?c {{ {vals} }}
      ?article schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> . }}"""
    titles = {}
    for i in range(0, len(fails), 120):
        try:
            for r in sparql(Q.format(vals=" ".join("wd:" + q for q in fails[i:i + 120])), timeout=150):
                titles[r["c"]["value"].rsplit("/", 1)[-1]] = r["article"]["value"].split("/wiki/", 1)[-1]
        except Exception as e:
            print("  sparql retry", str(e)[:50])
    print("titles:", len(titles))

    ok = 0
    for n, (q, t) in enumerate(titles.items(), 1):
        try:
            r = S.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{t}", timeout=20)
            if r.status_code == 200:
                src = (r.json().get("thumbnail") or {}).get("source")
                if src:
                    cache[q] = src.split("?")[0]
                    ok += 1
            elif r.status_code == 429:
                time.sleep(5)
        except Exception:
            pass
        if n % 50 == 0:
            print(f"  {n}/{len(titles)} -> {ok} images", flush=True)
            json.dump(cache, open(CACHE, "w"))
        time.sleep(0.25)
    json.dump(cache, open(CACHE, "w"))
    got = sum(1 for q in qids if det[q].get("image") or cache.get(q))
    print(f"added {ok} | with image now {got}/{len(qids)}")


if __name__ == "__main__":
    main()
