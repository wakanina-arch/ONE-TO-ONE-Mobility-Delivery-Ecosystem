'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { ArrowLeft, ChefHat, HandPlatter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import type { Merchant } from '@/lib/supabase/merchants'

interface CateringFormProps {
  comercio: Merchant
  onBack: () => void
}

type Modo = 'catering' | 'bufete' | null

interface CateringFormValues {
  nombre: string
  telefono: string
  email: string
  tipoEvento: string
  fecha: string
  hora: string
  comensales: string
  direccion: string
  tipoEntrega: string
  exclusividad: string
  camareros: boolean
  horasCamareros: string
  cantidadCamareros: string
  vajilla: boolean
  cuberteria: boolean
  manteleria: boolean
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
  const [modo, setModo] = useState<Modo>(null)
  const [referencia, setReferencia] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState<CateringFormValues>({
    nombre: '',
    telefono: '',
    email: '',
    tipoEvento: '',
    fecha: '',
    hora: '',
    comensales: '10',
    direccion: '',
    tipoEntrega: 'raciones',
    exclusividad: 'parcial',
    camareros: false,
    horasCamareros: '4',
    cantidadCamareros: '1',
    vajilla: false,
    cuberteria: false,
    manteleria: false,
    menu: '',
    notas: '',
  })
  const minDate = getLocalDateString(new Date())

  // Generar referencia única
  const generarReferencia = () => {
    const fecha = new Date()
    const año = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const dia = String(fecha.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `CAT-${año}${mes}${dia}-${random}`
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!modo) return

    const fechaHora = new Date(`${form.fecha}T${form.hora}`)
    if (fechaHora.getTime() <= Date.now()) {
      window.alert('Selecciona una fecha y hora futuras para el evento.')
      return
    }

    setEnviando(true)
    const supabase = createClient()
    const referenciaGenerada = generarReferencia()

    const { error } = await supabase.from('catering_requests').insert({
      merchant_id: comercio.id,
      reference: referenciaGenerada,
      modo: modo,
      cliente_nombre: form.nombre,
      cliente_telefono: form.telefono,
      cliente_email: form.email || null,
      fecha_evento: form.fecha,
      comensales: Number(form.comensales),
      tipo_evento: form.tipoEvento,
      direccion_entrega: modo === 'catering' ? form.direccion : null,
      tipo_entrega: modo === 'catering' ? form.tipoEntrega : null,
      exclusividad: modo === 'bufete' ? form.exclusividad : null,
      extras: {
        camareros: form.camareros,
        horasCamareros: form.camareros ? Number(form.horasCamareros) : null,
        cantidadCamareros: form.camareros ? Number(form.cantidadCamareros) : null,
        vajilla: modo === 'catering' ? form.vajilla : false,
        cuberteria: modo === 'catering' ? form.cuberteria : false,
        manteleria: modo === 'catering' ? form.manteleria : false,
      },
      notas: form.notas || null,
      estado: 'pendiente',
    })

    setEnviando(false)

    if (error) {
      console.error('Error enviando solicitud:', error)
      alert('Error enviando la solicitud: ' + error.message)
      return
    }

    setReferencia(referenciaGenerada)
  }

