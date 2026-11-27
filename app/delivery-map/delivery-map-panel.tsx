'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { QRCodeSVG } from 'qrcode.react'
import type { Order } from '@/lib/delivery/delivery-models'
import { obtenerMiPosicion, entrarACola, moverAlFinal, actualizarEstadoCola, salirDeCola } from '@/lib/delivery/queue-logic'
import { createClient } from '@/lib/supabase/client'
import { getPanelSession } from '@/components/PanelAccessModal'
import { QRScanner } from './components/QRScanner'
import { getWeatherWithRain, type WeatherZone, ZONE_COORDS } from '@/lib/delivery/weather-service'
import { MapPin, User, LogOut, Sun, CloudRain, Navigation, Bike, CheckCircle2, Thermometer } from 'lucide-react'

const DynamicMap = dynamic(() => import('./components/live-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#0b0d0e] animate-pulse flex items-center justify-center text-white/50">
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
  const [miPosicion, setMiPosicion] = useState<number | null>(1)
  const [totalEnCola, setTotalEnCola] = useState<number>(0)
    const [mostrarEscanner, setMostrarEscanner] = useState(false)
  const [clima, setClima] = useState<{ temp: number; lluvia: number; condicion: string } | null>(null)

  // Cargar sector guardado
  useEffect(() => {
    const savedSectorId = localStorage.getItem('rider-sector-id')
    const savedSectorName = localStorage.getItem('rider-sector-name')
    if (savedSectorId) setSectorId(savedSectorId)
    if (savedSectorName) setSectorName(savedSectorName)
  }, [])
      // Obtener clima basado en el sector del Ryder
  useEffect(() => {
    // Si no hay sector, usamos 'centro' por defecto para que siempre haya clima
    const sectorParaClima = sectorName || 'Centro'
    
    const getZonaFromSector = (sector: string): WeatherZone => {
      const s = sector.toLowerCase()
      if (s.includes('norte') || s.includes('carapungo') || s.includes('pomasqui')) return 'norte'
      if (s.includes('sur') || s.includes('quitumbe') || s.includes('chillos')) return 'sur'
      if (s.includes('valle') || s.includes('cumbaya') || s.includes('tumbaco')) return 'valles'
      return 'centro'
    }

    const zona = getZonaFromSector(sectorParaClima)
    console.log('🔍 Consultando clima para zona:', zona)

    const consultarClima = async () => {
      try {
        const data = await getWeatherWithRain(zona)
        console.log('🔍 Datos del clima recibidos:', data)
        setClima({
          temp: data.temperature,
          lluvia: data.rainProbability,
          condicion: data.condition,
        })
      } catch (error) {
        console.error('🔍 Error obteniendo clima:', error)
        // Fallback: datos simulados si todo falla
        setClima({ temp: 18, lluvia: 0, condicion: 'clear-day' })
      }
    }

    void consultarClima()
    
    // Actualizar cada 10 minutos
    const interval = setInterval(consultarClima, 600000)
    return () => clearInterval(interval)
  }, [sectorName])
       // Consultar la posición en la cola
  useEffect(() => {
    // No hacemos return temprano por sectorName, solo si hay un pedido activo
    if (activeOrder) return;

    const consultarCola = async () => {
      const session = getPanelSession('rider')
      if (!session?.id) return; // Solo salimos si no hay sesión

      // Si no hay sectorName, no podemos consultar la BD, pero dejamos el 1 visual
      if (!sectorName) {
        setMiPosicion(1)
        setTotalEnCola(1)
        return;
      }

      try {
        const { posicion, total } = await obtenerMiPosicion(session.id, sectorName)
        
        if (posicion !== null) {
          setMiPosicion(posicion)
          setTotalEnCola(total)
        } else {
          // Si no está en la BD, intentar entrar
          await entrarACola(session.id, sectorName)
          const reintento = await obtenerMiPosicion(session.id, sectorName)
          setMiPosicion(reintento.posicion ?? 1)
          setTotalEnCola(reintento.total || 1)
        }
      } catch (err) {
        console.error('Error en cola:', err)
        // Fallback: mostrar 1 si la BD falla
        setMiPosicion(1)
        setTotalEnCola(1)
      }
    }

    void consultarCola()
    
    const interval = setInterval(consultarCola, 15000)
    return () => clearInterval(interval)
  }, [sectorName, activeOrder])

  useEffect(() => {
    if (pendingOrder && !activeOrder && pendingOrderSource === 'auto') {
      setMessage(`¡Nuevo pedido! ${pendingOrder.restaurant} → ${pendingOrder.customer}`)
    }
  }, [pendingOrder, activeOrder, pendingOrderSource])

  // Listener para nuevos pedidos (simulación)
  useEffect(() => {
    const handleNuevoPedido = (event: Event) => {
      const customEvent = event as CustomEvent
      const sharedOrder = customEvent.detail
      if (!sharedOrder) return

      setPendingOrder({
        id: sharedOrder.id,
        restaurant: sharedOrder.comercioName,
        customer: sharedOrder.clienteName,
        pickup: { name: sharedOrder.comercioName, lat: sharedOrder.clienteLat, lng: sharedOrder.clienteLng },
        dropoff: { name: sharedOrder.clienteAddress, lat: sharedOrder.clienteLat, lng: sharedOrder.clienteLng }
      })
      setPendingOrderSource('auto')
      setMessage(`Nuevo pedido entrante: ${sharedOrder.comercioName} → ${sharedOrder.clienteName}`)
    }
    window.addEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
    return () => window.removeEventListener('nuevo-pedido-rider', handleNuevoPedido as EventListener)
  }, [])

  // Polling de pedidos reales
  useEffect(() => {
    if (pendingOrder || activeOrder) return
    const sessionForRider = getPanelSession('rider')
    const riderId = sessionForRider?.id ?? null
    if (!riderId) return

    const supabase = createClient()
    let isMounted = true

    const buscarPedidos = async () => {
      if (!isMounted) return
      const { data: riderData } = await supabase.from('riders').select('zone').eq('id', riderId).single()
      const riderZone = riderData?.zone
      if (!riderZone) return

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`id, status, total, delivery_address, delivery_lat, delivery_lng, created_at, merchant_id, merchants!inner ( name, sector, address )`)
        .eq('status', 'preparing')
        .is('rider_id', null)
        .eq('merchants.sector', riderZone)
        .order('created_at', { ascending: true })
        .limit(1)

      if (error) { console.error('Error buscando pedidos:', error); return }

      if (ordersData && ordersData.length > 0) {
        const o = ordersData[0] as any
        const merchant = Array.isArray(o.merchants) ? o.merchants[0] : o.merchants
        setPendingOrder({
          id: o.id,
          restaurant: merchant?.name || 'Comercio',
          customer: o.delivery_address || 'Cliente',
          pickup: { name: merchant?.name || 'Comercio', lat: -0.1807, lng: -78.4803 },
          dropoff: { name: o.delivery_address || 'Cliente', lat: o.delivery_lat || -0.18, lng: o.delivery_lng || -78.48 },
        })
        setMessage(`🔔 Nuevo servicio de ${merchant?.name}`)
      }
    }

    buscarPedidos()
    const interval = setInterval(buscarPedidos, 10000)
    return () => { isMounted = false; clearInterval(interval) }
  }, [pendingOrder, activeOrder])

  const handleAcceptOrder = async () => {
    if (!pendingOrder || aceptandoPedido) return
    const session = getPanelSession('rider')
    if (!session) { setErrorAceptacion('Debes iniciar sesión como Ryder.'); return }
    const riderId = session.id
    setAceptandoPedido(true)
    setErrorAceptacion(null)
    const supabase = createClient()

    try {
      const { count: assignedCount, error } = await supabase
        .from('orders')
        .update({ rider_id: riderId }, { count: 'exact' })
        .eq('id', pendingOrder.id)
        .is('rider_id', null)

      if (error || assignedCount !== 1) {
        setErrorAceptacion('Este pedido ya fue tomado por otro Ryder.')
        return
      }

      setActiveOrder(pendingOrder)
      setPendingOrder(null)
      setPendingOrderSource('auto')
      setMostrarConfirmacionRechazo(false)
      setModoAceptar('fijo')
      setEstadoServicio(null)
      setMessage('Pedido aceptado. Dirígete al comercio y muestra el QR.')
    } catch (error) {
      setErrorAceptacion('Ocurrió un error inesperado.')
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
    // Aquí iría la lógica de mover al final de la cola (back)
  }

      const handleServicio = async () => {
    if (!activeOrder) return

    if (estadoServicio === null) {
      // 1. El Ryder marca como recogido → 'picked_up'
      const supabase = createClient()
      await supabase
        .from('orders')
        .update({ status: 'picked_up' })
        .eq('id', activeOrder.id)

      setEstadoServicio('recogido')
      setMessage('✅ Pedido recogido. Sigue la ruta al cliente.')
    } else {
      // 2. El Ryder marca como entregado → 'delivering' (NO 'delivered')
      const supabase = createClient()
      await supabase
        .from('orders')
        .update({ status: 'delivering' }) // 👈 TIENE QUE SER 'delivering'
        .eq('id', activeOrder.id)

      window.dispatchEvent(new CustomEvent('pedido-entregado', { detail: { orderId: activeOrder.id } }))
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
      } catch (e) { console.error(e) }
    }
    router.push('/delivery')
  }

  return (
    <div className="h-screen bg-[#0b0d0e] text-white flex flex-col">
      
      {/* 1. BARRA SUPERIOR (Panel Operativo) */}
      <header className="bg-[#101112] border-b border-white/10 px-3 py-2 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
                    {/* Puesto en la cola */}
          <div className={`flex flex-col items-center justify-center h-12 w-14 rounded-lg ${activeOrder ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}>
            <span className="text-lg font-bold leading-none">{activeOrder ? '—' : (miPosicion ?? 1)}</span>
            <span className="text-[9px] font-medium mt-0.5">Tu puesto</span>
          </div>
          {/* Servicio */}
          <div className={`flex flex-col items-center justify-center h-12 w-14 rounded-lg ${activeOrder || pendingOrder ? 'bg-red-700 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            <span className="text-lg leading-none">●</span>
            <span className="text-[9px] font-medium mt-0.5">Servicio</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sectores con texto */}
          <button onClick={() => router.push('/sectores')} className="flex items-center gap-1.5 px-2 py-2 text-slate-300 hover:text-white transition">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium">Sectores</span>
          </button>
          {/* Perfil */}
          <button onClick={() => router.push('/ryder')} className="flex items-center gap-1.5 px-2 py-2 text-slate-300 hover:text-white transition">
            <User className="h-4 w-4" />
            <span className="text-xs font-medium">Perfil</span>
          </button>
          {/* Terminar jornada */}
          <button onClick={terminarJornada} className="flex items-center justify-center h-8 w-8 text-slate-400 hover:text-red-400 transition ml-1">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. MAPA OPERATIVO */}
      <main className="relative flex-1 bg-[#0b0d0e]">
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
                  lat: -0.1807, // TODO: Coordenadas reales
                  lng: -78.4803,
                },
                dropoff: {
                  name: o.delivery_address || 'Cliente',
                  lat: o.delivery_lat || -0.18,
                  lng: o.delivery_lng || -78.48,
                },
              })
              setPendingOrderSource('rescue') // Lo marcamos como rescate
              setMostrarConfirmacionRechazo(true) // Abrimos el modal de aceptar/rechazar
            } else {
              alert('Este pedido ya no está disponible o ya fue tomado.')
            }
          }}
        />

                     {/* Capa de Clima (Cristal Líquido Premium) */}
        <div className="absolute top-4 right-4 z-50 flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/60 px-2 py-3 shadow-2xl backdrop-blur-xl">
          {clima ? (
            <>
              {/* Temperatura */}
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-orange-400" strokeWidth={1.5} />
                <span className="text-sm font-bold text-white">{clima.temp}°C</span>
              </div>

              {/* Divisor elegante */}
              <div className="h-px w-5 bg-white/10" />

              {/* Lluvia */}
              <div className="flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
                <span className="text-sm font-bold text-white">{clima.lluvia}%</span>
              </div>

              {/* Semáforo de alerta */}
              <div className="mt-0.5 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    clima.lluvia > 60 ? 'bg-red-400' : clima.lluvia > 20 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}></span>
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    clima.lluvia > 60 ? 'bg-red-500' : clima.lluvia > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                </span>
                <span className={`text-[8px] font-medium uppercase tracking-wider ${
                  clima.lluvia > 60 ? 'text-red-400/80' : clima.lluvia > 20 ? 'text-amber-400/80' : 'text-emerald-400/80'
                }`}>
                  {clima.lluvia > 60 ? 'Alerta' : clima.lluvia > 20 ? 'Precaución' : 'Atención'}
                </span>
              </div>
            </>
          ) : (
            <span className="text-[10px] text-white/50">...</span>
          )}
        </div>

        {/* Capa de GPS (Mockup visual) */}
        <div className="absolute bottom-4 right-4 bg-[#101112]/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <Navigation className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-white/80">Mi ubicación</span>
        </div>
      </main>

      {/* 3. PANEL INFERIOR DE SERVICIO */}
      <section className="bg-[#101112] border-t border-white/10 px-4 py-4 z-30">
        <div className="max-w-lg mx-auto flex flex-col gap-3">
          
          {activeOrder ? (
            // ESTADO: SERVICIO ACTIVO
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Servicio en curso</h3>
                  <p className="text-xs text-white/50">{activeOrder.restaurant} → {activeOrder.customer}</p>
                </div>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">Ocupado</span>
              </div>
              
                            <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <div className="shrink-0 rounded-lg bg-white p-1.5">
                  <QRCodeSVG value={activeOrder.id} size={80} level="M" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">QR de retiro</p>
                  <p className="text-xs text-white/60 mt-0.5">Muéstralo en {activeOrder.restaurant}.</p>
                  <p className="text-[10px] font-mono text-emerald-400 mt-1">#{activeOrder.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              {/* Botón de escaneo / simulación */}
              {estadoServicio === null && (
                <button
                  onClick={async () => {
                    // Si estamos en desarrollo (localhost) o no hay cámara, simulamos
                    const esLocalhost = window.location.hostname === 'localhost'
                    
                    if (esLocalhost) {
                      // SIMULACIÓN: cambia el estado a 'picked_up'
                      const supabase = createClient()
                      const { error } = await supabase
                        .from('orders')
                        .update({ status: 'picked_up' })
                        .eq('id', activeOrder.id)

                      if (error) {
                        alert('Error al actualizar el pedido: ' + error.message)
                        return
                      }

                      setEstadoServicio('recogido')
                      setMessage('✅ Pedido recogido (simulado). Sigue la ruta al cliente.')
                    } else {
                      // PRODUCCIÓN: abre la cámara real
                      setMostrarEscanner(true)
                    }
                  }}
                  className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                >
                  {window.location.hostname === 'localhost' 
                    ? '📷 Simular escaneo del QR (Desarrollo)' 
                    : '📷 Escanear QR del comercio'}
                </button>
              )}

              <button
                onClick={handleServicio}
                className={`w-full rounded-xl py-3.5 font-bold text-sm transition shadow-lg ${
                  estadoServicio === null
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {estadoServicio === null ? '✓ Marcar como recogido' : '✓ Marcar como entregado'}
              </button>
            </>
          ) : pendingOrder ? (
            // ESTADO: NUEVO PEDIDO PENDIENTE
            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">Nuevo pedido</span>
                <span className="text-xs text-white/50">{pendingOrder.restaurant}</span>
              </div>
              <p className="text-sm text-white font-semibold">{pendingOrder.restaurant} → {pendingOrder.customer}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAcceptOrder}
                  disabled={aceptandoPedido}
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-400 transition"
                >
                  {aceptandoPedido ? 'Asignando...' : 'Aceptar'}
                </button>
                <button
                  onClick={() => setMostrarConfirmacionRechazo(true)}
                  disabled={aceptandoPedido}
                  className="flex-1 rounded-xl bg-slate-700 py-3 text-sm font-bold text-white hover:bg-slate-600 transition"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ) : (
                        // ESTADO: EN COLA (SIN SERVICIO)
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-white font-bold text-lg">Esperando pedido</h3>
              </div>
              <p className="text-xs text-white/50 text-center">
                Hay <span className="text-white font-bold">{totalEnCola}</span> ryders en tu sector. Eres el número <span className="text-emerald-400 font-bold">{miPosicion}</span>.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* MODAL DE RECHAZO (Conserva el diseño actual) */}
      {mostrarConfirmacionRechazo && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-[#101112] p-6 rounded-2xl max-w-sm w-full text-center border border-white/10 shadow-2xl">
            <div className="text-5xl mb-3">🛵</div>
            <p className="text-white font-bold text-lg mb-1">¿Rechazar servicio?</p>
            {pendingOrder && (
              <div className="bg-white/5 rounded-lg p-3 my-4 space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 text-sm">📍</span>
                  <div><p className="text-[10px] text-white/40 uppercase">Recoger en</p><p className="text-sm text-white truncate">{pendingOrder.restaurant}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 text-sm">🏁</span>
                  <div><p className="text-[10px] text-white/40 uppercase">Entregar en</p><p className="text-sm text-white truncate">{pendingOrder.customer}</p></div>
                </div>
              </div>
            )}
            {errorAceptacion && <p className="mt-3 text-sm text-red-300">{errorAceptacion}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleAcceptOrder} disabled={aceptandoPedido} className="flex-1 bg-emerald-500 py-3 rounded-xl font-bold text-white hover:bg-emerald-400 transition">
                Aceptar
              </button>
              <button onClick={handleRejectOrder} disabled={aceptandoPedido} className="flex-1 bg-red-600 py-3 rounded-xl font-bold text-white hover:bg-red-500 transition">
                Rechazar
              </button>
            </div>
          </div>
                {mostrarEscanner && (
        <QRScanner
          onScanSuccess={async (decodedText) => {
            setMostrarEscanner(false)
            if (decodedText.trim() !== activeOrder?.id) {
              alert('❌ El código QR no corresponde a este pedido.')
              return
            }
            const supabase = createClient()
            await supabase.from('orders').update({ status: 'picked_up' }).eq('id', activeOrder.id)
            setEstadoServicio('recogido')
            setMessage('✅ Pedido recogido. Sigue la ruta al cliente.')
          }}
          onClose={() => setMostrarEscanner(false)}
        />
      )}
        </div>,
        document.body
      )}
    </div>
  )
}