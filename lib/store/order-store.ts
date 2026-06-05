import { create } from 'zustand'

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  comercioId: string
  comercioName: string
  clienteName: string
  clienteAddress: string
  clienteLat: number
  clienteLng: number
  items: OrderItem[]
  total: number
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled'
  riderId?: string
  createdAt: Date
}

interface OrderStore {
  orders: Order[]
  activeOrder: Order | null
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string
  updateOrderStatus: (orderId: string, status: Order['status'], riderId?: string) => void
  getOrdersByComercio: (comercioId: string) => Order[]
  getOrdersByRider: (riderId: string) => Order[]
}

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `order-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  activeOrder: null,

  createOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: createId(),
      createdAt: new Date(),
      status: 'pending'
    }

    set((state) => ({
      orders: [newOrder, ...state.orders],
      activeOrder: newOrder
    }))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nuevo-pedido-comercio', { detail: newOrder }))
      window.dispatchEvent(new CustomEvent('nuevo-pedido-rider', { detail: newOrder }))
    }

    return newOrder.id
  },

  updateOrderStatus: (orderId, status, riderId) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, status, riderId } : order
      ),
      activeOrder:
        state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status, riderId }
          : state.activeOrder
    }))

    if (typeof window !== 'undefined') {
      if (status === 'accepted') {
        window.dispatchEvent(new CustomEvent('pedido-aceptado-rider', { detail: { orderId, riderId } }))
      }
      if (status === 'delivered') {
        window.dispatchEvent(new CustomEvent('pedido-entregado', { detail: { orderId } }))
      }
    }
  },

  getOrdersByComercio: (comercioId) => {
    return get().orders.filter((order) => order.comercioId === comercioId)
  },

  getOrdersByRider: (riderId) => {
    return get().orders.filter((order) => order.riderId === riderId)
  }
}))
