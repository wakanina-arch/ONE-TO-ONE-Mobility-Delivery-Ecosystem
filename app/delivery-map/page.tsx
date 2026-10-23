'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { QRCodeSVG } from 'qrcode.react'
import type { Order } from '@/lib/delivery/delivery-models'
import { createClient } from '@/lib/supabase/client'
import { getPanelSession } from '@/components/PanelAccessModal'
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
  const [pendingOrderSource, setPendingOrderSource] = useState<'auto' | 'rescue'>('auto')
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [estadoServicio, setEstadoServicio] = useState<'recogido' | null>(null)
  const [message, setMessage] = useState(initialMessage)
  const [modoAceptar, setModoAceptar] = useState<'parpadeo' | 'fijo'>('parpadeo')
  const [mostrarConfirmacionRechazo, setMostrarConfirmacionRechazo] = useState(false)
  const [aceptandoPedido, setAceptandoPedido] = useState(false)
  const [errorAceptacion, setErrorAceptacion] = useState<string | null>(null)

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
    if (pendingOrder && !activeOrder && pendingOrderSource === 'auto') {
      setMessage(`¡Nuevo pedido! ${pendingOrder.restaurant} → ${pendingOrder.customer}`)
    }
  }, [pendingOrder, activeOrder, pendingOrderSource])

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
      setPendingOrderSource('auto')
      setMessage(`Nuevo pedido entrante: ${sharedOrder.comercioName} → ${sharedOrder.clienteName}`)
    }

    window.addEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
    return () => window.removeEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
  }, [])

    // 🔵 Polling de pedidos reales en Supabase
  useEffect(() => {
    // Solo buscar si no hay pedido activo ni pendiente
    if (pendingOrder || activeOrder) return

        const sessionForRider = getPanelSession('rider')
    const riderId = sessionForRider?.id ?? null
    if (!riderId) return

    const supabase = createClient()
    let isMounted = true

    const buscarPedidos = async () => {
      if (!isMounted) return

      // 1. Obtener el sector del rider
      const { data: riderData } = await supabase
        .from('riders')
        .select('zone')
        .eq('id', riderId)
        .single()

      const riderZone = riderData?.zone
      if (!riderZone) return

      // 2. Buscar pedidos en 'preparing' del sector del rider
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          delivery_address,
          delivery_lat,
          delivery_lng,
          created_at,
          merchant_id,
          merchants!inner ( name, sector, address )
        `)
        .eq('status', 'preparing')
        .is('rider_id', null)
        .eq('merchants.sector', riderZone)
        .order('created_at', { ascending: true })
        .limit(1)

      if (error) {
        console.error('Error buscando pedidos:', error)
        return
      }

      if (ordersData && ordersData.length > 0) {
        const o = ordersData[0] as any
        const merchant = Array.isArray(o.merchants) ? o.merchants[0] : o.merchants

        setPendingOrder({
          id: o.id,
          restaurant: merchant?.name || 'Comercio',
          customer: o.delivery_address || 'Cliente',
          pickup: {
            name: merchant?.name || 'Comercio',
            lat: -0.1807,   // TODO: coordenadas reales del comercio
            lng: -78.4803,
          },
          dropoff: {
            name: o.delivery_address || 'Cliente',
            lat: o.delivery_lat || -0.18,
            lng: o.delivery_lng || -78.48,
          },
        })
        setMessage(`🔔 Nuevo servicio de ${merchant?.name}`)
      }
    }

    // Primera búsqueda inmediata
    buscarPedidos()

    // Polling cada 10s
    const interval = setInterval(buscarPedidos, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
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

        const handleAcceptOrder = async () => {
          if (!pendingOrder || aceptandoPedido) return

        const session = getPanelSession('rider')
    if (!session) {
      setErrorAceptacion('Debes iniciar sesión como Ryder para aceptar este pedido.')
      return
    }
    const riderId = session.id

          setAceptandoPedido(true)
          setErrorAceptacion(null)

          const supabase = createClient()
          try {
            // La condición rider_id IS NULL hace la asignación atómica si dos Ryders aceptan a la vez.
            const { count: assignedCount, error } = await supabase
              .from('orders')
              .update({ rider_id: riderId }, { count: 'exact' })
              .eq('id', pendingOrder.id)
              .is('rider_id', null)

            if (error) {
              console.error('Error aceptando pedido:', error.message)
              setErrorAceptacion('No se pudo asignar el pedido. Inténtalo de nuevo.')
              return
            }

            if (assignedCount !== 1) {
              const { data: ownAssignment, error: verificationError } = await supabase
                .from('orders')
                .select('id')
                .eq('id', pendingOrder.id)
                .eq('rider_id', riderId)
                .maybeSingle()

              if (verificationError) {
                console.error('Error verificando asignación del pedido:', verificationError.message)
                setErrorAceptacion('No se pudo confirmar la asignación. El pedido sigue en esta pantalla.')
                return
              }

              if (!ownAssignment) {
                setErrorAceptacion('Este pedido ya fue tomado por otro Ryder o ya no está disponible.')
                return
              }
            }

            setActiveOrder(pendingOrder)
            setPendingOrder(null)
            setPendingOrderSource('auto')
            setMostrarConfirmacionRechazo(false)
            setModoAceptar('fijo')
            setEstadoServicio(null)
            const hasRouteCoordinates =
              pendingOrder.pickup.lat !== null &&
              pendingOrder.pickup.lng !== null &&
              pendingOrder.dropoff.lat !== null &&
              pendingOrder.dropoff.lng !== null
            setMessage(
              hasRouteCoordinates
                ? 'Pedido aceptado. Dirígete al comercio y muestra el QR para retirar el pedido.'
                : `Pedido aceptado. Destino: ${pendingOrder.customer}. No hay coordenadas GPS suficientes para mostrar la ruta.`
            )
          } catch (error) {
            console.error('Error inesperado aceptando pedido:', error)
            setErrorAceptacion('Ocurrió un error inesperado. Inténtalo de nuevo.')
          } finally {
            setAceptandoPedido(false)
          }
        }

        const handleRejectOrder = () => {
          if (aceptandoPedido) return
          setPendingOrder(null)
          setMostrarConfirmacionRechazo(false)
          setErrorAceptacion(null)
          setMessage('Pedido rechazado. Esperando el siguiente aviso.')
        }

    const handleSelectNoRiderOrder = (order: Order) => {
    if (pendingOrder || activeOrder) return

    setPendingOrderSource('rescue')
    setPendingOrder(order)
    setMostrarConfirmacionRechazo(true)
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
  const sessionStr = localStorage.getItem('onetoone_panel_session_rider')
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
  onSelectMerchant={async (merchantId: string) => {
    // Buscar el pedido pendiente de ese comercio
    const supabase = createClient()
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total,
        delivery_address,
        delivery_lat,
        delivery_lng,
        created_at,
        merchant_id,
        merchants!inner ( name, sector, address )
      `)
      .eq('merchant_id', merchantId)
      .eq('status', 'preparing')
      .is('rider_id', null)
      .order('created_at', { ascending: true })
      .limit(1)

    if (orderData && orderData.length > 0) {
      const o = orderData[0] as any
      const merchant = Array.isArray(o.merchants) ? o.merchants[0] : o.merchants

      setPendingOrder({
        id: o.id,
        restaurant: merchant?.name || 'Comercio',
        customer: o.delivery_address || 'Cliente',
        pickup: {
          name: merchant?.name || 'Comercio',
          lat: -0.1807,
          lng: -78.4803,
        },
        dropoff: {
          name: o.delivery_address || 'Cliente',
          lat: o.delivery_lat || -0.18,
          lng: o.delivery_lng || -78.48,
        },
      })
      setMostrarConfirmacionRechazo(true)
    }
  }}
