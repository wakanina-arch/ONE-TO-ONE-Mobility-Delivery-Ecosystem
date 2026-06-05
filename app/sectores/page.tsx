'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SECTORS, Sector, updateRiderCount } from '@/lib/delivery/sectors-data'

export default function SectoresPage() {
  const router = useRouter()
  const [sectores, setSectores] = useState<Sector[]>(SECTORS)
  const [currentSectorId, setCurrentSectorId] = useState<string | null>(null)
  const [loadingSector, setLoadingSector] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('rider-sector-id')
    if (saved) {
      setCurrentSectorId(saved)
    }
  }, [])

  const handleSelectSector = (sector: Sector) => {
    setLoadingSector(true)
    localStorage.setItem('rider-sector-id', sector.id)
    localStorage.setItem('rider-sector-name', sector.name)
    updateRiderCount(sector.id, true)

    setTimeout(() => {
      router.push('/delivery-map')
    }, 300)
  }

  const handleBack = () => {
    const lastSector = localStorage.getItem('rider-sector-id')
    if (lastSector) {
      router.push('/delivery-map')
    } else {
      router.push('/splash')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-5 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="text-white/60 hover:text-white transition flex items-center gap-1 mb-6 hover:gap-2"
          >
            <span className="text-xl">←</span> Volver
          </button>

          <div className="text-center">
            <p className="text-sm uppercase text-sky-300 tracking-[0.4em]">ONE TO ONE</p>
            <h1 className="text-4xl font-bold mt-3 text-white">🏞 SECTORES</h1>
            <p className="text-sm text-slate-400 mt-2">Selecciona tu zona de trabajo. El número indica repartidores activos.</p>
            {currentSectorId ? (
              <p className="text-xs text-slate-500 mt-2">Sector sugerido por ubicación: {SECTORS.find((s) => s.id === currentSectorId)?.name}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          {sectores.map((sector) => {
            const isSuggested = sector.id === currentSectorId
            return (
              <button
                key={sector.id}
                onClick={() => handleSelectSector(sector)}
                disabled={loadingSector}
                className={`w-full rounded-3xl p-5 text-left transition-all duration-200 border ${isSuggested ? 'border-sky-400 bg-sky-700/20 shadow-sky-600/10' : 'border-blue-500/20 bg-blue-600/10 hover:border-blue-300/40 hover:bg-blue-600/20'} ${loadingSector ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white text-lg font-semibold">{sector.name}</p>
                    {isSuggested ? <p className="text-xs text-sky-200 mt-1">Sector sugerido según tu ubicación</p> : null}
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white font-semibold">
                    {sector.activeRiders}
                    <span className="text-slate-300 text-xs">riders</span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">Si tu sector no coincide, elige el botón correspondiente y activa tu ubicación en el siguiente mapa.</p>
      </div>
    </div>
  )
}
