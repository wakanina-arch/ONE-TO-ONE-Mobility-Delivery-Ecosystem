'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore, type MenuItem } from '@/lib/store'
import { useUserPanel } from '@/contexts/UserPanelContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Clock } from 'lucide-react'

interface OrderRow {
  id: string
  total: number
  status: string
  created_at: string
  merchant_id: string
  merchants?: { name: string } | { name: string }[]
}

export default function MiCuentaPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const { clearCart, addItem } = useCartStore()
  const { open } = useUserPanel()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) { setLoading(false); return }
      setCustomerId(user.id)

      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at, merchant_id, merchants(name)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data as OrderRow[])
      setLoading(false)
    }
    load()
  }, [])

  const handleReorder = async (order: OrderRow) => {
    const supabase = createClient()

    // 1. Leer items del pedido
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id)

    if (!items || items.length === 0) return

    // 2. Leer productos (solo columnas seguras)
    const productIds = items.map(i => i.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, description, image, category')
      .in('id', productIds)

    if (!products) return

    // 3. Rellenar carrito
    clearCart()
    for (const item of items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) continue
      const menuItem: MenuItem = {
        id: product.id,
        nombre: product.name ?? '',
        descripcion: product.description ?? '',
        precio: product.price ?? 0,
        categoria: product.category ?? '',
        imagen: product.image ?? '',
        disponible: true,
      }
      for (let q = 0; q < item.quantity; q++) {
        addItem(menuItem, order.merchant_id)
      }
    }

    // 4. Ir al comercio para finalizar
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <header className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            open()
            router.push('/')
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">Mis pedidos</h1>
      </header>

      {loading ? (
        <p className="text-center text-muted-foreground">Cargando...</p>
      ) : !customerId ? (
        <p className="text-center text-muted-foreground">Inicia sesión para ver tus pedidos.</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground">Aún no tienes pedidos.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const merchant = Array.isArray(order.merchants) ? order.merchants[0] : order.merchants
            return (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{merchant?.name ?? 'Comercio'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString('es-EC')}
                    </p>
                  </div>
                  <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs px-2 py-1 rounded bg-muted">{order.status}</span>
                  <Button size="sm" variant="outline" onClick={() => handleReorder(order)}>
                    <Package className="h-3 w-3 mr-1" /> Volver a pedir
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}