// app/delivery/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { WeatherProvider } from '@/contexts/WeatherContext'
import SpaceshipView from './spaceship-view'

function DeliveryIntroContent() {
  const router = useRouter()

  // Al terminar la secuencia de la nave, entramos al panel operativo real.
  const handleMissionStart = () => {
    router.push('/delivery-map')
  }

  return <SpaceshipView onMissionStart={handleMissionStart} />
}

export default function DeliveryIntroPage() {
  return (
    <WeatherProvider>
      <DeliveryIntroContent />
    </WeatherProvider>
  )
}
