'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Order } from '@/lib/delivery/delivery-models'
import { MapPin, Settings, User, LogOut } from 'lucide-react'

const DynamicMap = dynamic(() => import('./components/live-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-white/70">
      Cargando mapa...
    </div>
  )
})

const initialMessage = 'Activa tu ubicación y selecciona un sector para iniciar.'

export default function DeliveryMapPage() {
  const router = useRouter()
  const [sectorName, setSectorName] = useState('')
  const [sectorId, setSectorId] = useState('1')
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [estadoServicio, setEstadoServicio] = useState<'recogido' | null>(null)
  const [message, setMessage] = useState(initialMessage)
  const [modoAceptar, setModoAceptar] = useState<'parpadeo' | 'fijo'>('parpadeo')
  const [mostrarConfirmacionRechazo, setMostrarConfirmacionRechazo] = useState(false)

  useEffect(() => {
    const savedSectorId = localStorage.getItem('rider-sector-id')
    const savedSectorName = localStorage.getItem('rider-sector-name')

    if (savedSectorId) {
      setSectorId(savedSectorId)
    }
    if (savedSectorName) {
      setSectorName(savedSectorName)
    }
  }, [])

  useEffect(() => {
    if (pendingOrder && !activeOrder) {
      setMessage(`¡Nuevo pedido! ${pendingOrder.restaurant} → ${pendingOrder.customer}`)
    }
  }, [pendingOrder, activeOrder])

  useEffect(() => {
    const handleNuevoPedido = (event: Event) => {
      const customEvent = event as CustomEvent
      const sharedOrder = customEvent.detail as {
        id: string
        comercioId: string
        comercioName: string
        clienteName: string
        clienteAddress: string
        clienteLat: number
        clienteLng: number
        items: Array<{ name: string; quantity: number; price: number }>
        total: number
        status: string
        createdAt: string | Date
      }

      if (!sharedOrder) return

      setPendingOrder({
        id: sharedOrder.id,
        restaurant: sharedOrder.comercioName,
        customer: sharedOrder.clienteName,
        pickup: {
          name: sharedOrder.comercioName,
          lat: sharedOrder.clienteLat,
          lng: sharedOrder.clienteLng
        },
        dropoff: {
          name: sharedOrder.clienteAddress,
          lat: sharedOrder.clienteLat,
          lng: sharedOrder.clienteLng
        }
      })
      setMessage(`Nuevo pedido entrante: ${sharedOrder.comercioName} → ${sharedOrder.clienteName}`)
    }

    window.addEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
    return () => window.removeEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
  }, [])

  useEffect(() => {
    if (!pendingOrder && !activeOrder) {
      const timeoutId = window.setTimeout(() => {
        setPendingOrder({
          id: 'pedido-001',
          restaurant: 'Panadería La Colmena',
          customer: 'Cliente cerca de La Carolina',
          pickup: {
            name: 'Panadería La Colmena',
            lat: -0.2205,
            lng: -78.513
          },
          dropoff: {
            name: 'Destino del pedido',
            lat: -0.2215,
            lng: -78.5108
          }
        })
        setMessage('Tienes un pedido disponible. Acepta o rechaza.')
      }, 9000)

      return () => window.clearTimeout(timeoutId)
    }
  }, [pendingOrder, activeOrder])

    const handleHeroClick = (action: 'reject' | 'sectors' | 'settings' | 'profile') => {
    switch (action) {
      case 'reject':
        if (activeOrder) {
          setActiveOrder(null)
          setEstadoServicio(null)
          setMessage('Pedido cancelado. Volviendo al mapa con todos los locales.')
        } else if (pendingOrder) {
          setPendingOrder(null)
          setMessage('Pedido rechazado. Esperando el siguiente aviso.')
        }
        break
      case 'sectors':
        router.push('/sectores')
        break
      case 'settings':
        router.push('/ajustes')
        break
      case 'profile':
        router.push('/ryder')
        break
    }
  }

    const handleAcceptOrder = () => {
    if (!pendingOrder) return
    setActiveOrder(pendingOrder)
    setPendingOrder(null)
    setModoAceptar('fijo')
    setEstadoServicio(null)
    setMessage('Pedido aceptado. Sigue la ruta de recogida y entrega.')

    window.dispatchEvent(new CustomEvent('pedido-aceptado-rider', {
      detail: { orderId: pendingOrder.id, riderId: 'rider-001' }
    }))
  }

  const handleRejectOrder = () => {
    setPendingOrder(null)
    setMostrarConfirmacionRechazo(false)
    setMessage('Pedido rechazado. Esperando el siguiente aviso.')
  }

    const handleServicio = () => {
    if (!activeOrder) return

    if (estadoServicio === null) {
      // Primer paso: marcar como recogido
      setEstadoServicio('recogido')
      setMessage('✅ Pedido recogido. Sigue la ruta al cliente.')
    } else {
      // Segundo paso: marcar como entregado
      window.dispatchEvent(new CustomEvent('pedido-entregado', {
        detail: { orderId: activeOrder.id }
      }))
      setActiveOrder(null)
      setEstadoServicio(null)
      setMessage('✅ Pedido entregado. Vuelves a estar libre.')
    }
  }
const terminarJornada = () => {
  const sessionStr = localStorage.getItem('onetoone_panel_session')
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr)
      localStorage.setItem(`onetoone_rider_jornada_${session.id}`, 'false')
    } catch (e) {
      console.error('Error leyendo sesión:', e)
    }
  }
  router.push('/delivery')
}
  const bottomText = useMemo(() => {
    if (activeOrder) {
      return `📍 Recoge en ${activeOrder.pickup.name} y lleva a ${activeOrder.customer}`
    }
    return sectorName ? `Sector activo: ${sectorName}` : initialMessage
  }, [activeOrder, sectorName])

  return (
    <div className="h-screen bg-slate-950 text-white grid grid-rows-[auto_1fr_auto]">
                  <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-1 sticky top-0 z-30 backdrop-blur-xl">
        {/* 🔴 Alerta — semáforo */}
        <button
          type="button"
          onClick={() => setMostrarConfirmacionRechazo(true)}
          className={`w-9 h-9 rounded-full text-base flex items-center justify-center transition ${activeOrder || pendingOrder ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/50' : 'bg-slate-700 opacity-40 cursor-not-allowed'}`}
          disabled={!activeOrder && !pendingOrder}
        >
          🔴
        </button>

                {/* 🟢 Libre/Ocupado — semáforo de posición */}
        <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
          {/* Burbuja */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center transition-all ${
              activeOrder
                ? 'bg-slate-700 opacity-40'
                : 'bg-emerald-500 shadow-md shadow-emerald-500/50 animate-pulse'
            }`}
          />
          {/* Número de posición */}
          <span
            className={`relative z-10 text-base font-bold ${
              activeOrder ? 'text-slate-500' : 'text-white'
            }`}
          >
            {activeOrder ? '—' : '1'}
          </span>
        </div>

        {/* Sectores */}
        <button
          type="button"
          onClick={() => handleHeroClick('sectors')}
          className="w-9 h-9 flex items-center justify-center transition text-slate-300 hover:text-sky-400"
          title="Sectores"
        >
          <MapPin className="h-5 w-5" />
        </button>

        {/* Ajustes */}
        <button
          type="button"
          onClick={() => handleHeroClick('settings')}
          className="w-9 h-9 flex items-center justify-center transition text-slate-300 hover:text-slate-100"
          title="Ajustes"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Perfil */}
        <button
          type="button"
          onClick={() => handleHeroClick('profile')}
          className="w-9 h-9 flex items-center justify-center transition text-slate-300 hover:text-amber-400"
          title="Perfil"
        >
          <User className="h-5 w-5" />
        </button>

        {/* Terminar jornada */}
        <button
          type="button"
          onClick={terminarJornada}
          className="w-9 h-9 flex items-center justify-center transition text-slate-300 hover:text-red-400"
          title="Terminar jornada"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <main className="relative bg-slate-950">
        <DynamicMap
          sectorId={sectorId}
          activeOrder={activeOrder}
          showOnlyTask={Boolean(activeOrder)}
        />

        <div className="absolute top-6 left-4 right-4 flex flex-col gap-3">
          {pendingOrder && !activeOrder ? (
            <div className="rounded-3xl bg-slate-950/90 border border-slate-700 p-4 shadow-2xl">
              <p className="text-sm text-slate-200 font-semibold">Nuevo pedido disponible</p>
              <p className="text-xs text-slate-400 mt-1">{pendingOrder.restaurant} → {pendingOrder.customer}</p>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={handleAcceptOrder}
                  className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    modoAceptar === 'parpadeo'
                      ? 'bg-green-600 animate-pulse shadow-lg shadow-green-500/50 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  🟢 Aceptar
                </button>
                <button
                  onClick={() => setMostrarConfirmacionRechazo(true)}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
                >
                  🔴 Rechazar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <section className="bg-slate-900/95 border-t border-slate-800 px-4 py-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-white/90">{bottomText}</p>
          <p className="text-xs text-slate-500">{message}</p>
                    {activeOrder ? (
            <button
              onClick={handleServicio}
              className={
                estadoServicio === null
                  ? 'mt-3 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-white hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/40'
                  : 'mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/40'
              }
            >
              {estadoServicio === null
                ? '✓ Marcar como recogido'
                : '✓ Marcar como entregado'}
            </button>
          ) : null}
        </div>
      </section>

      {/* Modal de decisión de servicio (aceptar o rechazar) */}
{mostrarConfirmacionRechazo && (
  <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 p-6 rounded-2xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
      {/* Icono */}
      <div className="text-5xl mb-3">🛵</div>

      {/* Título */}
      <p className="text-white font-bold italic mb-1 text-lg drop-shadow-lg animate-pulse">
  ¡Tienes un servicio activo pendiente!
</p>

      {/* Detalles del servicio */}
      {pendingOrder && (
        <div className="bg-slate-800/60 rounded-lg p-3 my-4 space-y-2 text-left">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 text-sm">📍</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                Recoger en
              </p>
              <p className="text-sm text-white truncate">
                {pendingOrder.restaurant}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5 text-sm">🏁</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                Entregar en
              </p>
              <p className="text-sm text-white truncate">
                {pendingOrder.customer}
              </p>
            </div>
          </div>
        </div>
      )}

            {/* Botones */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            setMostrarConfirmacionRechazo(false)
            handleAcceptOrder()
          }}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-500/40"
        >
          ✓ Aceptar
        </button>
        <button
          onClick={handleRejectOrder}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-500/30"
        >
          ✕ Rechazar
        </button>
      </div>
    </div>
  </div>
)}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}
