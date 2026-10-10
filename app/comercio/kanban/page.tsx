'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPanelSession, hasValidPanelSession } from '@/components/PanelAccessModal'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Home,
  Bell,
  ChefHat,
  Package,
  Clipboard,
  Clock,
  Printer,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// ==================== TIPOS ====================

type Tab = 'recepcion' | 'produccion' | 'entrega' | 'historial'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product_id: string | null
  products: { name: string } | null
}

interface Order {
  id: string
  customer_id: string
  merchant_id: string
  rider_id: string | null
  status: string
  total: number
  delivery_address: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

// ==================== CONFIGURACIÓN DE ESTADOS ====================

const ESTADOS_CONFIG: Record<string, { label: string; color: string; tab: Tab }> = {
  created:    { label: 'Nuevo',        color: 'bg-amber-500',   tab: 'recepcion' },
  accepted:   { label: 'Aceptado',     color: 'bg-blue-500',    tab: 'recepcion' },
  preparing:  { label: 'Preparando',   color: 'bg-orange-500',  tab: 'produccion' },
  ready:      { label: 'Listo',        color: 'bg-emerald-500', tab: 'entrega' },
  picked_up:  { label: 'Recogido',     color: 'bg-teal-500',    tab: 'entrega' },
  delivering: { label: 'En camino',    color: 'bg-purple-500',  tab: 'entrega' },
  delivered:  { label: 'Entregado',    color: 'bg-gray-500',    tab: 'historial' },
  cancelled:  { label: 'Cancelado',    color: 'bg-red-500',     tab: 'historial' },
}

const ESTADOS_POR_TAB: Record<Tab, string[]> = {
  recepcion:  ['created', 'accepted'],
  produccion: ['preparing'],
  entrega:    ['ready', 'picked_up', 'delivering'],
  historial:  ['delivered', 'cancelled'],
}

// ==================== TARJETA DE PEDIDO ====================

function OrderCard({
  order,
  activeTab,
  onUpdateStatus,
}: {
  order: Order
  activeTab: Tab
  onUpdateStatus: (id: string, newStatus: string) => void
}) {
  const config = ESTADOS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-500' }
  const orderNumber = order.id.slice(-6).toUpperCase()
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      setTiempoTranscurrido(
        Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [order.created_at])

  return (
    <Card
      className={cn(
        'overflow-hidden bg-card border-border transition-all',
        order.status === 'created' && 'border-l-4 border-l-amber-500',
        order.status === 'accepted' && 'border-l-4 border-l-blue-500',
        order.status === 'preparing' && 'border-l-4 border-l-orange-500',
        order.status === 'ready' && 'border-l-4 border-l-emerald-500',
        order.status === 'picked_up' && 'border-l-4 border-l-teal-500',
        order.status === 'delivering' && 'border-l-4 border-l-purple-500'
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-2.5 border-b border-border">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground text-sm">#{orderNumber}</span>
            <Badge className={cn('text-[9px] px-1.5 text-white', config.color)}>
              {config.label}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {order.delivery_address || 'Sin dirección'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-primary">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-[9px] text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-2.5 w-2.5" />
            {tiempoTranscurrido} min
          </p>
        </div>
      </div>

      {/* INFO */}
      <div className="p-2.5 bg-muted/30 space-y-1">
        {/* Items del pedido */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="space-y-0.5 mb-1.5">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-[10px]">
                <span className="text-foreground font-medium">
                  {item.quantity}x {item.products?.name || 'Producto'}
                </span>
                <span className="text-muted-foreground">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notas */}
        {order.notes && (
          <p className="text-[10px] text-foreground italic border-t border-border/50 pt-1">
            📝 {order.notes}
          </p>
        )}

        {/* Método de pago */}
        {order.payment_method && (
          <p className="text-[10px] text-muted-foreground">
            💳 {order.payment_method}
          </p>
        )}
      </div>

      {/* ACCIONES */}
      <div className="p-2.5 pt-1.5 flex gap-1.5 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="gap-0.5 h-7 text-[10px] px-2"
        >
          <Printer className="h-3 w-3 mr-0.5" /> Imprimir
        </Button>

        {activeTab === 'recepcion' && (
          <>
            {order.status === 'created' && (
              <Button
                onClick={() => onUpdateStatus(order.id, 'accepted')}
                className="flex-1 h-7 text-[9px] bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Aceptar
              </Button>
            )}
            {order.status === 'accepted' && (
              <Button
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                className="flex-1 h-7 text-[9px] bg-orange-500 hover:bg-orange-600 text-white"
              >
                <ChefHat className="h-3 w-3 mr-1" /> A cocina
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="h-7 px-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </>
        )}

        {activeTab === 'produccion' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="flex-1 h-7 text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Listo
          </Button>
        )}

        {activeTab === 'entrega' && (
          <>
            {order.status === 'ready' && (
              <Button
                onClick={() => onUpdateStatus(order.id, 'picked_up')}
                className="flex-1 h-7 text-[9px] bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Package className="h-3 w-3 mr-1" /> Recogido
              </Button>
            )}
            {order.status === 'picked_up' && (
              <Button
                onClick={() => onUpdateStatus(order.id, 'delivering')}
                className="flex-1 h-7 text-[9px] bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Package className="h-3 w-3 mr-1" /> En camino
              </Button>
            )}
            {order.status === 'delivering' && (
              <Button
                onClick={() => onUpdateStatus(order.id, 'delivered')}
                className="flex-1 h-7 text-[9px] bg-gray-500 hover:bg-gray-600 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Entregado
              </Button>
            )}
          </>
        )}

        {activeTab === 'historial' && (
          <Button
            variant="outline"
            className="flex-1 h-7 text-[9px]"
            disabled
          >
            Archivado
          </Button>
        )}
      </div>
    </Card>
  )
}

// ==================== PANEL KANBAN ====================

function KanbanPanel() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('recepcion')
  const [loading, setLoading] = useState(true)
      const [merchantId] = useState<string | null>(
    () => getPanelSession()?.id ?? null
  )

  useEffect(() => {
    if (!hasValidPanelSession() || !merchantId) router.push('/')
  }, [router, merchantId])

  const cargarPedidos = useCallback(async () => {
    if (!merchantId) return

    const supabase = createClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products ( name )
        )
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando pedidos:', error)
      setOrders([])
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }, [merchantId])

  useEffect(() => {
    if (merchantId) {
      void Promise.resolve().then(cargarPedidos)
    }
  }, [merchantId, cargarPedidos])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!merchantId) return

    const supabase = createClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('merchant_id', merchantId)

    if (error) {
      console.error('Error actualizando pedido:', error)
      return
    }

    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }

  const pedidosPorTab = (tab: Tab) => {
    const estados = ESTADOS_POR_TAB[tab]
    return orders.filter(o => estados.includes(o.status))
  }

  const pedidosRecepcion = pedidosPorTab('recepcion')
  const pedidosProduccion = pedidosPorTab('produccion')
  const pedidosEntrega = pedidosPorTab('entrega')
  const pedidosHistorial = pedidosPorTab('historial')

  const displayOrders = pedidosPorTab(activeTab)
  const hasOrders = displayOrders.length > 0

  const tabs = [
    { id: 'recepcion' as Tab, label: 'Recepción', icon: Bell, count: pedidosRecepcion.length, color: 'text-amber-500' },
    { id: 'produccion' as Tab, label: 'Producción', icon: ChefHat, count: pedidosProduccion.length, color: 'text-orange-500' },
    { id: 'entrega' as Tab, label: 'Entrega', icon: Package, count: pedidosEntrega.length, color: 'text-emerald-500' },
    { id: 'historial' as Tab, label: 'Historial', icon: Clipboard, count: pedidosHistorial.length, color: 'text-blue-500' },
  ]

  const ventasHoy = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/comercio">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm font-semibold text-foreground">
              Cocina Kanban
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setLoading(true)
              void cargarPedidos()
            }}
            className="h-8 w-8"
            title="Recargar pedidos"
          >
            <Home className="h-4 w-4 rotate-180" />
          </Button>
        </div>

        <div className="flex border-t border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 relative transition-colors',
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className={cn('h-4 w-4', activeTab === tab.id && tab.color)} />
              <span className="text-[9px] font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <Badge className="absolute -top-1 right-2 h-3.5 min-w-3.5 p-0 text-[8px] bg-primary">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="p-2 grid grid-cols-3 gap-2">
        <Card className="p-1.5 bg-card text-center">
          <p className="text-[10px] text-muted-foreground">Pendientes</p>
          <p className="text-lg font-bold text-amber-500">
            {pedidosRecepcion.length}
          </p>
        </Card>
        <Card className="p-1.5 bg-card text-center">
          <p className="text-[10px] text-muted-foreground">En Cocina</p>
          <p className="text-lg font-bold text-orange-500">
            {pedidosProduccion.length}
          </p>
        </Card>
        <Card className="p-1.5 bg-card text-center">
          <p className="text-[10px] text-muted-foreground">Ventas Hoy</p>
          <p className="text-sm font-bold text-emerald-500">
            ${ventasHoy.toFixed(2)}
          </p>
        </Card>
      </div>

      <main className="p-2 space-y-2 pb-20">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-xs mt-2">
              Cargando pedidos...
            </p>
          </div>
        ) : !hasOrders ? (
          <div className="text-center py-8">
            <div className="bg-card/50 rounded-xl p-8 max-w-md mx-auto border border-border">
              <p className="text-foreground font-semibold mb-2">
                Sin pedidos en {activeTab}
              </p>
              <p className="text-muted-foreground text-xs">
                Los pedidos aparecerán aquí automáticamente
              </p>
            </div>
          </div>
        ) : (
          displayOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={updateOrderStatus}
            />
          ))
        )}
      </main>
    </div>
  )
}

export default function KanbanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
          Cargando Kanban...
        </div>
      }
    >
      <KanbanPanel />
    </Suspense>
  )
}