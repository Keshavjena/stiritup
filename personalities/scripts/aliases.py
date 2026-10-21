#!/usr/bin/env python3
"""Attach English alias names (Wikidata skos:altLabel) to every record in details.json."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
Q = """SELECT ?p (GROUP_CONCAT(DISTINCT ?al; separator="|") AS ?aliases) WHERE {{
  VALUES ?p {{ {vals} }}
  OPTIONAL {{ ?p skos:altLabel ?al . FILTER(lang(?al) = "en") }}
}} GROUP BY ?p"""


def fetch(batch):
    for a in range(3):
        try:
            return sparql(Q.format(vals=" ".join("wd:" + q for q in batch)))
        except Exception as e:
            print("   retry", str(e)[:60], flush=True)
            time.sleep(3)
    return []


def main():
    det = json.load(open(os.path.join(DATA, "details.json")))
    todo = [q for q, v in det.items() if "aliases" not in v]
    print("records:", len(det), "need aliases:", len(todo))
    batches = [todo[i:i + 60] for i in range(0, len(todo), 60)]
    done = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        for rows in ex.map(fetch, batches):
            done += 1
            for r in rows:
                qid = r["p"]["value"].rsplit("/", 1)[-1]
                if qid in det:
                    det[qid]["aliases"] = r.get("aliases", {}).get("value", "")
            if done % 25 == 0:
                print(f"  {done}/{len(batches)}", flush=True)
                json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    print("aliases done")


if __name__ == "__main__":
    main()
