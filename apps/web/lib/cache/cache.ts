// LocalStorage cache utility for historical weather data

const CACHE_PREFIX = 'weather_cache_'
const CACHE_EXPIRY_KEY = 'weather_cache_expiry_'
const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days - cleanup old items

export interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

// Check if we're in browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

// Get cached data
export function getCachedData<T>(key: string): T | null {
  if (!isBrowser()) return null

  try {
    const cacheKey = CACHE_PREFIX + key
    const expiryKey = CACHE_EXPIRY_KEY + key
    
    const cached = localStorage.getItem(cacheKey)
    const expiry = localStorage.getItem(expiryKey)
    
    if (!cached || !expiry) return null
    
    const expiryTime = parseInt(expiry, 10)
    if (Date.now() > expiryTime) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(expiryKey)
      return null
    }
    
    return JSON.parse(cached) as T
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error)
    return null
  }
}

// Set cached data
export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  if (!isBrowser()) return

  try {
    const cacheKey = CACHE_PREFIX + key
    const expiryKey = CACHE_EXPIRY_KEY + key
    
    localStorage.setItem(cacheKey, JSON.stringify(data))
    localStorage.setItem(expiryKey, String(Date.now() + ttl))
    
    // Cleanup old cache entries
    cleanupOldCacheEntries()
  } catch (error) {
    console.error('[Cache] Error writing to cache:', error)
    // If localStorage is full, try to clear old items
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearAllCache()
    }
  }
}

// Remove specific cached item
export function removeCachedData(key: string): void {
  if (!isBrowser()) return

  try {
    localStorage.removeItem(CACHE_PREFIX + key)
    localStorage.removeItem(CACHE_EXPIRY_KEY + key)
  } catch (error) {
    console.error('[Cache] Error removing from cache:', error)
  }
}

// Clear all weather cache
export function clearAllCache(): void {
  if (!isBrowser()) return

  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_KEY))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
  }
}

// Cleanup old cache entries that haven't been used in a while
export function cleanupOldCacheEntries(): void {
  if (!isBrowser()) return

  try {
    const now = Date.now()
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_EXPIRY_KEY)) {
        const expiry = localStorage.getItem(key)
        if (expiry) {
          const expiryTime = parseInt(expiry, 10)
          // Remove if expired or older than max cache age
          if (now > expiryTime || (expiryTime - now) > MAX_CACHE_AGE) {
            const dataKey = key.replace(CACHE_EXPIRY_KEY, CACHE_PREFIX)
            keysToRemove.push(key)
            keysToRemove.push(dataKey)
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('[Cache] Error cleaning up cache:', error)
  }
}

// Generate cache key for historical data queries
export function generateHistoricalCacheKey(
  view: string,
  mode: string,
  params: Record<string, string | number | undefined>
): string {
  const parts = [view, mode]
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      parts.push(`${key}:${value}`)
    }
  })
  
  return parts.join('_')
}
