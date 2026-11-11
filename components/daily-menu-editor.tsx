'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, X, Save, Tag, Camera } from 'lucide-react'
interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
}

interface DailyMenu {
  id: string
  merchant_id: string
  product_id: string
  title: string
  description: string | null
  offer_price: number | null
  tapiz: string | null
  valid_from: string | null
  valid_until: string | null
  active: boolean
  created_at: string
  products?: { name: string; price: number }
}

interface DailyMenuEditorProps {
  merchantId: string
}

const TAPICES = [
  'Cotopaxi', 'Chimborazo', 'Quilotoa', 'Andes', 'Amazonía', 'Costa',
  'Diablada', 'Inti Raymi', 'Mama Negra', 'Semana Santa', 'Día de los Difuntos', 'Carnaval'
]

export function DailyMenuEditor({ merchantId }: DailyMenuEditorProps) {
  const [productos, setProductos] = useState<Product[]>([])
  const [menus, setMenus] = useState<DailyMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulario
  const [tipo, setTipo] = useState<'menu' | 'especial' | 'promo'>('menu')
  const [productId, setProductId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [tapiz, setTapiz] = useState(TAPICES[0])
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [active, setActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')

  const cargarDatos = async () => {
    setLoading(true)
    const supabase = createClient()

    const [productosRes, menusRes] = await Promise.all([
      supabase.from('products').select('id, name, price, image_url').eq('merchant_id', merchantId).order('name'),
      supabase.from('daily_menus').select('*, products(name, price)').eq('merchant_id', merchantId).order('created_at', { ascending: false })
    ])

    if (productosRes.data) setProductos(productosRes.data)
    if (menusRes.data) setMenus(menusRes.data)
    setLoading(false)
  }

  useEffect(() => {
    if (merchantId) cargarDatos()
  }, [merchantId])

  const resetForm = () => {
    setTipo('menu')
    setProductId('')
    setTitle('')
    setDescription('')
    setOfferPrice('')
    setTapiz(TAPICES[0])
    setValidFrom('')
    setValidUntil('')
    setActive(true)
    setImageUrl('')
    setShowForm(false)
  }

  const guardarMenu = async () => {
    if (!title.trim()) {
      alert('Escribe el nombre del menú (Ej: Encebollado y Seco)')
      return
    }
    if (!imageUrl) {
      alert('Sube una foto para el menú')
      return
    }

    const tituloFinal = title.trim()

    setSaving(true)
    const supabase = createClient()

    if (active) {
      await supabase.from('daily_menus').update({ active: false }).eq('merchant_id', merchantId)
    }

    const { error } = await supabase.from('daily_menus').insert({
      merchant_id: merchantId,
      title: tituloFinal,
      description: description.trim() || null,
      offer_price: offerPrice ? parseFloat(offerPrice) : null,
      tapiz,
      image_url: imageUrl,
      valid_from: validFrom || null,
      valid_until: validUntil || null,
      active,
    })

    setSaving(false)

    if (error) {
      console.error('Error guardando menú:', error)
      alert('Error guardando el menú: ' + error.message)
      return
    }

    resetForm()
    await cargarDatos()
  }

  const activarMenu = async (id: string) => {
    const supabase = createClient()
    // Desactivar todos y activar el seleccionado
    await supabase.from('daily_menus').update({ active: false }).eq('merchant_id', merchantId)
    await supabase.from('daily_menus').update({ active: true }).eq('id', id)
    cargarDatos()
  }

  const eliminarMenu = async (id: string) => {
    if (!confirm('¿Eliminar este menú?')) return
    const supabase = createClient()
    await supabase.from('daily_menus').delete().eq('id', id)
    cargarDatos()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
  }

  return (
    <div className="space-y-3">
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-olive-600 hover:bg-olive-700 text-white text-sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Crear nuevo menú del día
        </Button>
      )}

      {showForm && (
        <Card className="p-4 bg-gray-800/50 border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Nuevo menú</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tipo */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full mt-0.5 h-8 text-xs bg-gray-800/50 border border-gray-700 rounded text-white px-2"
            >
              <option value="menu">Menú del día</option>
              <option value="especial">Plato especial</option>
              <option value="promo">Promoción</option>
            </select>
          </div>

                    {/* Título del menú */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Nombre del menú *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Encebollado y Seco"
              className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Foto del menú */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Foto del menú *</label>
            {imageUrl ? (
              <div className="mt-1 flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex-shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="mt-6 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
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
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const supabase = createClient()
                      const ext = file.name.split('.').pop() || 'jpg'
                      const fileName = `menu-${Date.now()}.${ext}`
                      const { error } = await supabase.storage.from('products').upload(fileName, file)
                      if (error) { alert('Error: ' + error.message); return }
                      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
                      setImageUrl(data.publicUrl)
                    } catch (err) { alert('Error subiendo la imagen') }
                  }}
                />
                <Camera className="h-5 w-5 mb-1 text-gray-400" />
                <span className="text-[9px] text-gray-400">Seleccionar imagen</span>
                <span className="text-[8px] text-gray-500">JPG, PNG · Máx 2MB</span>
              </label>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Descripción (opcional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Ceviche + bebida + postre"
              rows={2}
              className="mt-0.5 text-xs bg-gray-800/50 border-gray-700 text-white resize-none"
            />
          </div>

          {/* Precio oferta */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Precio de oferta ($)</label>
            <Input
              type="number"
              step="0.01"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="0.00"
              className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Tapiz */}
          <div>
            <label className="text-[10px] font-medium text-gray-400">Tapiz (fondo)</label>
            <select
              value={tapiz}
              onChange={(e) => setTapiz(e.target.value)}
              className="w-full mt-0.5 h-8 text-xs bg-gray-800/50 border border-gray-700 rounded text-white px-2"
            >
              {TAPICES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-400">Válido desde</label>
              <Input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-400">Válido hasta</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Activo */}
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-olive-500 w-3 h-3"
            />
            Publicar en la landing (desactivar otros menús)
          </label>

          <Button
            onClick={guardarMenu}
            disabled={saving}
            className="w-full bg-olive-600 hover:bg-olive-700 text-white text-sm"
          >
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Guardando...' : 'Guardar menú'}
          </Button>
        </Card>
      )}

      {/* Lista de menús */}
      <div className="space-y-2">
        {menus.length === 0 && (
          <div className="p-4 text-center text-gray-400 text-sm">
            <p>No hay menús del día todavía.</p>
            <p className="text-xs mt-1">Crea el primero con el botón de arriba.</p>
          </div>
        )}

        {menus.map((menu) => (
          <Card key={menu.id} className={`p-3 border ${menu.active ? 'border-olive-500 bg-olive-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-amber-400 shrink-0" />
                  <h4 className="text-sm font-bold text-white truncate">{menu.title}</h4>
                  {menu.active && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-olive-600 text-white">Activo</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {menu.products?.name || 'Plato'} ·{' '}
                  {menu.offer_price ? `$${menu.offer_price.toFixed(2)}` : `$${menu.products?.price.toFixed(2) || '—'}`}
                </p>
                {menu.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{menu.description}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-0.5">Tapiz: {menu.tapiz}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!menu.active && (
                  <button
                    onClick={() => activarMenu(menu.id)}
                    className="text-[10px] text-olive-400 hover:text-olive-300"
                  >
                    Activar
                  </button>
                )}
                <button
                  onClick={() => eliminarMenu(menu.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}