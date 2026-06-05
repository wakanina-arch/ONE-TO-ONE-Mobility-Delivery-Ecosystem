'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const cascosIniciales = [
  { id: 'awkak', nombre: 'Awkak (Guerrero)', descripcion: 'Casco de servicio', ruta: '/images/naves-cascos/awkak.png' },
  { id: 'artisan', nombre: 'Artisan (Artesano)', descripcion: 'Distinción de la Alianza', ruta: '/images/naves-cascos/artisan.png' },
  { id: 'comun', nombre: 'Común', descripcion: 'Tu avatar personal', ruta: '/images/naves-cascos/comun.png' },
  { id: 'sacha', nombre: 'Sacha', descripcion: 'Tu identidad', ruta: '/images/naves-cascos/sacha.png' }
]

export default function SplashScreen() {
  const router = useRouter()
  const [animating, setAnimating] = useState(false)

  const handleTap = () => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      router.push('/onboarding/select-identity')
    }, 300)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden cursor-pointer"
      onClick={handleTap}
    >
      {/* Fondo universo */}
      <div className="absolute inset-0">
        <Image
          src="/images/naves-cascos/universo.png"
          alt="Universo ONE TO ONE"
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>

      {/* Capa de niebla / humo - fondo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      
      {/* Neblina animada (capas flotantes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(100,80,60,0.3) 0%, transparent 50%)',
          animation: 'niebla1 20s ease-in-out infinite alternate'
        }} />
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(circle at 80% 30%, rgba(80,70,100,0.3) 0%, transparent 50%)',
          animation: 'niebla2 25s ease-in-out infinite alternate'
        }} />
        <div className="absolute inset-0 opacity-15" style={{
          background: 'radial-gradient(circle at 40% 70%, rgba(120,100,80,0.2) 0%, transparent 60%)',
          animation: 'niebla3 18s ease-in-out infinite alternate'
        }} />
      </div>

      {/* Título */}
      <div className="relative z-10 text-center mb-12">
        <h1 className="text-5xl font-bold text-amber-500 font-mono tracking-wider drop-shadow-lg">
          🔱 ONE TO ONE
        </h1>
        <p className="text-white/40 text-sm mt-3">Delivery Alianza</p>
      </div>

      {/* Contenedor de cascos - sin círculos, solo imágenes flotando */}
      <div className="relative z-10 grid grid-cols-2 gap-x-20 gap-y-12 max-w-md mx-auto">
        {cascosIniciales.map((casco, index) => (
          <div
            key={casco.id}
            className="flex flex-col items-center transition-all duration-500 hover:scale-105"
            style={{
              animation: `flotarHumo ${3 + index * 0.3}s ease-in-out infinite alternate`
            }}
          >
            {/* Casco sin fondo circular - solo la imagen con sombra y brillo */}
            <div className="relative w-28 h-28 flex items-center justify-center drop-shadow-2xl">
              <Image
                src={casco.ruta}
                alt={casco.nombre}
                width={110}
                height={110}
                className="object-contain"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.15))'
                }}
              />
              {/* Brillo sutil detrás del casco */}
              <div className="absolute inset-0 rounded-full bg-amber-500/5 blur-xl -z-10" />
            </div>
            <p className="text-white text-sm mt-3 font-mono font-medium tracking-wide">
              {casco.nombre}
            </p>
            <p className="text-white/30 text-xs text-center max-w-[100px] leading-relaxed">
              {casco.descripcion}
            </p>
          </div>
        ))}
      </div>

      {/* Indicador de toque */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
          <span className="text-white/40 text-sm animate-pulse">👆</span>
          <span className="text-white/40 text-sm tracking-wide">Toca para comenzar</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes flotarHumo {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        
        @keyframes niebla1 {
          0% { transform: scale(1) translateX(0%); opacity: 0.2; }
          100% { transform: scale(1.3) translateX(5%); opacity: 0.35; }
        }
        
        @keyframes niebla2 {
          0% { transform: scale(1) translateX(0%); opacity: 0.15; }
          100% { transform: scale(1.4) translateX(-5%); opacity: 0.3; }
        }
        
        @keyframes niebla3 {
          0% { transform: scale(1) translateX(0%); opacity: 0.1; }
          100% { transform: scale(1.2) translateX(3%); opacity: 0.25; }
        }
      `}</style>
    </div>
  )
}