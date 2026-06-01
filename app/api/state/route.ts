import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATE_KEY = 'main'
const ADMIN_PASS = process.env.ADMIN_PASS!
const MASTER_PASS = process.env.MASTER_PASS!

export async function GET() {
  const { data, error } = await supabase
    .from('app_state')
    .select('data')
    .eq('key', STATE_KEY)
    .single()

  if (error || !data) return NextResponse.json({ state: null })
  return NextResponse.json({ state: data.data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { state, password } = body

  if (
    password !== MASTER_PASS &&
    password !== ADMIN_PASS &&
    password !== state?.adminPass
  ) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { error: stateError } = await supabase
    .from('app_state')
    .upsert({ key: STATE_KEY, data: state }, { onConflict: 'key' })

  if (stateError) {
    return NextResponse.json({ error: stateError.message }, { status: 500 })
  }

  try {
    await Promise.all([
      syncJogos(state),
      syncPalpites(state),
    ])
  } catch (err) {
    console.error('Erro ao sincronizar tabelas relacionais:', err)
  }

  return NextResponse.json({ ok: true })
}

async function syncJogos(state: any) {
  const matches: any[] = state?.round?.matches ?? []
  if (!matches.length) return

  const rodada = state?.round?.name ?? ''

  const jogos = matches.map((m: any) => ({
    id: m.id,
    rodada,
    home: m.home ?? '',
    away: m.away ?? '',
    home_flag: m.homeFlag ?? '',
    away_flag: m.awayFlag ?? '',
    data_jogo: m.date ?? '',
    horario: m.time ?? '',
    locked: m.locked ?? false,
    has_quem_avanca: m.hasQuemAvanca ?? false,
    has_penaltis: m.hasPenaltis ?? false,
    resultado_home: state?.results?.[m.id]?.h !== ''
      ? parseInt(state?.results?.[m.id]?.h ?? '')
      : null,
    resultado_away: state?.results?.[m.id]?.a !== ''
      ? parseInt(state?.results?.[m.id]?.a ?? '')
      : null,
  }))

  await supabase
    .from('jogos')
    .upsert(jogos, { onConflict: 'id' })
}

async function syncPalpites(state: any) {
  const palpites: any = state?.palpites ?? {}
  const matches: any[] = state?.round?.matches ?? []
  const correctedScores: any = state?.correctedScores ?? {}

  const rows: any[] = []

  for (const [competidor, jogoPalpites] of Object.entries(palpites)) {
    for (const [jogoId, pal] of Object.entries(jogoPalpites as any)) {
      const p = pal as any

      const jogoExiste = matches.find((m: any) => m.id === jogoId)
      if (!jogoExiste) continue

      if (p.h === '' && p.a === '') continue

      rows.push({
        competidor,
        jogo_id: jogoId,
        gols_home: p.h !== '' ? parseInt(p.h) : null,
        gols_away: p.a !== '' ? parseInt(p.a) : null,
        quem_avanca: p.quemAvanca ?? null,
        penaltis: p.penaltis ?? null,
        pontos: correctedScores?.[competidor]?.[jogoId] ?? null,
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (!rows.length) return

  await supabase
    .from('palpites')
    .upsert(rows, { onConflict: 'competidor,jogo_id' })
}
