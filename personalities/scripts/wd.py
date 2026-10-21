import requests, json, time, sys
from urllib.parse import unquote, quote

UA = "PersonalityGameSeed/1.0 (web game dataset builder; contact user@example.com)"
EP = "https://query.wikidata.org/sparql"
S = requests.Session()
S.headers.update({"User-Agent": UA, "Accept": "application/sparql-results+json"})

def sparql(q, retries=6, timeout=120):
    last = None
    for a in range(retries):
        try:
            r = S.post(EP, data={"query": q, "format": "json"}, timeout=timeout)
            if r.status_code == 200:
                return r.json()["results"]["bindings"]
            last = f"HTTP {r.status_code}: {r.text[:200]}"
        except Exception as e:
            last = repr(e)
        time.sleep(3 * (a + 1))
    raise RuntimeError(last)

if __name__ == "__main__":
    q = """
SELECT ?p ?pLabel ?gender ?genderLabel ?image ?desc ?sl ?birth WHERE {
  ?p wdt:P106 wd:Q33999 ; wdt:P21 ?gender ; wdt:P18 ?image ; wikibase:sitelinks ?sl .
  FILTER(?sl >= 5)
  OPTIONAL { ?p schema:description ?desc FILTER(lang(?desc)="en") }
  OPTIONAL { ?p wdt:P569 ?birth }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} ORDER BY ?p LIMIT 200 OFFSET 0
"""
    t=time.time(); rows = sparql(q); print("rows", len(rows), "in", round(time.time()-t,1),"s")
    for r in rows[:4]: print({k:v["value"] for k,v in r.items()})
