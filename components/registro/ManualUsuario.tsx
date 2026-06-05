'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, Play, CheckCircle, LayoutDashboard, Utensils, Store, Bell, Tag } from 'lucide-react'
import Image from 'next/image'

interface ManualUsuarioProps {
  onClose: () => void
  onAcceder?: () => void
}

const PASOS = [
  {
    titulo: "Bienvenido",
    descripcion: "Gestiona tu comercio sin complicaciones",
    icono: <Play className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso0.png",
    consejo: "🔥 ONE TO ONE te acompaña"
  },
  {
    titulo: "Panel Principal",
    descripcion: "Pedidos entrantes, producción y entregas",
    icono: <LayoutDashboard className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso1.png",
    consejo: "💡 La campana 🔔 avisa nuevos pedidos"
  },
  {
    titulo: "Editor de Menú",
    descripcion: "Añade productos, precios y ofertas",
    icono: <Utensils className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso2.png",
    consejo: "💡 Puedes añadir productos por categoría"
  },
  {
    titulo: "Datos del Comercio",
    descripcion: "Dirección, horarios y redes sociales",
    icono: <Store className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso3.png",
    consejo: "💡 La cuña publicitaria aparece en la app"
  },
  {
    titulo: "Gestión de Pedidos",
    descripcion: "Notificaciones y comandas de producción",
    icono: <Bell className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso4.png",
    consejo: "💡 Imprime la comanda directamente"
  },
  {
    titulo: "Ofertas",
    descripcion: "Crea promociones por eventos especiales",
    icono: <Tag className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso5.png",
    consejo: "💡 Las ofertas se destacan en la app"
  },
  {
    titulo: "¡Listo!",
    descripcion: "Agrega tus productos y empieza a vender",
    icono: <CheckCircle className="h-8 w-8 text-olive-400" />,
    imagen: "/manual/paso6.png",
    consejo: "🚀 Éxito con ONE TO ONE"
  }
]

export function ManualUsuario({ onClose, onAcceder }: ManualUsuarioProps) {
  const [pasoActual, setPasoActual] = useState(0)
  const totalPasos = PASOS.length
  const paso = PASOS[pasoActual]

  const siguiente = () => {
    if (pasoActual < totalPasos - 1) {
      setPasoActual(pasoActual + 1)
    }
  }

  const anterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-gray-900 rounded-xl max-w-sm w-full max-h-[90vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30">
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🔱</span>
            <h2 className="text-sm font-bold text-white">Manual de Usuario</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-3 pt-3">
          <div className="flex gap-0.5">
            {Array.from({ length: totalPasos }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-1 h-0.5 rounded-full transition-all",
                  idx <= pasoActual ? "bg-olive-500" : "bg-gray-700"
                )}
              />
            ))}
          </div>
          <p className="text-[9px] text-gray-500 mt-1.5 text-center">
            {pasoActual + 1} / {totalPasos}
          </p>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-olive-500/20 flex items-center justify-center">
              {paso.icono}
            </div>
            <h3 className="text-sm font-bold text-white">{paso.titulo}</h3>
            <p className="text-[10px] text-gray-300">{paso.descripcion}</p>
            
            {/* Captura de pantalla */}
            <div className="bg-gray-800 rounded-lg p-2 w-full mt-1">
              <div className="bg-gray-700 rounded-md h-28 flex items-center justify-center">
                {paso.imagen ? (
                  <img 
                    src={paso.imagen} 
                    alt={paso.titulo}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center text-gray-500 text-xs';
                        fallback.innerHTML = '📸 Captura - ' + paso.titulo;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <span className="text-gray-500 text-[9px]">📸 Captura - {paso.titulo}</span>
                )}
              </div>
              <p className="text-[8px] text-gray-500 text-center mt-1">
                (Captura ilustrativa)
              </p>
            </div>
            
            {paso.consejo && (
              <div className="bg-gray-800/50 rounded-lg p-1.5 text-[9px] text-gray-400 w-full">
                {paso.consejo}
              </div>
            )}
          </div>
        </div>

        {/* Footer con navegación */}
        <div className="p-3 border-t border-gray-700 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={anterior}
            disabled={pasoActual === 0}
            className="h-7 text-[10px] px-2 border-gray-600 text-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="h-3 w-3 mr-0.5" /> Atrás
          </Button>
          
          {pasoActual === totalPasos - 1 ? (
            <Button 
              onClick={() => {
                if (onAcceder) {
                  onAcceder()
                } else {
                  onClose()
                }
              }}
              className="h-7 text-[10px] px-3 bg-olive-600 hover:bg-olive-700 text-white"
            >
              Acceder <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          ) : (
            <Button 
              onClick={siguiente}
              className="h-7 text-[10px] px-3 bg-olive-600 hover:bg-olive-700 text-white"
            >
              Siguiente <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
