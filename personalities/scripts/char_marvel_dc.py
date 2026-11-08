#!/usr/bin/env python3
"""Backfill the last Marvel / DC characters the franchise sweep harvested but couldn't image."""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from char_topup2 import fandom_image
from build import phase2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
MARVEL = ("marvel", "spider-man", "x-men", "avengers", "iron man", "thor", "hulk", "captain america",
          "wolverine", "deadpool", "venom", "daredevil", "loki", "guardians", "fantastic four",
          "ant-man", "black panther", "doctor strange", "punisher", "blade", "she-hulk", "ms. marvel",
          "eternals", "moon knight", "jessica jones", "luke cage", "ghost rider", "shang-chi")
DC = ("dc comics", "batman", "superman", "wonder woman", "justice league", "green lantern", "flash",
      "aquaman", "suicide squad", "shazam", "teen titans", "arrow", "gotham", "smallville", "watchmen",
      "cyborg", "harley quinn", "catwoman", "supergirl", "batwoman", "peacemaker", "doom patrol",
      "titans", "constantine", "sandman")


def main():
    raw = json.load(open(os.path.join(DATA, "characters_raw.json")))
    chars = json.load(open(os.path.join(DATA, "characters.json")))
    cache = json.load(open(os.path.join(DATA, "char_images.json")))
    det = json.load(open(os.path.join(DATA, "details.json")))
    have = {c["id"] for c in chars}
    todo = {}
    for q, sl in raw["characters"].items():
        if q in have or sl < 3:
            continue
        fr = raw["mapping"].get(q) or []
        low = " | ".join([fr] if isinstance(fr, str) else fr).lower()
        wiki = "marvel" if any(k in low for k in MARVEL) else "dc" if any(k in low for k in DC) else None
        if wiki:
            todo[q] = wiki
    print("candidates:", len(todo))
    missing = [q for q in todo if q not in det or not det[q].get("pLabel")]
    for i in range(0, len(missing), 40):
        for r in phase2(missing[i:i + 40]):
            det[r["p"]["value"].rsplit("/", 1)[-1]] = {k: v["value"] for k, v in r.items() if k != "p"}
        time.sleep(0.2)
    added = 0
    for q, wiki in todo.items():
        d = det.get(q) or {}
        name = d.get("pLabel")
        if not name:
            continue
        img = fandom_image(wiki, name) or d.get("image")
        time.sleep(0.15)
        if not img:
            continue
        cache[q] = img
        chars.append(dict(id=q, name=name, gender=d.get("gLabel") or "other", desc=d.get("desc", ""),
                          image=img, sitelinks=raw["characters"][q],
                          occupations=d.get("occs", "")))
        added += 1
    json.dump(chars, open(os.path.join(DATA, "characters.json"), "w"))
    json.dump(cache, open(os.path.join(DATA, "char_images.json"), "w"))
    json.dump(det, open(os.path.join(DATA, "details.json"), "w"))
    print(f"added {added} | characters {len(chars)}")


if __name__ == "__main__":
    main()
