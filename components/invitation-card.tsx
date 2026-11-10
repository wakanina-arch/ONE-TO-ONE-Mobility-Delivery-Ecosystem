'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StyledQR } from '@/components/styled-qr'

interface InvitationCardProps {
  evento: {
    nombre: string
    tipo: string
    fecha: string
    hora: string
    comensales: number
    menu: string
    direccion: string
    lat: number | null
    lng: number | null
    mesa: number
  }
  comercio: {
    nombre: string
    logoUrl: string | null
  }
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

export function InvitationCard({ evento, comercio, onClose }: InvitationCardProps) {
  const [shareError, setShareError] = useState('')
  const address = evento.direccion || comercio.nombre
  const hasCoordinates = Number.isFinite(evento.lat) && Number.isFinite(evento.lng)
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${evento.lat},${evento.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  const tableQrValue = `MESA-${evento.mesa}`
  const shareText = [
    `Estás invitado a ${evento.tipo.toLowerCase()}${evento.nombre ? ` de ${evento.nombre}` : ''}.`,
    `${formatDate(evento.fecha)} a las ${evento.hora}.`,
    `Lugar: ${address}.`,
    `${evento.comensales} invitados.`,
    `Confirmación de mesa: ${tableQrValue}.`,
    mapsUrl,
  ].join(' ')

  const handleShare = async () => {
    setShareError('')
    if (navigator.share) {
      try {
        await navigator.share({ title: `Invitación: ${evento.tipo}`, text: shareText })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
        console.error('No se pudo compartir la invitación con el menú del dispositivo.', error)
      }
    }

    const whatsappWindow = window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
    if (!whatsappWindow) {
      setShareError('No se pudo abrir WhatsApp. Comprueba los bloqueadores de ventanas emergentes.')
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d0e] px-4 py-8 text-white sm:py-12">
      <article className="invitation-card-print mx-auto max-w-3xl rounded-[2rem] border border-amber-300/50 bg-gradient-to-br from-[#211a10] via-[#121111] to-[#0b0d0e] p-6 shadow-2xl shadow-amber-950/30 sm:p-12">
        <div className="rounded-[1.5rem] border border-amber-300/25 p-6 text-center sm:p-10">
          {comercio.logoUrl ? (
            <img
              src={comercio.logoUrl}
              alt={`Logo de ${comercio.nombre}`}
              className="mx-auto mb-5 h-20 w-20 rounded-full border border-amber-300/40 object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 font-serif text-2xl text-amber-200"
            >
              {comercio.nombre.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">{comercio.nombre}</p>
          <h1 className="mt-5 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            Estás invitado a {evento.tipo.toLowerCase()}
          </h1>
          {evento.nombre && (
            <p className="mt-3 font-serif text-xl text-amber-100">{evento.nombre}</p>
          )}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65">
            Nos encantará compartir contigo este momento especial.
          </p>

          <div className="mx-auto my-8 h-px max-w-xs bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />

          <dl className="grid gap-5 text-left sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-amber-200/65">Fecha</dt>
              <dd className="mt-1 font-serif text-xl">{formatDate(evento.fecha)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-amber-200/65">Hora</dt>
              <dd className="mt-1 font-serif text-xl">{evento.hora}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-amber-200/65">Lugar</dt>
              <dd className="mt-1 text-base">{address}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-amber-200/65">Comensales</dt>
              <dd className="mt-1 text-base">{evento.comensales} personas</dd>
            </div>
            {evento.menu && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-widest text-amber-200/65">Menú</dt>
                <dd className="mt-1 text-base">{evento.menu}</dd>
              </div>
            )}
          </dl>

          <div className="mt-9 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl bg-white p-2">
                <StyledQR value={tableQrValue} size={112} logoUrl={comercio.logoUrl || undefined} />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/65">
                Confirmación de mesa · Nro. {evento.mesa}
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl bg-white p-2">
                <StyledQR value={mapsUrl} size={112} logoUrl={comercio.logoUrl || undefined} />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/65">Cómo llegar</p>
            </div>
          </div>
        </div>
      </article>

      <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row print:hidden">
        <Button
          type="button"
          onClick={() => window.print()}
          variant="outline"
          className="flex-1 border-amber-300/40 text-amber-100 hover:bg-amber-300/10 hover:text-white"
        >
          Imprimir
        </Button>
        <Button
          type="button"
          onClick={() => void handleShare()}
          className="flex-1 bg-amber-500 text-black hover:bg-amber-400"
        >
          Compartir por WhatsApp
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          className="text-white/70 hover:bg-white/10 hover:text-white"
        >
          Cerrar
        </Button>
      </div>
      {shareError && (
        <p role="status" className="mx-auto mt-3 max-w-3xl text-sm text-white/60 print:hidden">
          {shareError}
        </p>
      )}
    </main>
  )
}
