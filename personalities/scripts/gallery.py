#!/usr/bin/env python3
"""Self-contained HTML sample sheet (images inlined as data URIs) for eyeballing the dataset."""
import json, os, base64, io, time, collections
import requests
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = json.load(open(os.path.join(ROOT, "data", "personalities.json")))
S = requests.Session()
S.headers.update({"User-Agent": "PersonalityGameSeed/1.0 (dataset sample sheet)"})

PER_CAT = 6
picks = []
by = collections.defaultdict(list)
for r in rows:
    by[r["category"]].append(r)
for cat, items in by.items():
    top = sorted(items, key=lambda r: -r["popularity"])[:PER_CAT]
    picks.extend(top)


def thumb(r, tries=3):
    if not r["image"]:
        return r, None
    for a in range(tries):
        try:
            resp = S.get(r["image"] + "?width=220", timeout=40)
            if resp.status_code == 200 and len(resp.content) < 1_500_000:
                return r, base64.b64encode(resp.content).decode()
        except Exception:
            pass
        time.sleep(1.5 * (a + 1))
    return r, None


with ThreadPoolExecutor(max_workers=3) as ex:
    out = list(ex.map(thumb, picks))

cards = []
for r, b64 in out:
    img = (f'<img src="data:image/jpeg;base64,{b64}" alt="">' if b64
           else '<div class="ph">no image</div>')
    cards.append(f"""    <figure>
      {img}
      <figcaption><b>{r['name']}</b><span class="cat">{r['category']}</span>
      <em>{r['description']}</em>
      <span class="meta">{r['gender']} · pop {r['popularity']}{' · b. ' + str(r['birthYear']) if r['birthYear'] else ''}</span></figcaption>
    </figure>""")

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Seed dataset sample — {len(rows):,} records</title>
<style>
 body{{margin:0;background:#0d1117;color:#e6edf3;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}}
 header{{padding:28px 32px 8px}} h1{{margin:0 0 6px;font-size:22px}}
 p.sub{{margin:0;color:#9aa4b2}}
 .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;padding:20px 32px 48px}}
 figure{{margin:0;background:#161b22;border:1px solid #21262d;border-radius:12px;overflow:hidden}}
 figure img,.ph{{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#21262d}}
 .ph{{display:flex;align-items:center;justify-content:center;color:#6e7681;font-size:12px}}
 figcaption{{padding:10px 12px 12px;display:flex;flex-direction:column;gap:3px}}
 .cat{{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#58a6ff}}
 em{{color:#9aa4b2;font-style:normal;font-size:12px}}
 .meta{{font-size:11px;color:#6e7681}}
</style></head><body>
<header><h1>Seed dataset sample — {len(rows):,} records, {sum(1 for r in rows if r['image']):,} with portraits</h1>
<p class="sub">Top {PER_CAT} most-notable entries from every category, thumbnails inlined from Wikimedia Commons.</p></header>
<div class="grid">
{chr(10).join(cards)}
</div></body></html>
"""
open(os.path.join(ROOT, "gallery.html"), "w").write(html)
print("gallery.html", round(len(html)/1024), "KB,", sum(1 for r, b in out if b), "images")
