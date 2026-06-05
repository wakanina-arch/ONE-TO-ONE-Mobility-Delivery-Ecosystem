'use client'

import { useState, useEffect } 
from 'react'
import type { Order } from 
'./store'

const STORAGE_KEY = 
'one-to-one-orders'

export function 
usePersistedOrders(): Order[] {
  const [orders, setOrders] = 
useState<Order[]>([])

  useEffect(() => {
    const saved = 
localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = 
JSON.parse(saved)
        if 
(Array.isArray(parsed)) {
          setOrders(parsed)
        } else {
          setOrders([])
        }
      } catch (e) {
        console.error('Error parsing saved orders', e)
        setOrders([])
      }
    }
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      
localStorage.setItem(STORAGE_KEY, 
JSON.stringify(orders))
    }
  }, [orders])

  return orders
}
