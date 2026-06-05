import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export interface MenuItem {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: string
  disponible: boolean
  tiempoPreparacion?: number
  alergenos?: string[]
  calorias?: number
}

export interface CartItem extends MenuItem {
  cantidad: number
  notas?: string
  image?: string
}

export interface Order {
  id: string
  cliente: {
    nombre: string
    telefono: string
    email?: string
  }
  items: CartItem[]
  total: number
  estado: 'pendiente' | 'preparacion' | 'listo' | 'entregado' | 'cancelado'
  metodoPago: 'efectivo' | 'transferencia' | 'payphone' | 'tarjeta' | 'deuna'
  tipoEntrega: 'local' | 'domicilio'
  direccion?: string
  notas?: string
  fechaCreacion: string
  fechaActualizacion: string
  comercioId: string
}

export interface Comercio {
  id: string
  nombre: string
  nombreLegal: string
  ruc: string
  direccion: string
  telefono: string
  logo?: string
  imagen?: string
  especialidad?: string
  descripcion?: string
  horario?: {
    apertura: string
    cierre: string
  }
}

export interface LogEntry {
  id: string
  tipo: 'entrada' | 'salida' | 'preparacion' | 'entrega' | 'cancelacion'
  pedidoId: string
  detalle: string
  timestamp: string
}

// Store del carrito (cliente)
interface CartStore {
  items: CartItem[]
  comercioId: string | null
  addItem: (item: MenuItem, comercioId: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  setComercioId: (id: string) => void
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  comercioId: null,

  addItem: (item, comercioId) => {
    const currentId = get().comercioId
    
    // Si cambia de comercio, guardar el anterior y limpiar
    if (currentId && currentId !== comercioId) {
      // Guardar carrito del comercio anterior
      localStorage.setItem(`cart_${currentId}`, JSON.stringify(get().items))
      set({ items: [], comercioId })
    }
    
    // Obtener carrito actual del comercio (desde localStorage o vacío)
    let currentItems: any[] = []
    if (!currentId || currentId === comercioId) {
      currentItems = [...get().items]
    } else {
      const saved = localStorage.getItem(`cart_${comercioId}`)
      currentItems = saved ? JSON.parse(saved) : []
    }
    
    // Agregar o actualizar item
    const existingIndex = currentItems.findIndex((i: any) => i.id === item.id)
    if (existingIndex >= 0) {
      currentItems[existingIndex].cantidad += 1
    } else {
      currentItems.push({ ...item, cantidad: 1 })
    }
    
    // Guardar
    localStorage.setItem(`cart_${comercioId}`, JSON.stringify(currentItems))
    set({ items: currentItems, comercioId })
  },

  removeItem: (itemId) => {
    const { comercioId, items } = get()
    const newItems = items.filter(i => i.id !== itemId)
    set({ items: newItems })
    if (comercioId) {
      localStorage.setItem(`cart_${comercioId}`, JSON.stringify(newItems))
    }
  },

  updateQuantity: (itemId, cantidad) => {
    const { comercioId, items } = get()
    const newItems = items.map(i => i.id === itemId ? { ...i, cantidad } : i)
    set({ items: newItems })
    if (comercioId) {
      localStorage.setItem(`cart_${comercioId}`, JSON.stringify(newItems))
    }
  },

  clearCart: () => {
    const { comercioId } = get()
    set({ items: [] })
    if (comercioId) {
      localStorage.setItem(`cart_${comercioId}`, JSON.stringify([]))
    }
  },

  getTotal: () => {
    const { items } = get()
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.cantidad, 0)
  },

  setComercioId: (id) => {
    const currentId = get().comercioId
    
    // Guardar carrito actual antes de cambiar
    if (currentId) {
      localStorage.setItem(`cart_${currentId}`, JSON.stringify(get().items))
    }
    
    // Cargar carrito guardado del nuevo comercio
    const savedCart = localStorage.getItem(`cart_${id}`)
    set({ 
      comercioId: id,
      items: savedCart ? JSON.parse(savedCart) : []
    })
  }
}))

