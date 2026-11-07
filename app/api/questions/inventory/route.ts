import { NextResponse } from 'next/server'
import { getQuestionDb, getQuestionInventory } from '@/lib/questions/bank'

export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const decks = getQuestionInventory(getQuestionDb())
    return NextResponse.json({ success: true, decks }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Question inventory unavailable:', error)
    return NextResponse.json({ success: false, error: 'Question inventory unavailable' }, { status: 503 })
  }
}
