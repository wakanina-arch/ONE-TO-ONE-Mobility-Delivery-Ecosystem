'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Order } from '@/lib/delivery/delivery-models'

// Solución para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const LOCALES_POR_SECTOR: Record<string, Array<{ id: string; name: string; lat: number; lng: number }>> = {
  '1': [
    { id: 'loc1', name: "McDonald's La Carolina", lat: -0.1815, lng: -78.481 },
    { id: 'loc2', name: 'KFC La Carolina', lat: -0.179, lng: -78.4795 },
    { id: 'loc3', name: 'Pizza Hut', lat: -0.183, lng: -78.483 }
  ],
  '2': [
    { id: 'loc4', name: 'Panadería La Colmena', lat: -0.2205, lng: -78.513 },
    { id: 'loc5', name: 'Heladería San Agustín', lat: -0.219, lng: -78.514 }
  ],
  '3': [
    { id: 'loc6', name: 'Pizzería Cumbayá', lat: -0.2078, lng: -78.4382 },
    { id: 'loc7', name: 'Café del Bosque', lat: -0.2095, lng: -78.437 }
  ]
}

const CENTROS_SECTOR: Record<string, [number, number]> = {
  '1': [-0.1807, -78.4803],
  '2': [-0.2202, -78.5125],
  '3': [-0.2089, -78.4376],
  '4': [-0.2178, -78.4008],
  '5': [-0.3019, -78.5465],
  '6': [-0.2079, -78.5285],
  '7': [-0.1523, -78.4901],
  '8': [-0.328, -78.5491],
  '9': [-0.1085, -78.4804],
  '10': [-0.1129, -78.506],
  '11': [-0.1635, -78.4683],
  '12': [-0.1925, -78.4884],
  '13': [-0.24, -78.443],
  '14': [-0.3012, -78.5005],
  '15': [-0.0735, -78.5131]
}

interface LiveMapProps {
  sectorId: string
  activeOrder: Order | null
  showOnlyTask: boolean
}

function RiderLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
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
        maximumAge: 10000
      }
    )
  }, [map])

  return position ? (
    <Marker position={position}>
      <Popup>📍 Tu ubicación actual</Popup>
    </Marker>
  ) : null
}

export default function LiveMap({ sectorId, activeOrder, showOnlyTask }: LiveMapProps) {
  const locales = useMemo(() => LOCALES_POR_SECTOR[sectorId] || [], [sectorId])
  const center = CENTROS_SECTOR[sectorId] || [-0.22985, -78.52495]

  return (
    <MapContainer
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
          <Marker position={[activeOrder.pickup.lat, activeOrder.pickup.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>Recoger:</strong>
                <p>{activeOrder.pickup.name}</p>
              </div>
            </Popup>
          </Marker>
          <Marker position={[activeOrder.dropoff.lat, activeOrder.dropoff.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>Entregar:</strong>
                <p>{activeOrder.dropoff.name}</p>
              </div>
            </Popup>
          </Marker>
          <Polyline
            pathOptions={{ color: '#facc15', weight: 4, opacity: 0.8 }}
            positions={[
              [activeOrder.pickup.lat, activeOrder.pickup.lng],
              [activeOrder.dropoff.lat, activeOrder.dropoff.lng]
            ]}
          />
        </>
      ) : (
        locales.map((local) => (
          <Marker key={local.id} position={[local.lat, local.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>{local.name}</strong>
                <p>Local en el sector</p>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  )
}
