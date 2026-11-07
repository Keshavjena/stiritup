import { test } from 'node:test'
import assert from 'node:assert/strict'
import { expansion, mergeExpansion, indianDecks, performanceDecks } from '../lib/game-data/party-expansion'
import { extraBlackCards, extraWhiteCards } from '../lib/game-data/comedy-cards'
import { GET } from '../app/api/questions/route'
import { NextRequest } from 'next/server'

const games = ['never-have-i-ever', 'truth-or-dare', 'whos-most-likely', 'would-you-rather', 'if-you-had-to', 'drink-if', 'hot-seat', 'paranoia', 'spin-the-bottle', 'rapid-fire', 'strip-or-sip', 'emoji-decode', 'role-roulette']
test('expansion cards are nonempty and unique within each deck', () => {
  for (const game of games) for (const mode of ['standard', 'challenge', 'spicy'] as const) {
    const deck = expansion(game, mode)
    assert.ok(deck.length >= 30, `${game}/${mode}`)
    assert.equal(new Set(deck).size, deck.length, `${game}/${mode}`)
    assert.ok(deck.every(card => card.trim().length > 10))
  }
  assert.equal(mergeExpansion('hot-seat', 'standard', ['What is your funniest story involving a disastrous meal?']).filter(x => x === 'What is your funniest story involving a disastrous meal?').length, 1)
})
test('special game banks and comedy cards are playable', () => {
  for (const deck of [...Object.values(indianDecks), ...Object.values(performanceDecks)]) assert.ok(deck.length >= 80)
  assert.ok(extraBlackCards.every(c => c.blanks === 1 && (c.text.match(/_/g) || []).length === 1))
  assert.ok(extraWhiteCards.length >= 50)
})
test('API serves expanded decks and does not leak mature mode when disabled', async () => {
  const response = await GET(new NextRequest('http://localhost/api/questions?gameId=hot-seat&mode=spicy&mature=false&limit=1000'))
  const result = await response.json()
  assert.ok(result.totalAvailable >= 300)
  assert.ok(result.questions.includes('What is your funniest story involving a disastrous meal?'))
  assert.ok(!result.questions.includes('What is your funniest story involving a memorable kiss?'))
})
