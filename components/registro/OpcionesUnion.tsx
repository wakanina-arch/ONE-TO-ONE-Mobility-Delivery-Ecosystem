'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Store, Bike, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OpcionesUnionProps {
  onSelectComercio: () => void
  onSelectDelivery: () => void
  onBack: () => void
}

export function OpcionesUnion({ onSelectComercio, onSelectDelivery, onBack }: OpcionesUnionProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full animate-fade-in shadow-2xl border border-olive-500/30 overflow-hidden">
        
        {/* Header */}
        <div className="text-center pt-6 pb-2">
          <div className="text-5xl mb-2">🔱</div>
          <h2 className="text-xl font-bold text-white">Únete al Equipo</h2>
          <p className="text-xs text-gray-400 mt-1">Elige cómo quieres formar parte</p>
        </div>
        
        {/* Opciones */}
        <div className="p-4 space-y-3">
          {/* Opción Comercio */}
          <div
            onClick={onSelectComercio}
            className="group relative bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-olive-500 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-olive-500/20 flex items-center justify-center group-hover:bg-olive-500/30 transition">
                <Store className="h-7 w-7 text-olive-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base">Comercio</h3>
                <p className="text-xs text-gray-400">Vende tus productos y llega a más clientes</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-olive-400 transition" />
            </div>
          </div>
          
          {/* Opción Delivery */}
          <div
            onClick={onSelectDelivery}
            className="group relative bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:border-olive-500 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-olive-500/20 flex items-center justify-center group-hover:bg-olive-500/30 transition">
                <Bike className="h-7 w-7 text-olive-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-base">Delivery Rider</h3>
                <p className="text-xs text-gray-400">Gana dinero entregando pedidos en tu zona</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-olive-400 transition" />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-center">
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition">
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
