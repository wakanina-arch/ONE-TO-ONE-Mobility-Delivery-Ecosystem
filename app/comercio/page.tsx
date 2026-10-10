'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ComercioEditor } from '@/components/drawers/comercio-editor'
import { ComercioInfo } from '@/components/ComercioInfo'
import { DocumentosModal } from '@/components/drawers/DocumentosModal'
import { getPanelSession, hasValidPanelSession } from '@/components/PanelAccessModal'
import { LogOut } from 'lucide-react'
import { revokePanelSession } from '@/components/PanelAccessModal'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ToggleLeft,
  ToggleRight,
  Utensils,
  Store,
  FileText,
  ChevronRight,
  X,
} from 'lucide-react'
import Link from 'next/link'

// ==================== PANEL DEL COMERCIO ====================

function ComercioPanel() {
  const [showMenuEditor, setShowMenuEditor] = useState(false)
  const [showComercioInfo, setShowComercioInfo] = useState(false)
  const [showDocumentos, setShowDocumentos] = useState(false)
  const [kanbanEnabled, setKanbanEnabled] = useState(false)
  const router = useRouter()
const [session, setSession] = useState<{ merchantId: string; merchantName: string } | null>(null)

useEffect(() => {
  if (!hasValidPanelSession()) {
    router.push('/')
    return
  }
  const s = getPanelSession()
  if (s) {
    setSession({
      merchantId: s.id,
      merchantName: s.name,
    })
  }
}, [router])

  // TODO: cargar el kanban_enabled del comercio actual desde Supabase
  // TODO: cargar el nombre del comercio actual

  const handleToggleKanban = () => {
    setKanbanEnabled(prev => !prev)
    // TODO: guardar en Supabase (merchants.kanban_enabled)
  }
    const handleLogout = () => {
    revokePanelSession()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm font-semibold text-foreground">
              Panel Comercio
            </span>
          </div>
          <div className="flex items-center gap-2">
  <span className="text-xs text-muted-foreground">
        {session?.merchantName || 'Cargando...'}
  </span>
  <button
    onClick={handleLogout}
    className="text-muted-foreground hover:text-destructive transition-colors p-1"
    title="Cerrar sesión"
  >
    <LogOut className="h-4 w-4" />
  </button>
</div>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-4 space-y-3 max-w-lg mx-auto">
        
                {/* ITEM 1 — Cocina Kanban (ON/OFF) */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ToggleLeft className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Cocina Kanban
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {kanbanEnabled
                    ? 'Gestión activa · toca para entrar'
                    : 'Gestión operativa del flujo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Chevron para entrar al Kanban (solo si está activo) */}
                            {kanbanEnabled && (
                <Link
                  href="/comercio/kanban"
                  className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* Toggle ON/OFF */}
              <button
                onClick={handleToggleKanban}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors flex-shrink-0 p-0.5',
                  kanbanEnabled ? 'bg-emerald-500' : 'bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'block w-6 h-6 bg-white rounded-full transition-transform shadow-md',
                    kanbanEnabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        </Card>
        {/* ITEM 2 — Gestión de producción */}
        <Card
          onClick={() => setShowMenuEditor(true)}
          className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Gestión de producción
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Añade platos, precios e imágenes
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Card>
        
        {/* ITEM 3 — Información del comercio */}
        <Card
          onClick={() => setShowComercioInfo(true)}
          className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Información del comercio
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dirección, contacto, publicidad
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Card>

        {/* ITEM 4 — Documentación importante */}
        <Card
          onClick={() => setShowDocumentos(true)}
          className="p-4 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Documentación importante
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contratos, cláusulas y leyes
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </Card>
      </main>

            {/* MODALES */}

      {/* Gestión de producción (editor de menú) */}
      {showMenuEditor && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-primary/30 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">Gestión de producción</h2>
              </div>
              <button
                onClick={() => setShowMenuEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              <ComercioEditor
                open={showMenuEditor}
                onClose={() => setShowMenuEditor(false)}
                comercioId={session?.merchantId || ''}
                onSave={() => setShowMenuEditor(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Información del comercio */}
      {showComercioInfo && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-primary/30 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-white">Información del comercio</h2>
              </div>
              <button
                onClick={() => setShowComercioInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              <ComercioInfo
                comercioId={session?.merchantId || ''}
                comercioNombre={session?.merchantName || 'ONE TO ONE'}
                mode="admin"
                onClose={() => setShowComercioInfo(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Documentación (ya funciona bien) */}
      {showDocumentos && (
        <DocumentosModal
          open={showDocumentos}
          onClose={() => setShowDocumentos(false)}
        />
      )}
        </div>
  )
}

export default function ComercioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
          Cargando panel de comercio...
        </div>
      }
    >
      <ComercioPanel />
    </Suspense>
  )
}