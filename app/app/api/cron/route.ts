import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!
const CRON_SECRET = process.env.CRON_SECRET!

async function sendPush(title: string, message: string) {
  await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { pt: title, en: title },
      contents: { pt: message, en: message },
      url: 'https://palpitao-copa-mundo.vercel.app',
    }),
  })
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    // Busca estado atual
    const { data, error } = await supabase
      .from('app_state')
      .select('data')
      .eq('key', 'main')
      .single()

    if (error || !data) return NextResponse.json({ ok: true, msg: 'sem estado' })

    const state = data.data
    const matches: any[] = state?.round?.matches ?? []
    const roundName: string = state?.round?.name ?? 'da rodada'

    if (!matches.length || !state?.palpitesOpen) {
      return NextResponse.json({ ok: true, msg: 'sem jogos ou palpites fechados' })
    }

    // Data de hoje em Brasília (UTC-3)
    const now = new Date()
    const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const dia = String(brasilia.getUTCDate()).padStart(2, '0')
    const mes = String(brasilia.getUTCMonth() + 1).padStart(2, '0')
    const hoje = `${dia}/${mes}`

    // Verifica se tem jogo hoje
    const jogosHoje = matches.filter((m: any) => m.date === hoje)
    if (!jogosHoje.length) {
      return NextResponse.json({ ok: true, msg: 'sem jogos hoje' })
    }

    // Verifica se já notificou hoje
    const { data: notifData } = await supabase
      .from('app_state')
      .select('data')
      .eq('key', 'last_notif_date')
      .single()

    if (notifData?.data === hoje) {
      return NextResponse.json({ ok: true, msg: 'já notificou hoje' })
    }

    // Pega o primeiro jogo do dia para montar a mensagem
    const sorted = jogosHoje.sort((a: any, b: any) => {
      const [ah, am] = (a.time || '00:00').split(':').map(Number)
      const [bh, bm] = (b.time || '00:00').split(':').map(Number)
      return (ah * 60 + am) - (bh * 60 + bm)
    })
    const primeiro = sorted[0]
    const totalJogos = jogosHoje.length

    const titulo = '⚽ Tem jogo hoje no Palpitão!'
    const mensagem = totalJogos === 1
      ? `${roundName}: ${primeiro.home} x ${primeiro.away} às ${primeiro.time}. Corre lá palpitar! 🟢`
      : `${roundName}: ${totalJogos} jogos hoje, começando com ${primeiro.home} x ${primeiro.away} às ${primeiro.time}. Corre lá! 🟢`

    await sendPush(titulo, mensagem)

    // Registra que já notificou hoje
    await supabase
      .from('app_state')
      .upsert({ key: 'last_notif_date', data: hoje })

    console.log(`Push enviado: ${mensagem}`)
    return NextResponse.json({ ok: true, notified: true, hoje })

  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
