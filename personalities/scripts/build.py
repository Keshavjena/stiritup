#!/usr/bin/env python3
"""Build a large personality seed dataset for a guessing game from Wikidata.

phase 1  ids + sitelinks per bucket (most popular first), cached per bucket
phase 2  batched details (label, gender, description, image, birth, occupations, citizenship)
"""
import json, os, re, time, sys, glob
from urllib.parse import unquote, quote
from concurrent.futures import ThreadPoolExecutor
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
P1 = os.path.join(DATA, "p1")
os.makedirs(P1, exist_ok=True)

ACTOR = ["Q33999", "Q10800557", "Q10798782", "Q2405480"]
SINGER = ["Q177220", "Q2252262", "Q753110", "Q183945", "Q130857", "Q639669", "Q855091", "Q486748", "Q36834", "Q158852"]
SCI = ["Q169470", "Q593644", "Q170790", "Q864503", "Q11063", "Q205375", "Q6337803", "Q82594",
       "Q81096", "Q188094", "Q212980", "Q39631"]
TECH = ["Q131524", "Q43845", "Q484876", "Q557880", "Q5482740"]
MODEL = ["Q4610556", "Q3357567", "Q728711"]
CREATOR = ["Q17125263", "Q57414145", "Q94791573", "Q2045208"]
GLAM = ["Q3286043", "Q488111"]
HISTORY = ["Q116", "Q82955", "Q189290", "Q3242115", "Q4964182", "Q15253558", "Q11900058", "Q193391"]
WRITER = ["Q36180", "Q49757", "Q6625963", "Q1930187", "Q214917", "Q4853732"]
ARTIST = ["Q1028181", "Q42973", "Q33231", "Q3501317", "Q245068", "Q2526255", "Q156839",
          "Q1281618", "Q3391743", "Q483501"]
FANTASY = ["Q95074", "Q1569167", "Q15711870", "Q87576284", "Q188784"]
US_UK = ["Q30", "Q145", "Q16", "Q408", "Q27", "Q142"]
other_sports = ["Q2066131", "Q10843402", "Q12369333", "Q11607585", "Q11303721", "Q13141064",
                "Q10843263", "Q15117302", "Q19204627", "Q10871364", "Q10873124", "Q13381886",
                "Q12737077", "Q2309784", "Q5570756"]

