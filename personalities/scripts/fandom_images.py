#!/usr/bin/env python3
"""Fill remaining character images from Fandom wikis (they cover virtually every character).

Batches exact page titles (50 per request) per wiki, falls back to search for misses,
caches everything in data/char_images.json.
"""
import json, os, re, sys, time, requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
CACHE = os.path.join(DATA, "char_images.json")
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (compatible; PersonalityDatasetBuilder/1.0)"})

# franchise name (as in data/franchises.txt) -> fandom subdomain
WIKI = {
    "Marvel Cinematic Universe": "marvel", "Marvel Comics": "marvel", "Avengers (comics)": "marvel",
    "Iron Man": "marvel", "Captain America": "marvel", "Thor (Marvel Comics)": "marvel",
    "Hulk": "marvel", "Doctor Strange": "marvel", "Black Panther": "marvel",
    "Guardians of the Galaxy": "marvel", "Ant-Man": "marvel", "Deadpool": "marvel",
    "Wolverine": "marvel", "X-Men": "marvel", "Spider-Man": "marvel", "Venom": "marvel",
    "Fantastic Four": "marvel", "Moon Knight": "marvel", "She-Hulk": "marvel", "Ms. Marvel": "marvel",
    "Eternals": "marvel", "Shang-Chi": "marvel", "Blade (franchise)": "marvel",
    "Ghost Rider": "marvel", "Daredevil": "marvel", "Jessica Jones": "marvel",
    "Luke Cage": "marvel", "Punisher": "marvel", "WandaVision": "marvel", "Loki (TV series)": "marvel",
    "Agents of S.H.I.E.L.D.": "marvel", "DC Comics": "dc", "DC Extended Universe": "dc",
    "DC Universe (franchise)": "dc", "Batman": "dc", "Superman": "dc", "Wonder Woman": "dc",
    "Aquaman": "dc", "The Flash": "dc", "Green Lantern": "dc", "Watchmen": "dc",
    "Teen Titans": "dc", "Young Justice": "dc", "Smallville": "dc", "Gotham (TV series)": "dc",
    "Arrow (TV series)": "dc", "The Flash (TV series)": "dc", "Peacemaker (TV series)": "dc",
    "Game of Thrones": "gameofthrones", "House of the Dragon": "gameofthrones",
    "A Song of Ice and Fire": "gameofthrones",
    "Harry Potter": "harrypotter", "Fantastic Beasts": "harrypotter",
    "Star Wars": "starwars", "The Mandalorian": "starwars", "Ahsoka (TV series)": "starwars",
    "Obi-Wan Kenobi (TV series)": "starwars", "Andor (TV series)": "starwars",
    "The Book of Boba Fett": "starwars",
    "The Lord of the Rings": "lotr", "The Hobbit": "lotr", "The Rings of Power": "lotr",
    "The Witcher": "witcher", "The Hunger Games": "the-hunger-games",
    "Twilight (novel series)": "twilight-saga", "Percy Jackson & the Olympians": "percyjackson",
    "Stranger Things": "stranger-things", "The Boys (TV series)": "the-boys", "The Boys (comics)": "the-boys",
    "Breaking Bad": "breakingbad", "Better Call Saul": "breakingbad",
    "The Walking Dead (TV series)": "walkingdead", "The Walking Dead (comics)": "walkingdead",
    "Fear the Walking Dead": "walkingdead", "Supernatural (TV series)": "supernatural",
    "Doctor Who": "tardis", "Star Trek": "memory-alpha",
    "Pokémon": "pokemon", "Naruto": "naruto", "One Piece": "onepiece", "Dragon Ball": "dragonball",
    "Dragon Ball Z": "dragonball", "Dragon Ball Super": "dragonball",
    "Attack on Titan": "attackontitan", "Death Note": "deathnote",
    "My Hero Academia": "myheroacademia", "Demon Slayer: Kimetsu no Yaiba": "kimetsu-no-yaiba",
    "Jujutsu Kaisen": "jujutsu-kaisen", "Bleach (manga)": "bleach", "Fullmetal Alchemist": "fma",
    "Sword Art Online": "swordartonline", "Tokyo Ghoul": "tokyoghoul", "Hunter × Hunter": "hunterxhunter",
    "Sailor Moon": "sailormoon", "One-Punch Man": "onepunchman", "Chainsaw Man": "chainsaw-man",
    "Spy × Family": "spy-x-family", "Haikyu!!": "haikyuu", "Detective Conan": "detectiveconan",
    "Doraemon": "doraemon", "Inuyasha": "inuyasha", "Fairy Tail": "fairytail", "Black Clover": "blackclover",
    "Dr. Stone": "dr-stone", "Re:Zero": "rezero", "Overlord (novel series)": "overlord",
    "That Time I Got Reincarnated as a Slime": "tensura",
    "Steins;Gate": "steins-gate", "Code Geass": "codegeass", "Gintama": "gintama",
    "Psycho-Pass": "psycho-pass", "Mob Psycho 100": "mob-psycho-100",
    "Violet Evergarden": "violet-evergarden", "Spirited Away": "ghibli",
    "My Neighbor Totoro": "ghibli", "Princess Mononoke": "ghibli", "Howl's Moving Castle": "ghibli",
    "Akira": "akira", "Ghost in the Shell": "ghostintheshell",
    "Genshin Impact": "genshin-impact", "League of Legends": "leagueoflegends",
    "Overwatch": "overwatch", "Resident Evil": "residentevil", "Final Fantasy": "finalfantasy",
    "The Legend of Zelda": "zelda", "Super Mario": "mario", "Sonic the Hedgehog": "sonic",
    "Halo (franchise)": "halo", "God of War (franchise)": "godofwar",
    "Assassin's Creed": "assassinscreed", "The Last of Us": "thelastofus",
    "Elden Ring": "eldenring", "Dark Souls": "darksouls", "The Elder Scrolls": "elderscrolls",
    "Fallout (series)": "fallout", "Mass Effect": "masseffect", "Persona (series)": "megamitensei",
    "Street Fighter": "streetfighter", "Tekken": "tekken", "Mortal Kombat": "mortalkombat",
    "The Simpsons": "simpsons", "Family Guy": "familyguy", "South Park": "southpark",
    "SpongeBob SquarePants": "spongebob", "Disney Princess": "disney", "Pixar": "pixar",
    "Shrek": "shrek", "Ice Age (franchise)": "iceage", "Kung Fu Panda": "kungfupanda",
    "How to Train Your Dragon": "howtotrainyourdragon",
    "Fast & Furious": "fastandfurious", "Mission: Impossible": "missionimpossible",
    "James Bond": "jamesbond", "Pirates of the Caribbean": "pirates",
    "Indiana Jones": "indianajones", "Terminator (franchise)": "terminator",
    "Alien (franchise)": "avp", "Predator (franchise)": "avp", "Jurassic Park": "jurassicpark",
    "Back to the Future": "backtothefuture", "The Matrix": "matrix", "John Wick": "john-wick",
    "Rocky (franchise)": "rocky", "Rambo (franchise)": "rambo", "Die Hard": "diehard",
    "The Godfather": "godfather", "Peaky Blinders": "peaky-blinders", "Money Heist": "money-heist",
    "Squid Game": "squid-game", "Wednesday (TV series)": "wednesday", "Grey's Anatomy": "greysanatomy",
    "The Office (American TV series)": "theoffice", "Friends": "friends",
    "How I Met Your Mother": "how-i-met-your-mother", "The Big Bang Theory": "bigbangtheory",
    "Sherlock (TV series)": "sherlock", "Hannibal (TV series)": "hannibal", "Dexter (TV series)": "dexter",
    "House (TV series)": "house", "Riverdale": "riverdale", "Teen Wolf (TV series)": "teenwolf",
    "The Vampire Diaries": "vampirediaries", "Buffy the Vampire Slayer": "buffy",
    "Charmed": "charmed", "The 100 (TV series)": "the100", "Vikings (TV series)": "vikings",
    "The Last Kingdom": "the-last-kingdom", "The Wheel of Time": "wot", "Shadow and Bone": "shadowandbone",
    "Outlander (TV series)": "outlander", "Sex Education": "sex-education", "Elite (TV series)": "elite",
    "Dark (TV series)": "dark", "Lupin (French TV series)": "lupin", "Narcos": "narcos",
    "The Umbrella Academy": "umbrella-academy", "Doom Patrol": "doom-patrol", "Titans (TV series)": "titans",
    "Euphoria (American TV series)": "euphoria", "Succession (TV series)": "succession",
    "The Sopranos": "the-sopranos", "The Wire": "thewire", "Mad Men": "mad-men", "Lost (TV series)": "lost",
    "Prison Break": "prison-break", "24 (TV series)": "24", "Heroes (TV series)": "heroes",
    "The Sandman (TV series)": "sandman", "Yellowstone (American TV series)": "yellowstone",
    "Cobra Kai": "cobra-kai", "Karate Kid (franchise)": "karatekid",
    "Teenage Mutant Ninja Turtles": "turtlepedia", "Transformers": "transformers",
    "G.I. Joe": "gijoe", "Power Rangers": "powerrangers", "Ben 10": "ben10",
    "Adventure Time": "adventuretime", "Rick and Morty": "rickandmorty",
    "BoJack Horseman": "bojackhorseman", "Archer (TV series)": "archer", "Futurama": "futurama",
    "The Flintstones": "flintstones", "Scooby-Doo": "scoobydoo", "Looney Tunes": "looneytunes",
    "Tom and Jerry": "tomandjerry", "Peanuts": "peanuts", "Mickey Mouse": "disney",
    "Winnie the Pooh": "disney", "Alice in Wonderland": "disney", "Peter Pan": "disney",
    "Sherlock Holmes": "bakerstreet", "Dracula": "dracula", "Frankenstein": "frankenstein",
    "Frozen (franchise)": "disney", "Moana (franchise)": "disney", "Encanto": "disney",
    "Tangled": "disney", "Cinderella": "disney", "Snow White": "disney", "Sleeping Beauty": "disney",
    "The Little Mermaid": "disney", "Beauty and the Beast": "disney", "Aladdin (franchise)": "disney",
    "Mulan (franchise)": "disney", "Hercules (franchise)": "disney", "Tarzan": "disney",
    "The Lion King": "disney", "Toy Story": "pixar", "Finding Nemo": "pixar",
    "Monsters, Inc.": "pixar", "The Incredibles": "pixar", "Cars (franchise)": "pixar",
    "Ratatouille": "pixar", "Up (2009 film)": "pixar", "Inside Out (franchise)": "pixar",
    "Coco (2017 film)": "pixar", "Zootopia": "disney", "Big Hero 6": "disney", "WALL-E": "pixar",
    "Trolls (franchise)": "trolls", "The Smurfs": "smurfs", "My Little Pony": "mylittlepony",
    "Winx Club": "winx", "Miraculous: Tales of Ladybug & Cat Noir": "miraculousladybug",
    "Steven Universe": "steven-universe", "Gravity Falls": "gravityfalls",
    "Phineas and Ferb": "phineasandferb", "Kim Possible": "kimpossible", "Danny Phantom": "dannypantom",
    "Avatar: The Last Airbender": "avatar", "The Legend of Korra": "avatar",
    "Invincible (TV series)": "invincible", "Invincible (comics)": "invincible",
    "Hellboy": "hellboy", "The Mask": "the-mask", "Kick-Ass": "kick-ass", "Scott Pilgrim": "scottpilgrim",
    "Sin City": "sincity", "300 (comics)": "300", "V for Vendetta": "vforkvendetta",
    "Fables (comics)": "fables", "Asterix": "asterix", "Tintin": "tintin",
}


