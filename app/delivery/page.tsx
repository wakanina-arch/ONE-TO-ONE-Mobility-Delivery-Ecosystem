// app/delivery/page.tsx
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { WeatherProvider, useWeather } from '@/contexts/WeatherContext'
import SpaceshipView from './spaceship-view'

// Importamos el mapa dinámicamente
const DynamicMap = dynamic(
  () => import('@/app/delivery/components/live-map'),
  { ssr: false, loading: () => <div className="h-80 bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">🗺️ Cargando mapa...</div> }
)

function DeliveryDashboardContent() {
  const { weather } = useWeather()
  const [missionActive, setMissionActive] = useState(false)

  const handleMissionStart = () => {
    setMissionActive(true)
  }

  if (!missionActive) {
    return <SpaceshipView onMissionStart={handleMissionStart} />
  }

  const isNight = weather?.isNight || false

  return (
    <div className={`min-h-screen transition-all duration-500 ${isNight ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Aquí va el mapa y el panel de delivery normal */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="h-80 rounded-xl overflow-hidden">
            <DynamicMap />
          </div>
          <p className="text-center mt-4 text-gray-500">
            🚀 Misión en curso - Dirígete al restaurante
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DeliveryDashboard() {
  return (
    <WeatherProvider>
      <DeliveryDashboardContent />
    </WeatherProvider>
  )
}