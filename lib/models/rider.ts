// lib/models/rider.ts
export type RiderStatus = 'available' | 'busy' | 'offline' | 'maintenance'

export interface Rider {
  id: string
  userId: string           // referencia al usuario autenticado
  username: string         // nombre público
  avatar?: string          // URL del avatar (emoji o imagen)
  phone: string
  status: RiderStatus
  
  // Estadísticas
  totalDeliveries: number
  totalKilometers: number
  rating: number           // 1-5 estrellas promedio
  points: number           // puntos de gamificación
  
  // Financiero y social
  socialSecurityNumber: string   // afiliación a la Seguridad Social
  bankAccount?: string           // para pagos
  
  // Preferencias
  language: 'es' | 'en'
  notificationsEnabled: boolean
  
  // Sistema
  createdAt: Date
  lastActiveAt: Date
}