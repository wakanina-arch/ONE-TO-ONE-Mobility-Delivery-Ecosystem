'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Order } from '@/lib/delivery/delivery-models'

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
  const [isOnline, setIsOnline] = useState(true)
  const [sectorName, setSectorName] = useState('')
  const [sectorId, setSectorId] = useState('1')
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
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

  const handleHeroClick = (action: 'reject' | 'online' | 'sectors' | 'settings' | 'profile') => {
    switch (action) {
      case 'reject':
        if (activeOrder) {
          setActiveOrder(null)
          setMessage('Pedido cancelado. Volviendo al mapa con todos los locales.')
        } else if (pendingOrder) {
          setPendingOrder(null)
          setMessage('Pedido rechazado. Esperando el siguiente aviso.')
        }
        break
      case 'online':
        setIsOnline((current) => {
          const next = !current
          setMessage(next ? '🟢 Conectado: listo para recibir pedidos.' : '🔴 Desconectado: no recibirás pedidos activos.')
          return next
        })
        break
      case 'sectors':
        router.push('/sectores')
        break
      case 'settings':
        router.push('/ajustes')
        break
      case 'profile':
        router.push('/perfil-rider')
        break
    }
  }

  const handleAcceptOrder = () => {
    if (!pendingOrder) return
    setActiveOrder(pendingOrder)
    setPendingOrder(null)
    setModoAceptar('fijo')
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

  const handleDelivered = () => {
    if (activeOrder) {
      window.dispatchEvent(new CustomEvent('pedido-entregado', {
        detail: { orderId: activeOrder.id }
      }))
    }
    setActiveOrder(null)
    setMessage('✅ Pedido entregado. Todos los locales vuelven a verse en el mapa.')
  }

  const bottomText = useMemo(() => {
    if (activeOrder) {
      return `📍 Recoge en ${activeOrder.pickup.name} y lleva a ${activeOrder.customer}`
    }
    return sectorName ? `Sector activo: ${sectorName}` : initialMessage
  }, [activeOrder, sectorName])

  return (
    <div className="h-screen bg-slate-950 text-white grid grid-rows-[auto_1fr_auto]">
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-2 sticky top-0 z-30 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setMostrarConfirmacionRechazo(true)}
          className={`w-12 h-12 rounded-full text-xl flex items-center justify-center transition ${activeOrder || pendingOrder ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50' : 'bg-slate-700 opacity-40 cursor-not-allowed'}`}
          disabled={!activeOrder && !pendingOrder}
        >
          🔴
        </button>
        <button
          type="button"
          onClick={() => handleHeroClick('online')}
          className={`w-12 h-12 rounded-full text-xl flex items-center justify-center transition ${isOnline ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          🟢
        </button>
        <button
          type="button"
          onClick={() => handleHeroClick('sectors')}
          className="w-12 h-12 rounded-full bg-sky-600 hover:bg-sky-700 text-xl flex items-center justify-center"
        >
          🏞
        </button>
        <button
          type="button"
          onClick={() => handleHeroClick('settings')}
          className="w-12 h-12 rounded-full bg-slate-700 hover:bg-slate-600 text-xl flex items-center justify-center"
        >
          ⚙️
        </button>
        <button
          type="button"
          onClick={() => handleHeroClick('profile')}
          className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-xl flex items-center justify-center"
        >
          🏄
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
              onClick={handleDelivered}
              className="mt-3 rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 hover:bg-amber-400 transition"
            >
              Marcar como entregado
            </button>
          ) : null}
        </div>
      </section>

      {/* Modal de confirmación de rechazo */}
      {mostrarConfirmacionRechazo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-xs text-center border border-gray-700 shadow-2xl">
            <p className="text-white font-bold mb-1 text-lg">⚠️ Confirmar</p>
            <p className="text-white/70 mb-4 text-sm">¿Estás seguro de que quieres rechazar este servicio?</p>
            <div className="flex gap-3">
              <button
                onClick={handleRejectOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Sí, rechazar
              </button>
              <button
                onClick={() => setMostrarConfirmacionRechazo(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition"
              >
                Cancelar
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
