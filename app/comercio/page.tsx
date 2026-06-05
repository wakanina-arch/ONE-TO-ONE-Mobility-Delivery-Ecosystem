'use client'

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
import { useSearchParams } from 'next/navigation'
import { ManualUsuario } from '@/components/registro/ManualUsuario'
import { cn } from '@/lib/utils'
import { 
  ChefHat, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Home,
  Bell,
  BellOff,
  RefreshCw,
  Clipboard,
  Printer,
  Settings,
  FileText,
  LayoutDashboard,
  Utensils,
  Store,
  User,
  X,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

type Tab = 'recepcion' | 'produccion' | 'entrega' | 'historial'

const ESTADOS_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-500', icon: Clock },
  preparacion: { label: 'Preparando', color: 'bg-orange-500', icon: ChefHat },
  listo: { label: 'Listo', color: 'bg-emerald-500', icon: Package },
  entregado: { label: 'Entregado', color: 'bg-blue-500', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
}

// ============================================
// SONIDO DE CAMPANA FUNCIONAL
// ============================================
type AudioContextConstructor = new () => AudioContext
type WebAudioWindow = Window & { AudioContext?: AudioContextConstructor; webkitAudioContext?: AudioContextConstructor }

const playNotificationSound = () => {
  try {
    const win = window as WebAudioWindow
    const AudioContext = win.AudioContext || win.webkitAudioContext
    if (!AudioContext) return
    
    const audioContext = new AudioContext()
    const now = audioContext.currentTime
    
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.2)
    gain1.gain.setValueAtTime(0.4, now)
    gain1.gain.exponentialRampToValueAtTime(0.00001, now + 0.4)
    osc1.connect(gain1)
    gain1.connect(audioContext.destination)
    osc1.start()
    osc1.stop(now + 0.4)
    
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(660, now + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.35)
    gain2.gain.setValueAtTime(0.35, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.00001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(audioContext.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.55)
    
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  } catch {
    console.log('Sonido no disponible')
  }
}

// ============================================
// ALERTA VISUAL ANIMADA
// ============================================
const mostrarAlertaVisual = (order: Order) => {
  const alertaDiv = document.createElement('div')
  alertaDiv.className = 'fixed top-20 right-4 z-50 animate-slide-in'
  alertaDiv.innerHTML = `
    <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-2xl max-w-sm">
      <div class="flex items-center gap-3">
        <div class="text-3xl">🔔</div>
        <div>
          <p class="font-bold text-lg">¡NUEVA COMANDA!</p>
          <p class="text-sm">Pedido #${order.id.slice(-6).toUpperCase()}</p>
          <p class="text-xs">Total: $${order.total.toFixed(2)}</p>
          <p class="text-xs">${order.cliente.nombre}</p>
        </div>
      </div>
    </div>
  `
  document.body.appendChild(alertaDiv)
  setTimeout(() => alertaDiv.remove(), 5000)
}

// ============================================
// IMPRESIÓN DE COMANDA
// ============================================
const imprimirComanda = (order: Order) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  const orderNumber = order.id.slice(-6).toUpperCase()
  const tiempoTranscurrido = Math.floor((Date.now() - new Date(order.fechaCreacion).getTime()) / 60000)
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>COMANDA #${orderNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; width: 80mm; margin: 0 auto; background: white; }
        .comanda { border: 2px solid #000; padding: 15px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 1px dashed #000; margin-bottom: 15px; padding-bottom: 10px; }
        .header h2 { margin: 0; font-size: 18px; }
        .header p { margin: 5px 0; font-size: 12px; }
        .items { margin: 15px 0; }
        .items h3 { font-size: 14px; margin-bottom: 10px; }
        .item { margin: 8px 0; padding: 5px 0; border-bottom: 1px dotted #ccc; }
        .item strong { font-size: 13px; }
        .total { text-align: right; font-weight: bold; margin-top: 15px; padding-top: 10px; border-top: 2px solid #000; }
        .cliente { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; font-size: 12px; }
        .nota { background: #fff3cd; padding: 8px; margin-top: 10px; font-size: 11px; border-left: 3px solid #ffc107; }
        @media print { body { margin: 0; padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="comanda">
        <div class="header">
          <h2>🍽️ COMANDA DE PRODUCCIÓN</h2>
          <p><strong>Pedido #${orderNumber}</strong></p>
          <p>${new Date(order.fechaCreacion).toLocaleString()}</p>
          <p>⏱️ ${tiempoTranscurrido} min atrás</p>
          <p>Tipo: ${order.tipoEntrega === 'domicilio' ? '🚚 Delivery' : '🏠 Recoger en local'}</p>
        </div>
        <div class="items">
          <h3>📋 PRODUCTOS:</h3>
          ${order.items.map(item => `
            <div class="item">
              <strong>${item.cantidad}x</strong> ${item.nombre}
              <br><small>$${item.precio.toFixed(2)} c/u</small>
            </div>
          `).join('')}
        </div>
        <div class="total">TOTAL: $${order.total.toFixed(2)}</div>
        <div class="cliente">
          <p><strong>Cliente:</strong> ${order.cliente.nombre}</p>
          <p><strong>Teléfono:</strong> ${order.cliente.telefono}</p>
        </div>
        ${order.notas ? `<div class="nota"><strong>📝 NOTA ESPECIAL:</strong><br>${order.notas}</div>` : ''}
      </div>
      <script>
        window.onload = () => { window.print(); setTimeout(() => window.close(), 1000) }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

export default function ComercioPage() {
  const persistedOrders = usePersistedOrders()
  const [orders, setOrders] = useState<Order[]>(() => persistedOrders)
  const [activeTab, setActiveTab] = useState<Tab>('recepcion')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Estados para modales independientes
  const [showMenuEditor, setShowMenuEditor] = useState(false)
  const [showComercioInfo, setShowComercioInfo] = useState(false)
  const [showAjustesModal, setShowAjustesModal] = useState(false)
  const [showDocumentos, setShowDocumentos] = useState(false)
  const [showManual, setShowManual] = useState(false)  // ← AÑADIR ESTA
  
  // Estados para submenús desplegables
  const [showAjustesSubmenu, setShowAjustesSubmenu] = useState(false)
  const [showDocumentosSubmenu, setShowDocumentosSubmenu] = useState(false)
  const [showProduccionSubmenu, setShowProduccionSubmenu] = useState(false)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const openEditor = searchParams.get('openEditor')
    if (openEditor === 'true') {
      // Pequeño delay para asegurar que el componente está montado
      setTimeout(() => {
        setShowMenuEditor(true)
      }, 100)
      // Limpiar la URL
      window.history.replaceState({}, '', '/comercio')
    }
  }, [searchParams])
  
  const { 
    onNewOrder, 
    emitOrderStatusChange, 
    onOrderStatusChange,
    emitOrderDeleted,
    isConnected,
    onSyncRequest,
    requestSync,
    onSyncResponse
  } = useSocket()
  
  const { addLog } = useOrdersStore()
  const { updateOrderStatus: updateSharedOrderStatus } = useOrderStore()

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    requestSync()
  }, [requestSync])

  useEffect(() => {
    const comercioId = 'comercio-1'

    const handleNuevoPedido = (event: Event) => {
      const customEvent = event as CustomEvent
      const sharedOrder = customEvent.detail as {
        id: string
        comercioId: string
        comercioName: string
        clienteName: string
        clienteAddress: string
        clienteLat: number
        clienteLng: number
        items: Array<{ name: string; quantity: number; price: number }>
        total: number
        status: string
        createdAt: string | Date
      }

      if (!sharedOrder || sharedOrder.comercioId !== comercioId) return

      const mappedOrder: Order = {
        id: sharedOrder.id,
        cliente: {
          nombre: sharedOrder.clienteName,
          telefono: '',
          email: ''
        },
        items: sharedOrder.items.map((item) => ({
          id: `${item.name}-${item.quantity}`,
          nombre: item.name,
          descripcion: '',
          imagen: '',
          precio: item.price,
          categoria: 'Delivery',
          disponible: true,
          cantidad: item.quantity
        })),
        total: sharedOrder.total,
        estado: 'pendiente',
        metodoPago: 'efectivo',
        tipoEntrega: 'domicilio',
        direccion: sharedOrder.clienteAddress,
        notas: '',
        fechaCreacion: new Date(sharedOrder.createdAt).toISOString(),
        fechaActualizacion: new Date(sharedOrder.createdAt).toISOString(),
        comercioId: sharedOrder.comercioId
      }

      setOrders((prev) => {
        if (prev.some((order) => order.id === mappedOrder.id)) return prev
        return [...prev, mappedOrder]
      })
      addLog({
        tipo: 'entrada',
        pedidoId: mappedOrder.id,
        detalle: `🔔 Nuevo pedido recibido desde checkout - ${mappedOrder.cliente.nombre}`
      })

      if (soundEnabled) {
        playNotificationSound()
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 ¡Nuevo pedido!', {
            body: `Pedido #${mappedOrder.id.slice(-6)} - ${mappedOrder.cliente.nombre} - $${mappedOrder.total.toFixed(2)}`,
            icon: '/favicon.ico'
          })
        }
      }
    }

    window.addEventListener('nuevo-pedido-comercio', handleNuevoPedido as EventListener)
    return () => window.removeEventListener('nuevo-pedido-comercio', handleNuevoPedido as EventListener)
  }, [soundEnabled, addLog])

  useEffect(() => {
    const cleanup = onSyncRequest(() => orders)
    return cleanup
  }, [orders, onSyncRequest])

  useEffect(() => {
    const cleanup = onSyncResponse((syncedOrders) => {
      setOrders(prev => {
        const merged = [...prev]
        syncedOrders.forEach(o => {
          if (!merged.find(existing => existing.id === o.id)) {
            merged.push(o)
          }
        })
        return merged
      })
    })
    return cleanup
  }, [onSyncResponse])

  useEffect(() => {
    const handleNewOrder = (order: Order) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev
        return [...prev, order]
      })

      if (soundEnabled) {
        playNotificationSound()
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 ¡Nuevo pedido!', {
            body: `Pedido #${order.id.slice(-6)} - ${order.cliente.nombre} - $${order.total.toFixed(2)}`,
            icon: '/favicon.ico'
          })
        }
      }

      mostrarAlertaVisual(order)

      if (soundEnabled && confirm(`📋 ¿Imprimir comanda para pedido #${order.id.slice(-6)}?`)) {
        setTimeout(() => imprimirComanda(order), 500)
      }

      addLog({
        tipo: 'entrada',
        pedidoId: order.id,
        detalle: `🔔 Nuevo pedido #${order.id.slice(-4)} - ${order.cliente.nombre} - $${order.total.toFixed(2)}`
      })
    }

    const cleanup = onNewOrder(handleNewOrder)
    return cleanup
  }, [onNewOrder, soundEnabled, addLog])

  useEffect(() => {
    const handleStatusChange = (data: { orderId: string; status: Order['estado'] }) => {
      setOrders(prev => 
        prev.map(o => 
          o.id === data.orderId 
            ? { ...o, estado: data.status, fechaActualizacion: new Date().toISOString() }
            : o
        )
      )
    }
    const cleanup = onOrderStatusChange(handleStatusChange)
    return cleanup
  }, [onOrderStatusChange])

  const updateOrderStatus = useCallback((orderId: string, newStatus: Order['estado']) => {
    setOrders(prev => 
      prev.map(o => 
        o.id === orderId 
          ? { ...o, estado: newStatus, fechaActualizacion: new Date().toISOString() }
          : o
      )
    )
    emitOrderStatusChange(orderId, newStatus)

    const mappedStatus = newStatus === 'entregado'
      ? 'delivered'
      : newStatus === 'cancelado'
      ? 'cancelled'
      : 'accepted'

    updateSharedOrderStatus(orderId, mappedStatus, 'rider-001')

    addLog({
      tipo: newStatus === 'preparacion' ? 'preparacion' : 
            newStatus === 'listo' ? 'preparacion' :
            newStatus === 'entregado' ? 'entrega' : 'cancelacion',
      pedidoId: orderId,
      detalle: `Pedido #${orderId.slice(-4)} cambió a: ${ESTADOS_CONFIG[newStatus].label}`
    })
  }, [emitOrderStatusChange, addLog, updateSharedOrderStatus])

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
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Clock; count: number; color: string }[] = [
    { id: 'recepcion', label: 'Recepción', icon: Bell, count: pedidosRecepcion.length, color: 'text-amber-500' },
    { id: 'produccion', label: 'Producción', icon: ChefHat, count: pedidosProduccion.length, color: 'text-orange-500' },
    { id: 'entrega', label: 'Entrega', icon: Package, count: pedidosEntrega.length, color: 'text-emerald-500' },
    { id: 'historial', label: 'Historial', icon: Clipboard, count: pedidosHistorial.length, color: 'text-blue-500' },
  ]

  const ventasHoy = orders
    .filter(o => o.estado === 'entregado')
    .reduce((acc, o) => acc + o.total, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
  <div className="flex items-center gap-2">
    <Link href="/">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Home className="h-4 w-4" />
      </Button>
      <span className="text-xs font-medium">Panel Comercio</span>
    </Link>
  </div>
  
  <div className="flex items-center gap-1.5">
    {/* Ajustes */}
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowAjustesSubmenu(!showAjustesSubmenu)} 
        className="text-muted-foreground hover:bg-red-500 hover:text-white transition-all h-8 w-8"
        title="Ajustes"
      >
                <Settings className="h-4 w-4" />
      </Button>
      {showAjustesSubmenu && (
        <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <button onClick={() => { setShowAjustesModal(true); setShowAjustesSubmenu(false) }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" /> Configuración general
          </button>
          <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Mi cuenta
          </button>
          <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <Bell className="h-3.5 w-3.5" /> Preferencias
          </button>
        </div>
      )}
    </div>

            {/* Documentos - mantén tu estructura igual solo compacta tamaños */}
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowDocumentosSubmenu(!showDocumentosSubmenu)} 
        className="text-muted-foreground hover:bg-red-500 hover:text-white transition-all h-8 w-8"
        title="Documentos"
      >
        <FileText className="h-4 w-4" />
      </Button>
      {showDocumentosSubmenu && (
        <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <button onClick={() => { setShowDocumentos(true); setShowDocumentosSubmenu(false) }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Ver Documentos
          </button>
          <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Facturación
          </button>
          <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Contratos
          </button>
        </div>
      )}
    </div>

             {/* Producción */}
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowProduccionSubmenu(!showProduccionSubmenu)} 
        className="text-muted-foreground hover:bg-red-500 hover:text-white transition-all h-8 w-8"
        title="Producción"
      >
        <LayoutDashboard className="h-4 w-4" />
      </Button>
      {showProduccionSubmenu && (
        <div className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <button onClick={() => { setShowMenuEditor(true); setShowProduccionSubmenu(false) }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <Utensils className="h-3.5 w-3.5" /> Editor de Menú
          </button>
          <button onClick={() => { setShowComercioInfo(true); setShowProduccionSubmenu(false) }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <Store className="h-3.5 w-3.5" /> Comercio Info
          </button>
          <button onClick={() => { setShowManual(true); setShowProduccionSubmenu(false) }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> Manual de Usuario
          </button>
        </div>
      )}
    </div>

            {/* Indicador de conexión */}
    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px]", isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>
      <span className={cn("w-1 h-1 rounded-full", isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
      {isConnected ? 'Online' : 'Offline'}
    </div>
    
    {/* Botón sonido */}
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setSoundEnabled(!soundEnabled)} 
      className={cn("text-muted-foreground h-8 w-8", soundEnabled && "text-primary")}
      title={soundEnabled ? "Desactivar sonido" : "Activar sonido"}
    >
      {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 opacity-50" />}
    </Button>
  </div>
</div>

        <div className="flex border-t border-border">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-2 transition-all relative",
        activeTab === tab.id 
          ? "text-foreground bg-muted/50" 
          : "text-muted-foreground hover:bg-muted/30"
      )}
    >
      <div className="relative">
        <tab.icon className={cn("h-4 w-4", activeTab === tab.id && tab.color)} />
        {tab.count > 0 && (
          <Badge className={cn(
            "absolute -top-2 -right-2.5 h-3.5 min-w-3.5 p-0 flex items-center justify-center text-[8px]",
            tab.id === 'recepcion' && "bg-amber-500",
            tab.id === 'produccion' && "bg-orange-500",
            tab.id === 'entrega' && "bg-emerald-500",
            tab.id === 'historial' && "bg-blue-500",
          )}>
            {tab.count}
          </Badge>
        )}
      </div>
      <span className="text-[9px] font-medium">{tab.label}</span>
      
      {activeTab === tab.id && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5",
          tab.id === 'recepcion' && "bg-amber-500",
          tab.id === 'produccion' && "bg-orange-500",
          tab.id === 'entrega' && "bg-emerald-500",
          tab.id === 'historial' && "bg-blue-500",
        )} />
      )}
    </button>
  ))}
