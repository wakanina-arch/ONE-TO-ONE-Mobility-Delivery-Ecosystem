export type DeliveryPoint = {
  name: string
  lat: number
  lng: number
}

export type Order = {
  id: string
  restaurant: string
  customer: string
  pickup: DeliveryPoint
  dropoff: DeliveryPoint
}
