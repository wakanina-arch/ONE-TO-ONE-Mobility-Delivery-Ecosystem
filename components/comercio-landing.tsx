'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComercioInfo } from '@/components/ComercioInfo'
import { createClient } from '@/lib/supabase/client'
import {
  getMerchantSchedules,
  getProductsByMerchant,
  getTodayScheduleSummary,
  isOpenNow,
  type Merchant,
  type MerchantSchedule,
  type Product,
} from '@/lib/supabase/merchants'

interface ComercioLandingProps {
  comercio: Merchant
  onVerMenu: () => void
  onReservar: () => void
  onCatering: () => void
  onVolver: () => void
  onAbrirCarrito: () => void
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
  const [productos, setProductos] = useState<Product[]>([])
  const [menuDelDia, setMenuDelDia] = useState<any>(null)

  useEffect(() => {
    let active = true

    const cargarDatos = async () => {
      const [horariosData, productosData] = await Promise.all([
        getMerchantSchedules(comercio.id),
        getProductsByMerchant(comercio.id),
      ])

      const supabase = createClient()
      const { data: menuData } = await supabase
        .from('daily_menus')
        .select('*')
        .eq('merchant_id', comercio.id)
        .eq('active', true)
        .maybeSingle()

      if (active) {
        setHorarios(horariosData)
        setProductos(productosData)
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
                <section className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {comercio.logo_url ? (
            <img
              src={comercio.logo_url}
              alt={`Logo de ${comercio.name}`}
              className="h-28 w-28 rounded-3xl border border-white/10 object-cover shadow-2xl"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl sm:h-32 sm:w-32">
              🍽️
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-400/90">
              {comercio.sector || 'Gastronomía'}
            </p>
              <h1 className="sr-only">
              {comercio.name}
            </h1>
            {comercio.description && (
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:mx-0">
                {comercio.description}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-sm sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${abierto ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-medium ${abierto ? 'text-emerald-300' : 'text-red-300'}`}>
                  {abierto ? 'Abierto ahora' : 'Cerrado'}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/5 px-3.5 py-1.5 text-xs font-medium text-white/60">
                <Clock3 className="h-3.5 w-3.5 text-amber-400/80" />
                {horarioHoy}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {typeof valoracion === 'number' && Number.isFinite(valoracion) ? valoracion.toFixed(1) : 'Sin valoraciones'}
              </span>
            </div>
          </div>
        </section>

        {/* 2. MENÚ DEL DÍA (PIZARRA DE CALLE) */}
        {menuDelDia && (
          <section className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#101112] shadow-xl transition-all duration-500 hover:border-amber-400/30 hover:shadow-amber-500/5">
            
            {menuDelDia.image_url && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={menuDelDia.image_url}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full scale-110 object-cover opacity-20 blur-3xl transition-transform duration-1000 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d0e] via-[#0b0d0e]/90 to-transparent" />
              </div>
            )}
            
            <div className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                            <div className="flex-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
                  {menuDelDia.tipo === 'especial' ? '✨ Especial para hoy' : 
                   menuDelDia.tipo === 'promo' ? '🏷️ Promoción del día' : 
                   '🔥 Menú de hoy'}
                </span>
                
                {/* Nombre del plato (Ahora es el subtítulo con presencia) */}
                <h2 className="mt-4 font-serif text-2xl font-semibold text-white sm:text-4xl">
                  {menuDelDia.title}
                </h2>

                                {menuDelDia.description && (
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/60 sm:mx-0">
                    {menuDelDia.description}
                  </p>
                )}
                <p className="mt-4 text-2xl font-semibold text-amber-300">
                  ${Number(menuDelDia.offer_price).toFixed(2)}
                </p>
              </div>

              <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:items-end shrink-0">
                {menuDelDia.image_url && (
                  <div className="relative h-48 w-48 overflow-hidden rounded-2xl border border-white/10 shadow-xl sm:h-56 sm:w-56">
                    <img
                      src={menuDelDia.image_url}
                      alt={menuDelDia.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  onClick={onVerMenu}
                  className="w-full rounded-xl bg-amber-500 px-6 py-4 text-sm font-semibold text-black shadow-lg transition-all hover:scale-[1.02] hover:bg-amber-400 sm:w-full"
                >
                  Pedir ahora
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* 3. ACCESOS PRINCIPALES (TARJETAS) */}
                        <section aria-label="Accesos principales" className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          {/* Tarjeta Carta (Destacada) */}
          <button
            type="button"
            onClick={onVerMenu}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-4 text-left text-black shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:col-span-2 sm:row-span-2"
          >
            <div className="absolute -right-8 -top-8 text-[140px] opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">🍔</div>
            
            <div className="relative z-10 mt-auto pt-10">
             <h3 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">Ver Carta</h3>
              <p className="mt-2 text-sm font-medium text-black/60">Descubre nuestros platos y bebidas.</p>
            </div>
          </button>

          {/* Tarjeta Reservas */}
          <button
            type="button"
            onClick={onReservar}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.04] hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110">📅</div>
            <div className="relative z-10 mt-8">
            <h3 className="font-serif text-xl font-semibold text-white">Reservas</h3>
              <p className="mt-1 text-xs font-medium text-white/50">Visítanos o pide para llevar</p>
            </div>
          </button>

          {/* Tarjeta Catering */}
          <button
            type="button"
            onClick={onCatering}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.04] hover:shadow-xl"
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110">🍲</div>
            <div className="relative z-10 mt-8">
              <h3 className="font-serif text-xl font-semibold text-white">Catering</h3>
              <p className="mt-1 text-xs font-medium text-white/50">Celebra con el sabor de casa</p>
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