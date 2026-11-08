import Link from 'next/link'
import { ArrowLeft, Database, Layers, Sparkles } from 'lucide-react'
import { games } from '@/lib/game-data/games'
import { getQuestionDb, getQuestionInventory, readQuestionDeck } from '@/lib/questions/bank'

export const dynamic = 'force-dynamic'

type InventoryRow = { gameId: string; mode: string; source: string; reviewStatus: string; count: number }

export default function QuestionBankPage() {
  let rows: InventoryRow[] = []
  let error = false
  try {
    rows = getQuestionInventory(getQuestionDb()) as InventoryRow[]
  } catch {
    error = true
  }

  const gameIds = [...new Set(rows.map((row) => row.gameId))]
  const total = rows.reduce((sum, row) => sum + Number(row.count), 0)

  return (
    <main className="min-h-screen bg-neutral-950 text-zinc-100 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 selection:bg-zinc-800 selection:text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to games</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-b border-zinc-900 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                <Database className="w-3 h-3 text-amber-400" />
                <span>SQLite Store</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                Question Bank
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Live inventory from the local question deck database. Counts represent active game-and-mode cards.
              </p>
            </div>

            <div className="sm:text-right bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 sm:min-w-[180px]">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Deck Entries</span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tabular-nums">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5 text-xs text-red-300">
            The question database is currently unavailable. Games will automatically serve their bundled fallback content.
          </div>
        ) : (
          <div className="space-y-4">
            {gameIds.map((id) => {
              const deckRows = rows.filter((row) => row.gameId === id)
              const name = games.find((game) => game.id === id)?.name || id
              const sample = readQuestionDeck(getQuestionDb(), id, 'standard').slice(0, 3)
              const gameTotal = deckRows.reduce((n, r) => n + Number(r.count), 0)

              return (
                <section
                  key={id}
                  className="rounded-2xl border border-zinc-800/70 bg-zinc-900/20 p-5 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                        {name}
                      </h2>
                      {id === 'would-you-rather' && (
                        <p className="text-[11px] text-amber-400/90 mt-0.5">
                          Text deck acts as fallback; game actively prioritizes verified image rounds.
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-400 tabular-nums">
                      {gameTotal.toLocaleString()} cards
                    </span>
                  </div>

                  {/* Mode Breakdown Table */}
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-800/60 text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                          <th className="py-2 pr-4 font-medium">Mode</th>
                          <th className="pr-4 font-medium text-right">Legacy</th>
                          <th className="pr-4 font-medium text-right">Authored</th>
                          <th className="pr-4 font-medium text-right">Modular</th>
                          <th className="font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {['standard', 'challenge', 'spicy'].map((mode) => {
                          const count = (source: string) =>
                            deckRows
                              .filter((r) => r.mode === mode && r.source === source)
                              .reduce((n, r) => n + Number(r.count), 0)
                          const modeTotal = deckRows
                            .filter((r) => r.mode === mode)
                            .reduce((n, r) => n + Number(r.count), 0)

                          return (
                            <tr key={mode} className="text-zinc-300">
                              <td className="py-2 pr-4 font-medium capitalize text-zinc-200">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                                  mode === 'spicy' ? 'bg-red-500' : mode === 'challenge' ? 'bg-amber-400' : 'bg-zinc-400'
                                }`} />
                                {mode}
                              </td>
                              <td className="pr-4 text-right font-mono tabular-nums text-zinc-500">{count('legacy-json')}</td>
                              <td className="pr-4 text-right font-mono tabular-nums text-zinc-500">{count('authored-v1')}</td>
                              <td className="pr-4 text-right font-mono tabular-nums text-zinc-500">{count('modular-expansion-v1')}</td>
                              <td className="text-right font-mono tabular-nums font-bold text-zinc-100">{modeTotal}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Sample Drawer */}
                  {sample.length > 0 && (
                    <details className="mt-4 pt-3 border-t border-zinc-900 text-xs text-zinc-400 group">
                      <summary className="cursor-pointer text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors select-none">
                        Sample standard cards ({sample.length})
                      </summary>
                      <ul className="mt-2.5 space-y-1.5 pl-3 border-l border-zinc-800 text-[11px] text-zinc-300">
                        {sample.map((card, idx) => (
                          <li key={idx} className="leading-relaxed">
                            "{card}"
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </section>
              )
            })}
          </div>
        )}

        <footer className="pt-6 border-t border-zinc-900 text-[11px] text-zinc-500 leading-relaxed">
          Kiss Marry Kill and celebrity Would You Rather draw directly from the verified personality catalog (19,000+ entries). Draft Arena, Custom Game, and Cards Against Humanity use their dedicated modular engines.
        </footer>
      </div>
    </main>
  )
}
