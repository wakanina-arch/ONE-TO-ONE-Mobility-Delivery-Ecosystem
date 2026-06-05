'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getCurrentPosition, assignSectorByCoords } from '@/lib/delivery/location-service'

export default function SplashPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Iniciando ONE TO ONE...')
  const [locationLoaded, setLocationLoaded] = useState(false)
  const [activo, setActivo] = useState(false)

  useEffect(() => {
    const loadApp = async () => {
      setStatus('Solicitando ubicación...')

      try {
        const coords = await getCurrentPosition()
        setStatus('Ubicación detectada. Asignando sector...')
        const sector = assignSectorByCoords(coords)

        localStorage.setItem('rider-lat', coords.latitude.toString())
        localStorage.setItem('rider-lng', coords.longitude.toString())
        localStorage.setItem('rider-sector-id', sector.id)
        localStorage.setItem('rider-sector-name', sector.name)

        setLocationLoaded(true)
        setStatus('¿Listo para trabajar?')
      } catch (error) {
        console.error('Error cargando ubicación:', error)
        setStatus('No se pudo obtener la ubicación. Selecciona un sector manualmente.')
        setLocationLoaded(true)
      }
    }

    loadApp()
  }, [router])

  const handleContinuar = () => {
    if (activo) {
      localStorage.setItem('rider-activo', 'true')
    } else {
      localStorage.setItem('rider-activo', 'false')
    }
    router.push('/sectores')
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="relative w-32 h-32 mb-8">
        <Image
          src="/images/naves-cascos/awkak.png"
          alt="ONE TO ONE"
          fill
          className="object-contain animate-pulse"
          priority
        />
      </div>
      <h1 className="text-4xl font-bold text-amber-400 tracking-tight mb-2">ONE TO ONE</h1>
      <p className="text-sm text-white/50 mb-6">Delivery by Alianza</p>

      {!locationLoaded ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-center text-white/60 text-sm max-w-xs">{status}</p>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-6">
          {/* Estado del rider */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-bold">🟢 Estado del Rider</p>
                <p className="text-white/40 text-sm">
                  {activo ? 'Recibirás pedidos en tu sector' : 'No recibirás notificaciones'}
                </p>
              </div>
              <button
                onClick={() => setActivo(!activo)}
                className={`w-14 h-8 rounded-full transition-all ${activo ? 'bg-green-600' : 'bg-gray-600'} relative`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${activo ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Botón continuar */}
          <button
            onClick={handleContinuar}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            Continuar →
          </button>

          <p className="text-center text-white/50 text-xs">{status}</p>
        </div>
      )}
    </div>
  )
}

