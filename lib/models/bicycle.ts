// lib/models/bicycle.ts
export type BicycleStatus = 'available' | 'reserved' | 'in_use' | 'maintenance'

export interface Bicycle {
  id: string
  comercioId: string       // local al que pertenece
  qrCode: string           // código único para escanear
  status: BicycleStatus
  
  // Batería (para eléctricas)
  batteryLevel: number     // 0-100
  estimatedRangeKm: number // autonomía restante
  
  // Mantenimiento
  lastMaintenanceAt: Date
  totalKilometers: number
  
  // Asignación actual
  currentRiderId?: string
  reservedUntil?: Date     // si está reservada, hasta cuándo
}