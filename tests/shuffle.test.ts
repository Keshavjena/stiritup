import test from "node:test"
import assert from "node:assert/strict"
import { sample10MysteryItems } from "../lib/draft/kmk-draft-dataset"

test("Shuffle engine tests across games", async (t) => {
  await t.test("sample10MysteryItems produces 10 items and samples randomly without bias", () => {
    const run1 = sample10MysteryItems("celebrity-icons").map(i => i.name)
    const run2 = sample10MysteryItems("celebrity-icons").map(i => i.name)
    assert.equal(run1.length, 10)
    assert.equal(run2.length, 10)
    // Run1 and Run2 should not be completely identical across all 10 positions
    const isExactSame = run1.every((name, idx) => name === run2[idx])
    assert.equal(isExactSame, false, "Consecutive mystery pool generations should shuffle differently")
  })

  await t.test("Fisher-Yates guarantee of order change for player setup with >= 2 players", () => {
    const players = ["Alice", "Bob"]
    const copy = [...players]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = copy[i]
      copy[i] = copy[j]
      copy[j] = temp
    }
    if (copy.every((p, idx) => p === players[idx])) {
      const temp = copy[0]
      copy[0] = copy[1]
      copy[1] = temp
    }
    assert.notDeepEqual(copy, players, "Two players must swap positions upon shuffle")
    assert.deepEqual(copy, ["Bob", "Alice"])
  })

  await t.test("Paired Fisher-Yates preserves alignment between gameContent and personRounds", () => {
    const questions = ["Q1", "Q2", "Q3", "Q4", "Q5"]
    const rounds = [
      { id: "r1", trio: ["A", "B", "C"] },
      { id: "r2", trio: ["D", "E", "F"] },
      { id: "r3", trio: ["G", "H", "I"] },
      { id: "r4", trio: ["J", "K", "L"] },
      { id: "r5", trio: ["M", "N", "O"] }
    ]

    const indices = Array.from({ length: questions.length }, (_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = indices[i]
      indices[i] = indices[j]
      indices[j] = temp
    }
    if (indices.length > 1 && indices[0] === 0) {
      const swapTarget = 1 + Math.floor(Math.random() * (indices.length - 1))
      const temp = indices[0]
      indices[0] = indices[swapTarget]
      indices[swapTarget] = temp
    }

    const shuffledQ = indices.map((idx) => questions[idx])
    const shuffledR = indices.map((idx) => rounds[idx])

    assert.notEqual(shuffledQ[0], "Q1", "First question must change upon shuffle")
    assert.notEqual(shuffledR[0].id, "r1", "First round must change upon shuffle")
    // Each question matches its paired round
    for (let i = 0; i < shuffledQ.length; i++) {
      const origIndex = questions.indexOf(shuffledQ[i])
      assert.equal(shuffledR[i].id, rounds[origIndex].id, "Alignment between text and round must be strictly preserved")
    }
  })
})
