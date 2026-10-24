// GET /api/live → JSON crudo de la consola Davis, sin datos de red y con caché de 10 s (ver lib/live/live-proxy.ts).
import { NextResponse } from 'next/server'
import { createLiveProxy, stationUrlFromEnv } from '@/lib/live/live-proxy'

export const dynamic = 'force-dynamic'

const proxy = createLiveProxy({ stationUrl: stationUrlFromEnv(process.env) })

export async function GET() {
  const { status, body } = await proxy()
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}
