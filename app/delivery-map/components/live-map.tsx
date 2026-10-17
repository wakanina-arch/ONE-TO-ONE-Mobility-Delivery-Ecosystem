'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Order } from '@/lib/delivery/delivery-models'
import { createClient } from '@/lib/supabase/client'
import { SECTORS } from '@/lib/delivery/sectors-data'

// Solución para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 🏪 Icono para el comercio (pickup)
const merchantIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fbbf24; border-radius: 50%; border: 2px solid #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
  
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
    </svg>
  </div>`,
  
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// 🚨 Icono para el comercio CON pedido pendiente (rojo pulsante)
const merchantIconAlert = L.divIcon({
  html: `<div class="custom-merchant-icon-alert" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #ef4444; border-radius: 50%; border: 2px solid #1e293b; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// 🏠 Icono para el cliente (dropoff)
const customerIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #3b82f6; border-radius: 50%; border: 2px solid #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const riderIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #10b981; border-radius: 50%; border: 2px solid #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Centros de los 15 sectores de Quito
const CENTROS_SECTOR: Record<string, [number, number]> = {
  '1': [-0.1807, -78.4803],   // La Carolina
  '2': [-0.2202, -78.5125],   // Centro Histórico
  '3': [-0.2089, -78.4376],   // Cumbayá
  '4': [-0.2178, -78.4008],   // Tumbaco
  '5': [-0.3019, -78.5465],   // Los Chillos
  '6': [-0.2079, -78.5285],   // La Magdalena
  '7': [-0.1523, -78.4901],   // El Labrador
  '8': [-0.328, -78.5491],    // Quitumbe
  '9': [-0.1085, -78.4804],   // Carapungo
  '10': [-0.1129, -78.506],   // La Ofelia
  '11': [-0.1635, -78.4683],  // El Batán
  '12': [-0.1925, -78.4884],  // La Floresta
  '13': [-0.24, -78.443],     // San Rafael
  '14': [-0.3012, -78.5005],  // Conocoto
  '15': [-0.0735, -78.5131],  // Pomasqui
}

interface LiveMapProps {
  sectorId: string
  activeOrder: Order | null
  showOnlyTask: boolean
  onSelectMerchant?: (merchantId: string) => void
}

interface MerchantWithCoords {
  id: string
  name: string
  sector: string | null
  address: string | null
  lat: number | null
  lng: number | null
}

// ================================================================
// MARKER DEL RIDER
// ================================================================

function RiderLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ]
        setPosition(coords)
        map.setView(coords, 14)
      },
      () => {
        const fallback: [number, number] = [-0.22985, -78.52495]
        setPosition(fallback)
        map.setView(fallback, 13)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    )
  }, [map])

  return position ? (
    <Marker position={position} icon={riderIcon}>
      <Popup>🛵 Tu ubicación actual</Popup>
    </Marker>
  ) : null
}

// ================================================================
// COMPONENTE PRINCIPAL
// ================================================================

