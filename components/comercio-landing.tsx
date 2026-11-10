'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, MapPin, Phone, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComercioInfo } from '@/components/ComercioInfo'
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
  onVolver: () => void
  onAbrirCarrito: () => void
}

export function ComercioLanding({
  comercio,
  onVerMenu,
  onVolver,
  onAbrirCarrito,
}: ComercioLandingProps) {
  const [horarios, setHorarios] = useState<MerchantSchedule[]>([])
  const [productos, setProductos] = useState<Product[]>([])

  useEffect(() => {
    let active = true

    const cargarDatos = async () => {
      const [horariosData, productosData] = await Promise.all([
        getMerchantSchedules(comercio.id),
        getProductsByMerchant(comercio.id),
      ])

      if (active) {
        setHorarios(horariosData)
        setProductos(productosData)
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
  const oferta = productos.find((producto) => {
    const descuento = Number(producto.descuento)
    return producto.en_oferta === true
      && Number.isFinite(descuento)
      && descuento > 0
      && descuento <= 100
  })
  const descuentoOferta = oferta ? Number(oferta.descuento) : 0
  const precioOferta = oferta
    ? Math.round(oferta.price * (1 - descuentoOferta / 100) * 100) / 100
    : 0
  const latitud = comercio.latitude ?? comercio.lat
  const longitud = comercio.longitude ?? comercio.lng
  const tieneUbicacion = Number.isFinite(latitud) && Number.isFinite(longitud)
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
        <section className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {comercio.logo_url ? (
            <img
              src={comercio.logo_url}
              alt={`Logo de ${comercio.name}`}
              className="h-28 w-28 rounded-3xl border border-white/10 object-cover shadow-2xl"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl">
              🍽️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
              {comercio.sector || 'Gastronomía'}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              {comercio.name}
            </h1>
            {comercio.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                {comercio.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                <span className={`h-2 w-2 rounded-full ${abierto ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={abierto ? 'text-emerald-300' : 'text-red-300'}>
                  {abierto ? 'Abierto' : 'Cerrado'}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-white/60">
                <Clock3 className="h-4 w-4 text-amber-400" />
                {horarioHoy}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/70">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {typeof valoracion === 'number' && Number.isFinite(valoracion)
                  ? valoracion.toFixed(1)
                  : 'Sin valoraciones'}
              </span>
            </div>
          </div>
        </section>

        {oferta && (
          <section className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/15 via-[#17140e] to-[#101112]">
            {oferta.image_url && (
              <img
                src={oferta.image_url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            )}
            <div className="relative grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <p className="text-sm font-semibold text-amber-300">🔥 Oferta especial</p>
                <h2 className="mt-2 font-serif text-3xl font-semibold">{oferta.name}</h2>
                {oferta.description && (
                  <p className="mt-2 max-w-xl text-sm text-white/65">{oferta.description}</p>
                )}
                <p className="mt-4 flex items-baseline gap-3">
                  <span className="text-sm text-white/45 line-through">
                    ${oferta.price.toFixed(2)}
                  </span>
                  <span className="text-2xl font-semibold text-amber-300">
                    ${precioOferta.toFixed(2)}
                  </span>
                </p>
              </div>
              {oferta.image_url && (
                <img
                  src={oferta.image_url}
                  alt={oferta.name}
                  className="h-36 w-full rounded-2xl object-cover shadow-xl sm:h-40 sm:w-48"
                />
              )}
              <Button
                type="button"
                onClick={onVerMenu}
                className="bg-amber-500 text-black hover:bg-amber-400 sm:col-span-2 sm:justify-self-start"
              >
                Pedir ahora
              </Button>
            </div>
          </section>
        )}

        <section aria-label="Accesos principales" className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onVerMenu}
            className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-left transition hover:border-amber-300/70 hover:bg-amber-400/15"
          >
            <span className="font-serif text-xl font-semibold">Ver menú</span>
            <span className="mt-2 block text-sm text-white/55">Descubre nuestros platos</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Próximamente')}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            <span className="font-serif text-xl font-semibold">Reservar mesa</span>
            <span className="mt-2 block text-sm text-white/55">Planifica tu visita</span>
          </button>
          <button
            type="button"
            onClick={() => alert('Próximamente')}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            <span className="font-serif text-xl font-semibold">Catering / Bufetes</span>
            <span className="mt-2 block text-sm text-white/55">Celebra con nosotros</span>
          </button>
        </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-semibold mb-4">Información del comercio</h2>
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
