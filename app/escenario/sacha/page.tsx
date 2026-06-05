// Escenario Sacha
'use client'
import Image from 'next/image'

export default function EscenarioSacha() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-900 to-pink-800 relative">
      <Image src="/images/hangar-sacha.png" alt="Hangar Sacha" fill className="object-cover opacity-60" priority />
      <div className="relative z-10 text-center mt-32">
        <h1 className="text-3xl font-bold text-pink-200 mb-4">Modo Sacha</h1>
        <p className="text-pink-300">Escenario de ejemplo para Sacha.</p>
      </div>
    </div>
  )
}