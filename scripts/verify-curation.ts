import { getPeople } from "../lib/catalog/service"
import { generateKMKRounds } from "../lib/catalog/game-generator"

console.log("--- 1. Testing Default / 'All' Category (Scientists & History Excluded) ---")
const allResult = getPeople({ limit: 100 })
const hasSciOrHistInAll = allResult.items.some(
  (p) => p.category === "scientists" || p.category === "history"
)
console.log("Scientists or History found in 'All' query?:", hasSciOrHistInAll)

const kmkRounds = generateKMKRounds({ count: 10, category: "all" })
const kmkHasSciOrHist = kmkRounds.some((r) =>
  r.persons.some((p) => p.category === "scientists" || p.category === "history")
)
console.log("Scientists or History in default KMK rounds?:", kmkHasSciOrHist)

console.log("\n--- 2. Testing Explicit Category Requests ---")
const sci = getPeople({ category: "scientists", limit: 20 })
console.log("Explicit Scientists count:", sci.items.length)
console.log("Sample Scientists:", sci.items.slice(0, 6).map((p) => p.name))

const hist = getPeople({ category: "history", limit: 20 })
console.log("Explicit History count:", hist.items.length)
console.log("Sample History:", hist.items.slice(0, 6).map((p) => p.name))

console.log("\n--- 3. Testing Newly Added Categories ---")
const creators = getPeople({ category: "creators", limit: 10 })
console.log("Creators:", creators.items.map((p) => p.name))

const adult = getPeople({ category: "adultstars", limit: 10 })
console.log("OnlyFans & Glamour / Adult:", adult.items.map((p) => p.name))

const f1 = getPeople({ category: "f1", limit: 10 })
console.log("F1:", f1.items.map((p) => p.name))

const combat = getPeople({ category: "combat", limit: 10 })
console.log("Combat:", combat.items.map((p) => p.name))

const wwe = getPeople({ category: "wwe", limit: 10 })
console.log("WWE:", wwe.items.map((p) => p.name))

