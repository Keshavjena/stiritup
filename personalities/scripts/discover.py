import requests, json, sys, time

S = requests.Session()
S.headers.update({"User-Agent":"PersonalityGameSeed/1.0 (contact: user@example.com)"})

def search(term):
    r = S.get("https://www.wikidata.org/w/api.php", params={
        "action":"wbsearchentities","search":term,"language":"en",
        "format":"json","type":"item","limit":3}, timeout=20)
    out=[]
    for hit in r.json().get("search",[]):
        out.append((hit["id"], hit.get("label"), (hit.get("description") or "")[:70]))
    return out

terms = [
 "actor","film actor","television actor","stage actor","voice actor",
 "singer","songwriter","rapper","musician","record producer","disc jockey",
 "model","fashion model","glamour model","adult model","pornographic actor",
 "cricketer","football player","basketball player","tennis player","boxer",
 "racing driver","athlete","swimmer","wrestler","mixed martial artist","golfer","badminton player","field hockey player","volleyball player",
 "physicist","chemist","mathematician","biologist","astronomer","inventor","neuroscientist","physician",
 "computer scientist","engineer","programmer","entrepreneur","businessperson","chief executive officer","investor",
 "philosopher","historian","writer","poet","novelist","journalist","painter","architect","composer","conductor","chef","comedian","film director","photographer","fashion designer",
 "YouTuber","influencer","internet celebrity","streamer","tiktoker",
 "politician","monarch","military officer","revolutionary","emperor","queen regnant","diplomat","activist","monk",
 "fictional character","superhero","video game character","animated character","manga character",
 "pornographic film actor","playmate","philanthropist","astronaut","pilot","explorer",
]
res={}
for t in terms:
    try:
        res[t]=search(t)
    except Exception as e:
        res[t]=[("ERR",str(e),"")]
    time.sleep(0.05)
print(json.dumps(res, indent=1, ensure_ascii=False))
