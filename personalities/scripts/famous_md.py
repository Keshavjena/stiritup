#!/usr/bin/env python3
"""Write FAMOUS.md - the famous names in every category, so you can eyeball what's in the pool."""
import json, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = json.load(open(os.path.join(ROOT, "data", "personalities.json")))

ORDER = ["hollywood", "bollywood", "actors", "singers", "athletes", "models", "glamour",
         "creators", "fantasy", "artists", "writers", "tech", "icons", "scientists", "history"]
TITLES = {"glamour": "Glamour / 18+", "creators": "Creators & influencers",
          "models": "Models & pageant", "fantasy": "Fictional characters",
          "icons": "Icons (opt-in when needed)"}
LIMIT = 60


def line(r):
    bits = [r["name"]]
    meta = []
    if r.get("age"):
        meta.append(str(r["age"]))
    if r["country"]:
        meta.append(r["country"])
    if meta:
        bits.append(f"({', '.join(meta)})")
    return " ".join(bits)


out = ["# Famous names by category\n",
       f"{len(rows):,} records, everyone 70 or younger, every record has a portrait.\n",
       "`A+` = household name. Opt-in categories (scientists, history) are excluded from "
       "default rounds.\n"]
counts = collections.Counter(r["category"] for r in rows)
for cat in ORDER:
    sub = sorted([r for r in rows if r["category"] == cat], key=lambda r: -r["popularity"])
    if not sub:
        continue
    out.append(f"\n## {TITLES.get(cat, cat.capitalize())} — {len(sub):,} records")
    out.append(f" · A+ {sum(1 for r in sub if r['tier'] == 'A+')}"
               f" · opt-in {'yes' if sub[0]['optIn'] else 'no'}\n\n")
    top = [r for r in sub if r["tier"] == "A+"][:LIMIT] if len(sub) > LIMIT else sub
    out.append(", ".join(line(r) for r in top))
    if len(sub) > len(top):
        out.append(f"\n\n*…plus {len(sub) - len(top):,} more A-tier names in this category.*")
    out.append("\n")
open(os.path.join(ROOT, "FAMOUS.md"), "w").write("".join(out))
print("wrote FAMOUS.md", round(os.path.getsize(os.path.join(ROOT, "FAMOUS.md")) / 1024), "KB")
