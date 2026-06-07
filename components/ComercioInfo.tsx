'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { MapPin, Phone, Star, CheckCircle, Clock, AlertCircle, X, Plus, Trash2, Globe2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Sucursal {
  id: string
  direccion: string
  telefono: string
  horario: string
  lat: number
  lng: number
}

interface RedSocial {
  id: 'facebook' | 'instagram' | 'twitter' | 'website'
  activa: boolean
  url: string
  label: string
  icon: React.ReactNode
}

interface ComercioInfoProps {
  comercioId: string
  comercioNombre: string
  mode?: 'public' | 'admin'
  onClose?: () => void
  direccionInicial?: string
  telefonoInicial?: string
  descripcionInicial?: string
}

interface Comentario {
  id: string
  nombre: string
  comentario: string
  fecha: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
}

export function ComercioInfo({ 
  comercioId, 
  comercioNombre,
  mode = 'public',
  onClose,
  direccionInicial = "Calle Principal 123, Quito, Ecuador",
  telefonoInicial = "+593 99 999 9999",
  descripcionInicial = ""
}: ComercioInfoProps) {
  const isAdmin = mode === 'admin'
  
  const [descripcion, setDescripcion] = useState(descripcionInicial || `Bienvenido a ${comercioNombre}.`)
  const [telefono, setTelefono] = useState(telefonoInicial)
  const [email, setEmail] = useState('')
  const [cuñaPublicitaria, setCuñaPublicitaria] = useState('')
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [editandoSucursal, setEditandoSucursal] = useState<string | null>(null)
  
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([
    { id: 'facebook', activa: false, url: '', label: 'Facebook', icon: <span className="h-4 w-4">F</span> },
    { id: 'instagram', activa: false, url: '', label: 'Instagram', icon: <span className="h-4 w-4">I</span> },
    { id: 'twitter', activa: false, url: '', label: 'Twitter', icon: <span className="h-4 w-4">T</span> },
    { id: 'website', activa: false, url: '', label: 'Sitio Web', icon: <Globe2 className="h-4 w-4" /> },
  ])
  
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  
  useEffect(() => {
    const saved = localStorage.getItem(`comercio_info_${comercioId}`)
    if (saved) {
      const data = JSON.parse(saved)
      setDescripcion(data.descripcion || descripcionInicial)
      setTelefono(data.telefono || telefonoInicial)
      setEmail(data.email || '')
      setCuñaPublicitaria(data.cuñaPublicitaria || '')
      setSucursales(data.sucursales || [])
      setRedesSociales(data.redesSociales || redesSociales)
      setComentarios(data.comentarios || [])
    } else {
      setSucursales([{
        id: Date.now().toString(),
        direccion: direccionInicial,
        telefono: telefonoInicial,
        horario: 'Lun-Dom: 08:00 - 22:00',
        lat: -0.180653,
        lng: -78.467838
      }])
    }
  }, [comercioId])
  
  const guardarInfo = () => {
    const data = { descripcion, telefono, email, cuñaPublicitaria, sucursales, redesSociales, comentarios }
    localStorage.setItem(`comercio_info_${comercioId}`, JSON.stringify(data))
    if (onClose) onClose()
  }
  
  const agregarSucursal = () => {
    setSucursales([...sucursales, {
      id: Date.now().toString(),
      direccion: '',
      telefono: '',
      horario: 'Lun-Dom: 08:00 - 22:00',
      lat: 0,
      lng: 0
    }])
    setEditandoSucursal(Date.now().toString())
  }
  
  const eliminarSucursal = (id: string) => {
    setSucursales(sucursales.filter(s => s.id !== id))
  }
  
  const actualizarSucursal = (id: string, campo: keyof Sucursal, valor: any) => {
    setSucursales(sucursales.map(s => s.id === id ? { ...s, [campo]: valor } : s))
  }
  
  const agregarComentario = () => {
    if (!nuevoComentario.trim() || !nuevoNombre.trim()) return
    const nuevo: Comentario = {
      id: Date.now().toString(),
      nombre: nuevoNombre,
      comentario: nuevoComentario,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    }
    setComentarios([nuevo, ...comentarios])
    setNuevoComentario('')
    setNuevoNombre('')
  }
  
  const aprobarComentario = (id: string) => {
    setComentarios(comentarios.map(c => c.id === id ? { ...c, estado: 'aprobado' } : c))
  }
  
  const rechazarComentario = (id: string) => {
    setComentarios(comentarios.filter(c => c.id !== id))
  }
  
  const comentariosAprobados = comentarios.filter(c => c.estado === 'aprobado')
  
  // VISTA ADMIN
  if (isAdmin) {
    return (
      <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 sticky top-0 bg-gray-900">
          <h2 className="text-xl font-bold text-white">Información del Comercio</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">Cancelar</Button>
            <Button onClick={guardarInfo} className="bg-amber-600 hover:bg-amber-700 text-white">Guardar cambios</Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">📖 Descripción del negocio</label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe tu negocio..."
              className="bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">🎟️ Cuña publicitaria</label>
            <input
              type="text"
              value={cuñaPublicitaria}
              onChange={(e) => setCuñaPublicitaria(e.target.value)}
              placeholder="Ej: 'El sabor que une a las familias'"
              className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-200 flex items-center gap-2"><Phone className="h-4 w-4" /> Contacto principal</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Teléfono / WhatsApp</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+593 99 999 9999"
              className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email de contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-gray-200 flex items-center gap-2"><MapPin className="h-4 w-4" /> Sucursales</h3>
            <Button size="sm" variant="outline" onClick={agregarSucursal} className="border-amber-500 text-amber-400">
              <Plus className="h-3 w-3 mr-1" /> Añadir sucursal
            </Button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sucursales.map((suc, idx) => (
              <Card key={suc.id} className="p-3 bg-gray-800/30 border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-300">Sucursal {idx + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => eliminarSucursal(suc.id)} className="h-6 w-6 text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Dirección completa"
                    value={suc.direccion}
                    onChange={(e) => actualizarSucursal(suc.id, 'direccion', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono de la sucursal"
                    value={suc.telefono}
                    onChange={(e) => actualizarSucursal(suc.id, 'telefono', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Horario (ej: Lun-Dom 08:00-22:00)"
                    value={suc.horario}
                    onChange={(e) => actualizarSucursal(suc.id, 'horario', e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg text-sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-semibold text-gray-200 mb-3">🌐 Redes Sociales</h3>
          <div className="space-y-2">
            {redesSociales.map((red) => (
              <div key={red.id} className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg">
                <div className="w-8 flex justify-center text-gray-400">{red.icon}</div>
                <input
                  type="checkbox"
                  checked={red.activa}
                  onChange={(e) => setRedesSociales(redesSociales.map(r => r.id === red.id ? { ...r, activa: e.target.checked } : r))}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-300 w-20">{red.label}</span>
                <input
                  type="text"
                  placeholder={`URL de ${red.label}`}
                  value={red.url}
                  onChange={(e) => setRedesSociales(redesSociales.map(r => r.id === red.id ? { ...r, url: e.target.value } : r))}
                  disabled={!red.activa}
                  className="flex-1 bg-gray-800/50 border border-gray-700 text-white p-2 rounded-lg text-sm disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // VISTA PÚBLICA
  const sucursalPrincipal = sucursales[0] || { direccion: direccionInicial, telefono: telefonoInicial }
  
  return (
    <div className="mt-0 border-t border-border pt-4 mb-20">
      <div className="container mx-auto px-3">
        <div className="mb-3">
          <h2 className="text-base font-bold text-primary">{comercioNombre}</h2>
          {cuñaPublicitaria && <p className="text-[10px] text-muted-foreground italic mt-0.5">"{cuñaPublicitaria}"</p>}
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold flex items-center gap-2 mb-2"><MapPin className="h-3.5 w-3.5 text-primary" /> Ubicación</h3>
            <p className="text-xs text-muted-foreground mb-2">{sucursalPrincipal.direccion}</p>
            <div className="w-full h-36 bg-gray-200 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-2xl">📍</div>
            </div>
          </div>
          
          {descripcion && (
            <div>
              <h3 className="text-xs font-semibold mb-1">📖 Sobre Nosotros</h3>
              <p className="text-xs text-muted-foreground italic">{descripcion}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-xs font-semibold flex items-center gap-2 mb-2"><Phone className="h-3.5 w-3.5 text-primary" /> Contacto</h3>
            <div className="flex gap-3">
              <a href={`tel:${telefono}`} className="text-xs text-primary hover:underline">📞 {telefono}</a>
              <a href={`https://wa.me/${telefono.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">💬 WhatsApp</a>
              {email && <a href={`mailto:${email}`} className="text-xs text-primary hover:underline">📧 {email}</a>}
            </div>
          </div>
          
          {comentariosAprobados.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold flex items-center gap-2 mb-2"><Star className="h-3.5 w-3.5 text-yellow-500" /> Opiniones</h3>
              {comentariosAprobados.map((c) => (
                <Card key={c.id} className="p-2 bg-gray-800/20 border-gray-700 mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-xs text-gray-300">{c.nombre}</span>
                    <span className="text-[10px] text-gray-500">{new Date(c.fecha).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{c.comentario}</p>
                </Card>
              ))}
            </div>
          )}
          
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700">
            <p className="text-[11px] font-medium text-gray-300 mb-2 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Tu opinión es muy importante...
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Tu nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full bg-gray-800/70 border border-gray-600 text-white text-xs p-2 rounded-lg"
              />
              <textarea
                placeholder="Escribe aquí tu comentario..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                rows={2}
                className="w-full bg-gray-800/70 border border-gray-600 rounded-lg p-2 text-white text-xs resize-none"
              />
              <Button onClick={agregarComentario} className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                Enviar opinión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