// Store de pedidos (comercio)
interface OrdersStore {
  orders: Order[]
  logs: LogEntry[]
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, estado: Order['estado']) => void
  getOrdersByStatus: (estado: Order['estado']) => Order[]
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void
  archiveOrder: (orderId: string) => void
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],
      logs: [],
      
      addOrder: (order) => {
        set({ orders: [...get().orders, order] })
        get().addLog({
          tipo: 'entrada',
          pedidoId: order.id,
          detalle: `Nuevo pedido #${order.id.slice(-4)} - ${order.cliente.nombre} - $${order.total.toFixed(2)}`
        })
      },
      
      updateOrderStatus: (orderId, estado) => {
        set({
          orders: get().orders.map(o => 
            o.id === orderId 
              ? { ...o, estado, fechaActualizacion: new Date().toISOString() }
              : o
          )
        })
        
        const tipoLog = estado === 'preparacion' ? 'preparacion' 
          : estado === 'listo' ? 'preparacion'
          : estado === 'entregado' ? 'entrega'
          : estado === 'cancelado' ? 'cancelacion'
          : 'entrada'
        
        get().addLog({
          tipo: tipoLog,
          pedidoId: orderId,
          detalle: `Pedido #${orderId.slice(-4)} cambió a: ${estado}`
        })
      },
      
      getOrdersByStatus: (estado) => {
        return get().orders.filter(o => o.estado === estado)
      },
      
      addLog: (log) => {
        const newLog: LogEntry = {
          ...log,
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
        set({ logs: [...get().logs, newLog] })
      },
      
      archiveOrder: (orderId) => {
        set({ orders: get().orders.filter(o => o.id !== orderId) })
      }
    }),
    {
      name: 'one-to-one-orders'
    }
  )
)

