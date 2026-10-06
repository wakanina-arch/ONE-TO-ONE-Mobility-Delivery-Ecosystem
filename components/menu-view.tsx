'use client'

import { useEffect, useState, useMemo } from 'react'
import { useCartStore, type MenuItem } from '@/lib/store'
import {
  getMerchantById,
  getMerchantSchedules,
  getProductsByMerchant,
  isOpenNow,
  getTodayScheduleSummary,
  type Merchant,
  type MerchantSchedule,
  type Product,
} from '@/lib/supabase/merchants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, ArrowLeft, X } from 'lucide-react'
import { ComercioInfo } from '@/components/ComercioInfo'
import { cn } from '@/lib/utils'

interface MenuViewProps {
  onBack: () => void
  onOpenCart: () => void
}

// Interfaz de comercio guardado en localStorage
interface ComercioLocal {
  id: string
  nombre: string
  logo_url: string | null
  sector: string | null
}

export function MenuView({ onBack, onOpenCart }: MenuViewProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [comercioId, setComercioId] = useState<string | null>(null)
  const [comercio, setComercio] = useState<Merchant | null>(null)
  const [schedules, setSchedules] = useState<MerchantSchedule[]>([])
  const [productos, setProductos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const { items, addItem, removeItem, updateQuantity, getItemCount } = useCartStore()

  // 1. Leer el comercio seleccionado de localStorage
  useEffect(() => {
    const guardado = localStorage.getItem('comercio_seleccionado')
    if (guardado) {
      const comercioLocal: ComercioLocal = JSON.parse(guardado)
      setComercioId(comercioLocal.id)
    }
  }, [])

  // 2. Cargar comercio, horarios y productos desde Supabase
  useEffect(() => {
    if (!comercioId) return

    const cargar = async () => {
      setLoading(true)

      const [merchantData, schedulesData, productsData] = await Promise.all([
        getMerchantById(comercioId),
        getMerchantSchedules(comercioId),
        getProductsByMerchant(comercioId),
      ])

      setComercio(merchantData)
      setSchedules(schedulesData)
      setProductos(productsData)
      setLoading(false)
    }

    cargar()
  }, [comercioId])

  // 3. Calcular estado abierto/cerrado
  const abierto = comercio ? isOpenNow(comercio, schedules) : false
  const horarioHoy = useMemo(() => getTodayScheduleSummary(schedules), [schedules])

  // 4. Convertir productos de Supabase a MenuItem (formato del carrito)
  const menuItems: MenuItem[] = useMemo(() => {
    return productos.map(p => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description || '',
      precio: p.price,
      categoria: p.category || 'Otros',
      imagen: p.image_url || '',
      disponible: p.available,
    }))
  }, [productos])

  // 5. Orden personalizado de categorías (edítalo a tu gusto)
const ORDEN_CATEGORIAS = [
  'Desayunos',
  'De la casa',
  'Sopas',
  'Picoteo',
  'Tradicionales',
  'Ensaladas',
  'Postres',
  'Bebidas',
]

const categorias = useMemo(() => {
  const cats = new Set(menuItems.map(i => i.categoria).filter(Boolean))
  const catsArray = Array.from(cats)

  // Ordenar según ORDEN_CATEGORIAS
  catsArray.sort((a, b) => {
    const idxA = ORDEN_CATEGORIAS.indexOf(a)
    const idxB = ORDEN_CATEGORIAS.indexOf(b)
    if (idxA === -1) return 1   // Categorías no listadas van al final
    if (idxB === -1) return -1
    return idxA - idxB
  })

  return ['Todos', ...catsArray]
}, [menuItems])

  // 6. Filtrar por categoría
  const menuFiltrado = categoriaActiva === 'Todos'
    ? menuItems
    : menuItems.filter(item => item.categoria === categoriaActiva)

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item?.cantidad || 0
  }

  const handleAddItem = (item: MenuItem) => {
    const itemParaCarrito = { ...item, image: item.imagen, cantidad: 1 }
    addItem(itemParaCarrito, String(comercioId || ''))
  }

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const currentQty = getItemQuantity(itemId)
    const newQty = currentQty + delta
    if (newQty <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQty)
    }
  }

  const itemCount = getItemCount()

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER (botones flotantes) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-black/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 hover:text-white transition-all h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCart}
            className="relative bg-black/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 hover:text-white transition-all h-8 w-8"
          >
            <ShoppingCart className="h-4 w-4 text-white" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-red-500 text-white">
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

                  {/* HERO — Logo del comercio (fijo arriba) */}