/>

        <div className="absolute top-6 left-4 right-4 flex flex-col gap-3">
          {pendingOrder && !activeOrder && !mostrarConfirmacionRechazo ? (
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
          {activeOrder && (
            <div className="mt-2 flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-3">
              <div className="shrink-0 rounded-lg bg-white p-2">
                <QRCodeSVG
                  value={activeOrder.id}
                  size={112}
                  level="M"
                  title={`QR del pedido ${activeOrder.id.slice(-6).toUpperCase()}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">QR para retirar el pedido</p>
                <p className="mt-1 text-xs text-slate-300">
                  Muéstralo en {activeOrder.restaurant} al recoger.
                </p>
                <p className="mt-2 text-xs font-semibold tracking-wider text-emerald-400">
                  Pedido #{activeOrder.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          )}
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
{mostrarConfirmacionRechazo && typeof document !== 'undefined' && createPortal(
  <div
    className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
    style={{ zIndex: 10000 }}
  >
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

      {errorAceptacion && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-300">
          {errorAceptacion}
        </p>
      )}

            {/* Botones */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => void handleAcceptOrder()}
          disabled={aceptandoPedido}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-500/40"
        >
          {aceptandoPedido ? 'Asignando...' : '✓ Aceptar'}
        </button>
        <button
          onClick={handleRejectOrder}
          disabled={aceptandoPedido}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-500/30"
        >
          ✕ Rechazar
        </button>
      </div>
    </div>
  </div>,
  document.body
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
