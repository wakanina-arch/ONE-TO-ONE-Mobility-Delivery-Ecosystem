// app/delivery/spaceship-view.tsx - Versión Universo Realista
'use client'


import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useDeliveryStore } from '@/lib/store/delivery-store'
import { avatars } from '@/lib/models/avatar'

type SpaceshipState = 
  | 'idle_far'
  | 'alert_near'
  | 'alert_urgent'
  | 'speed_match1'
  | 'speed_match2'
  | 'hyperspace'
  | 'arrived'
  | 'delivering'
  | 'return_idle'

// Imágenes de nave por estado (puedes personalizar si quieres que cambie la nave)
const spaceshipImages: Record<SpaceshipState, string> = {
  idle_far: '/images/rider/01-welcome.png',
  alert_near: '/images/rider/02-standby.png',
  alert_urgent: '/images/rider/03-alert.png',
  speed_match1: '/images/rider/04-pre-accept.png',
  speed_match2: '/images/rider/05-accept.png',
  hyperspace: '/images/rider/06-speed-1.png',
  arrived: '/images/rider/07-speed-2.png',
  delivering: '/images/rider/08-approach.png',
  return_idle: '/images/rider/10-idle.png',
}

interface SpaceshipViewProps {
  onMissionStart?: () => void
}

// Componente de estrella fugaz (aparece aleatoriamente)
function ShootingStar() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: '0%', left: '0%' })

  useEffect(() => {
    const scheduleShootingStar = () => {
      const delay = Math.random() * 15000 + 5000 // 5-20 segundos
      setTimeout(() => {
        setPosition({
          top: `${Math.random() * 60 + 10}%`,
          left: `${Math.random() * 70 + 15}%`
        })
        setVisible(true)
        setTimeout(() => setVisible(false), 1500)
        scheduleShootingStar()
      }, delay)
    }
    scheduleShootingStar()
  }, [])

  if (!visible) return null

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        animation: 'shootingStar 1.5s ease-out forwards'
      }}
    >
      <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      <div className="absolute top-0 left-0 w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rotate-45 origin-top-left" />
    </div>
  )
}

