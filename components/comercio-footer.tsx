'use client'

import { useEffect, useState } from 'react'
import { Phone, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ComercioFooterProps {
  comercioId: string
  comercioNombre: string
  direccionInicial?: string
  telefonoInicial?: string
}

interface RedSocial {
  id: 'facebook' | 'instagram' | 'twitter' | 'website'
  activa: boolean
  url: string
  label: string
  icon: string
}

export function ComercioFooter({
  comercioId,
  comercioNombre,
  direccionInicial = '',
  telefonoInicial = '',
}: ComercioFooterProps) {
  const [telefono, setTelefono] = useState(telefonoInicial)
  const [direccion, setDireccion] = useState(direccionInicial)
  const [redes, setRedes] = useState<RedSocial[]>([])

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('comercio_info')
        .select('telefono, direccion, redes_sociales')
        .eq('comercio_id', comercioId)
        .maybeSingle()

      if (data) {
        if (data.telefono) setTelefono(data.telefono)
        if (data.direccion) setDireccion(data.direccion)
        if (Array.isArray(data.redes_sociales)) {
          setRedes(data.redes_sociales.filter((r: RedSocial) => r.activa && r.url))
        }
      }
    }
    cargar()
  }, [comercioId])

    return (
  <footer className="mt-6 border-t border-white/10 pt-6 pb-8 text-sm text-white/60">
    <div className="flex flex-col items-center gap-2 text-center">
      {direccion && (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{direccion}</span>
        </div>
      )}

      {telefono && (
        <a
          href={`tel:${telefono}`}
          className="flex items-center gap-2 hover:text-white transition"
        >
          <Phone className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{telefono}</span>
        </a>
      )}

      {telefono && (
        <a
          href={`https://wa.me/${telefono.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition mt-1"
        >
          <span className="text-base">💬</span> Escribir por WhatsApp
        </a>
      )}

      {redes.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          {redes.map((red) => (
            <a
              key={red.id}
              href={red.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-300 hover:text-amber-200 underline"
            >
              {red.label}
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 text-[10px] text-white/30">
        <p>· Pedidos gestionados por {comercioNombre} ·</p>
        <p className="mt-0.5">🔱 OneToOne.app</p>
      </div>
    </div>
  </footer>
)
}