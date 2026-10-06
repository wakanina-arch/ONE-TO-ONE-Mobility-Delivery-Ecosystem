'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Order } from '@/lib/store'
import { useCartStore } from '@/lib/store'
import { MenuView } from '@/components/menu-view'
import { CartView } from '@/components/cart-view'
import { TicketView } from '@/components/ticket-view'
import { Branding } from '@/components/branding'
import { RegistroComercio } from '@/components/registro/RegistroComercio'
import { OpcionesUnion } from '@/components/registro/OpcionesUnion'
import { PanelAccessModal, hasValidPanelSession } from '@/components/PanelAccessModal'
import { ChevronRight, Bike } from 'lucide-react'
import {
  getActiveMerchants,
  getAllSchedulesForActiveMerchants,
  isOpenNow,
  getTodayScheduleSummary,
  type Merchant,
  type MerchantSchedule,
} from '@/lib/supabase/merchants'
import { FRASES } from '@/lib/frases'

const FRASE_FIJA = { texto: 'La llama que te consume también puede iluminar tu camino.', icono: '🔥' }
type ViewState = 'welcome' | 'menu' | 'cart' | 'ticket'

export default function HomePage() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [view, setView] = useState<ViewState>('welcome')
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [frase, setFrase] = useState(FRASE_FIJA)
  const [showRegistro, setShowRegistro] = useState(false)
  const [showOpcionesUnion, setShowOpcionesUnion] = useState(false)
  const [showRegistroDelivery, setShowRegistroDelivery] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
