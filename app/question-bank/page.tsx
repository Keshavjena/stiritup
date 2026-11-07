import Link from 'next/link'
import { games } from '@/lib/game-data/games'
import { getQuestionDb, getQuestionInventory, readQuestionDeck } from '@/lib/questions/bank'

export const dynamic = 'force-dynamic'

type InventoryRow = { gameId: string; mode: string; source: string; reviewStatus: string; count: number }
export default function QuestionBankPage() {
  let rows: InventoryRow[] = []
  let error = false
  try { rows = getQuestionInventory(getQuestionDb()) as InventoryRow[] } catch { error = true }
  const gameIds = [...new Set(rows.map(row => row.gameId))]
  const total = rows.reduce((sum, row) => sum + Number(row.count), 0)
  return <main className="min-h-screen bg-neutral-950 text-zinc-100 px-5 py-10">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="text-amber-400 text-sm font-bold">← Back to games</Link>
      <h1 className="text-3xl font-black mt-6">Question bank</h1>
      <p className="text-zinc-400 mt-3 max-w-3xl">Live counts from the local SQLite question bank. Each row is a game-and-mode entry; some cards appear in multiple modes, so the total is not a count of unique, independently written questions.</p>
      {error ? <p className="mt-8 text-red-300">The question database is unavailable. Games can still use their bundled fallback content.</p> : <>
        <p className="mt-6 text-xl font-bold text-amber-400">{total.toLocaleString()} stored deck entries</p>
        <p className="text-sm text-zinc-400 mt-2">The bank includes legacy cards, individually written but unreviewed cards, and template-generated combinations. Generated does not mean individually reviewed.</p>
        <div className="mt-7 space-y-4">
          {gameIds.map(id => {
            const deckRows = rows.filter(row => row.gameId === id)
            const name = games.find(game => game.id === id)?.name || id
            const sample = readQuestionDeck(getQuestionDb(), id, 'standard').slice(0, 3)
            return <section key={id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h2 className="text-lg font-bold">{name}</h2>
              {id === 'would-you-rather' && <p className="text-xs text-amber-300 mt-1">Text deck is a fallback; the game currently prioritizes celebrity image rounds.</p>}
              <div className="overflow-x-auto mt-3"><table className="w-full text-sm text-left">
                <thead className="text-zinc-400"><tr><th className="py-2 pr-4">Mode</th><th className="pr-4">Legacy</th><th className="pr-4">Written</th><th className="pr-4">Generated</th><th>Total</th></tr></thead>
                <tbody>{['standard', 'challenge', 'spicy'].map(mode => {
                  const count = (source: string) => deckRows.filter(r => r.mode === mode && r.source === source).reduce((n, r) => n + Number(r.count), 0)
                  return <tr key={mode} className="border-t border-zinc-800"><td className="py-2 pr-4 capitalize">{mode}</td><td>{count('legacy-json')}</td><td>{count('authored-v1')}</td><td>{count('modular-expansion-v1')}</td><td>{deckRows.filter(r => r.mode === mode).reduce((n, r) => n + Number(r.count), 0)}</td></tr>
                })}</tbody>
              </table></div>
              <details className="mt-3 text-sm text-zinc-400"><summary className="cursor-pointer text-zinc-200">Sample standard cards</summary><ul className="list-disc pl-5 mt-2 space-y-1">{sample.map(card => <li key={card}>{card}</li>)}</ul></details>
            </section>
          })}
        </div>
        <p className="text-sm text-zinc-400 mt-8">Kiss Marry Kill and celebrity Would You Rather use the people catalog. Draft Arena, Custom Game, Drama-Dol, Indian Drinking Game and Cards Against Humanity use separate content systems and are not counted here.</p>
      </>}
    </div>
  </main>
}
