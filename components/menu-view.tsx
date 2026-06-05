'use client'

import { useEffect, useState } from 'react'
import { COMERCIO_DEMO, useCartStore, type MenuItem } from '@/lib/store'
import { 
  MENU_ONE_TO_ONE, 
  MENU_SABORES_ORIGEN, 
  MENU_SIERRA_FUEGO, 
  MENU_GENERICO 
} from '@/lib/menus-comercios'
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

const CATEGORIAS = ['Todos', 'Desayunos', 'Almuerzos', 'Especiales', 'Postres', 'Bebidas']

export function MenuView({ onBack, onOpenCart }: MenuViewProps) {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [comercioActual, setComercioActual] = useState(COMERCIO_DEMO)
  const { items, addItem, removeItem, updateQuantity, getItemCount } = useCartStore()
  
  useEffect(() => {
    const guardado = localStorage.getItem('comercio_seleccionado')
    if (guardado) {
      const comercio = JSON.parse(guardado)
      setComercioActual(comercio)
    }
  }, [])
  
  const getMenuByComercio = (nombreComercio: string): MenuItem[] => {
    switch (nombreComercio) {
      case 'ONE TO ONE': return MENU_ONE_TO_ONE
      case 'Sabores del Origen': return MENU_SABORES_ORIGEN
      case 'Sierra y Fuego': return MENU_SIERRA_FUEGO
      default: return MENU_GENERICO
    }
  }
  
  const menuCompleto = getMenuByComercio(comercioActual.nombre)
  const menuFiltrado = categoriaActiva === 'Todos' 
    ? menuCompleto 
    : menuCompleto.filter(item => item.categoria === categoriaActiva)
  
  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item?.cantidad || 0
  }

  const handleAddItem = (item: MenuItem) => {
    const itemParaCarrito = { ...item, image: item.imagen, cantidad: 1 }
    addItem(itemParaCarrito, String(comercioActual.id))
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

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
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

      {/* HERO */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className="relative w-full h-32 overflow-hidden">
          <img 
            src={comercioActual.imagen || '/casas/en_su_punto.JPG'} 
            alt={comercioActual.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-white font-medium">Abierto ahora</span>
            </div>
            <p className="text-[9px] text-white/70">08:00 - 24:00</p>
          </div>
        </div>
        
        {/* TABS */}
        <div className="border-b border-border bg-background">
          <div className="flex gap-1 px-2 pb-2 overflow-x-auto scrollbar-hide">
  {CATEGORIAS.map(cat => (
    <Button
      key={cat}
      variant={categoriaActiva === cat ? "default" : "outline"}
      size="sm"
      onClick={() => setCategoriaActiva(cat)}
      className={cn(
        "whitespace-nowrap rounded-full text-[9px] px-2.5 py-0.5 h-auto cursor-pointer",  // ← reducido
        categoriaActiva === cat 
          ? "bg-primary text-primary-foreground" 
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {cat}
    </Button>
  ))}
</div>
        </div>
      </div>

      {/* LISTA DE PLATOS */}

<div className="pt-32">
  <main className="px-0.5 pb-1">
    {menuFiltrado.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No hay productos en esta categoría</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-0.5">
        {menuFiltrado.map(item => {
          const qty = getItemQuantity(item.id)
          
          return (
            <Card 
              key={item.id} 
              className={cn(
                "overflow-hidden bg-card border-border transition-all",
                qty > 0 && "ring-1 ring-primary/50"
              )}
            >
              <div className="flex gap-1.5 p-1.5">
                {/* Imagen */}
                <div className="w-15 h-15 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>
                
                {/* Contenido */}
                <div className="flex-1 min-w-0">
  <h3 className="font-semibold text-foreground text-xs line-clamp-1">{item.nombre}</h3>
  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{item.descripcion}</p>
  
  <div className="flex items-center justify-between mt-1">
    <span className="text-sm font-bold text-primary">${item.precio.toFixed(2)}</span>
    
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
          {qty === 1 ? <X className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
        </Button>
        <span className="w-4 text-center text-[10px] font-semibold">{qty}</span>
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

      {/* COMERCIO INFO - compacto para móvil */}
      <div className="mt-0">
        <ComercioInfo 
          comercioId={comercioActual.id}
          comercioNombre={comercioActual.nombre}
          mode="public"
        />
      </div>

      {/* Botón flotante del carrito */}
      {itemCount > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-50">
          <Button
  onClick={onOpenCart}
  className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg text-xs"
>
  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
  <span className="flex-1 text-left text-[10px]">Ver carrito ({itemCount})</span>
  <span className="font-bold text-xs">
    ${items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2)}
  </span>
</Button>
        </div>
      )}
    </div>
  )
}
