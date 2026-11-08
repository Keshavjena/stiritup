#!/usr/bin/env python3
"""Fame signals that go beyond "how many Wikipedias have an article about them".

For every candidate we compute `best_work`, the sitelink count of the most famous thing the
person is attached to (film/TV they were cast in, song they performed, book they wrote, band or
sports team they belong to, event they competed in). Someone like Melissa O'Neil has only ~23
sitelinks herself, but her show has 32 - so "did something popular" is captured.

Output: data/fame.json  ->  { "<qid>": {"work": 32} }
"""
import json, os, sys, time
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

Q = """SELECT ?p (MAX(?wsl) AS ?best) WHERE {{
  VALUES ?p {{ {vals} }}
  {{ ?w wdt:P161 ?p }} UNION {{ ?w wdt:P175 ?p }} UNION {{ ?w wdt:P463 ?p }} UNION
  {{ ?p wdt:P54 ?w }} UNION {{ ?w wdt:P1344 ?p }} UNION {{ ?w wdt:P50 ?p }} UNION
  {{ ?w wdt:P170 ?p }}
  ?w wikibase:sitelinks ?wsl .
}} GROUP BY ?p"""


def fetch(batch):
    for a in range(3):
        try:
            return sparql(Q.format(vals=" ".join("wd:" + q for q in batch)), timeout=150)
        except Exception as e:
            print("   retry", str(e)[:70], flush=True)
            time.sleep(3 + 3 * a)
    return []


def main():
    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    out_path = os.path.join(DATA, "fame.json")
    fame = json.load(open(out_path)) if os.path.exists(out_path) else {}
    todo = [q for q in p1 if q not in fame]
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        todo = list(p1)
    print("candidates:", len(p1), "to score:", len(todo), flush=True)
    batches = [todo[i:i + 80] for i in range(0, len(todo), 80)]
    done = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        for rows in ex.map(fetch, batches):
            done += 1
            got = {r["p"]["value"].rsplit("/", 1)[-1]: int(r["best"]["value"]) for r in rows}
            for q in batches[min(done - 1, len(batches) - 1)]:
                fame.setdefault(q, {})["work"] = got.get(q, 0)
            if done % 25 == 0:
                print(f"  {done}/{len(batches)}", flush=True)
                json.dump(fame, open(out_path, "w"))
    for q in todo:                       # people with no attached work at all
        fame.setdefault(q, {}).setdefault("work", 0)
    json.dump(fame, open(out_path, "w"))
    vals = sorted((v.get("work", 0) for v in fame.values()), reverse=True)
    print("scored:", len(fame), "| median work fame:", vals[len(vals) // 2], "| top:", vals[:8])


if __name__ == "__main__":
    main()
