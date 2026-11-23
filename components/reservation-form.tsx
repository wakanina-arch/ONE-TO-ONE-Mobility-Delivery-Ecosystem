'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Merchant } from '@/lib/supabase/merchants'
import { ReservationTicket } from '@/components/reservation-ticket'

interface ReservationFormProps {
  comercio: Merchant
  onBack: () => void
}

interface ReservationFormValues {
  nombre: string
  telefono: string
  fecha: string
  hora: string
  comensales: string
  menu: string
  notas: string
}

interface ReservationDetails {
  nombre: string
  fecha: string
  hora: string
  comensales: number
  menu: string
  mesa: number
  modo?: 'mesa' | 'pedido' | 'recoger'
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ReservationForm({ comercio, onBack }: ReservationFormProps) {
  const [reservation, setReservation] = useState<ReservationDetails | null>(null)
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
      const [modo, setModo] = useState<'mesa' | 'pedido' | 'recoger'>('mesa')
    
  
  useEffect(() => {
  const intervalo = setInterval(() => {
    setModo((actual) => {
      if (actual === 'mesa') return 'pedido'
      if (actual === 'pedido') return 'recoger'
      return 'mesa'
    })
  }, 5000) // 5 segundos: tiempo justo para leer sin impacientar
  return () => clearInterval(intervalo)
}, [])
  const [form, setForm] = useState<ReservationFormValues>({
    nombre: '',
    telefono: '',
    fecha: '',
    hora: '',
    comensales: '1',
    menu: 'Menú del día',
    notas: '',
  })
  const minDate = getLocalDateString(new Date())

  if (reservation) {
    return (
      <ReservationTicket
        reserva={reservation}
        comercio={comercio.name}
        logoUrl={comercio.logo_url}
        onClose={onBack}
      />
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fechaHora = new Date(`${form.fecha}T${form.hora}`)
    if (fechaHora.getTime() <= Date.now()) {
      window.alert('Selecciona una fecha y hora futuras para la reserva.')
      return
    }

        setReservation({
      nombre: form.nombre,
      fecha: form.fecha,
      hora: form.hora,
      comensales: Number(form.comensales),
      menu: form.menu || 'Menú del día',
      mesa: 16,
      modo: modo, // NUEVO CAMPO
    })
  }

  return (
    <main className="min-h-screen bg-[#0b0d0e] px-4 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        {/* TARJETA DE INVITACIÓN (ESTILO IMPRENTA CLARA CON TRICOLOR) */}
        <section className="relative overflow-hidden rounded-3xl bg-[#f7f3ea] p-1 shadow-2xl">
          {/* Resplandor verde selva y vino de fondo */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2d6a4f]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#8b1e3f]/10 blur-3xl" />

          {/* Marco doble con esquinas decorativas (vino) */}
          <div className="relative rounded-[1.25rem] border-2 border-[#8b1e3f]/60 p-1">
            <div className="relative rounded-2xl border border-[#1a1a1a]/15 p-4 sm:p-6">
              
              {/* Adornos esquineros (verde selva) */}
              <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#2d6a4f]/80" />
              <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#2d6a4f]/80" />
              <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#2d6a4f]/80" />
              <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#2d6a4f]/80" />

              {/* Cabecera con Carrusel Integrado */}
              <div className="text-center">
                <div className="min-w-0 flex-1 flex items-center justify-center">
  <svg viewBox="0 -30 400 80" className="h-12 w-full max-w-[360px] -mb-2">
  <defs>
    <path
      id="curva-header"
      d="M 10,45 Q 200,-20 390,45"
      fill="transparent"
    />
  </defs>

  ...
    <text className="fill-[#8b1e3f] font-serif text-3xl font-bold sm:text-4xl">
  <textPath href="#curva-header" startOffset="50%" textAnchor="middle">
    {comercio.name}
  </textPath>
</text>
  </svg>
</div>
                
                {/* Título que rota */}
                <div className="relative mt-2 h-14 overflow-hidden sm:h-16">
  <div 
    className="flex transition-transform duration-500 ease-in-out"
    style={{ transform: `translateX(-${modo === 'mesa' ? 0 : modo === 'pedido' ? 100 : 200}%)` }}
  >
    <h1 className="w-full shrink-0 font-serif text-3xl font-bold text-[#1a1a1a] sm:text-4xl flex items-center justify-center">
  Sabor de barrio
</h1>
<h1 className="w-full shrink-0 font-serif text-3xl font-bold text-[#1a1a1a] sm:text-4xl flex items-center justify-center">
  Momentos únicos
</h1>
<h1 className="w-full shrink-0 font-serif text-3xl font-bold text-[#1a1a1a] sm:text-4xl flex items-center justify-center">
  Reserva tu mesa
</h1>
  </div>
</div>

                <div className="mx-auto mt-3 h-0.5 w-16 bg-[#2d6a4f]" />
                
                {/* Subtítulo que rota */}
                <div className="relative mt-3 h-5 overflow-hidden">
  <div 
    className="flex transition-transform duration-500 ease-in-out"
    style={{ transform: `translateX(-${modo === 'mesa' ? 0 : modo === 'pedido' ? 100 : 200}%)` }}
  >
    <p className="w-full shrink-0 font-serif text-sm italic text-[#1a1a1a]/70">
      "El tiempo se detiene cuando el sabor es bueno."
    </p>
    <p className="w-full shrink-0 font-serif text-sm italic text-[#1a1a1a]/70">
      "Cada bocado una experiencia que recordarás."
    </p>
    <p className="w-full shrink-0 font-serif text-sm italic text-[#1a1a1a]/70">
      "Tu mesa te espera, con el sabor de casa."
    </p>
  </div>
</div>

                              {/* Puntos indicadores del carrusel (solo decorativos) */}
              <div className="mt-4 flex justify-center gap-1.5">
                {['mesa', 'pedido', 'recoger'].map((key) => (
                  <div
                    key={key}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      modo === key ? 'w-6 bg-[#8b1e3f]' : 'w-1.5 bg-[#1a1a1a]/20'
                    }`}
                  />
                ))}
              </div>
              </div>

              {/* Aviso de cortesía (siempre de reserva de mesa) */}
              <div className="mt-3 rounded-lg border border-[#eab308]/40 bg-[#eab308]/15 p-2.5 text-center text-xs text-[#1a1a1a]/80">
                Te esperamos <strong className="text-[#8b1e3f]">15 minutos</strong>. Pasado ese tiempo, la mesa se libera para otro comensal.
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Nombre del cliente</span>
                    <Input
                      autoComplete="name"
                      required
                      value={form.nombre}
                      onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                      placeholder="Nombre completo"
                      className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Teléfono</span>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      pattern="\+?[0-9\s().-]{7,20}"
                      title="Introduce un teléfono válido (mínimo 7 dígitos)."
                      required
                      value={form.telefono}
                      onChange={(event) => setForm({ ...form, telefono: event.target.value })}
                      placeholder="Teléfono de contacto"
                      className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Fecha</span>
                    <Input
                      type="date"
                      min={minDate}
                      required
                      value={form.fecha}
                      onChange={(event) => setForm({ ...form, fecha: event.target.value })}
                      className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Hora</span>
                    <Input
                      type="time"
                      required
                      value={form.hora}
                      onChange={(event) => setForm({ ...form, hora: event.target.value })}
                      className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]"
                    />
                  </label>
                  
                  {modo === 'mesa' ? (
                    <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                      <span>Comensales</span>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        step={1}
                        required
                        value={form.comensales}
                        onChange={(event) => setForm({ ...form, comensales: event.target.value })}
                        className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]"
                      />
                    </label>
                  ) : (
                    <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                      <span>Cantidad de platos</span>
                      <Input
                        type="number"
                        min={1}
                        required
                        value={form.comensales}
                        onChange={(event) => setForm({ ...form, comensales: event.target.value })}
                        className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]"
                      />
                    </label>
                  )}

                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>{modo === 'mesa' ? 'Menú' : 'Plato principal'}</span>
                    <Input
                      value={form.menu}
                      onChange={(event) => setForm({ ...form, menu: event.target.value })}
                      placeholder={modo === 'mesa' ? 'Menú del día' : 'Ej: Encebollado'}
                      className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]"
                    />
                  </label>
                </div>

                <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                  <span>Notas (alergias, celebraciones, etc.)</span>
                  <Textarea
                    rows={3}
                    value={form.notas}
                    onChange={(event) => setForm({ ...form, notas: event.target.value })}
                    placeholder="¿Hay algo que debamos tener en cuenta?"
                    className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f] resize-none"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-[#8b1e3f]/20 bg-white/40 p-3 text-xs leading-5 text-[#1a1a1a]/80">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedPolicy}
                    onChange={(event) => setAcceptedPolicy(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#8b1e3f]"
                  />
                  <span>Entiendo que si no llego en 15 minutos, la mesa se libera.</span>
                </label>

                <Button
  type="submit"
  className="w-full rounded-xl bg-[#8b1e3f] py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#a82450]"
>
  🔱 Confirmar reserva de mesa
</Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}