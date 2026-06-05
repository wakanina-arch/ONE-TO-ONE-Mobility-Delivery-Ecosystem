import { SECTORS, Sector } from './sectors-data'
import { getSectorByCoordinates } from './sectors-polygons'

export type RiderCoordinates = {
  latitude: number
  longitude: number
}

const toRad = (value: number) => (value * Math.PI) / 180

const distanceKm = (a: RiderCoordinates, b: RiderCoordinates) => {
  const R = 6371
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const aa = sinDLat * sinDLat + sinDLng * sinDLng * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
  return R * c
}

export const getCurrentPosition = (): Promise<RiderCoordinates> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    )
  })
}

export const assignSectorByCoords = (coords: RiderCoordinates): Sector => {
  const sectorId = getSectorByCoordinates(coords.latitude, coords.longitude)
  if (sectorId) {
    const matched = SECTORS.find((sector) => sector.id === sectorId)
    if (matched) {
      return matched
    }
  }

  let nearest: Sector | null = null
  let nearestDistance = Number.MAX_VALUE

  for (const sector of SECTORS) {
    const [lat, lng] = sector.center
    const distance = distanceKm(coords, { latitude: lat, longitude: lng })
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = sector
    }
  }

  return nearest || SECTORS[0]
}
