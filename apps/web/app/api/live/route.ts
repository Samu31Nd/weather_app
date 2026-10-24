// GET /api/live → JSON crudo de la consola Davis, sin datos de red y con caché de 10 s (ver lib/live/live-proxy.ts).
import { NextResponse } from 'next/server'
import { createLiveProxy, stationUrlFromEnv } from '@/lib/live/live-proxy'

export const dynamic = 'force-dynamic'

// Accesos literales: Next sustituye `process.env.NEXT_PUBLIC_*` al compilar. En Cloud Run esa URL solo llega como
// argumento del build, así que `stationUrlFromEnv(process.env)` no la vería en tiempo de ejecución.
const proxy = createLiveProxy({
  stationUrl: stationUrlFromEnv({
    LIVE_STATION_URL: process.env.LIVE_STATION_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }),
})

export async function GET() {
  const { status, body } = await proxy()
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}
