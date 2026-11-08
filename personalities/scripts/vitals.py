#!/usr/bin/env python3
"""Fetch birth (P569) and death (P570) dates for every candidate -> data/vitals.json"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
Q = """SELECT ?p ?birth ?death WHERE {{
  VALUES ?p {{ {vals} }}
  OPTIONAL {{ ?p wdt:P569 ?birth }}
  OPTIONAL {{ ?p wdt:P570 ?death }}
}}"""


def fetch(batch):
    for a in range(3):
        try:
            return batch, sparql(Q.format(vals=" ".join("wd:" + q for q in batch)), timeout=150)
        except Exception as e:
            print("   retry", str(e)[:60], flush=True)
            time.sleep(3 + 3 * a)
    return batch, []


def main():
    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    path = os.path.join(DATA, "vitals.json")
    vit = json.load(open(path)) if os.path.exists(path) else {}
    todo = [q for q in p1 if q not in vit]
    print("candidates:", len(p1), "to fetch:", len(todo), flush=True)
    batches = [todo[i:i + 80] for i in range(0, len(todo), 80)]
    done = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        for batch, rows in ex.map(fetch, batches):
            done += 1
            got = {}
            for r in rows:
                q = r["p"]["value"].rsplit("/", 1)[-1]
                rec = got.setdefault(q, {"birth": None, "death": None})
                if "birth" in r:
                    rec["birth"] = r["birth"]["value"][:10]
                if "death" in r:
                    rec["death"] = r["death"]["value"][:10]
            for q in batch:
                vit.setdefault(q, got.get(q, {"birth": None, "death": None}))
            if done % 40 == 0:
                print(f"  {done}/{len(batches)}", flush=True)
                json.dump(vit, open(path, "w"))
    json.dump(vit, open(path, "w"))
    live = sum(1 for v in vit.values() if v.get("birth") and not v.get("death"))
    print("vitals:", len(vit), "| with birth:", sum(1 for v in vit.values() if v.get('birth')),
          "| living:", live)


if __name__ == "__main__":
    main()
