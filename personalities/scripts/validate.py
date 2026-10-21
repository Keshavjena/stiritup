#!/usr/bin/env python3
"""QA pass over data/personalities.json -> data/report.md (+ optional live image checks)."""
import json, os, re, sys, random, collections, unicodedata, urllib.request


def norm_name(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s.lower())

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CATS = {"bollywood", "hollywood", "actors", "singers", "athletes", "scientists", "tech",
        "models", "creators", "glamour", "history", "writers", "artists", "fantasy", "india",
        "icons"}
GENDERS = {"male", "female", "non-binary", "other"}
IMG = re.compile(r"^https://commons\.wikimedia\.org/wiki/Special:FilePath/[^\s]+\.(jpe?g|png)$", re.I)
SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def main():
    rows = json.load(open(os.path.join(DATA, "personalities.json")))
    errs = collections.Counter()
    examples = collections.defaultdict(list)

    def err(kind, r):
        errs[kind] += 1
        if len(examples[kind]) < 6:
            examples[kind].append(r["name"])

    ids, names = set(), set()
    for r in rows:
        if not isinstance(r, dict):
            err("not_object", {"name": "?"}); continue
        for f in ("id", "name", "gender", "category", "tags", "description", "image", "popularity"):
            if f not in r:
                err("missing_" + f, r)
        if r["id"] in ids:
            err("dupe_id", r)
        ids.add(r["id"])
        key = norm_name(r["name"])
        if key in names:
            err("dupe_name", r)
        names.add(key)
        if r["gender"] not in GENDERS:
            err("bad_gender", r)
        if r["category"] not in CATS:
            err("bad_category", r)
        if r["image"] and not IMG.match(r["image"]):
            err("bad_image_url", r)
        if not r["image"] and r["category"] != "fantasy":
            err("no_image", r)
        if not (2 <= len(r["name"]) <= 80):
            err("bad_name_length", r)
        if re.search(r"(list of|disambiguation|\(born)", r["name"], re.I):
            err("suspicious_name", r)
        if not r["description"] or len(r["description"]) < 8:
            err("bad_description", r)
        if not r["tags"] or len(r["tags"]) > 10:
            err("bad_tag_count", r)
        for t in r["tags"]:
            if not SLUG.match(t) or len(t) > 31:
                err("bad_tag_format", r)
        if len(set(r["tags"])) != len(r["tags"]):
            err("dupe_tag", r)
        if not isinstance(r["popularity"], int) or r["popularity"] <= 0:
            err("bad_popularity", r)

    cats = collections.Counter(r["category"] for r in rows)
    gens = collections.Counter(r["gender"] for r in rows)
    with_img = sum(1 for r in rows if r["image"])
    tiers = collections.Counter(
        "A (60+ wiki editions)" if r["popularity"] >= 60 else
        "B (25-59)" if r["popularity"] >= 25 else
        "C (10-24)" if r["popularity"] >= 10 else "D (<10)" for r in rows)

    live = ""
    if "--check-images" in sys.argv:
        sample = random.sample(rows, min(40, len(rows)))
        bad = []
        for r in sample:
            if not r["image"]:
                continue
            url = r["image"] + "?width=320"
            try:
                req = urllib.request.Request(url, method="HEAD",
                                             headers={"User-Agent": "SeedQA/1.0"})
                with urllib.request.urlopen(req, timeout=25) as resp:
                    if resp.status != 200:
                        bad.append((r["name"], resp.status))
            except Exception as e:
                bad.append((r["name"], str(e)[:60]))
        live = f"\n**Live image check:** {len(sample) - len(bad)}/{len(sample)} returned HTTP 200.\n"
        if bad:
            live += "- failures: " + ", ".join(f"{n} ({e})" for n, e in bad[:10]) + "\n"

    lines = [f"# Seed dataset QA report\n",
             f"**Records:** {len(rows):,}  \n"
             f"**With portrait image:** {with_img:,} ({with_img/len(rows)*100:.1f}%)  \n"
             f"**Unique ids / names:** {len(ids):,} / {len(names):,}\n",
             "\n## Errors\n"]
    if errs:
        for k, v in errs.most_common():
            lines.append(f"- `{k}`: {v}  e.g. {', '.join(examples[k])}\n")
    else:
        lines.append("None - all checks passed.\n")
    lines.append("\n## By category\n\n| category | count |\n|---|---|\n")
    for c, n in cats.most_common():
        lines.append(f"| {c} | {n:,} |\n")
    lines.append("\n## By gender\n\n| gender | count |\n|---|---|\n")
    for g, n in gens.most_common():
        lines.append(f"| {g} | {n:,} |\n")
    lines.append("\n## Popularity tiers (difficulty)\n\n| tier | count |\n|---|---|\n")
    for t, n in sorted(tiers.items()):
        lines.append(f"| {t} | {n:,} |\n")
    lines.append(live)
    out = os.path.join(DATA, "report.md")
    open(out, "w").write("".join(lines))
    print("".join(lines))
    print("wrote", out)


if __name__ == "__main__":
    main()
