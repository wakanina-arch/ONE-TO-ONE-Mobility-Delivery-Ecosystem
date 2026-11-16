'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, type MenuItem } from '@/lib/store'
import { ComercioInfo } from '@/components/ComercioInfo'
import { createClient } from '@/lib/supabase/client'
import {
  getMerchantSchedules,
  getTodayScheduleSummary,
  isOpenNow,
  type Merchant,
  type MerchantSchedule,
} from '@/lib/supabase/merchants'

interface ComercioLandingProps {
  comercio: Merchant
  onVerMenu: () => void
  onReservar: () => void
  onCatering: () => void
  onVolver: () => void
  onAbrirCarrito: () => void
}

interface PublishedDailyMenu {
  id: string
  title: string
  description: string | null
  offer_price: number | null
  image_url: string | null
  tapiz: string | null
  tipo?: 'menu' | 'especial' | 'promo' | null
  products?: { price: number } | null
}

export function ComercioLanding({
  comercio,
  onVerMenu,
  onReservar,
  onCatering,
  onVolver,
  onAbrirCarrito,
}: ComercioLandingProps) {
  const [horarios, setHorarios] = useState<MerchantSchedule[]>([])
  const [menuDelDia, setMenuDelDia] = useState<PublishedDailyMenu | null>(null)
  const tapizUrl = typeof menuDelDia?.tapiz === 'string' && /^https?:\/\//.test(menuDelDia.tapiz)
    ? menuDelDia.tapiz
    : null
  const { addItem } = useCartStore()
  const handlePedirAhora = () => {
    if (menuDelDia) {
      const precio = menuDelDia.offer_price ?? menuDelDia.products?.price ?? 0
      const item: MenuItem = {
        id: `menu-${menuDelDia.id}`,
        nombre: menuDelDia.title,
        descripcion: menuDelDia.description || '',
        precio: Number(precio),
        categoria: 'Menú del día',
        imagen: menuDelDia.image_url || '',
        disponible: true,
      }

      addItem(item, String(comercio.id))
      onAbrirCarrito()
    } else {
      onVerMenu()
    }
  }

  useEffect(() => {
    let active = true

    const cargarDatos = async () => {
      const horariosData = await getMerchantSchedules(comercio.id)

      const supabase = createClient()
      const { data: menuData } = await supabase
        .from('daily_menus')
        .select('*, products(price)')
        .eq('merchant_id', comercio.id)
        .eq('active', true)
        .maybeSingle()

      if (active) {
        setHorarios(horariosData)
        setMenuDelDia(menuData)
      }
    }

    void cargarDatos()
    return () => {
      active = false
    }
  }, [comercio.id])

  const abierto = isOpenNow(comercio, horarios)
  const horarioHoy = comercio.always_open
    ? 'Abierto 24 horas'
    : getTodayScheduleSummary(horarios)

  const valoracion = comercio.rating

  return (
    <main className="min-h-screen bg-[#0b0d0e] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onVolver}
            className="text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onAbrirCarrito}
            aria-label="Abrir carrito"
            className="text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:py-12">
        {/* 1. HEADER DEL COMERCIO */}
                <section className="flex flex-col items-center gap-4 text-center">
          {comercio.logo_url ? (
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-amber-500/10 blur-xl" />
              <img
                src={comercio.logo_url}
                alt={`Logo de ${comercio.name}`}
                className="mx-auto h-32 w-32 rounded-[1.5rem] border border-white/10 object-cover shadow-2xl sm:h-40 sm:w-40"
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 text-5xl sm:h-40 sm:w-40">
              🍽️
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400/90">
              {comercio.sector || 'Gastronomía'}
            </p>
            <h1 className="sr-only">{comercio.name}</h1>
            {comercio.description && (
              <p className="mt-2 max-w-lg text-sm text-white/50">
                {comercio.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${abierto ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={abierto ? 'text-emerald-400' : 'text-red-400'}>{abierto ? 'Abierto' : 'Cerrado'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/40">
                <Clock3 className="h-3.5 w-3.5" /> {horarioHoy}
              </span>
              <span className="inline-flex items-center gap-1 text-white/40">
                <Star className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400/50" />
                {typeof valoracion === 'number' && Number.isFinite(valoracion) ? valoracion.toFixed(1) : 'Nuevo'}
              </span>
            </div>
          </div>
        </section>

        {/* 2. MENÚ DEL DÍA (PIZARRA DE CALLE) */}
                       {menuDelDia && (
          <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* CAPA 1: El Tapiz (Fondo de ambiente desenfocado y oscurecido) */}
            <div className="absolute inset-0">
              {tapizUrl ? (
                <>
                  <img
                    src={tapizUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full scale-110 object-cover opacity-40 blur-md"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                </>
              ) : (
                <div className="h-full w-full bg-[#17140e]" />
              )}
            </div>

            {/* CAPA 2: El Contenido (Plato arriba, texto abajo con dos columnas) */}
            <div className="relative z-10 flex flex-col items-center gap-5 p-6 sm:p-8">
              
              {/* El Héroe: La Foto del Plato */}
              {menuDelDia.image_url && (
                <div className="relative w-full max-w-[300px] sm:max-w-[360px]">
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-amber-500/20 blur-2xl" />
                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-2xl">
  <img
    src={menuDelDia.image_url}
    alt={menuDelDia.title}
    className="h-full w-full object-cover"
  />
</div>
                </div>
              )}

              {/* Texto (Izquierda) y Precio/Botón (Derecha) */}
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                
                <div className="flex-1 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                    {menuDelDia.tipo === 'especial' ? '✨ Especial' : 
                     menuDelDia.tipo === 'promo' ? '🏷️ Promo' : 
                     '🔥 Menú de hoy'}
                  </span>
                  
                  <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl drop-shadow-md">
                    {menuDelDia.title}
                  </h2>
                  
                  {menuDelDia.description && (
                    <p className="mt-2 max-w-lg text-sm text-white/70 drop-shadow-sm">
                      {menuDelDia.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
                  <p className="text-3xl font-bold text-amber-300 drop-shadow-md">
                    ${Number(menuDelDia.offer_price).toFixed(2)}
                  </p>
                  <Button
                    type="button"
                    onClick={handlePedirAhora}
                    className="w-full rounded-xl bg-amber-500 px-8 py-4 text-sm font-bold text-black shadow-lg transition-all hover:scale-[1.02] hover:bg-amber-400 sm:w-auto"
                  >
                    Pedir ahora
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. ACCESOS PRINCIPALES (TARJETAS) */}
                <section aria-label="Accesos principales" className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onVerMenu}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center transition-all hover:border-amber-400/40 hover:bg-amber-400/10"
          >
            <span className="text-2xl transition-transform group-hover:scale-110">📖</span>
            <div>
              <h3 className="font-serif text-sm font-semibold text-white">Ver Carta</h3>
              <p className="mt-0.5 text-[10px] text-white/40">Platos y bebidas</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onReservar}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            <span className="text-2xl transition-transform group-hover:scale-110">📅</span>
            <div>
              <h3 className="font-serif text-sm font-semibold text-white">Reservas</h3>
              <p className="mt-0.5 text-[10px] text-white/40">Pide para llevar</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onCatering}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center transition-all hover:border-white/20 hover:bg-white/[0.04]"
          >
            <span className="text-2xl transition-transform group-hover:scale-110">🍲</span>
            <div>
              <h3 className="font-serif text-sm font-semibold text-white">Catering</h3>
              <p className="mt-0.5 text-[10px] text-white/40">Bufetes</p>
            </div>
          </button>
        </section>

        {/* 4. INFORMACIÓN DEL COMERCIO */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 mt-6">
          <h2 className="font-serif text-xl font-semibold mb-6 text-white/90">Información del comercio</h2>
          <ComercioInfo
            comercioId={comercio.id}
            comercioNombre={comercio.name}
            mode="public"
          />
        </section>
      </div>
    </main>
  )
}