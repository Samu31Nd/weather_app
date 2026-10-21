// Cloud API adapter implementing hexagonal architecture

import axios from 'axios'
import type { HistoricalQueryParams, HistoricalView } from '../domain/historical-weather.entity'
import { CloudApiResponse, HistoricalDto } from './cloud-api.dto'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_CLOUD_URL!;

export interface CloudApiQueryParams {
  vista?: HistoricalView
  date_start?: string
  date_end?: string
  days?: number
  specific_date?: string
}

function buildQueryParams(params: HistoricalQueryParams): CloudApiQueryParams {
  const queryParams: CloudApiQueryParams = {
    vista: params.view,
  }

  switch (params.mode) {
    case 'specific_date':
      if (params.specificDate) {
        queryParams.specific_date = params.specificDate
      }
      break
    case 'date_range':
      if (params.dateStart) {
        queryParams.date_start = params.dateStart
      }
      if (params.dateEnd) {
        queryParams.date_end = params.dateEnd
      }
      break
    case 'last_n_days':
      if (params.days) {
        queryParams.days = params.days
      }
      break
  }

  return queryParams
}

export async function fetchHistoricalDataFromCloud<T extends HistoricalDto>(
  params: HistoricalQueryParams
): Promise<CloudApiResponse<T>> {
  const queryParams = buildQueryParams(params)

  // Build URL with query parameters
  const url = new URL(API_BASE_URL)
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })

  const response = await axios.get<CloudApiResponse<T>>(url.toString(), {
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
    },
  })

  return response.data
}

// Singleton adapter class
export class CloudApiAdapter {
  async fetchData<T extends HistoricalDto>(
    params: HistoricalQueryParams
  ): Promise<CloudApiResponse<T>> {
    return fetchHistoricalDataFromCloud<T>(params)
  }
}

export const cloudApiAdapter = new CloudApiAdapter()
