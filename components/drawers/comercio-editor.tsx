'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus, Camera, ChevronDown, ChevronRight, Trash2, Tag, Save, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIAS = ['Desayunos', 'Almuerzos', 'Especiales', 'Postres', 'Bebidas']
const EVENTOS_PROMO = ['Día de la Madre', 'Día del Padre', 'Navidad', '2x1', 'Vacaciones', 'Día del Amor']

interface Plato {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  enOferta?: boolean
  descuento?: number
  promo?: string
  eliminado?: boolean
}

interface CategoriaMenu {
  nombre: string
  opciones: Plato[]
}

interface ComercioEditorProps {
  open: boolean
  onClose: () => void
  comercioId: string
  onSave?: (items: CategoriaMenu[]) => void
}

export function ComercioEditor({ open, onClose, comercioId, onSave }: ComercioEditorProps) {
  const [items, setItems] = useState<CategoriaMenu[]>([])
  const [expandidas, setExpandidas] = useState<Record<number, boolean>>({})
  const [modalOferta, setModalOferta] = useState<{ catIdx: number; optIdx: number } | null>(null)
  const [ofertaData, setOfertaData] = useState({ descuento: '', promo: 'Día de la Madre' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const menuGuardado = localStorage.getItem(`menu_${comercioId}`)
    if (menuGuardado) {
      setItems(JSON.parse(menuGuardado))
    } else {
      const categoriasVacias = CATEGORIAS.map(cat => ({ nombre: cat, opciones: [] }))
      setItems(categoriasVacias)
    }
  }, [open, comercioId])

  if (!open) return null

  const addPlato = (catIdx: number) => {
    const nuevos = [...items]
    nuevos[catIdx].opciones.push({
      id: Date.now().toString(),
      nombre: '',
      descripcion: '',
      precio: 0,
      imagen: '',
      enOferta: false,
      eliminado: false
    })
    setItems(nuevos)
    setExpandidas({ ...expandidas, [catIdx]: true })
  }

  const updatePlato = (catIdx: number, optIdx: number, campo: keyof Plato, valor: any) => {
    const nuevos = [...items]
    nuevos[catIdx].opciones[optIdx] = { ...nuevos[catIdx].opciones[optIdx], [campo]: valor }
    setItems(nuevos)
  }

  const toggleDeletePlato = (catIdx: number, optIdx: number) => {
    const nuevos = [...items]
    nuevos[catIdx].opciones[optIdx].eliminado = !nuevos[catIdx].opciones[optIdx].eliminado
    setItems(nuevos)
  }

  const aplicarOferta = () => {
    if (!modalOferta) return
    const { catIdx, optIdx } = modalOferta
    const desc = parseFloat(ofertaData.descuento)
    if (isNaN(desc) || desc <= 0) return
    updatePlato(catIdx, optIdx, 'enOferta', true)
    updatePlato(catIdx, optIdx, 'descuento', desc)
    updatePlato(catIdx, optIdx, 'promo', ofertaData.promo)
    setModalOferta(null)
    setOfertaData({ descuento: '', promo: 'Día de la Madre' })
  }

  const eliminarOferta = (catIdx: number, optIdx: number) => {
    updatePlato(catIdx, optIdx, 'enOferta', false)
    updatePlato(catIdx, optIdx, 'descuento', undefined)
    updatePlato(catIdx, optIdx, 'promo', undefined)
  }

  const guardarCambios = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`menu_${comercioId}`, JSON.stringify(items))
      if (onSave) onSave(items)
      if (onClose) onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header compacto */}
      <div className="border-b border-gray-700 pb-2">
  <div className="flex items-center gap-2 mb-2">
    <span className="text-primary text-lg">🔱</span>
    <h2 className="text-sm font-bold text-white">Gestión de producción</h2>
  </div>
  <div className="flex justify-center gap-3">
    <Button variant="outline" onClick={onClose} className="h-6 text-xs border-gray-600 text-gray-300">Cancelar</Button>
    <Button onClick={guardarCambios} disabled={saving} className="h-6 text-xs bg-olive-600 hover:bg-olive-700 text-white">
      <Save className="h-3 w-3 mr-1" /> {saving ? 'Guardando...' : 'Guardar'}
    </Button>
  </div>