def wiki_for(franchises):
    for f in franchises:
        w = WIKI.get(f)
        if w:
            return w
    for f in franchises:
        base = re.sub(r"\s*\(.*?\)\s*", "", f)
        guess = re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-")
        if guess:
            return guess
    return None


def api(wiki, params, tries=4):
    for a in range(tries):
        try:
            r = S.get(f"https://{wiki}.fandom.com/api.php", params=params, timeout=35)
            if r.status_code == 200 and r.text.lstrip().startswith("{"):
                return r.json()
            if r.status_code == 429:
                time.sleep(3 * (a + 1))
                continue
        except Exception:
            pass
        time.sleep(1 + a)
    return {}


def pageimage(wiki, title):
    j = api(wiki, {"action": "query", "titles": title, "prop": "pageimages",
                   "piprop": "thumbnail", "pithumbsize": 480, "format": "json", "redirects": 1})
    pages = (j.get("query") or {}).get("pages", {})
    pages = pages if isinstance(pages, list) else list(pages.values())
    for p in pages:
        if p.get("thumbnail"):
            return p["thumbnail"]["source"]
    j = api(wiki, {"action": "query", "generator": "search", "gsrsearch": title, "gsrlimit": 1,
                   "prop": "pageimages", "piprop": "thumbnail", "pithumbsize": 480, "format": "json"})
    pages = (j.get("query") or {}).get("pages", {})
    pages = pages if isinstance(pages, list) else list(pages.values())
    for p in pages:
        if p.get("thumbnail"):
            return p["thumbnail"]["source"]
    return None


