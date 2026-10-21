import { NextResponse } from 'next/server'
// import http from 'http'
// import fs from 'fs'
// import path from 'path'
// import Papa from 'papaparse'
// import { HistoricalCsvRow } from '@/lib/infrastructure/historical-data.dto'
// import { mapCsvDataToDataPoints } from '@/lib/infrastructure/historical-data.mapper'
import { HistoricalQueryParams, HistoricalView, QueryMode } from '@/lib/domain/historical-weather.entity'
import { cloudApiAdapter } from '@/lib/infrastructure/cloud-api.adapter'
import { mapCleanWeatherDto, mapPressureDto, mapRainDto, mapTemperatureDto, mapWindDto } from '@/lib/infrastructure/cloud-api.mapper'
import { CleanWeatherDto, PressureDto, RainDto, TemperatureDto, WindDto } from '@/lib/infrastructure/cloud-api.dto'

const VALID_VIEWS: HistoricalView[] = ['vw_clean_weather', 'vw_temperatura', 'vw_viento', 'vw_lluvia', 'vw_presion']
const VALID_MODES: QueryMode[] = ['specific_date', 'date_range', 'last_n_days']

// async function fetchCsvData(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const req = http.get(
//       url,
//       {
//         insecureHTTPParser: true,
//         timeout: 30000,
//       },
//       (res) => {
//         let data = ''
//         res.setEncoding('utf8')
//         res.on('data', (chunk) => { data += chunk })
//         res.on('end', () => { resolve(data) })
//         res.on('error', (err) => { reject(err) })
//       }
//     )
//     req.on('error', (err) => { reject(err) })
//     req.on('timeout', () => {
//       req.destroy()
//       reject(new Error('Request timeout'))
//     })
//   })
// }

// function parseCsvText(csvText: string) {
//   const cleanedCsv = csvText
//     .replace(/^\uFEFF/, '')
//     .split('\n')
//     .filter(line => line.trim().length > 0)
//     .join('\n')
//     .trim()

//   const parseResult = Papa.parse<HistoricalCsvRow>(cleanedCsv, {
//     header: true,
//     skipEmptyLines: 'greedy',
//     transformHeader: (header) => header.trim(),
//     transform: (value) => value.trim(),
//   })

//   if (parseResult.errors.length > 0) {
//     console.error('[historical] CSV parsing errors:', parseResult.errors.slice(0, 5))
//   }

//   const validRows = parseResult.data.filter(row =>
//     row.Date && row.Time && row['Temp Out']
//   )

//   return mapCsvDataToDataPoints(validRows)
// }

// function serveMock(dateStr: string) {
//   console.log('[historical] Mock path:', MOCK_CSV_PATH)
//   console.log('[historical] Mock exists:', fs.existsSync(MOCK_CSV_PATH))

//   if (!fs.existsSync(MOCK_CSV_PATH)) {
//     return null
//   }

//   const csvText = fs.readFileSync(MOCK_CSV_PATH, 'utf8')
//   const dataPoints = parseCsvText(csvText)
//   console.warn('[historical] Serving mock data, points:', dataPoints.length)

//   return NextResponse.json({
//     data: dataPoints,
//     meta: {
//       date: dateStr,
//       totalPoints: dataPoints.length,
//       fetchedAt: new Date().toISOString(),
//       source: 'mock',
//     },
//   })
// }

export async function GET(request: Request) {
  
  
  
  
  
  try {
    const { searchParams } = new URL(request.url);
    // Parse query parameters
    const view = (searchParams.get('view') || 'vw_temperatura') as HistoricalView
    const mode = (searchParams.get('mode') || 'last_n_days') as QueryMode
    const specificDate = searchParams.get('specific_date') || undefined
    const dateStart = searchParams.get('date_start') || undefined
    const dateEnd = searchParams.get('date_end') || undefined
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!, 10) : 1

    // Validate parameters
    if (!VALID_VIEWS.includes(view)) {
      return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 })
    }
    if (!VALID_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode parameter' }, { status: 400 })
    }

    // Build query params
    const queryParams: HistoricalQueryParams = {
      view,
      mode,
      specificDate,
      dateStart,
      dateEnd,
      days,
    }

    // Fetch data from Cloud API
    const response = await cloudApiAdapter.fetchData(queryParams)

    // Map the data based on the view type
    let mappedData: unknown[]
    
    switch (view) {
      case 'vw_temperatura':
        mappedData = (response.data as TemperatureDto[]).map(mapTemperatureDto)
        break
      case 'vw_viento':
        mappedData = (response.data as WindDto[]).map(mapWindDto)
        break
      case 'vw_lluvia':
        mappedData = (response.data as RainDto[]).map(mapRainDto)
        break
      case 'vw_presion':
        mappedData = (response.data as PressureDto[]).map(mapPressureDto)
        break
      case 'vw_clean_weather':
      default:
        mappedData = (response.data as CleanWeatherDto[]).map(mapCleanWeatherDto)
        break
    }

    return NextResponse.json({
      total: response.total,
      data: mappedData,
      meta: {
        view,
        mode,
        params: { specificDate, dateStart, dateEnd, days },
        fetchedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[v0] Failed to fetch historical data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical weather data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
    // console.log('[historical] GET called, date:', dateStr)
  //   const url = `${API_BASE_URL}?action=text&date=${dateStr}`
  //   console.log('[historical] Fetching:', url)

  //   const csvText = await fetchCsvData(url)

  //   if (!csvText || typeof csvText !== 'string') {
  //     throw new Error('Empty or invalid response from weather API')
  //   }

  //   console.log('[historical] Live data received, length:', csvText.length)

  //   const dataPoints = parseCsvText(csvText)

  //   return NextResponse.json({
  //     data: dataPoints,
  //     meta: {
  //       date: dateStr,
  //       totalPoints: dataPoints.length,
  //       fetchedAt: new Date().toISOString(),
  //       source: 'live',
  //     },
  //   })

  //} catch (error) {
  //   const errMsg = error instanceof Error ? error.message : String(error)
  //   console.error('[historical] Live fetch failed:', errMsg)

  //   const mockResponse = serveMock(dateStr)
  //   if (mockResponse) return mockResponse

  //   return NextResponse.json(
  //     { error: 'Failed to fetch historical weather data', details: errMsg },
  //     { status: 500 }
  //   )
  }
}

export const dynamic = 'force-dynamic'