#!/usr/bin/env python3
"""Top fictional characters by notability that the franchise sweep missed (Iron Man, Joker, ...)."""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityDatasetBuilder/1.0 (character top-up)"})


def main():
    rows = sparql("""SELECT ?c ?sl WHERE {
      ?c wdt:P31/wdt:P279* wd:Q95074 ; wikibase:sitelinks ?sl . FILTER(?sl >= 14)
    }""", timeout=300)
    top = {r["c"]["value"].rsplit("/", 1)[-1]: int(r["sl"]["value"]) for r in rows}
    print("candidate characters:", len(top))

    det = json.load(open(os.path.join(DATA, "details.json")))
    cache = json.load(open(os.path.join(DATA, "char_images.json"))) if os.path.exists(
        os.path.join(DATA, "char_images.json")) else {}
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    have = {c["id"] for c in chars}
    todo = [q for q in top if q not in have]
    print("missing from dataset:", len(todo))

    # details for the ones we don't know yet
    need = [q for q in todo if q not in det or not det[q].get("pLabel")]
    for i in range(0, len(need), 40):
        for r in phase2(need[i:i + 40]):
            q = r["p"]["value"].rsplit("/", 1)[-1]
            det[q] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))

    # english titles for the image lookup
    Q = """SELECT ?c ?article WHERE {{ VALUES ?c {{ {vals} }}
      ?article schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> . }}"""
    titles = {}
    for i in range(0, len(todo), 120):
        try:
            for r in sparql(Q.format(vals=" ".join("wd:" + q for q in todo[i:i + 120])), timeout=150):
                titles[r["c"]["value"].rsplit("/", 1)[-1]] = r["article"]["value"].split("/wiki/", 1)[-1]
        except Exception as e:
            print("  sparql retry", str(e)[:50])

    added = 0
    for n, q in enumerate(todo, 1):
        d = det.get(q) or {}
        if not d.get("pLabel") or not d.get("gLabel"):
            continue
        img = d.get("image") or cache.get(q)
        if not img and q in titles:
            try:
                r = S.get(f"https://en.wikipedia.org/api/rest_v1/page/summary/{titles[q]}", timeout=20)
                if r.status_code == 200:
                    src = (r.json().get("thumbnail") or {}).get("source")
                    if src:
                        img = src.split("?")[0]
                        cache[q] = img
            except Exception:
                pass
            time.sleep(0.35)
        if not img:
            continue
        chars.append(dict(id=q, name=d["pLabel"], gender=d.get("gLabel"), desc=d.get("desc", ""),
                          image=img, sitelinks=top[q], occupations=d.get("occs", "")))
        added += 1
        if n % 100 == 0:
            print(f"  {n}/{len(todo)} (+{added})", flush=True)
            json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
            json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    print(f"added {added} characters | total {len(chars)}")


if __name__ == "__main__":
    main()
