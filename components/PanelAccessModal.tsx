'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Lock, X, AlertCircle, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PanelAccessModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (merchantId: string, merchantName: string) => void
}

// 🔑 Clave de localStorage para la sesión
const SESSION_KEY = 'onetoone_panel_session'

interface Session {
  merchantId: string
  merchantName: string
  grantedAt: string
  expiresAt: string
}

export function PanelAccessModal({ open, onClose, onSuccess }: PanelAccessModalProps) {
  const [merchants, setMerchants] = useState<{ id: string; name: string }[]>([])
  const [loadingMerchants, setLoadingMerchants] = useState(true)
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Cargar los comercios al abrir
  useEffect(() => {
    if (!open) return

    const cargar = async () => {
      setLoadingMerchants(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Error cargando comercios:', error)
        setMerchants([])
      } else {
        setMerchants(data || [])
      }
      setLoadingMerchants(false)
    }

    cargar()
  }, [open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!selectedId) {
      setError('Selecciona un comercio')
      return
    }
    if (!password) {
      setError('Introduce la contraseña')
      return
    }

    // Buscar el comercio seleccionado
    const merchantIndex = merchants.findIndex(m => m.id === selectedId)
    if (merchantIndex === -1) {
      setError('Comercio no válido')
      return
    }

    // La contraseña es el número de posición (01, 02, 03...)
    const expectedPassword = String(merchantIndex + 1).padStart(2, '0')

    if (password !== expectedPassword) {
      setError('Contraseña incorrecta')
      setPassword('')
      return
    }

    // ✅ Acceso concedido
    const merchant = merchants[merchantIndex]
    const session: Session = {
      merchantId: merchant.id,
      merchantName: merchant.name,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))

    // Reset
    setPassword('')
    setSelectedId('')
    setError('')

    // Callback
    onSuccess(merchant.id, merchant.name)
  }

  const handleClose = () => {
    setPassword('')
    setSelectedId('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-primary/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-white">Acceso al Panel</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Selecciona tu comercio e introduce la contraseña
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Selector de comercio */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Comercio</label>
            {loadingMerchants ? (
              <div className="h-10 flex items-center justify-center bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value)
                    setError('')
                  }}
                  className="w-full h-10 pl-10 pr-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Selecciona --</option>
                  {merchants.map((m, idx) => (
                    <option key={m.id} value={m.id}>
                      {String(idx + 1).padStart(2, '0')}. {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Contraseña</label>
            <Input
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              disabled={!selectedId}
              autoFocus
              className="bg-gray-800/50 border-gray-700 text-white h-10 disabled:opacity-50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg p-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-700 text-gray-300 h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedId || !password}
              className="flex-1 bg-primary text-primary-foreground h-9 disabled:opacity-50"
            >
              Acceder
            </Button>
          </div>
        </form>

        <p className="text-[10px] text-gray-500 text-center mt-4">
          Solo personal autorizado
        </p>
      </Card>
    </div>
  )
}

// Helper: verificar si hay sesión válida
export function hasValidPanelSession(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return false
  try {
    const session: Session = JSON.parse(stored)
    return new Date(session.expiresAt) > new Date()
  } catch {
    return false
  }
}

// Helper: obtener la sesión actual
export function getPanelSession(): Session | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null
  try {
    const session: Session = JSON.parse(stored)
    if (new Date(session.expiresAt) <= new Date()) return null
    return session
  } catch {
    return null
  }
}

// Helper: cerrar sesión
export function revokePanelSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}
