import { NextRequest, NextResponse } from 'next/server'

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!
const MASTER_PASS = process.env.MASTER_PASS!
const ADMIN_PASS = process.env.ADMIN_PASS!

export async function POST(req: NextRequest) {
  const { title, message, password } = await req.json()

  if(password !== MASTER_PASS && password !== ADMIN_PASS) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if(!title || !message) {
    return NextResponse.json({ error: 'Título e mensagem obrigatórios' }, { status: 400 })
  }

  const res = await fetch('https://api.onesignal.com/notifications', {
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

  const data = await res.json()
  if(!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json({ ok: true, recipients: data.recipients })
}
