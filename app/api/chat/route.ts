import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const MASTER_PASS = process.env.MASTER_PASS || 'Mestre#26Pal'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// GET — buscar mensagens de uma rodada
export async function GET(req: NextRequest) {
  const round = req.nextUrl.searchParams.get('round') || 'geral'
  try {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('chat_messages')
      .select('*')
      .eq('round', round)
      .order('ts', { ascending: true })
      .limit(200)
    if (error) throw error
    return NextResponse.json({ messages: data || [] })
  } catch (err) {
    console.error('chat GET error:', err)
    return NextResponse.json({ messages: [] })
  }
}

// POST — enviar nova mensagem
export async function POST(req: NextRequest) {
  try {
    const { user, text, round } = await req.json()
    if (!user || !text) return NextResponse.json({ error: 'user e text obrigatórios' }, { status: 400 })
    const sb = getSupabase()
    const { data, error } = await sb
      .from('chat_messages')
      .insert({ user, text, round: round || 'geral', reactions: {} })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ message: data })
  } catch (err) {
    console.error('chat POST error:', err)
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}

// PATCH — atualizar reações de uma mensagem
export async function PATCH(req: NextRequest) {
  try {
    const { id, reactions } = await req.json()
    if (!id) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
    const sb = getSupabase()
    const { error } = await sb
      .from('chat_messages')
      .update({ reactions })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('chat PATCH error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar reação' }, { status: 500 })
  }
}

// DELETE — limpar chat de uma rodada (admin)
export async function DELETE(req: NextRequest) {
  try {
    const round = req.nextUrl.searchParams.get('round') || 'geral'
    const sb = getSupabase()
    const { error } = await sb
      .from('chat_messages')
      .delete()
      .eq('round', round)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('chat DELETE error:', err)
    return NextResponse.json({ error: 'Erro ao limpar chat' }, { status: 500 })
  }
}
