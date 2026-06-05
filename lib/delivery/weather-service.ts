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

// Coordenadas aproximadas de Quito
const QUITO_LAT = -0.22985
const QUITO_LON = -78.52495

// API Key (regístrate gratis en OpenWeatherMap)
// Por ahora usamos simulación, después pones tu key real
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo'

export async function getWeather(): Promise<WeatherState> {
  // Si es demo o no hay API key, usamos simulación local
  if (OPENWEATHER_API_KEY === 'demo') {
    return simulateWeatherByTime()
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${QUITO_LAT}&lon=${QUITO_LON}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
    )
    const data = await response.json()
    
    const condition = mapWeatherCondition(data.weather[0].id, data.sys)
    const temperature = Math.round(data.main.temp)
    const isNight = isNightTime(data.sys)

    return { condition, temperature, isNight }
  } catch (error) {
    console.error('Error obteniendo clima:', error)
    return simulateWeatherByTime()
  }
}

// Simulación basada en hora local (para desarrollo)
function simulateWeatherByTime(): WeatherState {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour > 18
  const isSunset = hour === 18 || hour === 5
  const isDawn = hour === 6

  let condition: WeatherCondition = 'clear-day'
  
  if (isNight) condition = 'clear-night'
  else if (isSunset) condition = 'sunset'
  else if (isDawn) condition = 'dawn'
  else if (hour > 12 && hour < 15) condition = 'cloudy' // simular nublado al mediodía
  else if (hour > 15 && hour < 17) condition = 'rain'   // simular lluvia por la tarde
  
  const temperature = isNight ? 12 : 22
  
  return { condition, temperature, isNight }
}

function mapWeatherCondition(weatherId: number, sys: any): WeatherCondition {
  const hour = new Date().getHours()
  const isNight = hour < 6 || hour > 18
  
  // Clear
  if (weatherId === 800) {
    return isNight ? 'clear-night' : 'clear-day'
  }
  // Clouds
  if (weatherId >= 801 && weatherId <= 804) return 'cloudy'
  // Rain
  if ((weatherId >= 500 && weatherId <= 531) || weatherId === 701) return 'rain'
  // Fog
  if (weatherId >= 701 && weatherId <= 741) return 'fog'
  
  return 'clear-day'
}

function isNightTime(sys: any): boolean {
  if (!sys?.sunrise || !sys?.sunset) return false
  const now = Math.floor(Date.now() / 1000)
  return now < sys.sunrise || now > sys.sunset
}