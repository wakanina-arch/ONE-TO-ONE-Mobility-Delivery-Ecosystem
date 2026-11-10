'use client'

import { useState, type FormEvent } from 'react'
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

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400">{comercio.name}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Reservar mesa</h1>
          <p className="mt-2 font-serif text-lg text-amber-100">
            Tu mesa te espera. Reserva con cariño, llega a tiempo.
          </p>
          <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Te esperamos 15 minutos. Pasado ese tiempo, la mesa se libera.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Nombre del cliente</span>
                <Input
                  autoComplete="name"
                  required
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Nombre completo"
                />
              </label>
              <label className="space-y-2 text-sm">
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
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Fecha</span>
                <Input
                  type="date"
                  min={minDate}
                  required
                  value={form.fecha}
                  onChange={(event) => setForm({ ...form, fecha: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Hora</span>
                <Input
                  type="time"
                  required
                  value={form.hora}
                  onChange={(event) => setForm({ ...form, hora: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Número de comensales</span>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  required
                  value={form.comensales}
                  onChange={(event) => setForm({ ...form, comensales: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Menú</span>
                <Input
                  value={form.menu}
                  onChange={(event) => setForm({ ...form, menu: event.target.value })}
                  placeholder="Menú del día"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span>Notas (alergias, celebraciones, etc.)</span>
              <Textarea
                rows={4}
                value={form.notas}
                onChange={(event) => setForm({ ...form, notas: event.target.value })}
                placeholder="¿Hay algo que debamos tener en cuenta?"
              />
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6">
              <input
                type="checkbox"
                required
                checked={acceptedPolicy}
                onChange={(event) => setAcceptedPolicy(event.target.checked)}
                className="mt-1 h-4 w-4 accent-amber-400"
              />
              <span>Entiendo que si no llego en 15 minutos, la mesa se libera.</span>
            </label>

            <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-400">
              Confirmar reserva
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