</div>

      {/* Categorías acordeón */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((cat, catIdx) => (
          <div key={cat.nombre} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/30">
            <button
              onClick={() => setExpandidas({ ...expandidas, [catIdx]: !expandidas[catIdx] })}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <span className="font-medium text-gray-200 text-sm">{cat.nombre}</span>
              {expandidas[catIdx] ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            </button>
            
            {expandidas[catIdx] && (
              <div className="p-2 space-y-2">
                {cat.opciones.length === 0 && (
                  <div className="text-center py-3 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/20">
                    <p className="text-xs text-gray-400">No hay productos en {cat.nombre.toLowerCase()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Haz clic en "Añadir plato" para comenzar</p>
                  </div>
                )}
                
                {cat.opciones.map((plato, optIdx) => (
                  !plato.eliminado && (
                    <div key={plato.id} className="border border-gray-700 rounded-lg p-2 space-y-2 bg-gray-800/20">
                      {/* Nombre */}
                      <div>
                        <label className="text-[10px] font-medium text-gray-400">Nombre del plato</label>
                        <Input
                          placeholder="Ej: Ceviche de Camarón"
                          value={plato.nombre}
                          onChange={(e) => updatePlato(catIdx, optIdx, 'nombre', e.target.value)}
                          className="mt-0.5 h-7 text-xs bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                      
                      {/* Descripción */}
                      <div>
                        <label className="text-[10px] font-medium text-gray-400">Descripción</label>
                        <Textarea
                          placeholder="Describe los ingredientes y preparación"
                          value={plato.descripcion}
                          onChange={(e) => updatePlato(catIdx, optIdx, 'descripcion', e.target.value)}
                          rows={2}
                          className="mt-0.5 h-14 text-xs bg-gray-800/50 border-gray-700 text-white resize-none"
                        />
                      </div>
                      
                      {/* Imagen - selector de archivos */}
<div>
  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
    <ImageIcon className="h-3 w-3" /> Imagen del plato
  </label>
  
  {plato.imagen ? (
  <div className="mt-1 flex items-start gap-4">
    {/* Contenedor de la imagen */}
    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex-shrink-0">
      <img 
        src={plato.imagen} 
        alt="preview" 
        className="w-full h-full object-contain"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = 'w-full h-full flex items-center justify-center text-gray-500 text-lg';
            fallback.innerHTML = '📷';
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
    
    {/* ✕ fuera de la imagen, con más separación */}
    <button
      type="button"
      onClick={() => updatePlato(catIdx, optIdx, 'imagen', '')}
      className="mt-12 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
    >
      ✕
    </button>
  </div>
) : (
  
  
    <label className="flex flex-col items-center justify-center py-3 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer mt-1 hover:border-olive-500 bg-gray-800/30 transition-colors">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith('image/')) {
            alert('Solo se permiten imágenes');
            return;
          }
          if (file.size > 2 * 1024 * 1024) {
            alert('La imagen no puede superar los 2MB');
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            updatePlato(catIdx, optIdx, 'imagen', base64);
          };
          reader.readAsDataURL(file);
        }}
      />
      <Camera className="h-5 w-5 mb-1 text-gray-400" />
      <span className="text-[9px] text-gray-400">Seleccionar imagen</span>
      <span className="text-[8px] text-gray-500">JPG, PNG · Máx 2MB</span>
    </label>
  )}
</div>
                      
                      {/* Precio y Oferta */}
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-[10px] font-medium text-gray-400">Precio ($)</label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={plato.precio || ''}
                            onChange={(e) => updatePlato(catIdx, optIdx, 'precio', parseFloat(e.target.value))}
                            className="mt-0.5 h-7 text-xs bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-gray-400 invisible">Oferta</label>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setModalOferta({ catIdx, optIdx })}
                            className="h-7 text-[10px] border-olive-500 text-olive-400 hover:bg-olive-500/20"
                          >
                            <Tag className="h-3 w-3 mr-1" /> Oferta
                          </Button>
                        </div>
                      </div>
                      
                      {/* Badge oferta */}
                      {plato.enOferta && (
                        <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-1.5 border border-yellow-500/30">
                          <span className="text-[10px] text-yellow-400 font-medium">
                            🔥 -{plato.descuento}% {plato.promo}
                          </span>
                          <button
                            onClick={() => eliminarOferta(catIdx, optIdx)}
                            className="text-[10px] text-red-400 hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                      
                      {/* Botón eliminar */}
                      <div className="flex justify-end pt-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleDeletePlato(catIdx, optIdx)}
                          className="text-red-400 hover:text-red-300 text-[10px] h-6 px-2"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Eliminar plato
                        </Button>
                      </div>
                    </div>
                  )
                ))}
                
                <Button variant="outline" size="sm" className="w-full border-dashed border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 text-xs h-7" onClick={() => addPlato(catIdx)}>
                  <Plus className="h-3 w-3 mr-1" /> Añadir plato
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Oferta */}
      {modalOferta && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-4 w-72 border border-gray-700">
            <h3 className="font-semibold mb-3 text-center text-gray-200 text-sm">🏷️ Configurar Oferta</h3>
            <label className="text-[10px] font-medium text-gray-400 block mb-1">Evento:</label>
            <select
              className="w-full border border-gray-700 rounded-lg px-2 py-1.5 mb-2 bg-gray-800 text-white text-xs"
              value={ofertaData.promo}
              onChange={(e) => setOfertaData({ ...ofertaData, promo: e.target.value })}
            >
              {EVENTOS_PROMO.map(ev => <option key={ev}>{ev}</option>)}
            </select>
            <label className="text-[10px] font-medium text-gray-400 block mb-1">Descuento (%):</label>
            <input
              type="number"
              placeholder="Ej: 20"
              className="w-full border border-gray-700 rounded-lg px-2 py-1.5 mb-3 bg-gray-800 text-white text-xs"
              value={ofertaData.descuento}
              onChange={(e) => setOfertaData({ ...ofertaData, descuento: e.target.value })}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-7 text-xs border-gray-600 text-gray-300" onClick={() => setModalOferta(null)}>Cancelar</Button>
              <Button className="flex-1 h-7 text-xs bg-olive-600 hover:bg-olive-700 text-white" onClick={aplicarOferta}>Aplicar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
