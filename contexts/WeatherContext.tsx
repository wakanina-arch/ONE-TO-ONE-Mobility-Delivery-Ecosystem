// contexts/WeatherContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getWeather, WeatherState } from '@/lib/delivery/weather-service'

interface WeatherContextType {
  weather: WeatherState | null
  isLoading: boolean
  refreshWeather: () => void
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined)

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWeather = async () => {
    setIsLoading(true)
    const data = await getWeather()
    setWeather(data)
    setIsLoading(false)
  }

  const refreshWeather = () => {
    fetchWeather()
  }

  useEffect(() => {
    fetchWeather()
    // Actualizar cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <WeatherContext.Provider value={{ weather, isLoading, refreshWeather }}>
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const context = useContext(WeatherContext)
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}