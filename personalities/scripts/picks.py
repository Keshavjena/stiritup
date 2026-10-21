#!/usr/bin/env python3
"""Guarantee that a hand-picked list of famous names is present.

Resolves enwiki titles -> Wikidata ids, adds any that are missing to phase1.json,
fetches their details, and records the category each one should land in.
"""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityGameSeed/1.0 (pick list)"})

FICTION = {
    "Q931", "Q483815", "Q189489",  # safety net, overwritten below by real ids
}


def api(params, tries=5):
    for a in range(tries):
        try:
            r = S.get("https://www.wikidata.org/w/api.php", params=params, timeout=40)
            if r.status_code == 200 and r.text.lstrip().startswith("{"):
                return r.json()
        except Exception as e:
            print("   api retry:", str(e)[:60], flush=True)
        time.sleep(2 * (a + 1))
    return {}


def resolve(titles, batch=20):
    out = {}
    for i in range(0, len(titles), batch):
        chunk = titles[i:i + batch]
        r = api({"action": "wbgetentities", "sites": "enwiki", "titles": "|".join(chunk),
                 "props": "sitelinks|claims", "format": "json"})
        title_by_qid = {v.get("title"): k for k, v in r.get("entities", {}).items() if "missing" not in v}
        for k, v in r.get("entities", {}).items():
            if "missing" in v or k == "-1":
                continue
            out[v.get("sitelinks", {}).get("enwiki", {}).get("title", k)] = (k, v)
        for t in chunk:
            if t not in out and t in title_by_qid:
                out[t] = (title_by_qid[t], r["entities"][title_by_qid[t]])
        time.sleep(0.6)
    return out


def is_fiction(entity):
    claims = entity.get("claims", {})
    p31 = [c["mainsnak"].get("datavalue", {}).get("value", {}).get("id") for c in claims.get("P31", [])]
    return bool(set(p31) & {"Q95074", "Q15632617", "Q15711870", "Q87576284", "Q188784",
                            "Q80447738", "Q126398920", "Q30017383", "Q2239243", "Q15773317"})


def main():
    titles = [t.strip() for t in open(os.path.join(DATA, "pick_titles.txt")) if t.strip()]
    found = resolve(titles)
    p1 = json.load(open(os.path.join(DATA, "phase1.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    cats = json.load(open(os.path.join(DATA, "pick_cats.json"))) if os.path.exists(
        os.path.join(DATA, "pick_cats.json")) else {}

    titles_map = {}

    added, skipped = [], []
    for title, (qid, ent) in found.items():
        cat = "fantasy" if is_fiction(ent) else "picks"
        if qid in p1:
            p1[qid].update(bucket="picks", cat=cat, rank=-1)   # picks win over generated buckets
            cats[qid] = cat
            titles_map[qid] = title
            continue
        sl = len(ent.get("sitelinks", {}))
        p1[qid] = dict(qid=qid, sitelinks=max(sl, 1), bucket="picks", cat=cat, rank=-1)
        cats[qid] = cat
        added.append(title)
        skipped.append(qid)
        titles_map[qid] = title

    todo = [q for q in skipped if q not in det]
    print("resolved:", len(found), "added:", len(added), "need details:", len(todo))
    for i in range(0, len(todo), 25):
        rows = phase2(todo[i:i + 25])
        for r in rows:
            qid = r["p"]["value"].rsplit("/", 1)[-1]
            det[qid] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.3)
    missing = [q for q in todo if q not in det]
    print("no details:", [t for t, v in found.items() if v[0] in missing][:10])
    json.dump(p1, open(os.path.join(DATA, "phase1.json"), "w"))
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    json.dump(cats, open(os.path.join(DATA, "pick_cats.json"), "w"))
    json.dump(titles_map, open(os.path.join(DATA, "pick_names.json"), "w"), indent=1)
    print("picks total:", sum(1 for v in p1.values() if v["bucket"] == "picks"))


if __name__ == "__main__":
    main()
