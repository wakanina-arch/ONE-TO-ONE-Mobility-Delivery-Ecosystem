'use client'

import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Merchant } from '@/lib/supabase/merchants'
import { InvitationCard } from '@/components/invitation-card'

interface CateringFormProps {
  comercio: Merchant
  onBack: () => void
}

interface CateringFormValues {
  nombre: string
  telefono: string
  email: string
  tipoEvento: string
  fecha: string
  hora: string
  comensales: string
  presupuesto: string
  menu: string
  notas: string
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CateringForm({ comercio, onBack }: CateringFormProps) {
  const [invitation, setInvitation] = useState<CateringFormValues | null>(null)
  const [form, setForm] = useState<CateringFormValues>({
    nombre: '',
    telefono: '',
    email: '',
    tipoEvento: '',
    fecha: '',
    hora: '',
    comensales: '10',
    presupuesto: '',
    menu: '',
    notas: '',
  })
  const minDate = getLocalDateString(new Date())

  if (invitation) {
    return (
      <InvitationCard
        evento={{
          nombre: invitation.nombre,
          tipo: invitation.tipoEvento,
          fecha: invitation.fecha,
          hora: invitation.hora,
          comensales: Number(invitation.comensales),
          menu: invitation.menu,
          direccion: comercio.address || '',
          lat: comercio.latitude ?? comercio.lat ?? null,
          lng: comercio.longitude ?? comercio.lng ?? null,
          mesa: 16,
        }}
        comercio={{ nombre: comercio.name, logoUrl: comercio.logo_url }}
        onClose={onBack}
      />
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fechaHora = new Date(`${form.fecha}T${form.hora}`)
    if (fechaHora.getTime() <= Date.now()) {
      window.alert('Selecciona una fecha y hora futuras para el evento.')
      return
    }

    setInvitation(form)
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
          <h1 className="mt-2 font-serif text-3xl font-semibold">Catering / Bufetes</h1>
          <p className="mt-2 font-serif text-lg text-amber-100">
            Cada celebración merece un menú especial.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span>Nombre del cliente o empresa</span>
                <Input
                  autoComplete="name"
                  required
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  placeholder="Nombre o empresa"
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
                <span>Email</span>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Tipo de evento</span>
                <select
                  required
                  value={form.tipoEvento}
                  onChange={(event) => setForm({ ...form, tipoEvento: event.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                >
                  <option value="" disabled>Selecciona un tipo</option>
                  <option value="Boda">Boda</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Congreso">Congreso</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span>Fecha del evento</span>
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
                  min={10}
                  max={500}
                  step={1}
                  required
                  value={form.comensales}
                  onChange={(event) => setForm({ ...form, comensales: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span>Presupuesto aproximado (opcional)</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.presupuesto}
                  onChange={(event) => setForm({ ...form, presupuesto: event.target.value })}
                  placeholder="0.00"
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span>Menú deseado (opcional)</span>
                <Input
                  value={form.menu}
                  onChange={(event) => setForm({ ...form, menu: event.target.value })}
                  placeholder="Describe el menú que tienes en mente"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span>Notas (alergias, requerimientos especiales)</span>
              <Textarea
                rows={4}
                value={form.notas}
                onChange={(event) => setForm({ ...form, notas: event.target.value })}
                placeholder="¿Qué necesidades especiales debemos conocer?"
              />
            </label>

            <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-400">
              Solicitar cotización
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
