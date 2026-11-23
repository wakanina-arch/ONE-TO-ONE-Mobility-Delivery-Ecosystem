'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, ShoppingCart, Star, User } from 'lucide-react'
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
  const { addItem } = useCartStore()
  const [cargando, setCargando] = useState(true)

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
        setCargando(false)
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

  const handlePedirAhora = () => {
    if (menuDelDia) {
      const precio = menuDelDia.offer_price ?? menuDelDia.products?.price ?? 0
      const item: MenuItem = {
  id: `menu-${menuDelDia.id}`, // Debe tener el prefijo
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

  return (
    <main className="min-h-screen bg-[#0b0d0e] pb-24 text-white">
      {/* HEADER STICKY: Volver · Nombre en amarillo · Icono de usuario */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d0e]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onVolver}
            className="shrink-0 text-white/75 hover:bg-white/10 hover:text-white"
            aria-label="Volver a comercios"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="min-w-0 flex-1 truncate text-center font-serif text-xl font-bold text-amber-400 sm:text-2xl">
  {comercio.name}
</h1>

          <Button
            type="button"
            variant="ghost"
            aria-label="Mi cuenta"
            className="shrink-0 text-white/75 hover:bg-white/10 hover:text-white"
            onClick={() => {
              window.location.href = '/mi-cuenta'
            }}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* 1. TARJETAS BENTO: Carta / Reservas / Catering */}
        <section aria-label="Accesos principales" className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onVerMenu}
            className="group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-3 text-center text-black shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-28"
          >
            <div className="absolute -right-4 -top-4 z-0 text-6xl opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">📖</div>
            <div className="relative z-10 mt-4">
              <h3 className="font-serif text-base font-bold leading-tight sm:text-lg">Ver Carta</h3>
              <p className="mt-1 text-[10px] font-medium text-black/70 sm:text-xs">Platos y bebidas</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onReservar}
            className="group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.04] sm:h-28"
          >
            <div className="absolute -right-4 -top-4 z-0 text-6xl opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">📅</div>
            <div className="relative z-10 mt-4">
              <h3 className="font-serif text-base font-semibold text-white sm:text-lg">Reservas</h3>
              <p className="mt-1 text-[10px] font-medium text-white/50 sm:text-xs">Solo mesa</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onCatering}
            className="group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.04] sm:h-28"
          >
            <div className="absolute -right-4 -top-4 z-0 text-6xl opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">🍲</div>
            <div className="relative z-10 mt-4">
              <h3 className="font-serif text-base font-semibold text-white sm:text-lg">Catering</h3>
              <p className="mt-1 text-[10px] font-medium text-white/50 sm:text-xs">Bufetes</p>
            </div>
          </button>
        </section>
<div className={`transition-opacity duration-1000 ease-in-out ${cargando ? 'opacity-100' : 'opacity-0'}`}>
  {cargando && (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative aspect-square w-full max-w-[320px] animate-pulse rounded-3xl bg-white/5">
{/* Marca de agua en diagonal (más grande, se desborda) */}
        <div className="absolute inset-0 opacity-20">
  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-25 text-center -ml-4 -mt-4">
    <span className="block text-6xl">🔱</span>
    <span className="mt-1 block whitespace-nowrap font-serif text-5xl font-bold tracking-widest text-white/60">
      ONE TO ONE
    </span>
  </div>
</div>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
        </div>
        <div className="space-y-3 sm:border-l sm:border-white/10 sm:pl-6">
          <div className="h-8 w-20 animate-pulse rounded bg-white/5" />
          <div className="h-12 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  )}
</div>

{cargando ? null : menuDelDia ? (
  // CONTENIDO REAL con fade-in
  <div className="flex flex-col items-center gap-6 py-4 transition-opacity duration-1000 ease-in-out opacity-100">
    {/* Imagen centrada (sin contenedor) */}
    {menuDelDia.image_url && (
      <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl shadow-2xl">
        <img
          src={menuDelDia.image_url}
          alt={menuDelDia.title}
          className="h-full w-full object-cover"
        />
      </div>
    )}

    {/* Texto en dos columnas (debajo de la imagen) */}
    <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Columna Izquierda */}
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
          {menuDelDia.tipo === 'especial' ? '✨ Especial' :
           menuDelDia.tipo === 'promo' ? '🏷️ Promo' :
           '🔥 Menú de hoy'}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
          {menuDelDia.title}
        </h2>
        {menuDelDia.description && (
          <p className="mt-2 text-sm text-white/60">
            {menuDelDia.description}
          </p>
        )}
      </div>

      {/* Columna Derecha (con pasamanos invisible) */}
      <div className="flex flex-col items-center justify-center gap-3 sm:border-l sm:border-white/10 sm:pl-6 sm:items-end">
        <p className="text-3xl font-bold text-amber-300">
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
) : null}

        {/* 3. INFORMACIÓN DEL COMERCIO (con logo arriba) */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 border-b border-white/10 pb-6">
            {comercio.logo_url ? (
              <img
                src={comercio.logo_url}
                alt={`Logo de ${comercio.name}`}
                className="h-20 w-20 rounded-[1.5rem] border border-white/10 object-cover shadow-2xl"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/5 text-3xl">
                🍽️
              </div>
            )}
              <h2 className="sr-only">{comercio.name}</h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${abierto ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={abierto ? 'text-emerald-400' : 'text-red-400'}>{abierto ? 'Abierto' : 'Cerrado'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" /> {horarioHoy}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400/50 text-amber-400/50" />
                {typeof valoracion === 'number' && Number.isFinite(valoracion) ? valoracion.toFixed(1) : 'Nuevo'}
              </span>
            </div>
          </div>
          <div className="pt-6">
            <ComercioInfo
              comercioId={comercio.id}
              comercioNombre={comercio.name}
              mode="public"
            />
          </div>
        </section>
      </div>

      
    </main>
  )
}