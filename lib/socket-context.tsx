'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react'
import type { Order } from '@/lib/store'

// Tipos de mensajes para sincronización entre pestañas
type SyncMessage = 
  | { type: 'new-order'; order: Order }
  | { type: 'order-status-change'; orderId: string; status: Order['estado'] }
  | { type: 'order-deleted'; orderId: string }
  | { type: 'sync-request' }
  | { type: 'sync-response'; orders: Order[] }

interface SyncContextType {
  isConnected: boolean
  emitNewOrder: (order: Order) => void
  emitOrderStatusChange: (orderId: string, status: Order['estado']) => void
  emitOrderDeleted: (orderId: string) => void
  onNewOrder: (callback: (order: Order) => void) => () => void
  onOrderStatusChange: (callback: (data: { orderId: string; status: Order['estado'] }) => void) => () => void
  onOrderDeleted: (callback: (orderId: string) => void) => () => void
  requestSync: () => void
  onSyncRequest: (callback: () => Order[]) => () => void
  onSyncResponse: (callback: (orders: Order[]) => void) => () => void
}

const SyncContext = createContext<SyncContextType | null>(null)

const CHANNEL_NAME = 'onetoone-delivery-sync'
const STORAGE_KEY = 'onetoone-orders'

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const callbacksRef = useRef<{
    newOrder: Set<(order: Order) => void>
    statusChange: Set<(data: { orderId: string; status: Order['estado'] }) => void>
    orderDeleted: Set<(orderId: string) => void>
    syncRequest: Set<() => Order[]>
    syncResponse: Set<(orders: Order[]) => void>
  }>({
    newOrder: new Set(),
    statusChange: new Set(),
    orderDeleted: new Set(),
    syncRequest: new Set(),
    syncResponse: new Set()
  })

  useEffect(() => {
    // BroadcastChannel para sincronización entre pestañas del mismo origen
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      channelRef.current = channel

      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const message = event.data

        switch (message.type) {
          case 'new-order':
            callbacksRef.current.newOrder.forEach(cb => cb(message.order))
            break
          case 'order-status-change':
            callbacksRef.current.statusChange.forEach(cb => 
              cb({ orderId: message.orderId, status: message.status })
            )
            break
          case 'order-deleted':
            callbacksRef.current.orderDeleted.forEach(cb => cb(message.orderId))
            break
          case 'sync-request':
            // Responder con nuestros pedidos actuales
            callbacksRef.current.syncRequest.forEach(cb => {
              const orders = cb()
              if (orders.length > 0) {
                channel.postMessage({ type: 'sync-response', orders } as SyncMessage)
              }
            })
            break
          case 'sync-response':
            callbacksRef.current.syncResponse.forEach(cb => cb(message.orders))
            break
        }
      }

      setIsConnected(true)

      return () => {
        channel.close()
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [])

  // Persistir en localStorage para que sobreviva recargas de página
  const persistOrders = useCallback((orders: Order[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch (e) {
      console.error('[Sync] Error guardando en localStorage:', e)
    }
  }, [])

  const getPersistedOrders = useCallback((): Order[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }, [])

  const emitNewOrder = useCallback((order: Order) => {
    // Guardar en localStorage
    const orders = getPersistedOrders()
    const exists = orders.some(o => o.id === order.id)
    if (!exists) {
      const updated = [...orders, order]
      persistOrders(updated)
    }

    // Notificar a otras pestañas
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'new-order', order } as SyncMessage)
    }
  }, [getPersistedOrders, persistOrders])

  const emitOrderStatusChange = useCallback((orderId: string, status: Order['estado']) => {
    // Actualizar en localStorage
    const orders = getPersistedOrders()
    const updated = orders.map(o => 
      o.id === orderId ? { ...o, estado: status } : o
    )
    persistOrders(updated)

    // Notificar a otras pestañas
    if (channelRef.current) {
      channelRef.current.postMessage({ 
        type: 'order-status-change', 
        orderId, 
        status 
      } as SyncMessage)
    }
  }, [getPersistedOrders, persistOrders])

  const emitOrderDeleted = useCallback((orderId: string) => {
    // Eliminar de localStorage
    const orders = getPersistedOrders()
    const updated = orders.filter(o => o.id !== orderId)
    persistOrders(updated)

    // Notificar a otras pestañas
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'order-deleted', orderId } as SyncMessage)
    }
  }, [getPersistedOrders, persistOrders])

  const onNewOrder = useCallback((callback: (order: Order) => void) => {
    callbacksRef.current.newOrder.add(callback)
    return () => {
      callbacksRef.current.newOrder.delete(callback)
    }
  }, [])

  const onOrderStatusChange = useCallback((callback: (data: { orderId: string; status: Order['estado'] }) => void) => {
    callbacksRef.current.statusChange.add(callback)
    return () => {
      callbacksRef.current.statusChange.delete(callback)
    }
  }, [])

  const onOrderDeleted = useCallback((callback: (orderId: string) => void) => {
    callbacksRef.current.orderDeleted.add(callback)
    return () => {
      callbacksRef.current.orderDeleted.delete(callback)
    }
  }, [])

  const requestSync = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'sync-request' } as SyncMessage)
    }
  }, [])

  const onSyncRequest = useCallback((callback: () => Order[]) => {
    callbacksRef.current.syncRequest.add(callback)
    return () => {
      callbacksRef.current.syncRequest.delete(callback)
    }
  }, [])

  const onSyncResponse = useCallback((callback: (orders: Order[]) => void) => {
    callbacksRef.current.syncResponse.add(callback)
    return () => {
      callbacksRef.current.syncResponse.delete(callback)
    }
  }, [])

  return (
    <SyncContext.Provider value={{
      isConnected,
      emitNewOrder,
      emitOrderStatusChange,
      emitOrderDeleted,
      onNewOrder,
      onOrderStatusChange,
      onOrderDeleted,
      requestSync,
      onSyncRequest,
      onSyncResponse
    }}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de SocketProvider')
  }
  return context
}

// Hook para obtener pedidos persistidos
export function usePersistedOrders(): Order[] {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setOrders(JSON.parse(stored))
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, [])

  return orders
}