// Menú demo
export const MENU_DEMO: MenuItem[] = [
  // ========== DESAYUNOS (4) ==========
  {
    id: 'des-1',
    nombre: 'Bolón de Verde',
    descripcion: 'Bolón de verde relleno de queso, acompañado de café',
    precio: 4.50,
    categoria: 'Desayunos',
    imagen: '/img/picoteo/Bolon de Verde.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'des-2',
    nombre: 'Tigrillo',
    descripcion: 'Plátano verde machacado con queso, huevo frito y café',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/entrantes/Tigrillo.JPG',
    disponible: true,
    tiempoPreparacion: 12
  },
  {
    id: 'des-3',
    nombre: 'Mote Pillo',
    descripcion: 'Mote con huevo, cebolla, especias y café',
    precio: 4.00,
    categoria: 'Desayunos',
    imagen: '/img/entrantes/Mote Pillo.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'des-4',
    nombre: 'Empanadas de Verde',
    descripcion: 'Empanadas de verde rellenas de queso con café',
    precio: 4.50,
    categoria: 'Desayunos',
    imagen: '/img/picoteo/Empanadas de Verde.png',
    disponible: true,
    tiempoPreparacion: 8
  },

  // ========== ALMUERZOS (4) ==========
  {
    id: 'alm-1',
    nombre: 'Seco de Pollo',
    descripcion: 'Seco de pollo servido con arroz, maduro frito y aguacate',
    precio: 6.00,
    categoria: 'Almuerzos',
    imagen: '/img/entrantes/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 20
  },
  {
    id: 'alm-2',
    nombre: 'Locro de Papa',
    descripcion: 'Crema de papa con queso, aguacate y acompañado de arroz',
    precio: 5.50,
    categoria: 'Almuerzos',
    imagen: '/img/entrantes/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'alm-3',
    nombre: 'Arroz con Menestra',
    descripcion: 'Arroz con menestra de lentejas, carne asada y patacones',
    precio: 6.50,
    categoria: 'Almuerzos',
    imagen: '/img/entrantes/Mote Pillo.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'alm-4',
    nombre: 'Puchero',
    descripcion: 'Caldo de carnes con verduras, garbanzos y acompañado de arroz',
    precio: 7.00,
    categoria: 'Almuerzos',
    imagen: '/img/entrantes/Puchero.png',
    disponible: true,
    tiempoPreparacion: 25
  },

  // ========== SOPAS (4) ==========
  {
    id: 'sop-1',
    nombre: 'Encebollado',
    descripcion: 'Caldo de albacora con yuca, cebolla encurtida y chifles',
    precio: 5.00,
    categoria: 'Sopas',
    imagen: '/img/entrantes/Sopa de Bolas de Verde Rellenas.png',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sop-2',
    nombre: 'Caldo de Bolas de Pescado',
    descripcion: 'Caldo tradicional con bolas de pescado, yuca y especias',
    precio: 6.00,
    categoria: 'Sopas',
    imagen: '/img/entrantes/Caldo de Bolas de Pescado.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sop-3',
    nombre: 'Sopa de Bolas de Verde',
    descripcion: 'Sopa con bolas de verde rellenas de queso',
    precio: 5.50,
    categoria: 'Sopas',
    imagen: '/img/entrantes/Sopa de Bolas de Verde Rellenas.png',
    disponible: true,
    tiempoPreparacion: 12
  },
  {
    id: 'sop-4',
    nombre: 'Locro Quiteño',
    descripcion: 'Crema de papa con queso fresco, aguacate y acompañado de arroz',
    precio: 5.00,
    categoria: 'Sopas',
    imagen: '/img/entrantes/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },

  // ========== MARISCOS (4) ==========
  {
    id: 'mar-1',
    nombre: 'Ceviche de Camarón',
    descripcion: 'Camarones frescos en jugo de limón con cebolla morada',
    precio: 8.00,
    categoria: 'Mariscos',
    imagen: '/img/entrantes/Ceviche de Camaron.JPG',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'mar-2',
    nombre: 'Ceviche Mixto',
    descripcion: 'Pescado y mariscos frescos en jugo de limón',
    precio: 9.00,
    categoria: 'Mariscos',
    imagen: '/img/entrantes/Ceviche de Camaron.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'mar-3',
    nombre: 'Camarones al Ajillo',
    descripcion: 'Camarones salteados con ajo, vino blanco y especias',
    precio: 10.00,
    categoria: 'Mariscos',
    imagen: '/img/entrantes/Ceviche de Camaron.JPG',
    disponible: true,
    tiempoPreparacion: 12
  },
  {
    id: 'mar-4',
    nombre: 'Arroz Marinero',
    descripcion: 'Arroz con mariscos mixtos, acompañado de patacones',
    precio: 10.50,
    categoria: 'Mariscos',
    imagen: '/img/entrantes/Ceviche de Camaron.JPG',
    disponible: true,
    tiempoPreparacion: 20
  },

  // ========== BEBIDAS (4) ==========
  {
    id: 'beb-1',
    nombre: 'Coca Cola',
    descripcion: 'Gaseosa Coca Cola 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CocaCola.jpg',
    disponible: true
  },
  {
    id: 'beb-2',
    nombre: 'Pepsi',
    descripcion: 'Gaseosa Pepsi 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/Pepsi.jpg',
    disponible: true
  },
  {
    id: 'beb-3',
    nombre: 'Cerveza Club',
    descripcion: 'Cerveza Club Ecuador bien fría',
    precio: 3.50,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaClub.jpg',
    disponible: true
  },
  {
    id: 'beb-4',
    nombre: 'Agua Mineral',
    descripcion: 'Agua mineral sin gas 500ml',
    precio: 1.50,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/AguaMineral.jpg',
    disponible: true
  }
]

// Comercio demo
export const COMERCIO_DEMO: Comercio = {
  id: 'comercio-1',
  nombre: 'ONE TO ONE',
  nombreLegal: 'ONE TO ONE DELIVERY S.A.',
  ruc: '0992123456001',
  direccion: 'Av. Principal 123, Quito',
  telefono: '0991234567',
  horario: {
    apertura: '07:00',
    cierre: '21:00'
  }
}
