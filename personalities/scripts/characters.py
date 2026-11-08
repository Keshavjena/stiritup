#!/usr/bin/env python3
"""Harvest fictional characters from A-tier franchises (Marvel, DC, GoT, Harry Potter, anime,
games, Disney, ...) and give every one of them an image.

Two signals per franchise:
  * characters whose "present in work" (P1441) is the franchise itself
  * characters whose P1441 is any work that is part of the franchise (P179 closure)
Images: Wikidata P18 first (free), then the English Wikipedia page image (fair-use thumbnails
served from upload.wikimedia.org), then the character is dropped if neither exists.
"""
import json, os, sys, time, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wd import sparql

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityGameSeed/1.0 (character harvest)"})


def api(params, tries=4):
    for a in range(tries):
        try:
            r = S.get("https://www.wikidata.org/w/api.php", params=params, timeout=40)
            if r.status_code == 200 and r.text.lstrip().startswith("{"):
                return r.json()
        except Exception:
            pass
        time.sleep(2 * (a + 1))
    return {}


def resolve(titles):
    out = {}
    batch = 20
    for i in range(0, len(titles), batch):
        chunk = titles[i:i + batch]
        r = api({"action": "wbgetentities", "sites": "enwiki", "titles": "|".join(chunk),
                 "props": "sitelinks|claims", "format": "json"})
        for qid, ent in r.get("entities", {}).items():
            if qid == "-1" or "missing" in ent:
                continue
            t = ent.get("sitelinks", {}).get("enwiki", {}).get("title")
            if t:
                out[qid] = (t, len(ent.get("sitelinks", {})))
        time.sleep(0.5)
    return out


def characters_of(franchise_qid):
    q = f"""SELECT DISTINCT ?c ?sl WHERE {{
  {{ ?c wdt:P1441 wd:{franchise_qid} }} UNION
  {{ ?w wdt:P179 wd:{franchise_qid} . ?c wdt:P1441 ?w }} UNION
  {{ ?w wdt:P8345 wd:{franchise_qid} . ?c wdt:P1441 ?w }}
  OPTIONAL {{ ?c wikibase:sitelinks ?sl }}
}}"""
    try:
        return sparql(q, timeout=120)
    except Exception as e:
        print("   franchise query failed:", str(e)[:60], flush=True)
        return []


def wikipedia_pageimages(titles, size=480):
    """title -> thumbnail URL, via en.wikipedia pageimages (works for fair-use images too)."""
    out = {}
    batch = 50
    for i in range(0, len(titles), batch):
        chunk = titles[i:i + batch]
        for a in range(3):
            try:
                r = S.get("https://en.wikipedia.org/w/api.php", params={
                    "action": "query", "titles": "|".join(chunk), "prop": "pageimages",
                    "piprop": "thumbnail", "pithumbsize": size, "format": "json",
                    "redirects": 1}, timeout=40)
                if r.status_code != 200:
                    raise RuntimeError(r.status_code)
                data = r.json()["query"]
                norm = {n["from"]: n["to"] for n in data.get("normalized", [])}
                pages = data["pages"]
                for title in chunk:
                    t = norm.get(title, title)
                    for _, p in pages.items():
                        if p.get("title") == t and p.get("thumbnail"):
                            out[title] = p["thumbnail"]["source"]
                break
            except Exception as e:
                print("   wp retry", str(e)[:50], flush=True)
                time.sleep(2 * (a + 1))
        time.sleep(0.4)
    return out


def main():
    names = [l.strip() for l in open(os.path.join(DATA, "franchises.txt")) if l.strip()]
    franchises = resolve(names)
    print(f"resolved {len(franchises)} franchises of {len(names)}", flush=True)

    found, per, mapping = {}, {}, {}
    for i, (qid, (title, sl)) in enumerate(sorted(franchises.items(), key=lambda x: -x[1][1])):
        rows = characters_of(qid)
        n = 0
        for r in rows:
            c = r["c"]["value"].rsplit("/", 1)[-1]
            found[c] = max(found.get(c, 0), int(r["sl"]["value"]) if "sl" in r else 0)
            mapping.setdefault(c, []).append(title)
            n += 1
        per[title] = n
        if n:
            print(f"  {title}: {n} characters (total {len(found)})", flush=True)
        time.sleep(0.2)

    print(f"unique characters: {len(found)}", flush=True)
    json.dump({"characters": found, "per_franchise": per, "mapping": mapping,
               "franchise_qid": {title: qid for qid, (title, sl) in franchises.items()}},
              open(os.path.join(DATA, "characters_raw.json"), "w"))


if __name__ == "__main__":
    main()