const [showPanelAccess, setShowPanelAccess] = useState(false)
  const [comercios, setComercios] = useState<Merchant[]>([])
  const [schedules, setSchedules] = useState<Record<string, MerchantSchedule[]>>({})
  const [loadingComercios, setLoadingComercios] = useState(true)

  const handleOrderComplete = (order: Order) => {
    setCompletedOrder(order)
    setView('ticket')
  }

  // Splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setMostrarBienvenida(false), 800)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Cargar comercios + horarios
  useEffect(() => {
    const loadData = async () => {
      setLoadingComercios(true)
      const [merchantsData, schedulesData] = await Promise.all([
        getActiveMerchants(),
        getAllSchedulesForActiveMerchants(),
      ])
      setComercios(merchantsData)
      setSchedules(schedulesData)
      setLoadingComercios(false)
    }
    loadData()
  }, [])

  // Frase aleatoria
  useEffect(() => {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)])
  }, [])

  const handleComercioClick = (comercio: Merchant) => {
    useCartStore.getState().setComercioId(comercio.id)
    localStorage.setItem(
      'comercio_seleccionado',
      JSON.stringify({
        id: comercio.id,
        nombre: comercio.name,
        logo_url: comercio.logo_url,
        sector: comercio.sector,
      })
    )
    setView('menu')
  }

  // ==================== SPLASH ====================
  if (mostrarBienvenida) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background ${
          fadeOut ? 'animate-fade-out' : ''
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center pt-20 md:pt-32">
          <Branding variant="splash" showSubtitle={false} />
          <div className="mt-20">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-3" />
            <div className="px-4">
              <p className="text-gray-300 text-xs italic font-light tracking-wide leading-relaxed max-w-xs mx-auto">
                "{frase.texto}"
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-6 h-px bg-primary/20" />
                <span className="text-primary/60 text-xs tracking-wider">{frase.icono}</span>
                <div className="w-6 h-px bg-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==================== VISTAS INTERNAS ====================
  if (view === 'ticket' && completedOrder) {
    return (
      <TicketView
        order={completedOrder}
        onBackHome={() => {
          setCompletedOrder(null)
          setView('welcome')
        }}
      />
    )
  }
  if (view === 'cart') {
    return <CartView onBack={() => setView('menu')} onOrderComplete={handleOrderComplete} />
  }
  if (view === 'menu') {
    return <MenuView onBack={() => setView('welcome')} onOpenCart={() => setView('cart')} />
  }

  // ==================== HOME ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex flex-col items-center py-4 px-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
  if (hasValidPanelSession()) {
    window.location.href = '/comercio'
  } else {
    setShowPanelAccess(true)
  }
}}
          >
            <span className="text-2xl text-muted-foreground">🔱</span>
            <Branding variant="header" showIcon={false} />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-teal-400">Rapi</span>
            <span className="text-[10px] text-teal-400 inline-block animate-slide-right">»</span>
            <span className="text-[10px] text-teal-400">Servi</span>
            <span
              className="text-[10px] text-teal-400 inline-block animate-slide-right"
              style={{ animationDelay: '0.3s' }}
            >
              »
            </span>
            <span className="text-[10px] text-teal-400">Delivery</span>
            <Bike
              className="h-3 w-3 text-teal-400 ml-0.5 animate-slide-right"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-4 pb-8 space-y-3">
        {loadingComercios ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white/50 text-sm mt-2">Cargando comercios...</p>
          </div>
        ) : comercios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/50">No hay comercios disponibles</p>
          </div>
        ) : (
          comercios.map((comercio) => {
            const merchantSchedules = schedules[comercio.id] || []
            const abierto = isOpenNow(comercio, merchantSchedules)
            const horarioHoy = getTodayScheduleSummary(merchantSchedules)

            return (
              <Card
  key={comercio.id}
  onClick={() => handleComercioClick(comercio)}
  className="relative bg-gray-900 border-gray-700 overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer group p-0 h-48"
>
  {/* Imagen con overlay */}
  <div className="absolute inset-0 bg-gray-950">
    {comercio.logo_url && (
      <img
        src={comercio.logo_url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-50"
        aria-hidden="true"
      />
    )}
    {comercio.logo_url && (
      <img
        src={comercio.logo_url}
        alt={comercio.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
  </div>

  {/* Overlay gradiente */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

  {/* Info */}
  <div className="relative z-10 h-full flex flex-col justify-between p-3">
    {/* Badges arriba */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            abierto ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-[10px] text-white font-semibold">
          {abierto ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
      <span className="text-[10px] text-white/90 bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5">
        {horarioHoy}
      </span>
    </div>

    {/* Info abajo */}
    <div className="flex items-end justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-base drop-shadow-lg truncate">
          {comercio.name}
        </h3>
        <p className="text-white/80 text-xs drop-shadow-md truncate">
          {comercio.sector || 'Quito'}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-white/80 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0 drop-shadow-lg" />
    </div>
  </div>
</Card>
            )
          })
        )}

        {/* Botón Únete */}
        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-full"
            onClick={() => setShowOpcionesUnion(true)}
          >
            💎 Únete al Equipo
          </Button>
        </div>
      </main>

      {/* MODALES */}
      {showOpcionesUnion && (
        <OpcionesUnion
          onSelectComercio={() => {
            setShowOpcionesUnion(false)
            setShowRegistro(true)
          }}
          onSelectDelivery={() => {
            setShowOpcionesUnion(false)
            setShowRegistroDelivery(true)
          }}
          onBack={() => setShowOpcionesUnion(false)}
        />
      )}
      {showRegistro && (
        <RegistroComercio
          onBack={() => setShowRegistro(false)}
          onIrAlPanel={() => {
            setShowRegistro(false)
            window.location.href = '/comercio?openEditor=true'
          }}
        />
      )}
      {showRegistroDelivery && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 text-center">
            <Bike className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Próximamente</h2>
            <p className="text-gray-400 text-sm mb-4">Registro para Riders disponible pronto</p>
            <Button onClick={() => setShowRegistroDelivery(false)} className="bg-amber-600">
              Volver
            </Button>
          </div>
        </div>
      )}
      {showPanelAccess && (
  <PanelAccessModal
    open={showPanelAccess}
    onClose={() => setShowPanelAccess(false)}
    onSuccess={() => {
      setShowPanelAccess(false)
      window.location.href = '/comercio'
    }}
  />
)}

      <style jsx>{`
        @keyframes slide-right {
          0% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(3px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.7; }
        }
        .animate-slide-right { animation: slide-right 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  )
}