'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SECTORS, type Sector } from '@/lib/delivery/sectors-data'
import {
  getAllZonesWeatherWithRain,
  type WeatherState,          // ← AÑADIR
  type WeatherStateWithRain,
  type WeatherZone,
} from '@/lib/delivery/weather-service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft,
  MapPin,
  Users,
  Sun,
  Moon,
  Cloud,
  CloudSun,         // ← NUEVO
  CloudRain,
  CloudRainWind,    // ← NUEVO
  CloudFog,
  Sunset,
  Sunrise,
  Thermometer,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectorConRyders extends Sector {
  realActiveRiders: number
  ryderNumbers: string[]
}

// Icono Lucide según condición
function WeatherIcon({ condition }: { condition: WeatherState['condition'] }) {
  const cls = 'h-3.5 w-3.5 text-primary'
  switch (condition) {
    case 'clear-day':   return <Sun className={cls} />
    case 'clear-night': return <Moon className={cls} />
    case 'cloudy':      return <Cloud className={cls} />
    case 'rain':        return <CloudRain className={cls} />
    case 'fog':         return <CloudFog className={cls} />
    case 'sunset':      return <Sunset className={cls} />
    case 'dawn':        return <Sunrise className={cls} />
    default:            return <Sun className={cls} />
  }
}
 // Icono según probabilidad de lluvia
function RainIcon({ probability }: { probability: number }) {
  const cls = 'h-3 w-3 text-primary'

  if (probability === 0) return <Sun className={cls} />
  if (probability <= 20) return <CloudSun className={cls} />
  if (probability <= 50) return <Cloud className={cls} />
  if (probability <= 80) return <CloudRain className={cls} />
  return <CloudRainWind className={cls} />
}

export default function SectoresPage() {
  const router = useRouter()
  const [sectores, setSectores] = useState<SectorConRyders[]>([])
  const [weatherByZone, setWeatherByZone] = useState<Record<WeatherZone, WeatherStateWithRain> | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      const supabase = createClient()

      // 1. Traer Ryders activos
      const { data: ridersData, error } = await supabase
        .from('riders')
        .select('zone, username')
        .eq('active', true)

      if (error) {
        console.error('Error cargando riders:', error)
      }

      // 2. Agrupar por zona
      const rydersByZone: Record<string, string[]> = {}
      for (const r of ridersData || []) {
        if (r.zone && r.username) {
          if (!rydersByZone[r.zone]) rydersByZone[r.zone] = []
          const match = r.username.match(/\d+/)
          const num = match ? match[0] : r.username
          rydersByZone[r.zone].push(num)
        }
      }

      // 3. Combinar con SECTORS
      const sectoresConRyders: SectorConRyders[] = SECTORS.map((s) => {
        const nums = rydersByZone[s.name] || []
        return {
          ...s,
          realActiveRiders: nums.length,
          ryderNumbers: nums.sort((a, b) => a.localeCompare(b)),
        }
      })

      setSectores(sectoresConRyders)

      // 4. Cargar clima de las 4 zonas en paralelo
      try {
        const weather = await getAllZonesWeatherWithRain()
        setWeatherByZone(weather)
      } catch (e) {
        console.error('Error cargando clima:', e)
      }

      setLoading(false)
    }

    cargar()
  }, [])

  const toggleExpand = (sectorId: string) => {
    setExpandedId((prev) => (prev === sectorId ? null : sectorId))
  }

  const totalRyders = sectores.reduce((acc, s) => acc + s.realActiveRiders, 0)

  // Etiqueta de región
  const regionLabel: Record<WeatherZone, string> = {
    norte: 'Norte',
    centro: 'Centro',
    sur: 'Sur',
    valles: 'Valles',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/delivery-map')}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Sectores de Quito
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-2.5 py-1 flex-shrink-0">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-primary">
              {totalRyders}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-4 space-y-2 max-w-lg mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Cargando sectores...
            </p>
          </div>
        ) : (
          sectores.map((sector) => {
            const isExpanded = expandedId === sector.id
            const hasRyders = sector.realActiveRiders > 0
            const sectorIcon = sector.type === 'metro' ? '🚇' : '🏔'
            const sectorWeather = weatherByZone?.[sector.region]

            return (
              <Card
                key={sector.id}
                onClick={() => toggleExpand(sector.id)}
                className={cn(
                  'bg-card border-border transition-all cursor-pointer overflow-hidden',
                  isExpanded ? 'border-primary/50' : 'hover:border-primary/30'
                )}
              >
                <div className="p-3 flex items-center justify-between gap-3">
                  {/* Bloque izquierdo: icono + nombre + clima */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                      {sectorIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate">
                        {sector.name}
                      </h3>
                      {sectorWeather && (
  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
    <span className="flex items-center gap-1">
      <Thermometer className="h-3 w-3 text-primary" />
      {sectorWeather.temperature}°C
    </span>
    <span className="text-muted-foreground/40">|</span>
   <span className="flex items-center gap-1">
  <RainIcon probability={sectorWeather.rainProbability} />
  {sectorWeather.rainProbability}%
</span>
  </p>
)}
                    </div>
                  </div>

                  {/* Contador */}
                  <div
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 flex-shrink-0',
                      hasRyders ? 'bg-primary/10' : 'bg-muted'
                    )}
                  >
                    <Users
                      className={cn(
                        'h-3.5 w-3.5',
                        hasRyders ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-bold',
                        hasRyders ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {sector.realActiveRiders}
                    </span>
                  </div>
                </div>

                {/* Lista expandible */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 bg-muted/20">
                    {hasRyders ? (
                      <div className="space-y-1.5">
                        {sector.ryderNumbers.map((num) => (
                          <div key={num} className="flex items-center gap-3 pl-4">
                            <span className="text-xs text-muted-foreground">#</span>
                            <span className="text-sm font-mono text-foreground font-medium">
                              {num}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Sin Ryders asignados
                      </p>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}