<div className="sticky top-0 z-40 w-full h-32 overflow-hidden bg-gray-950">
        {/* Capa 1: fondo borroso (misma imagen, escalada) */}
        {comercio?.logo_url && (
          <img
            src={comercio.logo_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
            aria-hidden="true"
          />
        )}

        {/* Capa 2: imagen nítida centrada */}
        {comercio?.logo_url ? (
          <img
            src={comercio.logo_url}
            alt={comercio.name}
            className="absolute inset-0 w-full h-full object-contain relative z-10"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gray-800 relative z-10">
            🏪
          </div>
        )}

        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 bg-black/40 z-20" />

        {/* Estado + Horario */}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end z-30">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                abierto ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              )}
            />
            <span className="text-[10px] text-white font-medium">
              {abierto ? 'Abierto ahora' : 'Cerrado ahora'}
            </span>
          </div>
          <p className="text-[9px] text-white/70">{horarioHoy}</p>
        </div>
      </div>

      {/* TABS de categorías (sticky debajo del hero) */}
<div className="sticky top-32 z-30 border-b border-border bg-background">
        <div className="flex gap-2 px-3 py-2 overflow-x-auto">
          {categorias.map(cat => (
            <Button
              key={cat}
              variant={categoriaActiva === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoriaActiva(cat)}
              className={cn(
                'whitespace-nowrap rounded-full text-xs px-3 py-1 h-auto cursor-pointer',
                categoriaActiva === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* LISTA DE PLATOS */}
      <div className="pt-0">
        <main className="px-0.5 pb-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Cargando menú...</p>
            </div>
          ) : menuFiltrado.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {comercio?.name} aún no tiene productos disponibles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0.5">
              {menuFiltrado.map(item => {
                const qty = getItemQuantity(item.id)

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      'overflow-hidden bg-card border-border transition-all',
                      qty > 0 && 'ring-1 ring-primary/50'
                    )}
                  >
                    <div className="flex gap-3 p-2.5">
                      {/* Imagen del plato */}
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-xs line-clamp-1">
                          {item.nombre}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {item.descripcion}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-primary">
                            ${item.precio.toFixed(2)}
                          </span>

                          {qty === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(item)}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-5 px-2 text-[9px]"
                            >
                              <Plus className="h-2.5 w-2.5 mr-0.5" /> Agregar
                            </Button>
                          ) : (
                            <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="h-5 w-5 rounded-full"
                              >
                                {qty === 1 ? (
                                  <X className="h-2.5 w-2.5" />
                                ) : (
                                  <Minus className="h-2.5 w-2.5" />
                                )}
                              </Button>
                              <span className="w-4 text-center text-[10px] font-semibold">
                                {qty}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="h-5 w-5 rounded-full"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* COMERCIO INFO — compacto para móvil */}
      {comercio && (
        <div className="mt-0">
          <ComercioInfo
            comercioId={comercio.id}
            comercioNombre={comercio.name}
            mode="public"
          />
        </div>
      )}

      {/* Botón flotante del carrito */}
      {itemCount > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <Button
            onClick={onOpenCart}
            className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            <span className="flex-1 text-left text-[10px]">
              Ver carrito ({itemCount})
            </span>
            <span className="font-bold text-xs">
              ${items.reduce((acc, item) => acc + item.precio * item.cantidad, 0).toFixed(2)}
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}