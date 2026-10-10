// lib/delivery/weather-service.ts

export type WeatherCondition =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rain'
  | 'fog'
  | 'sunset'
  | 'dawn'

export interface WeatherState {
  condition: WeatherCondition
  temperature: number
  isNight: boolean
}

export interface WeatherStateWithRain extends WeatherState {
  rainProbability: number // 0-100
}

// Coordenadas por zona de Quito
export const ZONE_COORDS = {
  norte:  { lat: -0.1100, lng: -78.4900 },
  centro: { lat: -0.2100, lng: -78.5000 },
  sur:    { lat: -0.3100, lng: -78.5300 },
  valles: { lat: -0.2100, lng: -78.4200 },
} as const

export type WeatherZone = keyof typeof ZONE_COORDS

// API Key (registro gratuito en OpenWeatherMap)
const OPENWEATHER_API_KEY =
  process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo'

/**
 * Obtener el clima de una zona.
 */
export async function getWeather(
  zone: WeatherZone = 'centro',
  lat?: number,
  lng?: number
): Promise<WeatherState> {
  const coords = ZONE_COORDS[zone]
  const finalLat = lat ?? coords.lat
  const finalLng = lng ?? coords.lng

  // Si no hay API key real, simulamos
  if (OPENWEATHER_API_KEY === 'demo') {
    return simulateWeatherByTime(zone)
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${finalLat}&lon=${finalLng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    )
    const data = await response.json()

    const condition = mapWeatherCondition(data.weather?.[0]?.id ?? 800, data.sys)
    const temperature = Math.round(data.main?.temp ?? 18)
    const isNight = isNightTime(data.sys)

    return { condition, temperature, isNight }
  } catch (error) {
    console.error('Error obteniendo clima:', error)
    return simulateWeatherByTime(zone)
  }
}

/**
 * Obtener clima + probabilidad de lluvia de una zona.
 * Hace 2 llamadas: /weather + /forecast
 */
export async function getWeatherWithRain(
  zone: WeatherZone
): Promise<WeatherStateWithRain> {
  const coords = ZONE_COORDS[zone]
  const weather = await getWeather(zone)

  // Si no hay API key real, devolvemos 0
  if (OPENWEATHER_API_KEY === 'demo') {
    return { ...weather, rainProbability: 0 }
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es&cnt=1`
    )
    const data = await response.json()

    // pop = probability of precipitation (0-1)
    const pop = data?.list?.[0]?.pop ?? 0
    const rainProbability = Math.round(pop * 100)

    return { ...weather, rainProbability }
  } catch (error) {
    console.error('Error obteniendo probabilidad de lluvia:', error)
    return { ...weather, rainProbability: 0 }
  }
}

/**
 * Obtener clima de las 4 zonas en paralelo.
 */
export async function getAllZonesWeather(): Promise<
  Record<WeatherZone, WeatherState>
> {
  const zones: WeatherZone[] = ['norte', 'centro', 'sur', 'valles']

  const results = await Promise.all(zones.map((z) => getWeather(z)))

  const out = {} as Record<WeatherZone, WeatherState>
  zones.forEach((z, i) => {
    out[z] = results[i]
  })
  return out
}

/**
 * Obtener clima + lluvia de las 4 zonas en paralelo.
 * Hace 8 llamadas en total (2 por zona).
 */
export async function getAllZonesWeatherWithRain(): Promise<
  Record<WeatherZone, WeatherStateWithRain>
> {
  const zones: WeatherZone[] = ['norte', 'centro', 'sur', 'valles']

  const results = await Promise.all(zones.map((z) => getWeatherWithRain(z)))

  const out = {} as Record<WeatherZone, WeatherStateWithRain>
  zones.forEach((z, i) => {
    out[z] = results[i]
  })
  return out
}

// ================================================================
// HELPERS INTERNOS
// ================================================================

/**
 * Mapeo de condiciones de OpenWeatherMap a nuestras condiciones.
 */
function mapWeatherCondition(weatherId: number, sys: any): WeatherCondition {
  const isNight = isNightTime(sys)

  if (weatherId >= 200 && weatherId < 300) return 'rain' // Tormenta
  if (weatherId >= 300 && weatherId < 600) return 'rain' // Llovizna / Lluvia
  if (weatherId >= 600 && weatherId < 700) return 'rain' // Nieve
  if (weatherId >= 700 && weatherId < 800) return 'fog' // Niebla
  if (weatherId === 800) return isNight ? 'clear-night' : 'clear-day'
  if (weatherId > 800) return 'cloudy'

  return 'clear-day'
}

/**
 * ¿Es de noche?
 */
function isNightTime(sys: any): boolean {
  if (!sys?.sunrise || !sys?.sunset) {
    const hour = new Date().getHours()
    return hour < 6 || hour > 18
  }
  const now = Math.floor(Date.now() / 1000)
  return now < sys.sunrise || now > sys.sunset
}

/**
 * Simulación por hora (fallback sin API key).
 */
function simulateWeatherByTime(zone: WeatherZone): WeatherState {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour > 18
  const isSunset = hour === 18 || hour === 5
  const isDawn = hour === 6

  let condition: WeatherCondition = 'clear-day'

  if (isNight) condition = 'clear-night'
  else if (isSunset) condition = 'sunset'
  else if (isDawn) condition = 'dawn'

  // Simulación de temperatura por zona
  // Valles: +2°C | Centro: +1°C | Norte: 0°C | Sur: -1°C
  const baseTemp = 18
  const zoneOffset = {
    norte: 0,
    centro: 1,
    sur: -1,
    valles: 2,
  }[zone]

  const hourVariation = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 3

  return {
    condition,
    temperature: Math.round(baseTemp + zoneOffset + hourVariation),
    isNight,
  }
}