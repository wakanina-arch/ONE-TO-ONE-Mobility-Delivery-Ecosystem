// app/escenario/awkak/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type EstadoAwkak = 
  | 'espera'           // hangar gris + nave gris + aureola gris
  | 'alerta'           // hangar rojo + nave roja + aureola roja (rechazar) + botón verde (aceptar)
  | 'aceptado'         // hangar azul + nave azul + QR
  | 'verificado'       // hangar oculto + nave bruma
  | 'viaje'            // nave hiperespacio + líneas velocidad
  | 'entrega'          // nave bruma (llegando)
  | 'completado'       // volviendo a gris

export default function EscenarioAwkak() {
  const router = useRouter()
  const [estado, setEstado] = useState<EstadoAwkak>('espera')
  const [mostrarAlarma, setMostrarAlarma] = useState(false)
  const [mostrarQR, setMostrarQR] = useState(false)
  const [simulandoPedido, setSimulandoPedido] = useState(false)

  // Simular llegada de pedido
  useEffect(() => {
    if (estado === 'espera' && !simulandoPedido) {
      const timer = setTimeout(() => {
        setSimulandoPedido(true)
        setEstado('alerta')
        setMostrarAlarma(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [estado, simulandoPedido])

  // Apagar alarma después de 2 segundos
  useEffect(() => {
    if (mostrarAlarma) {
      const timer = setTimeout(() => setMostrarAlarma(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [mostrarAlarma])

  const aceptarMision = () => {
    setEstado('aceptado')
    setMostrarQR(true)
  }

  const rechazarMision = () => {
    setEstado('espera')
    setSimulandoPedido(false)
    setMostrarAlarma(false)
  }

  const verificarQR = () => {
    setMostrarQR(false)
    setEstado('verificado')
    
    setTimeout(() => setEstado('viaje'), 2000)
    setTimeout(() => setEstado('entrega'), 5000)
    setTimeout(() => {
      setEstado('completado')
      setTimeout(() => {
        setEstado('espera')
        setSimulandoPedido(false)
      }, 1500)
    }, 7000)
  }

  const getHangar = () => {
    switch (estado) {
      case 'alerta': return '/images/naves-cascos/hangar-rojo.png'
      case 'aceptado': return '/images/naves-cascos/hangar-azul.png'
      default: return '/images/naves-cascos/hangar-gris.png'
    }
  }

  const getNave = () => {
    switch (estado) {
      case 'alerta': return '/images/naves-cascos/nave-rojo.png'
      case 'aceptado': return '/images/naves-cascos/nave-azul.png'
      case 'verificado': 
      case 'entrega': return '/images/naves-cascos/nave-bruma.png'
      case 'viaje': return '/images/naves-cascos/nave-hiperespacio.png'
      default: return '/images/naves-cascos/nave-gris.png'
    }
  }

  const ocultarHangar = estado === 'verificado' || estado === 'viaje' || estado === 'entrega'

  const getAureolaColor = () => {
    if (estado === 'alerta') return 'ring-red-500 shadow-red-500/50'
    if (estado === 'espera' || estado === 'completado') return 'ring-gray-500 shadow-gray-500/30'
    return 'ring-gray-600 shadow-gray-600/20'
  }

  // Texto del casco izquierdo según estado
  const getCascoLeftText = () => {
    if (estado === 'alerta') return 'RECHAZAR'
    return ''
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black">
      
      {/* FONDO */}
      {!ocultarHangar ? (
        <div className="absolute inset-0 transition-all duration-700">
          <Image src={getHangar()} alt="Hangar" fill className="object-cover opacity-80" priority />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Alarma visual */}
      {mostrarAlarma && (
        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />
      )}

      {/* Líneas de velocidad */}
      {estado === 'viaje' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: '2px',
                top: `${Math.random() * 100}%`,
                left: '-100px',
                animation: `velocidad ${Math.random() * 0.8 + 0.3}s linear infinite`,
                opacity: Math.random() * 0.6,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Bruma */}
      {(estado === 'verificado' || estado === 'entrega') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 animate-pulse" />
        </div>
      )}

      {/* ========== CASCOS ========== */}
      
      {/* Casco izquierdo: en espera = gris (sin acción), en alerta = rojo (rechazar) */}
      <div 
        onClick={estado === 'alerta' ? rechazarMision : undefined}
        className={`absolute top-6 left-6 z-20 ${estado === 'alerta' ? 'cursor-pointer' : ''}`}
      >
        <div className={`relative w-16 h-16 rounded-full ring-4 ${getAureolaColor()} shadow-lg transition-all duration-300`}>
          <Image
            src="/images/naves-cascos/awkak.png"
            alt="Casco Awkak"
            fill
            className="object-contain p-1"
          />
        </div>
        {getCascoLeftText() && (
          <p className={`text-xs text-center mt-1 font-mono font-bold ${estado === 'alerta' ? 'text-red-400' : 'text-gray-400'}`}>
            {getCascoLeftText()}
          </p>
        )}
      </div>

      {/* Casco derecho (ACEPTAR) - solo visible en alerta */}
      {estado === 'alerta' && (
        <div 
          onClick={aceptarMision}
          className="absolute top-6 right-24 z-20 cursor-pointer transition-all duration-300 hover:scale-110"
        >
          <div className="relative w-16 h-16 rounded-full ring-4 ring-green-500 shadow-lg shadow-green-500/50">
            <Image
              src="/images/naves-cascos/awkak.png"
              alt="Aceptar"
              fill
              className="object-contain p-1"
            />
          </div>
          <p className="text-green-400 text-xs text-center mt-1 font-mono font-bold">ACEPTAR</p>
        </div>
      )}

      {/* Botón volver a splash (solo visible fuera de alerta para no solaparse) */}
      {estado !== 'alerta' && (
        <button
          onClick={() => router.push('/onboarding/splash')}
          className="absolute top-6 right-6 z-20 text-white/40 text-sm hover:text-white/70 transition"
        >
          ← Salir
        </button>
      )}

      {/* MODAL QR */}
            {/* MODAL QR - Minimalista, hangar azul visible de fondo */}
      {mostrarQR && (
        <div 
          className="absolute inset-0 z-30 flex items-center justify-center"
          onClick={verificarQR}
        >
          {/* QR - sin fondo, sin marco, flotando sobre el hangar */}
          <div className="relative w-40 h-40 md:w-48 md:h-48 cursor-pointer transition-transform duration-300 hover:scale-105">
            <Image
              src="/images/qr-placeholder.png"
              alt="Código QR"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
        </div>
      )}

      {/* NAVE CENTRADA */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className={`relative w-64 h-64 md:w-80 md:h-80 transition-all duration-500 ${
          estado === 'viaje' ? 'animate-pulse' : ''
        }`}>
          <Image src={getNave()} alt="Nave" fill className="object-contain drop-shadow-2xl" />
        </div>

        <div className="text-center mt-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full">
          {estado === 'espera' && (
            <p className="text-gray-300 font-mono text-sm">🔱 En espera... <span className="text-gray-500 text-xs">(llegará un pedido)</span></p>
          )}
          {estado === 'alerta' && (
            <p className="text-red-400 font-mono font-bold text-sm animate-pulse">⚠️ ¡PEDIDO URGENTE! ⚠️</p>
          )}
          {estado === 'aceptado' && (
            <p className="text-cyan-400 font-mono text-sm">🚀 Misión aceptada - Escanea el QR</p>
          )}
          {estado === 'verificado' && (
            <p className="text-green-400 font-mono text-sm">✅ QR verificado - Despegando</p>
          )}
          {estado === 'viaje' && (
            <p className="text-purple-400 font-mono font-bold text-sm animate-pulse">✨ VIAJE INTERESTELAR ✨</p>
          )}
          {estado === 'entrega' && (
            <p className="text-amber-400 font-mono text-sm">🎯 Llegando al destino</p>
          )}
          {estado === 'completado' && (
            <p className="text-green-400 font-mono text-sm">✅ Misión completada</p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes velocidad {
          0% { transform: translateX(-100px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
      `}</style>
    </div>
  )
}