BUCKETS = [
    dict(key="bollywood", occ=ACTOR, cap=1800, minsl=3, extra="?p wdt:P27 wd:Q668 .", cat="bollywood"),
    dict(key="hollywood", occ=ACTOR, cap=2600, minsl=5,
         extra="?p wdt:P27 ?c . FILTER(?c IN (" + ", ".join("wd:" + q for q in US_UK) + "))", cat="hollywood"),
    dict(key="actors", occ=ACTOR, cap=2600, minsl=6, cat="actors"),
    dict(key="singers", occ=SINGER, cap=2600, minsl=5, cat="singers"),
    dict(key="football", occ=["Q937857"], cap=1300, minsl=6, cat="athletes"),
    dict(key="cricket", occ=["Q12299841"], cap=700, minsl=3, cat="athletes"),
    dict(key="basketball", occ=["Q3665646"], cap=500, minsl=6, cat="athletes"),
    dict(key="tennis", occ=["Q10833314"], cap=450, minsl=6, cat="athletes"),
    dict(key="boxing", occ=["Q11338576"], cap=450, minsl=6, cat="athletes"),
    dict(key="racing", occ=["Q10349745"], cap=350, minsl=6, cat="athletes"),
    dict(key="othersport", occ=other_sports, cap=1100, minsl=6, cat="athletes"),
    dict(key="scientists", occ=SCI, cap=1700, minsl=5, cat="scientists"),
    dict(key="tech", occ=TECH, cap=1300, minsl=5, cat="tech"),
    dict(key="models", occ=MODEL, cap=900, minsl=4, cat="models"),
    dict(key="creators", occ=CREATOR, cap=800, minsl=4, cat="creators"),
    dict(key="glamour", occ=GLAM, cap=800, minsl=4, cat="glamour"),
    dict(key="history", occ=HISTORY, cap=2400, minsl=9, cat="history"),
    dict(key="writers", occ=WRITER, cap=1800, minsl=5, cat="writers"),
    dict(key="artists", occ=ARTIST, cap=1800, minsl=5, cat="artists"),
    dict(key="fantasy", occ=FANTASY, cap=900, minsl=3, cat="fantasy"),
    dict(key="indian", occ=["Q33999", "Q177220", "Q12299841", "Q937857", "Q131524", "Q82955"],
         cap=700, minsl=4, extra="?p wdt:P27 wd:Q668 .", cat="bollywood"),
    # ---- second pass: top up thin categories (appended so existing buckets keep priority) ----
    dict(key="models2", occ=MODEL, cap=4000, minsl=2, cat="models"),
    dict(key="glamour2", occ=GLAM, cap=3000, minsl=2, cat="glamour"),
    dict(key="creators2", occ=CREATOR, cap=2200, minsl=3, cat="creators"),
    dict(key="worldcinema", occ=ACTOR, cap=3000, minsl=6, cat="actors",
         extra="FILTER NOT EXISTS { ?p wdt:P27 ?cc . FILTER(?cc IN (wd:Q30, wd:Q145, wd:Q16, wd:Q408, wd:Q27, wd:Q142, wd:Q668)) }"),
    dict(key="artists2", occ=ARTIST, cap=3000, minsl=3, cat="artists"),
    dict(key="writers2", occ=WRITER, cap=3000, minsl=3, cat="writers"),
    dict(key="singers2", occ=SINGER, cap=3000, minsl=4, cat="singers"),
    dict(key="cricket2", occ=["Q12299841"], cap=1200, minsl=2, cat="athletes"),
    dict(key="india2", occ=["Q82955", "Q43845", "Q131524", "Q177220", "Q1930187", "Q2066131"],
         cap=2000, minsl=3, extra="?p wdt:P27 wd:Q668 .", cat="india"),
    dict(key="athletics", occ=["Q11513337"], cap=700, minsl=15, cat="athletes"),
    # ---- fame safety net: most notable fictional characters, then most notable citizens per country
    #      (category is derived from each person's occupations in export.py) ----
    dict(key="fame_fiction", p31s=["Q95074", "Q15632617", "Q15711870", "Q87576284", "Q188784",
                                   "Q80447738", "Q126398920", "Q30017383", "Q2239243"],
         cap=2500, minsl=8, cat="fantasy"),
    dict(key="fame_us", p27="Q30", cap=2000, minsl=60, cat="icons"),
    dict(key="fame_in", p27="Q668", cap=2200, minsl=18, cat="icons"),
    dict(key="fame_uk", p27="Q145", cap=1200, minsl=45, cat="icons"),
    dict(key="fame_ca", p27="Q16", cap=500, minsl=40, cat="icons"),
    dict(key="fame_au", p27="Q408", cap=500, minsl=40, cat="icons"),
    dict(key="fame_fr", p27="Q142", cap=700, minsl=40, cat="icons"),
    dict(key="fame_de", p27="Q183", cap=700, minsl=40, cat="icons"),
    dict(key="fame_it", p27="Q38", cap=700, minsl=40, cat="icons"),
    dict(key="fame_es", p27="Q29", cap=600, minsl=35, cat="icons"),
    dict(key="fame_br", p27="Q155", cap=600, minsl=32, cat="icons"),
    dict(key="fame_mx", p27="Q96", cap=500, minsl=30, cat="icons"),
    dict(key="fame_jp", p27="Q17", cap=800, minsl=32, cat="icons"),
    dict(key="fame_kr", p27="Q884", cap=600, minsl=28, cat="icons"),
    dict(key="fame_cn", p27="Q148", cap=600, minsl=32, cat="icons"),
    dict(key="fame_pk", p27="Q843", cap=500, minsl=18, cat="icons"),
    dict(key="fame_bd", p27="Q902", cap=400, minsl=18, cat="icons"),
    dict(key="fame_ng", p27="Q1033", cap=400, minsl=22, cat="icons"),
    dict(key="fame_eg", p27="Q79", cap=400, minsl=22, cat="icons"),
    dict(key="fame_tr", p27="Q43", cap=400, minsl=25, cat="icons"),
    dict(key="fame_ru", p27="Q159", cap=500, minsl=35, cat="icons"),
]