export default function SpaceshipView({ onMissionStart }: SpaceshipViewProps) {
  const [state, setState] = useState<SpaceshipState>('idle_far')
  const [pedidoRecibido, setPedidoRecibido] = useState(false)
  const [stars, setStars] = useState<Array<{
    top: string, left: string, size: string, duration: string, brightness: number
  }>>([])

  // Store de delivery y perfil
  const { profile, serviceMode, currentHelmet, loadProfile, startService, endService } = useDeliveryStore()

  // Cargar perfil al montar
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Generar estrellas con diferentes tamaños y brillos
  useEffect(() => {
    const generatedStars = Array.from({ length: 150 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 0.5}px`,
      duration: `${Math.random() * 4 + 1}s`,
      brightness: 0.2 + Math.random() * 0.6
    }))
    setStars(generatedStars)
  }, [])

  // Simular llegada de pedido
  useEffect(() => {
    if (state === 'idle_far') {
      const timer = setTimeout(() => {
        setPedidoRecibido(true)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [state])

  // Secuencia al recibir pedido
  useEffect(() => {
    if (pedidoRecibido && state === 'idle_far') {
      setState('alert_near')
      setTimeout(() => setState('alert_urgent'), 1500)
    }
  }, [pedidoRecibido, state])

  // Determinar qué imagen de casco mostrar
  const getHelmetImage = () => {
    if (serviceMode || currentHelmet === 'awkak') {
      return '/images/naves-cascos/awkak.png'
    }
    if (currentHelmet === 'artisan') {
      return '/images/naves-cascos/artisan.png'
    }
    // Para Common o Sacha, mostrar el avatar elegido
    if (profile?.avatar) {
      return profile.avatar.imagePath
    }
    return '/images/naves-cascos/awkak.png'
  }

  // Aceptar misión: cambia estado y activa modo servicio
  const handleAccept = useCallback(() => {
    startService()
    setState('speed_match1')
    setTimeout(() => setState('speed_match2'), 1500)
    setTimeout(() => setState('hyperspace'), 3000)
    setTimeout(() => setState('arrived'), 4500)
    setTimeout(() => setState('delivering'), 6000)
    setTimeout(() => {
      setState('return_idle')
      setTimeout(() => {
        endService()
        if (onMissionStart) onMissionStart()
      }, 1000)
    }, 7000)
  }, [onMissionStart, startService, endService])

  // Rechazar misión: vuelve a estado inicial y termina modo servicio
  const handleReject = () => {
    endService()
    setState('return_idle')
    setTimeout(() => {
      setPedidoRecibido(false)
      setState('idle_far')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Fondo universo: negro con matices marrón oscuro */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1a0f0a] via-[#0a0806] to-[#000000]">
        
        {/* Nebulosa / galaxia muy sutil (opacidad baja) */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-amber-900/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-purple-900/15 blur-3xl" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-indigo-900/10 blur-3xl" />
        </div>

        {/* Estrellas titilantes */}
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: star.size,
                height: star.size,
                top: star.top,
                left: star.left,
                opacity: star.brightness,
                boxShadow: `0 0 ${parseFloat(star.size) * 2}px rgba(255,255,255,${star.brightness * 0.5})`,
                animation: `twinkleStar ${star.duration} infinite ease-in-out`
              }}
            />
          ))}
        </div>

        {/* Estrellas fugaces */}
        <ShootingStar />
        <ShootingStar />
      </div>

      {/* Nave principal y casco/avatar */}
      <div className="relative z-10 flex flex-col items-center px-4">
        <div className={`relative w-72 h-72 sm:w-96 sm:h-96 transition-all duration-700 ${
          state === 'hyperspace' ? 'animate-pulse' : ''
        }`}>
          {/* Imagen de nave de fondo */}
          <Image
            src={spaceshipImages[state]}
            alt="Nave ONE TO ONE"
            fill
            className="object-contain drop-shadow-2xl"
            priority
            unoptimized
          />
          {/* Casco/avatar superpuesto */}
          <div className="absolute left-1/2 top-1/2 w-32 h-32 sm:w-40 sm:h-40 -translate-x-1/2 -translate-y-1/2 z-20">
            <Image
              src={getHelmetImage()}
              alt="Casco"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Texto y botones */}
        <div className="mt-6 text-center">
          {state === 'idle_far' && (
            <p className="text-amber-500/80 text-xl font-mono animate-pulse tracking-wider">
              🔱 ONE TO ONE DELIVERY
            </p>
          )}
          {state === 'alert_near' && (
            <p className="text-yellow-500 text-2xl font-mono font-bold animate-pulse">
              ⚠️ ¡LA ALIANZA TE NECESITA! ⚠️
            </p>
          )}
          {state === 'alert_urgent' && (
            <div className="space-y-6">
              <p className="text-red-500 text-2xl sm:text-3xl font-mono font-bold animate-pulse">
                🚨 PEDIDO URGENTE 🚨
              </p>
              <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
                <button
                  onClick={handleAccept}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-500 transition shadow-lg active:scale-95 border border-green-400/30"
                >
                  ✅ ACEPTAR
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-red-800 to-red-700 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-600 transition shadow-lg active:scale-95 border border-red-400/30"
                >
                  ❌ RECHAZAR
                </button>
              </div>
            </div>
          )}
          {state === 'speed_match1' && (
            <p className="text-cyan-400 text-xl sm:text-2xl font-mono animate-pulse">
              ⚡ Acelerando... Match 1
            </p>
          )}
          {state === 'speed_match2' && (
            <p className="text-blue-400 text-xl sm:text-2xl font-mono animate-pulse">
              ⚡⚡ Match 2 - Velocidad crucero
            </p>
          )}
          {state === 'hyperspace' && (
            <div className="space-y-2">
              <p className="text-purple-400 text-2xl sm:text-3xl font-mono font-bold animate-pulse">
                ✨ ¡VELOCIDAD LUZ! ✨
              </p>
              <div className="flex justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          {state === 'arrived' && (
            <p className="text-green-400 text-xl sm:text-2xl font-mono">
              🎯 Destino alcanzado
            </p>
          )}
          {state === 'delivering' && (
            <p className="text-amber-400 text-lg sm:text-xl font-mono">
              📦 Realizando entrega...
            </p>
          )}
          {state === 'return_idle' && (
            <p className="text-gray-500 text-base sm:text-lg font-mono">
              ↩️ Regresando a la base...
            </p>
          )}
        </div>
      </div>

      {/* Efecto hyperspace: líneas radiales sutiles */}
      {state === 'hyperspace' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-t from-transparent via-white/20 to-transparent"
              style={{
                width: '2px',
                height: `${Math.random() * 100 + 50}%`,
                top: '25%',
                left: `${Math.random() * 100}%`,
                animation: `hyperspaceStretch ${Math.random() * 0.5 + 0.3}s linear infinite`,
                transformOrigin: 'top center'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}