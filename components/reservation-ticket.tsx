'use client'

import { Button } from '@/components/ui/button'
import { StyledQR } from '@/components/styled-qr'

interface ReservationTicketProps {
  reserva: {
    nombre: string
    fecha: string
    hora: string
    comensales: number
    menu: string
    mesa: number
  }
  comercio: string
  logoUrl?: string | null
  onClose: () => void
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function ReservationTicket({ reserva, comercio, logoUrl, onClose }: ReservationTicketProps) {
  const qrValue = `MESA-${reserva.mesa}`

  return (
    <main className="min-h-screen bg-[#0b0d0e] px-4 py-10 text-white">
      <article className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-br from-[#211a10] via-[#111111] to-[#0b0d0e] shadow-2xl shadow-amber-950/30">
        <div className="border-b border-dashed border-amber-300/30 px-6 py-8 text-center sm:px-10">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">{comercio}</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold">Tu reserva está lista</h1>
          <p className="mt-2 text-sm text-white/60">Te esperamos con mucho gusto, {reserva.nombre}.</p>
        </div>

        <div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <dl className="space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/45">Fecha</dt>
              <dd className="mt-1 font-serif text-xl">{formatDate(reserva.fecha)}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/45">Hora</dt>
                <dd className="mt-1 text-lg">{reserva.hora}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/45">Comensales</dt>
                <dd className="mt-1 text-lg">{reserva.comensales}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/45">Menú</dt>
              <dd className="mt-1 text-base">{reserva.menu || 'Menú del día'}</dd>
            </div>
          </dl>

          <div className="justify-self-center rounded-2xl border border-amber-300/30 bg-white p-3">
            <StyledQR value={qrValue} size={132} logoUrl={logoUrl || undefined} />
            <p className="mt-2 text-center font-mono text-xs text-black">{qrValue}</p>
          </div>
        </div>

        <div className="mx-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-5 text-center sm:mx-10">
          <p className="font-serif text-xl text-amber-100">Nro. de Mesa: {reserva.mesa}</p>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Si no puedes venir, avísanos con 2 horas de antelación. Si no, tu mesa se libera.
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-amber-500 text-black hover:bg-amber-400"
          >
            Cerrar
          </Button>
        </div>
      </article>
    </main>
  )
}
