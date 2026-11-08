#!/usr/bin/env python3
"""Details + images for harvested characters -> data/characters.json"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql
from build import phase2
from characters import wikipedia_pageimages
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(DATA, "characters.json")

TITLES_Q = """SELECT ?c ?article WHERE {{
  VALUES ?c {{ {vals} }}
  ?article schema:about ?c ; schema:isPartOf <https://en.wikipedia.org/> .
}}"""


def enwiki_titles(qids):
    out = {}
    batches = [qids[i:i + 120] for i in range(0, len(qids), 120)]
    def work(b):
        for a in range(3):
            try:
                rows = sparql(TITLES_Q.format(vals=" ".join("wd:" + q for q in b)), timeout=150)
                return rows
            except Exception as e:
                print("   retry", str(e)[:60], flush=True)
                time.sleep(3)
        return []
    with ThreadPoolExecutor(max_workers=4) as ex:
        for rows in ex.map(work, batches):
            for r in rows:
                c = r["c"]["value"].rsplit("/", 1)[-1]
                out[c] = r["article"]["value"].split("/wiki/", 1)[-1].replace("_", " ")
    return out


def main():
    raw = json.load(open(os.path.join(DATA, "characters_raw.json")))
    chars = raw["characters"]
    print("harvested:", len(chars))
    # only reasonably notable ones
    chars = {q: sl for q, sl in chars.items() if sl >= 2}
    print("with sitelinks>=2:", len(chars))

    det = json.load(open(os.path.join(DATA, "details.json")))
    todo = [q for q in chars if q not in det or not det[q].get("pLabel")]
    print("need details:", len(todo))
    for i in range(0, len(todo), 40):
        rows = phase2(todo[i:i + 40])
        for r in rows:
            q = r["p"]["value"].rsplit("/", 1)[-1]
            det[q] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))

    usable = [q for q in chars if (det.get(q) or {}).get("pLabel") and (det.get(q) or {}).get("gLabel")]
    print("with name+gender:", len(usable))

    # images: P18 first
    have_p18 = {q for q in usable if det[q].get("image")}
    need_wp = [q for q in usable if q not in have_p18]
    print(f"P18 images: {len(have_p18)} | need Wikipedia image: {len(need_wp)}")

    titles = enwiki_titles(need_wp)
    print("enwiki titles:", len(titles))
    wp = wikipedia_pageimages(list(titles.values()))
    print("wikipedia thumbnails:", len(wp))

    out = []
    for q in usable:
        d = det[q]
        img = d.get("image")
        if not img:
            t = titles.get(q)
            if t and t in wp:
                img = wp[t]
        if not img:
            continue
        out.append(dict(id=q, name=d["pLabel"], gender=d.get("gLabel"),
                        desc=d.get("desc", ""), image=img,
                        sitelinks=chars[q], occupations=d.get("occs", "")))
    print("characters with image:", len(out))
    json.dump(out, open(OUT, "w"))


if __name__ == "__main__":
    main()