export default function LiveMap({
  sectorId,
  activeOrder,
  showOnlyTask,
  onSelectMerchant,
}: LiveMapProps) {
  const [merchants, setMerchants] = useState<MerchantWithCoords[]>([])
  const [loading, setLoading] = useState(true)
  // 🔴 Set de comercios con pedidos pendientes (preparing)
const [merchantsWithPendingOrders, setMerchantsWithPendingOrders] = useState<Set<string>>(new Set())
  const [ordersWithoutRiders, setOrdersWithoutRiders] = useState<Map<string, Order>>(new Map())

  const center = useMemo(
    () => CENTROS_SECTOR[sectorId] || [-0.22985, -78.52495],
    [sectorId]
  )

  // 🔵 Cargar los comercios reales del sector desde Supabase
  useEffect(() => {
    const cargarComercios = async () => {
    const supabase = createClient()

    // 1. Cargar TODOS los comercios activos
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, sector, address, lat, lng')
      .eq('active', true)

    if (merchantError) {
      console.error('Error cargando comercios:', merchantError)
      setMerchants([])
      setMerchantsWithPendingOrders(new Set())
      setOrdersWithoutRiders(new Map())
      setLoading(false)
      return
    }

    setMerchants(merchantData || [])

    // 2. Cargar pedidos pendientes (preparing) de esos comercios
    const merchantIds = (merchantData || []).map((m) => m.id)

    if (merchantIds.length > 0) {
      const [ordersResult, ridersResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, merchant_id, delivery_address, delivery_lat, delivery_lng, created_at')
          .eq('status', 'preparing')
          .is('rider_id', null)
          .in('merchant_id', merchantIds)
          .order('created_at', { ascending: true }),
        supabase
          .from('riders')
          .select('zone')
          .eq('active', true),
      ])

      if (ordersResult.error) {
        console.error('Error cargando pedidos pendientes:', ordersResult.error)
        setMerchantsWithPendingOrders(new Set())
        setOrdersWithoutRiders(new Map())
      } else {
        const orderData = ordersResult.data || []
        const pendingSet = new Set(orderData.map((order) => order.merchant_id))
        setMerchantsWithPendingOrders(pendingSet)

        if (ridersResult.error) {
          console.error('Error comprobando Ryders activos por sector:', ridersResult.error)
          setOrdersWithoutRiders(new Map())
        } else {
          const activeRiderZones = new Set(
            (ridersResult.data || []).map((rider) => rider.zone).filter(Boolean)
          )
          const fallbackOrders = new Map<string, Order>()

          for (const order of orderData) {
            if (fallbackOrders.has(order.merchant_id)) continue

            const merchant = merchantData.find((item) => item.id === order.merchant_id)
            if (!merchant?.sector || activeRiderZones.has(merchant.sector)) continue

            const customer = order.delivery_address || 'Dirección no registrada'

            fallbackOrders.set(order.merchant_id, {
              id: order.id,
              restaurant: merchant.name,
              customer,
              pickup: {
                name: merchant.name,
                lat: merchant.lat,
                lng: merchant.lng,
              },
              dropoff: {
                name: customer,
                lat: order.delivery_lat,
                lng: order.delivery_lng,
              },
            })
          }

          setOrdersWithoutRiders(fallbackOrders)
        }
      }
    } else {
      setMerchantsWithPendingOrders(new Set())
      setOrdersWithoutRiders(new Map())
    }

    setLoading(false)
  }

  // Carga inicial
  cargarComercios()

  // Polling cada 10s
  const interval = setInterval(cargarComercios, 10000)

  return () => clearInterval(interval)
}, [center, sectorId])

    return (
    <>
      <MapContainer
        key="delivery-map-main"
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RiderLocationMarker />

        {showOnlyTask && activeOrder ? (
          <>
            {activeOrder.pickup.lat !== null && activeOrder.pickup.lng !== null && (
              <Marker
                position={[activeOrder.pickup.lat, activeOrder.pickup.lng]}
                icon={merchantIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Recoger en:</strong>
                    <p>{activeOrder.pickup.name}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {activeOrder.dropoff.lat !== null && activeOrder.dropoff.lng !== null && (
              <Marker
                position={[activeOrder.dropoff.lat, activeOrder.dropoff.lng]}
                icon={customerIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Entregar en:</strong>
                    <p>{activeOrder.dropoff.name}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {activeOrder.pickup.lat !== null &&
              activeOrder.pickup.lng !== null &&
              activeOrder.dropoff.lat !== null &&
              activeOrder.dropoff.lng !== null && (
                <Polyline
                  pathOptions={{ color: '#facc15', weight: 4, opacity: 0.8 }}
                  positions={[
                    [activeOrder.pickup.lat, activeOrder.pickup.lng],
                    [activeOrder.dropoff.lat, activeOrder.dropoff.lng],
                  ]}
                />
              )}
          </>
        ) : (
          <>
            {loading ? null : merchants.length === 0 ? (
              <Marker position={center}>
                <Popup>
                  <div className="text-sm">
                    <strong>Sin comercios activos</strong>
                    <p>En este sector por ahora</p>
                  </div>
                </Popup>
              </Marker>
            ) : (
              merchants.map((merchant) => {
  const lat = merchant.lat ?? center[0]
  const lng = merchant.lng ?? center[1]
  const hasPending = merchantsWithPendingOrders.has(merchant.id)

  return (
    <Marker
      key={merchant.id}
      position={[lat, lng]}
      icon={hasPending ? merchantIconAlert : merchantIcon}
      eventHandlers={{
        click: () => {
          if (hasPending && onSelectMerchant) {
            // 🔵 Si tiene pedidos pendientes → abrir el modal directo
            onSelectMerchant(merchant.id)
          }
          // Si no tiene pedidos, el popup se abre normal (info del comercio)
        },
      }}
    >
      <Tooltip
        permanent
        direction="bottom"
        offset={[0, 12]}
        className="merchant-tooltip"
      >
        {merchant.name}
      </Tooltip>

      {/* 🔵 Popup SOLO para comercios sin pedidos pendientes (info del comercio) */}
      {!hasPending && (
        <Popup>
          <div className="text-sm">
            <strong>{merchant.name}</strong>
            <p>{merchant.sector}</p>
            {merchant.address && (
              <p className="text-xs text-gray-600">{merchant.address}</p>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  )
})
            )}
          </>
        )}
      </MapContainer>

      <style jsx>{`
        :global(.merchant-tooltip) {
          background: #1e293b !important;
          color: #fbbf24 !important;
          border: 1px solid #fbbf24 !important;
          border-radius: 4px !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          padding: 2px 6px !important;
          white-space: nowrap !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
        }

        :global(.merchant-tooltip::before) {
          border-bottom-color: #fbbf24 !important;
        }
          @keyframes pulse-alert {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 20px rgba(239, 68, 68, 1);
  }
}

:global(.custom-merchant-icon-alert) {
  animation: pulse-alert 1s ease-in-out infinite !important;
  transform-origin: center !important;
}
      `}</style>
    </>
  )
}