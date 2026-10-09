'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  hasValidPanelSession,
  getPanelSession,
  revokePanelSession,
} from '@/components/PanelAccessModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Map as MapIcon,
  User,
  BarChart3,
  BookOpen,
  ChevronRight,
  LogOut,
} from 'lucide-react'

interface Session {
  id: string
  name: string
  avatar?: string
}

// Clave de localStorage para el estado de la jornada
const JORNADA_KEY = 'onetoone_rider_jornada'

export default function DeliveryPanel() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [jornadaActiva, setJornadaActiva] = useState(false)

  useEffect(() => {
    if (!hasValidPanelSession()) {
      router.push('/')
      return
    }
    const s = getPanelSession()
    if (s && s.type === 'rider') {
      setSession({
        id: s.id,
        name: s.name,
        avatar: s.avatar,
      })
      // Cargar estado de jornada desde localStorage
      const saved = localStorage.getItem(`${JORNADA_KEY}_${s.id}`)
      setJornadaActiva(saved === 'true')
    } else {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    revokePanelSession()
    router.push('/')
  }

  const handleToggleJornada = () => {
  if (!session) return
  const next = !jornadaActiva
  setJornadaActiva(next)
  localStorage.setItem(`${JORNADA_KEY}_${session.id}`, String(next))

  // Si activa la jornada → entra al mapa directamente
  if (next) {
    router.push('/delivery-map')
  }
}

  const riderNumber = session?.name?.match(/\d+/)?.[0] || ''
  const riderAlias = session?.name?.replace(/Ryder\s*\d+\s*/i, '').trim() || ''

  // Los 3 ítems secundarios (sin Mapa de Trabajo que va arriba con toggle)
  const otherItems = [
    {
      label: 'Ryder',
      description: 'Perfil, salud, seguridad social',
      icon: User,
      href: '/ryder',
    },
    {
      label: 'Estadísticas',
      description: 'Entregas, kilómetros, ganancias',
      icon: BarChart3,
      href: '/delivery/estadisticas',
    },
    {
      label: 'Wikipedia',
      description: 'Consulta offline mientras esperas',
      icon: BookOpen,
      href: '/delivery/wikipedia',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {session?.avatar ? (
              <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                <div className="absolute inset-6 rounded-full bg-primary/20 blur-lg" />
                <img
                  src={session.avatar}
                  alt={session.name}
                  className="relative w-28 h-28 object-contain scale-[1.4]"
                />
              </div>
            ) : (
              <div className="w-28 h-28 flex items-center justify-center text-5xl flex-shrink-0">
                🚴
              </div>
            )}

            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-base font-bold text-foreground truncate">
                Panel {riderAlias || 'Ryder'}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Ryder #{riderNumber || '—'}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-10 w-10 flex-shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
      </header>

      {/* MAIN */}
      <main className="p-4 space-y-3 max-w-lg mx-auto">
        {/* ITEM 1 — Mapa de Trabajo (con toggle) */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Mapa de Trabajo
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {jornadaActiva
                    ? 'Jornada activa · toca para entrar'
                    : 'Activa tu jornada de trabajo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              

              <button
  onClick={handleToggleJornada}
  className={cn(
    'relative w-12 h-7 rounded-full transition-colors flex-shrink-0 p-0.5',
    jornadaActiva ? 'bg-emerald-500' : 'bg-gray-600'
  )}
>
  <span
    className={cn(
      'block w-6 h-6 bg-white rounded-full transition-transform shadow-md',
      jornadaActiva ? 'translate-x-5' : 'translate-x-0'
    )}
  />
</button>
            </div>
          </div>
        </Card>

        {/* ITEMS 2-4 (sin toggle) */}
        {otherItems.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.label}
              onClick={() => router.push(item.href)}
              className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {item.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Card>
          )
        })}
      </main>
    </div>
  )
}