def main():
    det = json.load(open(os.path.join(DATA, "details.json")))
    raw = json.load(open(os.path.join(DATA, "characters_raw.json")))
    mapping, chars = raw["mapping"], raw["characters"]
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}

    qids = [q for q, sl in chars.items()
            if sl >= 2 and (det.get(q) or {}).get("pLabel") and (det.get(q) or {}).get("gLabel")]
    need = [q for q in qids if not (det.get(q) or {}).get("image") and not cache.get(q)]
    print(f"characters {len(qids)} | still need image {len(need)}", flush=True)

    # group by wiki
    groups = {}
    for q in need:
        w = wiki_for(mapping.get(q, []))
        if w:
            groups.setdefault(w, []).append(q)
    print("wikis involved:", len(groups), flush=True)

    done = 0
    for wiki, qs in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        print(f"  {wiki}: {len(qs)}", flush=True)
        for i in range(0, len(qs), 40):
            for q in qs[i:i + 40]:
                name = det[q]["pLabel"]
                url = pageimage(wiki, name)
                cache[q] = url
                done += 1
                time.sleep(0.12)
            if done % 400 < 40:
                json.dump(cache, open(CACHE, "w"))
    json.dump(cache, open(CACHE, "w"))
    got = sum(1 for q in qids if det[q].get("image") or cache.get(q))
    print(f"with image now: {got}/{len(qids)}")


if __name__ == "__main__":
    main()
