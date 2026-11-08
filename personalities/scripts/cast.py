#!/usr/bin/env python3
"""Harvest people attached to globally famous works ("did something popular").

Titles come from data/famous_works.txt (English Wikipedia titles). For each work we take its
cast (P161) plus its performers/creators, and add those people to data/phase1.json so they can be
scored like everyone else. People with few Wikipedia editions of their own still qualify when the
show/film they are known for is famous.
"""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityGameSeed/1.0 (famous works harvest)"})


def resolve(titles, batch=25):
    out = {}
    for i in range(0, len(titles), batch):
        chunk = titles[i:i + batch]
        for a in range(4):
            try:
                r = S.get("https://www.wikidata.org/w/api.php", params={
                    "action": "wbgetentities", "sites": "enwiki", "titles": "|".join(chunk),
                    "props": "sitelinks", "format": "json"}, timeout=40)
                if r.status_code == 200 and r.text.strip().startswith("{"):
                    for qid, ent in r.json().get("entities", {}).items():
                        if qid != "-1" and "missing" not in ent:
                            title = ent.get("sitelinks", {}).get("enwiki", {}).get("title")
                            if title:
                                out[qid] = (title, len(ent.get("sitelinks", {})))
                    break
            except Exception as e:
                print("   api retry", str(e)[:60], flush=True)
            time.sleep(2)
        time.sleep(0.4)
    return out


def main():
    titles = [t.strip() for t in open(os.path.join(DATA, "famous_works.txt")) if t.strip()]
    works = resolve(titles)
    # second pass: parenthetical disambiguators like "(TV series)" often differ from enwiki titles
    missing = [t for t in titles if t not in {v[0] for v in works.values()}]
    variants = []
    for t in missing:
        base = t.split(" (")[0].strip()
        variants += [base, f"{base} (film)", f"{base} (TV series)", f"{base} (2018 TV series)"]
    if variants:
        works.update({k: v for k, v in resolve(sorted(set(variants))).items()})
    print(f"resolved {len(works)} works from {len(titles)} titles", flush=True)
    ids = list(works)
    works_sl = {q: n for q, (t, n) in works.items()}
    people, wsl = {}, {}
    for i in range(0, len(ids), 25):
        vals = " ".join("wd:" + w for w in ids[i:i + 25])
        rows = sparql(f"""SELECT ?w ?p ?sl ?wsl WHERE {{
  VALUES ?w {{ {vals} }}
  {{ ?w wdt:P161 ?p }} UNION {{ ?w wdt:P175 ?p }} UNION {{ ?w wdt:P170 ?p }}
  OPTIONAL {{ ?p wikibase:sitelinks ?sl }}
  ?w wikibase:sitelinks ?wsl
}}""", timeout=180)
        for r in rows:
            p = r["p"]["value"].rsplit("/", 1)[-1]
            people[p] = max(people.get(p, 0), int(r["sl"]["value"]) if "sl" in r else 0)
            wsl[p] = max(wsl.get(p, 0), int(r["wsl"]["value"]))
        seen_here = {r["w"]["value"].rsplit("/", 1)[-1] for r in rows}
        for w in ids[i:i + 25]:                     # retry works that came back empty
            if w in seen_here:
                continue
            try:
                again = sparql(f"""SELECT ?p ?sl WHERE {{ wd:{w} wdt:P161 ?p .
                    OPTIONAL {{ ?p wikibase:sitelinks ?sl }} }}""", timeout=90)
                missing_w = [x for x in again]
                for r in missing_w:
                    p_ = r["p"]["value"].rsplit("/", 1)[-1]
                    people[p_] = max(people.get(p_, 0), int(r["sl"]["value"]) if "sl" in r else 0)
                    wsl[p_] = max(wsl.get(p_, 0), works_sl.get(w, 0))
            except Exception as e:
                print("   work retry failed", w, str(e)[:50], flush=True)
        print(f"  cast batch {i}: {len(people)} people", flush=True)

    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    fame_path = os.path.join(DATA, "fame.json")
    fame = json.load(open(fame_path)) if os.path.exists(fame_path) else {}
    added = 0
    for p, sl in people.items():
        # only bother with people whose famous work is genuinely big (>= 40 sitelinks)
        if wsl.get(p, 0) < 25:
            continue
        if p not in p1:
            p1[p] = dict(qid=p, sitelinks=max(sl, 1), bucket="cast", cat="actors", rank=50)
            added += 1
        # seed the work-fame signal we just measured
        cur = fame.setdefault(p, {})
        cur["work"] = max(cur.get("work", 0), wsl[p])
    extra_path = os.path.join(DATA, "extra_candidates.json")
    extra = json.load(open(extra_path)) if os.path.exists(extra_path) else {}
    for p_, rec in p1.items():
        if rec.get("bucket") == "cast":
            extra[p_] = rec
    json.dump(extra, open(extra_path, "w"))
    json.dump(p1, open(os.path.join(DATA, "phase1.json"), "w"))
    json.dump(fame, open(fame_path, "w"))
    print("new people from famous works:", added, "| candidates now:", len(p1))


if __name__ == "__main__":
    main()
