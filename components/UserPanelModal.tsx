'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X, User, Save, ChevronRight, LogOut, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserPanel } from '@/contexts/UserPanelContext'

export function UserPanelModal() {
  const { isOpen, profile, close, reload } = useUserPanel()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    delivery_address: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        delivery_address: profile.delivery_address || '',
      })
    }
  }, [profile, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name || null,
        phone: form.phone || null,
        email: form.email || null,
        delivery_address: form.delivery_address || null,
      })
      .eq('id', user.id)

    if (!error) {
      setSaved(true)
      await reload()
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    close()
    window.location.href = '/'
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-primary/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
  <div className="flex items-center gap-2">
    <User className="h-5 w-5 text-primary" />
    <h2 className="text-base font-bold text-white">Mi cuenta</h2>
  </div>
  <button onClick={close} className="text-gray-400 hover:text-white">
    <X className="h-5 w-5" />
  </button>
</div>

        <p className="text-xs text-gray-400 mb-4">
          Tus datos se guardan para la próxima compra
        </p>

        {/* Formulario */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Tu nombre"
              className="bg-gray-800/50 border-gray-700 text-white h-9"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="0999999999"
              className="bg-gray-800/50 border-gray-700 text-white h-9"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="correo@ejemplo.com"
              className="bg-gray-800/50 border-gray-700 text-white h-9"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Dirección de entrega</label>
            <Input
              value={form.delivery_address}
              onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
              placeholder="Av. Principal 123, Quito"
              className="bg-gray-800/50 border-gray-700 text-white h-9"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2 mt-5">
  <Button
    onClick={handleSave}
    disabled={saving}
    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white h-9"
  >
    <Save className="h-3.5 w-3.5 mr-1.5" />
    {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar cambios'}
  </Button>

  {/* Separador */}
  <div className="border-t border-gray-700 my-1" />

  {/* Ver mis pedidos */}
  <button
    onClick={() => {
      close()
      window.location.href = '/mi-cuenta'
    }}
    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors"
  >
    <div className="flex items-center gap-2">
      <Package className="h-4 w-4 text-primary" />
      <span className="text-sm text-foreground">Ver mis pedidos</span>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  </button>

  {/* Separador */}
  <div className="border-t border-gray-700 my-1" />

  <Button
    onClick={handleLogout}
    variant="ghost"
    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9"
  >
    <LogOut className="h-3.5 w-3.5 mr-1.5" />
    Cerrar sesión
  </Button>
</div>

        <p className="text-[10px] text-gray-500 text-center mt-3">
          Cerrar sesión es opcional. Tus datos se mantienen.
        </p>
      </Card>
    </div>
  )
}