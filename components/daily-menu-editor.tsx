'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, X, Save, Tag, Camera, Pencil } from 'lucide-react'

type MenuType = 'menu' | 'especial' | 'promo'

interface DailyMenu {
  id: string
  merchant_id: string
  title: string
  description: string | null
  offer_price: number | null
  image_url: string | null
  valid_from: string | null
  valid_until: string | null
  active: boolean
  created_at: string
  tipo?: MenuType | null
  products?: { name: string; price: number }
}

interface DailyMenuEditorProps {
  merchantId: string
}

export function DailyMenuEditor({ merchantId }: DailyMenuEditorProps) {
  const [menus, setMenus] = useState<DailyMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [tipo, setTipo] = useState<MenuType>('menu')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [active, setActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const consultarMenus = useCallback(async () => {
    const supabase = createClient()
    return supabase
      .from('daily_menus')
      .select('*, products(name, price)')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
  }, [merchantId])

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await consultarMenus()
    if (error) {
      console.error('Error cargando menús:', error)
      alert('No se pudieron cargar los menús: ' + error.message)
    } else {
      setMenus(data || [])
    }
    setLoading(false)
  }, [consultarMenus])

  useEffect(() => {
    let active = true
    const cargarInicial = async () => {
      const { data, error } = await consultarMenus()
      if (!active) return
      if (error) {
        console.error('Error cargando menús:', error)
        alert('No se pudieron cargar los menús: ' + error.message)
      } else {
        setMenus(data || [])
      }
      setLoading(false)
    }
    void cargarInicial()
    return () => {
      active = false
    }
  }, [consultarMenus])

  const resetForm = () => {
    setEditingId(null)
    setTipo('menu')
    setTitle('')
    setDescription('')
    setOfferPrice('')
    setValidFrom('')
    setValidUntil('')
    setActive(true)
    setImageUrl('')
    setShowForm(false)
  }

  const iniciarEdicion = (menu: DailyMenu) => {
    setEditingId(menu.id)
    setTipo(menu.tipo || 'menu')
    setTitle(menu.title)
    setDescription(menu.description || '')
    setOfferPrice(menu.offer_price == null ? '' : String(menu.offer_price))
    setValidFrom(menu.valid_from || '')
    setValidUntil(menu.valid_until || '')
    setActive(menu.active)
    setImageUrl(menu.image_url || '')
    setShowForm(true)
  }

  const subirImagen = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar los 2 MB.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'img'
      const filePath = `daily-menu-${merchantId}-${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, { contentType: file.type })

      if (error) {
        console.error('Error subiendo imagen:', error)
        alert('No se pudo subir la imagen: ' + error.message)
        return
      }

      const { data } = supabase.storage.from('products').getPublicUrl(filePath)
      setImageUrl(data.publicUrl)
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      alert('No se pudo subir la imagen. Inténtalo de nuevo.')
    } finally {
      setUploading(false)
    }
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

    const parsedPrice = offerPrice.trim() ? Number(offerPrice) : null
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      alert('Escribe un precio válido igual o superior a cero.')
      return
    }

    const tituloFinal = title.trim()
    setSaving(true)
    const supabase = createClient()

    if (active) {
      let deactivateQuery = supabase
        .from('daily_menus')
        .update({ active: false })
        .eq('merchant_id', merchantId)
      if (editingId) deactivateQuery = deactivateQuery.neq('id', editingId)
      const { error: deactivateError } = await deactivateQuery
      if (deactivateError) {
        setSaving(false)
        console.error('Error desactivando otros menús:', deactivateError)
        alert('No se pudieron actualizar los menús activos: ' + deactivateError.message)
        return
      }
    }

    const menuData = {
      merchant_id: merchantId,
      title: tituloFinal,
      description: description.trim() || null,
      offer_price: parsedPrice,
      image_url: imageUrl,
      valid_from: validFrom || null,
      valid_until: validUntil || null,
      active,
      tipo: tipo,
    }

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from('daily_menus')
        .update(menuData)
        .eq('id', editingId)
        .eq('merchant_id', merchantId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('daily_menus')
        .insert(menuData)
      error = insertError
    }

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
    const { error: deactivateError } = await supabase
      .from('daily_menus')
      .update({ active: false })
      .eq('merchant_id', merchantId)
    if (deactivateError) {
      console.error('Error desactivando menús:', deactivateError)
      alert('No se pudieron actualizar los menús: ' + deactivateError.message)
      return
    }

    const { error } = await supabase
      .from('daily_menus')
      .update({ active: true })
      .eq('id', id)
      .eq('merchant_id', merchantId)
    if (error) {
      console.error('Error activando menú:', error)
      alert('No se pudo activar el menú: ' + error.message)
      return
    }
    await cargarDatos()
  }

  const eliminarMenu = async (id: string) => {
    if (!confirm('¿Eliminar este menú?')) return
    const supabase = createClient()
    const { error } = await supabase
      .from('daily_menus')
      .delete()
      .eq('id', id)
      .eq('merchant_id', merchantId)
    if (error) {
      console.error('Error eliminando menú:', error)
      alert('No se pudo eliminar el menú: ' + error.message)
      return
    }
    await cargarDatos()
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
  }

  return (
    <div className="w-full min-w-0 space-y-3">
      {!showForm && (
        <Button
  onClick={() => setShowForm(true)}
  className="w-full bg-olive-600 hover:bg-olive-700 text-white text-xs sm:text-sm py-2 sm:py-2.5"
>
          <Plus className="h-4 w-4 mr-1" /> Crear nuevo menú del día
        </Button>
      )}

      {showForm && (
        <Card className="w-full min-w-0 gap-3 overflow-hidden p-3 sm:p-4 bg-gray-800/50 border-gray-700 space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {editingId ? 'Editar menú publicado' : 'Nuevo menú'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tipo */}
          <div className="w-full">
            <label className="text-[10px] font-medium text-gray-400">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as MenuType)}
              className="mt-1 h-9 w-full max-w-xs rounded border border-gray-700 bg-gray-800/50 px-3 text-sm text-white"
            >
              <option value="menu">Menú del día</option>
              <option value="especial">Plato especial</option>
              <option value="promo">Promoción</option>
            </select>
          </div>

          {/* Título */}
          <div className="w-full">
            <label className="text-[10px] font-medium text-gray-400">Nombre del menú *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Encebollado y Seco"
              className="mt-0.5 h-8 sm:h-9 w-full min-w-0 text-sm bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Foto */}
          <div className="w-full">
            <label className="text-[10px] font-medium text-gray-400">Foto del menú *</label>
            {imageUrl ? (
              <div className="mt-1 flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700 flex-shrink-0">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  aria-label="Quitar foto del plato"
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
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''
                    if (file) void subirImagen(file)
                  }}
                />
                <Camera className="h-5 w-5 mb-1 text-gray-400" />
                <span className="text-[9px] text-gray-400">
                  {uploading ? 'Subiendo foto...' : 'Seleccionar foto del plato'}
                </span>
                <span className="text-[8px] text-gray-500">JPG, PNG · Máx 2MB</span>
              </label>
            )}
          </div>

          {/* Descripción */}
          <div className="w-full">
            <label className="text-[10px] font-medium text-gray-400">Descripción (opcional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Ceviche + bebida + postre"
              rows={3}
              className="mt-0.5 w-full min-w-0 text-sm bg-gray-800/50 border-gray-700 text-white resize-y"
            />
          </div>

          {/* Precio */}
          <div className="w-full">
            <label className="text-[10px] font-medium text-gray-400">Precio de oferta ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="0.00"
              className="mt-0.5 h-8 sm:h-9 w-full min-w-0 text-sm bg-gray-800/50 border-gray-700 text-white"
            />
          </div>

          {/* Fechas */}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="w-full">
              <label className="text-[10px] font-medium text-gray-400">Válido desde</label>
              <Input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-0.5 h-8 sm:h-9 w-full px-2 text-sm bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
            <div className="w-full">
              <label className="text-[10px] font-medium text-gray-400">Válido hasta</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-0.5 h-8 sm:h-9 w-full px-2 text-sm bg-gray-800/50 border-gray-700 text-white"
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
  disabled={saving || uploading}
  className="w-full bg-olive-600 hover:bg-olive-700 text-white text-xs sm:text-sm py-2 sm:py-2.5"
>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Guardar menú'}
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
          <Card key={menu.id} className={`p-2 sm:p-3 border ${menu.active ? 'border-olive-500 bg-olive-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
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
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!menu.active && (
                  <button
                    type="button"
                    onClick={() => activarMenu(menu.id)}
                    className="text-[10px] text-olive-400 hover:text-olive-300"
                  >
                    Activar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => iniciarEdicion(menu)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  title="Editar menú"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => eliminarMenu(menu.id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                  title="Eliminar menú"
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}