</div>
      </header>

      {/* ========== MODAL EDITOR DE MENÚ ========== */}
{showMenuEditor && (
  <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30 overflow-hidden">
      <ComercioEditor 
        open={showMenuEditor}
        onClose={() => setShowMenuEditor(false)}
        comercioId="1"
        onSave={(items) => {
          console.log('Menú guardado:', items)
          setShowMenuEditor(false)
        }}
      />
    </div>
  </div>
)}

      {/* ========== MODAL COMERCIO INFO ========== */}
      {showComercioInfo && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30 overflow-hidden">
            <ComercioInfo 
              comercioId="1"
              comercioNombre="ONE TO ONE"
              mode="admin"
              onClose={() => setShowComercioInfo(false)}
            />
          </div>
        </div>
      )}
      {/* ========== MODAL MANUAL DE USUARIO ========== */}
{showManual && (
  <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <ManualUsuario 
      onClose={() => setShowManual(false)}
      onAcceder={() => {
        setShowManual(false)
        // Abrir editor de menú vacío
        setShowMenuEditor(true)
      }}
    />
  </div>
)}

      {/* ========== MODAL AJUSTES ========== */}
      {showAjustesModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="h-5 w-5" /> Ajustes</h2>
              <button onClick={() => setShowAjustesModal(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-gray-400 text-center py-8">Configuración disponible próximamente</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL DOCUMENTOS ========== */}
      {showDocumentos && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="h-5 w-5" /> Documentos</h2>
              <button
  onClick={() => {
    setShowDocumentos(true)
    setShowDocumentosSubmenu(false)
  }}
  className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
>
  <FileText className="h-4 w-4" /> Ver Documentos
              </button>
              <button onClick={() => setShowDocumentos(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <DocumentosModal 
  open={showDocumentos}
  onClose={() => setShowDocumentos(false)}  // ← antes setShowDocumentosModal(false)
/>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-gray-400 text-center py-8">Documentación disponible próximamente</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 grid grid-cols-3 gap-2">
  <Card className="p-1.5 bg-card border-border text-center">
    <p className="text-[10px] text-muted-foreground">Pendientes</p>
    <p className="text-lg font-bold text-amber-500">{pedidosRecepcion.length}</p>
  </Card>
  <Card className="p-1.5 bg-card border-border text-center">
    <p className="text-[10px] text-muted-foreground">En Cocina</p>
    <p className="text-lg font-bold text-orange-500">{pedidosProduccion.length}</p>
  </Card>
  <Card className="p-1.5 bg-card border-border text-center">
    <p className="text-[10px] text-muted-foreground">Ventas Hoy</p>
    <p className="text-sm font-bold text-emerald-500">${ventasHoy.toFixed(2)}</p>
  </Card>
</div>

<main className="p-2 space-y-2 pb-20">
  {getOrdersForTab().length === 0 ? (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
        <RefreshCw className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-xs text-muted-foreground">No hay pedidos en esta sección</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">Los pedidos aparecerán aquí automáticamente</p>
    </div>
  ) : (
    getOrdersForTab().map(order => (
      <OrderCard key={order.id} order={order} activeTab={activeTab} onUpdateStatus={updateOrderStatus} onArchive={archiveOrder} onPrint={() => imprimirComanda(order)} />
    ))
  )}
</main>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  )
}

// Componente de tarjeta de pedido (compactado)
function OrderCard({ order, activeTab, onUpdateStatus, onArchive, onPrint }: { order: Order; activeTab: Tab; onUpdateStatus: (id: string, status: Order['estado']) => void; onArchive: (id: string) => void; onPrint: () => void }) {
  const config = ESTADOS_CONFIG[order.estado]
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
    <Card className={cn("overflow-hidden bg-card border-border transition-all", order.estado === 'pendiente' && "border-l-4 border-l-amber-500", order.estado === 'preparacion' && "border-l-4 border-l-orange-500", order.estado === 'listo' && "border-l-4 border-l-emerald-500")}>
      {/* Header compacto */}
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
          <p className="text-[9px] text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-2.5 w-2.5" />{tiempoTranscurrido} min</p>
        </div>
      </div>
      
      {/* Items compacto */}
      <div className="p-2.5 bg-muted/30">
        <div className="space-y-0.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[10px]">
              <span className="text-foreground">{item.cantidad}x {item.nombre}</span>
              <span className="text-muted-foreground">${(item.cantidad * item.precio).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {order.notas && (
          <div className="mt-2 p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <p className="text-[9px] text-amber-400"><strong>Nota:</strong> {order.notas}</p>
          </div>
        )}
      </div>
      
      {/* Info adicional compacta */}
      <div className="px-2.5 py-1.5 flex items-center justify-between text-[9px] text-muted-foreground border-t border-border">
        <span className="capitalize">{order.metodoPago}</span>
        <span className="capitalize">{order.tipoEntrega === 'domicilio' ? '🚚 Delivery' : '🏠 Local'}</span>
      </div>
      
      {/* Acciones compactas */}
      <div className="p-2.5 pt-1.5 flex gap-1.5">
        <Button variant="outline" size="sm" onClick={onPrint} className="gap-0.5 h-7 text-[10px] px-2" title="Imprimir comanda">
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
          <Button variant="outline" onClick={() => onArchive(order.id)} className="flex-1 h-7 text-[9px] border-border text-muted-foreground">
            Archivar
          </Button>
        )}
      </div>
    </Card>
  )
}