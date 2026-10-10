// lib/delivery/sectors-data.ts

import type { WeatherZone } from './weather-service'

export type SectorType = 'metro' | 'valle'

export interface Sector {
  id: string
  name: string
  activeRiders: number
  center: [number, number]
  polygon?: any
  type: SectorType
  region: WeatherZone   // ← NUEVO
}

export const SECTORS: Sector[] = [
  // ============ NORTE ============
  { id: '1',  name: 'La Carolina',      activeRiders: 7, center: [-0.1807, -78.4803], type: 'metro', region: 'norte' },
  { id: '7',  name: 'El Labrador',      activeRiders: 8, center: [-0.1523, -78.4901], type: 'metro', region: 'norte' },
  { id: '9',  name: 'Carapungo',        activeRiders: 2, center: [-0.1085, -78.4804], type: 'valle', region: 'norte' },
  { id: '10', name: 'La Ofelia',        activeRiders: 4, center: [-0.1129, -78.5060], type: 'valle', region: 'norte' },
  { id: '11', name: 'El Batán',         activeRiders: 5, center: [-0.1635, -78.4683], type: 'metro', region: 'norte' },
  { id: '15', name: 'Pomasqui',         activeRiders: 1, center: [-0.0735, -78.5131], type: 'valle', region: 'norte' },

  // ============ CENTRO ============
  { id: '2',  name: 'Centro Histórico', activeRiders: 3, center: [-0.2202, -78.5125], type: 'metro', region: 'centro' },
  { id: '6',  name: 'La Magdalena',     activeRiders: 6, center: [-0.2079, -78.5285], type: 'metro', region: 'centro' },
  { id: '12', name: 'La Floresta',      activeRiders: 6, center: [-0.1925, -78.4884], type: 'metro', region: 'centro' },
  { id: '13', name: 'San Rafael',       activeRiders: 1, center: [-0.2400, -78.4430], type: 'valle', region: 'centro' },

  // ============ SUR ============
  { id: '5',  name: 'Los Chillos',      activeRiders: 4, center: [-0.3019, -78.5465], type: 'valle', region: 'sur' },
  { id: '8',  name: 'Quitumbe',         activeRiders: 3, center: [-0.3280, -78.5491], type: 'metro', region: 'sur' },
  { id: '14', name: 'Conocoto',         activeRiders: 2, center: [-0.3012, -78.5005], type: 'valle', region: 'sur' },

  // ============ VALLES ============
  { id: '3',  name: 'Cumbayá',          activeRiders: 5, center: [-0.2089, -78.4376], type: 'valle', region: 'valles' },
  { id: '4',  name: 'Tumbaco',          activeRiders: 2, center: [-0.2178, -78.4008], type: 'valle', region: 'valles' },
]

export const updateRiderCount = (sectorId: string, increment: boolean) => {
  const sector = SECTORS.find((s) => s.id === sectorId)
  if (!sector) return

  if (increment) {
    sector.activeRiders += 1
  } else {
    sector.activeRiders = Math.max(0, sector.activeRiders - 1)
  }
}