  // PANTALLA DE CONFIRMACIÓN
  if (referencia) {
    return (
      <main className="min-h-screen bg-[#0b0d0e] px-4 py-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#f7f3ea] p-1 shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2d6a4f]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#8b1e3f]/10 blur-3xl" />
            <div className="relative rounded-[1.25rem] border-2 border-[#8b1e3f]/60 p-1">
              <div className="relative rounded-2xl border border-[#1a1a1a]/15 p-6 sm:p-8">
                <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#2d6a4f]/80" />
                <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#2d6a4f]/80" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#2d6a4f]/80" />
                <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#2d6a4f]/80" />

                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#8b1e3f]">
                    {comercio.name}
                  </p>
                  <h1 className="mt-2 font-serif text-3xl font-bold text-[#1a1a1a]">
  ¡Parte enviado!
</h1>
                  <div className="mx-auto mt-3 h-0.5 w-16 bg-[#2d6a4f]" />
                  <p className="mt-3 font-serif text-sm italic text-[#1a1a1a]/70">
                    "Gracias por confiar en nosotros."
                  </p>
                </div>

                <div className="mt-6 rounded-lg border border-[#eab308]/40 bg-[#eab308]/15 p-4 text-center">
                  <p className="text-xs font-medium text-[#1a1a1a]/70">Tu número de referencia:</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#8b1e3f]">{referencia}</p>
                </div>

                <div className="mt-6 space-y-3 text-sm text-[#1a1a1a]/80">
                  <p><strong>Comercio:</strong> {comercio.name}</p>
                  <p><strong>Tipo de servicio:</strong> {modo === 'catering' ? 'Catering a domicilio' : 'Bufete en el local'}</p>
                  <p><strong>Fecha del evento:</strong> {form.fecha}</p>
                  <p><strong>Comensales:</strong> {form.comensales}</p>
                  <p className="mt-4 rounded-lg border border-[#8b1e3f]/20 bg-white/40 p-3 text-xs">
  El comercio te contactará en las próximas <strong>24 horas</strong> al teléfono <strong>{form.telefono}</strong> con las propuestas de menú. <strong>Tu celebración está un paso más cerca.</strong>
</p>
                </div>

                <Button
                  onClick={onBack}
                  className="mt-6 w-full rounded-xl bg-[#8b1e3f] py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#a82450]"
                >
                  🔱 Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // PANTALLA DE SELECCIÓN (Catering vs. Bufete)
  if (!modo) {
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

          <div className="relative overflow-hidden rounded-3xl bg-[#f7f3ea] p-1 shadow-2xl">
            <div className="relative rounded-[1.25rem] border-2 border-[#8b1e3f]/60 p-1">
              <div className="relative rounded-2xl border border-[#1a1a1a]/15 p-4 sm:p-6">
                <div className="text-center">
  {/* Nombre del comercio arqueado */}
  <div className="flex justify-center">
    <svg viewBox="0 -30 400 80" className="h-12 w-full max-w-[360px]">
      <defs>
        <path
          id="curva-seleccion"
          d="M 10,45 Q 200,-20 390,45"
          fill="transparent"
        />
      </defs>
      <text className="fill-[#8b1e3f] font-serif text-3xl font-bold sm:text-4xl">
        <textPath href="#curva-seleccion" startOffset="50%" textAnchor="middle">
          {comercio.name}
        </textPath>
      </text>
    </svg>
  </div>

  <h1 className="mt-2 font-serif text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
    ¿Qué necesitas?
  </h1>
  <div className="mx-auto mt-3 h-0.5 w-16 bg-[#2d6a4f]" />
  <p className="mt-3 font-serif text-sm italic text-[#1a1a1a]/70">
    "Cada celebración merece un menú especial."
  </p>
</div>

                <div className="mt-8 grid gap-4">
                  <button
                    type="button"
                    onClick={() => setModo('catering')}
                    className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-[#8b1e3f]/30 bg-white/60 p-4 transition-all hover:border-[#8b1e3f] hover:bg-white/80">
                    <ChefHat className="h-10 w-10 text-[#8b1e3f]" />
                    <h3 className="font-serif text-xl font-bold text-[#8b1e3f]">Catering a domicilio</h3>
                    <p className="text-xs text-[#1a1a1a]/60">Llevamos el sabor de casa a tu evento o celebración</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModo('bufete')}
                    className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-[#8b1e3f]/30 bg-white/60 p-4 transition-all hover:border-[#8b1e3f] hover:bg-white/80">
                    <HandPlatter className="h-10 w-10 text-[#2d6a4f]" />
                    <h3 className="font-serif text-xl font-bold text-[#2d6a4f]">Bufete en el local</h3>
                    <p className="text-xs text-[#1a1a1a]/60">Celebra en nuestro salón, con el sabor y la alegría de siempre</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // FORMULARIO (Catering o Bufete)
  return (
    <main className="min-h-screen bg-[#0b0d0e] px-4 py-6 text-white">
      <div className="mx-auto max-w-2xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setModo(null)}
          className="mb-6 text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="relative overflow-hidden rounded-3xl bg-[#f7f3ea] p-1 shadow-2xl">
          <div className="relative rounded-[1.25rem] border-2 border-[#8b1e3f]/60 p-1">
            <div className="relative rounded-2xl border border-[#1a1a1a]/15 p-4 sm:p-6">
              <div className="text-center">
  {/* Nombre del comercio arqueado */}
  <div className="flex justify-center">
    <svg viewBox="0 -30 400 80" className="h-12 w-full max-w-[360px]">
      <defs>
        <path
          id="curva-formulario"
          d="M 10,45 Q 200,-20 390,45"
          fill="transparent"
        />
      </defs>
      <text className="fill-[#8b1e3f] font-serif text-3xl font-bold sm:text-4xl">
        <textPath href="#curva-formulario" startOffset="50%" textAnchor="middle">
          {comercio.name}
        </textPath>
      </text>
    </svg>
  </div>

  <h1 className="mt-2 font-serif text-3xl font-bold text-[#1a1a1a] sm:text-4xl">
    {modo === 'catering' ? 'Parte de Catering' : 'Parte de Bufete'}
  </h1>
  <div className="mx-auto mt-3 h-0.5 w-16 bg-[#2d6a4f]" />
  <p className="mt-1 font-serif text-sm italic text-[#1a1a1a]/70">
  {modo === 'catering' 
    ? '"El sabor de casa en tus ceremoniales inolvidables."' 
    : '"Tú, tus amigos, el salón, fiesta, alegría. ¡Un recuerdo inolvidable!."'}
</p>
</div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {/* BLOQUE 1: Datos del evento */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Nombre del cliente o empresa</span>
                    <Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre o empresa" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]" />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Teléfono</span>
                    <Input type="tel" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono de contacto" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]" />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Email</span>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]" />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Tipo de evento</span>
                    <select required value={form.tipoEvento} onChange={(e) => setForm({ ...form, tipoEvento: e.target.value })} className="h-9 w-full rounded-md border border-[#1a1a1a]/20 bg-white/70 px-2 text-sm text-[#1a1a1a] focus:border-[#2d6a4f]">
                      <option value="" disabled>Selecciona un tipo</option>
                      <option value="Boda">Boda</option>
                      <option value="Cumpleaños">Cumpleaños</option>
                      <option value="Congreso">Congreso</option>
                      <option value="Empresa">Empresa</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Fecha del evento</span>
                    <Input type="date" min={minDate} required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]" />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Hora</span>
                    <Input type="time" required value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]" />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Número de comensales</span>
                    <Input type="number" min={1} required value={form.comensales} onChange={(e) => setForm({ ...form, comensales: e.target.value })} className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] focus:border-[#2d6a4f]" />
                  </label>
                </div>

                {/* BLOQUE 2: Dirección / Exclusividad (condicional) */}
                {modo === 'catering' ? (
                  <div className="space-y-3 rounded-lg border border-[#1a1a1a]/10 bg-white/30 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8b1e3f]">Entrega</p>
                    <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                      <span>Dirección de entrega *</span>
                      <Input required value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número, referencia" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f]" />
                    </label>
                    <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                      <span>Tipo de entrega *</span>
                      <select required value={form.tipoEntrega} onChange={(e) => setForm({ ...form, tipoEntrega: e.target.value })} className="h-9 w-full rounded-md border border-[#1a1a1a]/20 bg-white/70 px-2 text-sm text-[#1a1a1a] focus:border-[#2d6a4f]">
                        <option value="raciones">En raciones (envases del comercio)</option>
                        <option value="bruto">En bruto (contenedores grandes)</option>
                        <option value="raciones_cliente">En raciones (envases del cliente)</option>
                      </select>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-[#1a1a1a]/10 bg-white/30 p-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#8b1e3f]">Exclusividad del local</p>
                    <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                      <span>¿Qué parte del local necesitas?</span>
                      <select required value={form.exclusividad} onChange={(e) => setForm({ ...form, exclusividad: e.target.value })} className="h-9 w-full rounded-md border border-[#1a1a1a]/20 bg-white/70 px-2 text-sm text-[#1a1a1a] focus:border-[#2d6a4f]">
                        <option value="parcial">Parte del local</option>
                        <option value="entero">Local entero (exclusivo)</option>
                      </select>
                    </label>
                  </div>
                )}

                {/* BLOQUE 3: Extras */}
                <div className="space-y-3 rounded-lg border border-[#1a1a1a]/10 bg-white/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8b1e3f]">Extras</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex items-center gap-2 text-xs text-[#1a1a1a]/80">
                      <input type="checkbox" checked={form.camareros} onChange={(e) => setForm({ ...form, camareros: e.target.checked })} className="h-4 w-4 accent-[#8b1e3f]" />
                      Camareros
                    </label>
                    {modo === 'catering' && (
                      <>
                        <label className="flex items-center gap-2 text-xs text-[#1a1a1a]/80">
                          <input type="checkbox" checked={form.vajilla} onChange={(e) => setForm({ ...form, vajilla: e.target.checked })} className="h-4 w-4 accent-[#8b1e3f]" />
                          Vajilla
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#1a1a1a]/80">
                          <input type="checkbox" checked={form.cuberteria} onChange={(e) => setForm({ ...form, cuberteria: e.target.checked })} className="h-4 w-4 accent-[#8b1e3f]" />
                          Cubertería
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#1a1a1a]/80">
                          <input type="checkbox" checked={form.manteleria} onChange={(e) => setForm({ ...form, manteleria: e.target.checked })} className="h-4 w-4 accent-[#8b1e3f]" />
                          Mantelería
                        </label>
                      </>
                    )}
                  </div>

                  {form.camareros && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                        <span>Cantidad de camareros</span>
                        <Input type="number" min={1} value={form.cantidadCamareros} onChange={(e) => setForm({ ...form, cantidadCamareros: e.target.value })} className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a]" />
                      </label>
                      <label className="space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                        <span>Horas de servicio</span>
                        <select value={form.horasCamareros} onChange={(e) => setForm({ ...form, horasCamareros: e.target.value })} className="h-9 w-full rounded-md border border-[#1a1a1a]/20 bg-white/70 px-2 text-sm text-[#1a1a1a]">
                          <option value="2">2 horas</option>
                          <option value="3">3 horas</option>
                          <option value="4">4 horas</option>
                          <option value="6">6 horas</option>
                          <option value="8">8 horas</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>

                {/* BLOQUE 4: Menú y notas */}
                <div className="space-y-4">
                  <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Menú deseado (opcional)</span>
                    <Textarea rows={2} value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} placeholder="Describe el menú que tienes en mente" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f] resize-none" />
                  </label>
                  <label className="block space-y-1 text-xs font-medium text-[#1a1a1a]/70">
                    <span>Notas (alergias, requerimientos especiales)</span>
                    <Textarea rows={3} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="¿Qué necesidades especiales debemos conocer?" className="border-[#1a1a1a]/20 bg-white/70 text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:border-[#2d6a4f] resize-none" />
                  </label>
                </div>

                <Button type="submit" disabled={enviando} className="w-full rounded-xl bg-[#8b1e3f] py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#a82450]">
                  {enviando ? 'Enviando...' : '🔱 Solicitar cotización'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}