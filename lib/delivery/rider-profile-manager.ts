// lib/delivery/rider-profile-manager.ts
import { Rider, RiderStatus } from '@/lib/models/rider'

// Base de datos en memoria (después conectaremos a base real)
const ridersDB: Map<string, Rider> = new Map()

export const RiderProfileManager = {
  // Crear o actualizar perfil
  saveRider(rider: Rider): void {
    ridersDB.set(rider.id, { ...rider, lastActiveAt: new Date() })
  },

  // Obtener perfil
  getRider(id: string): Rider | undefined {
    return ridersDB.get(id)
  },

  // Actualizar estadísticas después de un servicio
  updateStats(riderId: string, km: number, deliveryCompleted: boolean): void {
    const rider = ridersDB.get(riderId)
    if (!rider) return

    rider.totalKilometers += km
    if (deliveryCompleted) {
      rider.totalDeliveries += 1
      rider.points += 10  // puntos base por entrega
    }
    rider.lastActiveAt = new Date()
    ridersDB.set(riderId, rider)
  },

  // Cambiar estado (disponible, ocupado, etc.)
  setStatus(riderId: string, status: RiderStatus): void {
    const rider = ridersDB.get(riderId)
    if (rider) {
      rider.status = status
      ridersDB.set(riderId, rider)
    }
  },

  // Listar todos los riders (para administración)
  listAllRiders(): Rider[] {
    return Array.from(ridersDB.values())
  }
}