# ==========================================================
# Second-stage coverage: use the *subclass closure* of each root occupation so
# narrow occupations ("theoretical physicist", "film actor") still count.
# Cached in data/closure_<root>.json.
# ==========================================================
CLOSURE_ROOTS = [
    # (root qid, category, cap, min sitelinks)  -- narrow roots only; huge ones are skipped
    ("Q169470", "scientists", 700, 30),    # physicist
    ("Q593644", "scientists", 400, 30),    # chemist
    ("Q170790", "scientists", 400, 30),    # mathematician
    ("Q864503", "scientists", 350, 30),    # biologist
    ("Q11063", "scientists", 350, 30),     # astronomer
    ("Q205375", "scientists", 300, 30),    # inventor
    ("Q82594", "scientists", 300, 30),     # computer scientist
    ("Q39631", "scientists", 300, 30),     # physician
    ("Q33999", "actors", 1200, 40),        # actor
    ("Q177220", "singers", 900, 40),       # singer
    ("Q36180", "writers", 900, 40),        # writer
    ("Q1028181", "artists", 700, 35),      # painter
    ("Q2526255", "artists", 400, 40),      # film director
    ("Q245068", "artists", 400, 40),       # comedian
    ("Q4610556", "models", 600, 35),       # model
    ("Q131524", "tech", 500, 40),          # entrepreneur
    ("Q1930187", "writers", 400, 40),      # journalist
    ("Q17125263", "creators", 400, 35),    # YouTuber
    ("Q3286043", "glamour", 500, 25),      # erotic photography model
    ("Q488111", "glamour", 500, 25),       # pornographic film actor
    ("Q4964182", "history", 400, 40),      # philosopher
    ("Q937857", "athletes", 600, 40),      # association football player
    ("Q12299841", "athletes", 300, 30),    # cricketer
    ("Q3665646", "athletes", 250, 40),     # basketball player
    ("Q10833314", "athletes", 200, 40),    # tennis player
    ("Q11338576", "athletes", 200, 40),    # boxer
    ("Q10349745", "athletes", 200, 40),    # racing driver
]


def closure(root, depth_limit=4):
    """All occupations that are (transitively) subclasses of `root`, incl. root."""
    cache = os.path.join(DATA, f"closure_{root}.json")
    if os.path.exists(cache):
        return json.load(open(cache))
    rows = sparql(f"""SELECT DISTINCT ?occ WHERE {{ ?occ wdt:P279* wd:{root} . }}""")
    ids = sorted({r["occ"]["value"].rsplit("/", 1)[-1] for r in rows} | {root})
    if len(ids) > 2500:                      # too broad to inline in a VALUES clause
        print(f"   closure {root}: {len(ids)} occupations is too broad, using the root only", flush=True)
        ids = [root]
    json.dump(ids, open(cache, "w"))
    print(f"   closure {root}: {len(ids)} occupations", flush=True)
    return ids


def add_closure_buckets():
    for i, (root, cat, cap, minsl) in enumerate(CLOSURE_ROOTS):
        BUCKETS.append(dict(key=f"cl_{root}", occ=closure(root), cap=cap, minsl=minsl,
                            cat=cat, rank=100 + i))


def phase1(b):
    cache = os.path.join(P1, b["key"] + ".json")
    if os.path.exists(cache):
        return json.load(open(cache))
    if b.get("p31s"):
        cores = ["?p wdt:P31 ?cls . VALUES ?cls { " + " ".join("wd:" + c for c in b["p31s"]) + " }"]
    elif b.get("p27"):
        cores = [f"?p wdt:P27 wd:{b['p27']} . FILTER EXISTS {{ ?p wdt:P31 wd:Q5 }}"]
    else:
        occs = list(b["occ"])
        cores = ["?p wdt:P106 ?occ . VALUES ?occ { " + " ".join("wd:" + o for o in occs[i:i + 120]) + " }"
                 for i in range(0, len(occs), 120)]

    out, page = {}, 1000
    for core in cores:
        for off in range(0, 20000, page):
            if len(out) >= b["cap"]:
                break
            q = f"""SELECT ?p ?sl WHERE {{
  {core}
  ?p wikibase:sitelinks ?sl . FILTER(?sl >= {b['minsl']})
  {b.get('extra','')}
}} ORDER BY DESC(?sl) ?p LIMIT {page} OFFSET {off}"""
            rows = sparql(q)
            if not rows:
                break
            for r in rows:
                out[r["p"]["value"].rsplit("/", 1)[-1]] = int(r["sl"]["value"])
            print(f"  {b['key']}: off={off} unique={len(out)}", flush=True)
            if len(rows) < page:
                break
            time.sleep(0.2)
    res = sorted(([qid, sl] for qid, sl in out.items()), key=lambda x: -x[1])[:b["cap"]]
    json.dump(res, open(cache, "w"))
    return res


