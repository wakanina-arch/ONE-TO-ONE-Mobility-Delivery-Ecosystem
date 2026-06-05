// Escenario Artisan
'use client'
import Image from 'next/image'

export default function EscenarioArtisan() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-purple-800 relative">
      <Image src="/images/hangar-artisan.png" alt="Hangar Artisan" fill className="object-cover opacity-60" priority />
      <div className="relative z-10 text-center mt-32">
        <h1 className="text-3xl font-bold text-purple-200 mb-4">Modo Artisan</h1>
        <p className="text-purple-300">Escenario de ejemplo para Artisan.</p>
      </div>
    </div>
  )
}