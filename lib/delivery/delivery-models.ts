export type DeliveryPoint = {
  name: string
  lat: number | null
  lng: number | null
}

export type Order = {
  id: string
  restaurant: string
  customer: string
  pickup: DeliveryPoint
  dropoff: DeliveryPoint
}