DETAIL_Q = """
SELECT ?p ?pLabel ?gLabel ?desc ?birth
       (SAMPLE(?img) AS ?image)
       (GROUP_CONCAT(DISTINCT ?occLabel; separator="|") AS ?occs)
       (GROUP_CONCAT(DISTINCT ?ctryLabel; separator="|") AS ?countries)
WHERE {{
  VALUES ?p {{ {vals} }}
  OPTIONAL {{ ?p rdfs:label ?len . FILTER(lang(?len) = "en") }}
  OPTIONAL {{ ?p rdfs:label ?lmul . FILTER(lang(?lmul) = "mul") }}
  BIND(COALESCE(?len, ?lmul) AS ?pLabel)
  FILTER(BOUND(?pLabel))
  OPTIONAL {{ ?p wdt:P21 ?g . ?g rdfs:label ?gLabel . FILTER(lang(?gLabel)="en") }}
  OPTIONAL {{ ?p schema:description ?den . FILTER(lang(?den)="en") }}
  OPTIONAL {{ ?p schema:description ?dmul . FILTER(lang(?dmul)="mul") }}
  BIND(COALESCE(?den, ?dmul) AS ?desc)
  OPTIONAL {{ ?p wdt:P569 ?birth }}
  OPTIONAL {{ ?p wdt:P18 ?img }}
  OPTIONAL {{ ?p wdt:P106 ?occ . ?occ rdfs:label ?occLabel . FILTER(lang(?occLabel)="en") }}
  OPTIONAL {{ ?p wdt:P27 ?ctry . ?ctry rdfs:label ?ctryLabel . FILTER(lang(?ctryLabel)="en") }}
}} GROUP BY ?p ?pLabel ?gLabel ?desc ?birth
"""


def phase2(qids):
    vals = " ".join("wd:" + q for q in qids)
    return sparql(DETAIL_Q.format(vals=vals))


def main():
    t0 = time.time()
    print("PHASE1", flush=True)
    add_closure_buckets()
    for b in BUCKETS:
        print(" bucket", b["key"], flush=True)
        phase1(b)

    # merge with bucket priority (earlier buckets win)
    people = {}
    for i, b in enumerate(BUCKETS):
        for qid, sl in json.load(open(os.path.join(P1, b["key"] + ".json"))):
            if qid not in people:
                cat = b["cat"]
                people[qid] = dict(qid=qid, sitelinks=sl, bucket=b["key"], cat=cat, rank=i)
    print("unique ids:", len(people), flush=True)
    json.dump(people, open(os.path.join(DATA, "phase1.json"), "w"))

    qids = list(people)
    batches = [qids[i:i + 50] for i in range(0, len(qids), 50)]
    details, done = {}, 0
    cache = os.path.join(DATA, "details.json")
    if os.path.exists(cache):
        details = {q: v for q, v in json.load(open(cache)).items() if "_empty" not in v}
    todo = [b for b in batches if any(q not in details for q in b)]
    print("detail batches:", len(todo), "of", len(batches), flush=True)

    def work(batch):
        for a in range(3):
            try:
                return batch, phase2(batch)
            except Exception as e:
                print("   retry", str(e)[:80], flush=True)
                time.sleep(3 + 3 * a)
        return batch, []

    with ThreadPoolExecutor(max_workers=4) as ex:
        for batch, rows in ex.map(work, todo):
            done += 1
            if not rows:                      # mark so we don't retry forever
                for q in batch:
                    details.setdefault(q, {"_empty": "1"})
            for r in rows:
                qid = r["p"]["value"].rsplit("/", 1)[-1]
                details[qid] = {k: v["value"] for k, v in r.items() if k != "p"}
            if done % 10 == 0:
                print(f"  {done}/{len(todo)} batches, {len(details)} rows, {round(time.time()-t0)}s", flush=True)
                json.dump(details, open(cache, "w"))
    # WDQS can silently truncate a long query, so sweep up anything still missing
    for sweep in range(4):
        missing = [q for q in qids if q not in details]
        if not missing:
            break
        print(f"sweep {sweep}: {len(missing)} ids still missing", flush=True)
        batches = [missing[i:i + 20] for i in range(0, len(missing), 20)]
        with ThreadPoolExecutor(max_workers=4) as ex:
            for batch, rows in ex.map(work, batches):
                for r in rows:
                    qid = r["p"]["value"].rsplit("/", 1)[-1]
                    details[qid] = {k: v["value"] for k, v in r.items() if k != "p"}
        json.dump(details, open(cache, "w"))
    print("DONE", len(details), "records in", round(time.time() - t0), "s", flush=True)


if __name__ == "__main__":
    main()
