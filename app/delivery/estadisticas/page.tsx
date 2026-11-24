'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getPanelSession } from '@/components/PanelAccessModal'
import { avatars } from '@/lib/models/avatar'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Package,
  Clock,
  Star,
  Bike,
  Route,
} from 'lucide-react'

interface RiderStats {
  total_deliveries: number | null
  total_kilometers: number | null
  active_minutes: number | null
  rating: number | null
  zone: string | null
  vehicle_type: string | null
}

interface Session {
  id: string
  name: string
  avatar?: string
}

export default function EstadisticasPage() {
  const router = useRouter()
  const [stats, setStats] = useState<RiderStats | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [riderAvatar, setRiderAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const s = getPanelSession('rider')
      if (!s?.id) {
        setLoading(false)
        return
      }
      setSession({ id: s.id, name: s.name, avatar: s.avatar })
      if (s.avatar) setRiderAvatar(s.avatar)

      const supabase = createClient()
      const { data } = await supabase
        .from('riders')
        .select(
          'username, total_deliveries, total_kilometers, active_minutes, rating, zone, vehicle_type, avatar'
        )
        .eq('id', s.id)
        .maybeSingle()

      if (data) {
        setStats({
          total_deliveries: data.total_deliveries,
          total_kilometers: data.total_kilometers,
          active_minutes: data.active_minutes,
          rating: data.rating,
          zone: data.zone,
          vehicle_type: data.vehicle_type,
        })
        if (data.avatar) setRiderAvatar(data.avatar)
        if (data.username) {
          setSession((prev) => (prev ? { ...prev, name: data.username } : prev))
        }
      }
      setLoading(false)
    }
    void cargar()
  }, [])

  const formatearTiempo = (minutos: number | null | undefined) => {
    if (!minutos) return '0h 0m'
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  const riderNumber = session?.name?.match(/\d+/)?.[0] || ''
  const riderAlias = session?.name?.replace(/Ryder\s*\d+\s*/i, '').trim() || ''
  const avatarData = avatars.find((a) => a.id === riderAvatar)

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER: Volver a la izquierda, Ryder ID centrado y casco avatar a la derecha */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Flecha de volver a la izquierda */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/delivery')}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Ryder ID centrado */}
          <div className="flex flex-1 items-center justify-center min-w-0 px-2">
            <h1 className="truncate text-sm font-bold text-foreground">
              {riderAlias || 'Ryder'}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                · #{riderNumber || '—'}
              </span>
            </h1>
          </div>

          {/* Casco avatar a la derecha */}
<div className="flex items-center justify-end shrink-0">
  {avatarData ? (
    <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden">
      <div className="absolute inset-2 rounded-full bg-primary/20 blur-md" />
      <img
        src={avatarData.imagePath}
        alt={avatarData.name}
        className="relative h-full w-full scale-[3.2] object-contain"
      />
    </div>
  ) : (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden">
      <span className="text-3xl">🚴</span>
    </div>
  )}
</div>

        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-3">
        <Card className="bg-card border-border overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border bg-card/50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                Estadísticas
              </h2>
              <p className="text-xs text-muted-foreground">
                Tu desempeño en la alianza
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Cargando...
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-background/50 p-3 text-center">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-emerald-500/10 mb-2">
                      <Package className="h-5 w-5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">
                      {stats?.total_deliveries ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Entregas</p>
                  </div>

                  <div className="rounded-xl bg-background/50 p-3 text-center">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-yellow-500/10 mb-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {stats?.rating?.toFixed(1) ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>

                  <div className="rounded-xl bg-background/50 p-3 text-center">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                      <Route className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">
                      {stats?.total_kilometers ?? 0} km
                    </p>
                    <p className="text-xs text-muted-foreground">Kilómetros</p>
                  </div>

                  <div className="rounded-xl bg-background/50 p-3 text-center">
                    <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                      <Clock className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatearTiempo(stats?.active_minutes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tiempo activo
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-background/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Bike className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {stats?.vehicle_type || 'Sin vehículo'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stats?.zone || 'Sin zona asignada'}
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/20 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-400">
                        ✓ Buen desempeño
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mantén la calidad en tus entregas para mejorar tu rating
                        y ganar más.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  Las estadísticas se muestran como información de solo lectura.
                </p>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
