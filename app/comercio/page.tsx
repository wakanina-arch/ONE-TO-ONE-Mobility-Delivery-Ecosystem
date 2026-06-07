'use client'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useSocket, usePersistedOrders } from '@/lib/socket-context'
import { type Order, useOrdersStore } from '@/lib/store'
import { useOrderStore } from '@/lib/store/order-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComercioEditor } from '@/components/drawers/comercio-editor'
import { ComercioInfo } from '@/components/ComercioInfo'
import { DocumentosModal } from '@/components/drawers/DocumentosModal'
import { ManualUsuario } from '@/components/registro/ManualUsuario'
import { cn } from '@/lib/utils'
import { 
  ChefHat, Package, Clock, CheckCircle, XCircle, Home, Bell, BellOff,
  RefreshCw, Clipboard, Printer, Settings, FileText, LayoutDashboard,
  Utensils, Store, User, X, BookOpen
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'recepcion' | 'produccion' | 'entrega' | 'historial'

const ESTADOS_CONFIG: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-500' },
  preparacion: { label: 'Preparando', color: 'bg-orange-500' },
  listo: { label: 'Listo', color: 'bg-emerald-500' },
  entregado: { label: 'Entregado', color: 'bg-blue-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
}

// Componente de tarjeta de pedido
function OrderCard({ order, activeTab, onUpdateStatus, onArchive, onPrint }: { 
  order: Order; activeTab: Tab; onUpdateStatus: (id: string, status: Order['estado']) => void; 
  onArchive: (id: string) => void; onPrint: () => void 
}) {
  const config = ESTADOS_CONFIG[order.estado] || { label: order.estado, color: 'bg-gray-500' }
  const orderNumber = order.id.slice(-6).toUpperCase()
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      setTiempoTranscurrido(Math.floor((Date.now() - new Date(order.fechaCreacion).getTime()) / 60000))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [order.fechaCreacion])

  return (
    <Card className={cn("overflow-hidden bg-card border-border transition-all", 
      order.estado === 'pendiente' && "border-l-4 border-l-amber-500",
      order.estado === 'preparacion' && "border-l-4 border-l-orange-500",
      order.estado === 'listo' && "border-l-4 border-l-emerald-500"
    )}>
      <div className="flex items-center justify-between p-2.5 border-b border-border">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground text-sm">#{orderNumber}</span>
            <Badge className={cn("text-[9px] px-1.5", config.color)}>{config.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{order.cliente.nombre} • {order.cliente.telefono}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-primary">${order.total.toFixed(2)}</p>
          <p className="text-[9px] text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-2.5 w-2.5" />{tiempoTranscurrido} min
          </p>
        </div>
      </div>
      
      <div className="p-2.5 bg-muted/30">
        <div className="space-y-0.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[10px]">
              <span className="text-foreground">{item.cantidad}x {item.nombre}</span>
              <span className="text-muted-foreground">${(item.cantidad * item.precio).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-2.5 pt-1.5 flex gap-1.5">
        <Button variant="outline" size="sm" onClick={onPrint} className="gap-0.5 h-7 text-[10px] px-2">
          <Printer className="h-3 w-3 mr-0.5" /> Imprimir
        </Button>
        {activeTab === 'recepcion' && (
          <>
            <Button onClick={() => onUpdateStatus(order.id, 'preparacion')} className="flex-1 h-7 text-[9px] bg-orange-500 hover:bg-orange-600 text-white">
              <ChefHat className="h-3 w-3 mr-1" /> Cocinar
            </Button>
            <Button variant="outline" onClick={() => onUpdateStatus(order.id, 'cancelado')} className="h-7 px-2 border-destructive text-destructive hover:bg-destructive/10">
              <XCircle className="h-3 w-3" />
            </Button>
          </>
        )}
        {activeTab === 'produccion' && (
          <Button onClick={() => onUpdateStatus(order.id, 'listo')} className="flex-1 h-7 text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" /> Listo
          </Button>
        )}
        {activeTab === 'entrega' && (
          <Button onClick={() => onUpdateStatus(order.id, 'entregado')} className="flex-1 h-7 text-[9px] bg-blue-500 hover:bg-blue-600 text-white">
            <Package className="h-3 w-3 mr-1" /> Entregar
          </Button>
        )}
        {activeTab === 'historial' && (
          <Button variant="outline" onClick={() => onArchive(order.id)} className="flex-1 h-7 text-[9px]">
            Archivar
          </Button>
        )}
      </div>
    </Card>
  )
}

// Componente principal del panel de comercio
function ComercioPanel() {
  const persistedOrders = usePersistedOrders()
  const [orders, setOrders] = useState<Order[]>(() => persistedOrders)
  const [activeTab, setActiveTab] = useState<Tab>('recepcion')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showMenuEditor, setShowMenuEditor] = useState(false)
  const [showComercioInfo, setShowComercioInfo] = useState(false)
  const [showAjustesModal, setShowAjustesModal] = useState(false)
  const [showDocumentos, setShowDocumentos] = useState(false)
  const [showManual, setShowManual] = useState(false)

  const { isConnected, emitOrderStatusChange, emitOrderDeleted, onNewOrder, onOrderStatusChange } = useSocket()
  const { addLog } = useOrdersStore()
  const { updateOrderStatus: updateSharedOrderStatus } = useOrderStore()

  useEffect(() => {
    const handleNewOrder = (order: Order) => {
      setOrders(prev => prev.find(o => o.id === order.id) ? prev : [...prev, order])
      addLog({ tipo: 'entrada', pedidoId: order.id, detalle: `🔔 Nuevo pedido - ${order.cliente.nombre}` })
    }
    const cleanup = onNewOrder(handleNewOrder)
    return cleanup
  }, [onNewOrder, addLog])

  useEffect(() => {
    const handleStatusChange = (data: { orderId: string; status: Order['estado'] }) => {
      setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, estado: data.status } : o))
    }
    const cleanup = onOrderStatusChange(handleStatusChange)
    return cleanup
  }, [onOrderStatusChange])

  const updateOrderStatus = useCallback((orderId: string, newStatus: Order['estado']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o))
    emitOrderStatusChange(orderId, newStatus)
    addLog({ tipo: 'preparacion', pedidoId: orderId, detalle: `Pedido actualizado a: ${ESTADOS_CONFIG[newStatus]?.label || newStatus}` })
  }, [emitOrderStatusChange, addLog])

  const archiveOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
    emitOrderDeleted(orderId)
  }, [emitOrderDeleted])

  const pedidosRecepcion = orders.filter(o => o.estado === 'pendiente')
  const pedidosProduccion = orders.filter(o => o.estado === 'preparacion')
  const pedidosEntrega = orders.filter(o => o.estado === 'listo')
  const pedidosHistorial = orders.filter(o => o.estado === 'entregado' || o.estado === 'cancelado')

  const getOrdersForTab = () => {
    switch (activeTab) {
      case 'recepcion': return pedidosRecepcion
      case 'produccion': return pedidosProduccion
      case 'entrega': return pedidosEntrega
      case 'historial': return pedidosHistorial
      default: return []
    }
  }

  const tabs = [
    { id: 'recepcion' as Tab, label: 'Recepción', icon: Bell, count: pedidosRecepcion.length, color: 'text-amber-500' },
    { id: 'produccion' as Tab, label: 'Producción', icon: ChefHat, count: pedidosProduccion.length, color: 'text-orange-500' },
    { id: 'entrega' as Tab, label: 'Entrega', icon: Package, count: pedidosEntrega.length, color: 'text-emerald-500' },
    { id: 'historial' as Tab, label: 'Historial', icon: Clipboard, count: pedidosHistorial.length, color: 'text-blue-500' },
  ]

  const ventasHoy = orders.filter(o => o.estado === 'entregado').reduce((acc, o) => acc + o.total, 0)

  const displayOrders = getOrdersForTab()
  const hasOrders = displayOrders.length > 0

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="icon" className="h-8 w-8"><Home className="h-4 w-4" /></Button></Link>
            <span className="text-xs font-medium text-white">Panel Comercio</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowMenuEditor(true)} className="text-gray-400 hover:text-white h-8 w-8">
              <Utensils className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowComercioInfo(true)} className="text-gray-400 hover:text-white h-8 w-8">
              <Store className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowDocumentos(true)} className="text-gray-400 hover:text-white h-8 w-8">
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className={`h-8 w-8 ${soundEnabled ? 'text-amber-500' : 'text-gray-500'}`}>
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>
            <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px]", isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
              <span className={cn("w-1 h-1 rounded-full", isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-800">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex-1 flex flex-col items-center gap-0.5 py-2 relative", activeTab === tab.id ? "text-amber-500 bg-gray-800/50" : "text-gray-400")}>
              <tab.icon className="h-4 w-4" />
              <span className="text-[9px] font-medium">{tab.label}</span>
              {tab.count > 0 && <Badge className="absolute -top-1 right-2 h-3.5 min-w-3.5 p-0 text-[8px] bg-amber-500">{tab.count}</Badge>}
            </button>
          ))}
        </div>
      </header>

      <div className="p-2 grid grid-cols-3 gap-2">
        <Card className="p-1.5 bg-gray-800/50 text-center"><p className="text-[10px] text-gray-400">Pendientes</p><p className="text-lg font-bold text-amber-500">{pedidosRecepcion.length}</p></Card>
        <Card className="p-1.5 bg-gray-800/50 text-center"><p className="text-[10px] text-gray-400">En Cocina</p><p className="text-lg font-bold text-orange-500">{pedidosProduccion.length}</p></Card>
        <Card className="p-1.5 bg-gray-800/50 text-center"><p className="text-[10px] text-gray-400">Ventas Hoy</p><p className="text-sm font-bold text-emerald-500">${ventasHoy.toFixed(2)}</p></Card>
      </div>

      <main className="p-2 space-y-2 pb-20">
        {!hasOrders ? (
          <div className="text-center py-8">
            <div className="bg-gray-800/30 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-white font-bold mb-2">📋 Panel de Comercio</h2>
              <p className="text-gray-400 text-sm">Esperando pedidos...</p>
              <p className="text-gray-500 text-xs mt-4">Los pedidos aparecerán aquí automáticamente</p>
              <button 
                onClick={() => {
                  const mockOrder: any = {
                    id: `mock-${Date.now()}`,
                    cliente: { nombre: 'Cliente Demo', telefono: '0999999999', email: 'demo@test.com' },
                    items: [{ id: '1', nombre: 'Producto Demo', precio: 10.00, cantidad: 2 }],
                    total: 20.00,
                    estado: 'pendiente',
                    fechaCreacion: new Date().toISOString(),
                    metodoPago: 'efectivo',
                    tipoEntrega: 'domicilio',
                    comercioId: '1'
                  }
                  setOrders(prev => [mockOrder, ...prev])
                }}
                className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Simular pedido de prueba
              </button>
            </div>
          </div>
        ) : (
          displayOrders.map(order => (
            <OrderCard key={order.id} order={order} activeTab={activeTab} onUpdateStatus={updateOrderStatus} onArchive={archiveOrder} onPrint={() => {}} />
          ))
        )}
      </main>

      {showMenuEditor && <ComercioEditor open={showMenuEditor} onClose={() => setShowMenuEditor(false)} comercioId="1" onSave={() => setShowMenuEditor(false)} />}
      {showComercioInfo && <ComercioInfo comercioId="1" comercioNombre="ONE TO ONE" mode="admin" onClose={() => setShowComercioInfo(false)} />}
      {showDocumentos && <DocumentosModal open={showDocumentos} onClose={() => setShowDocumentos(false)} />}
    </div>
  )
}

export default function ComercioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando panel de comercio...</div>}>
      <ComercioPanel />
    </Suspense>
  )
}
