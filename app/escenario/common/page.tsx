// Escenario Común
'use client'
import Image from 'next/image'

export default function EscenarioCommon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-900 to-yellow-800 relative">
      <Image src="/images/hangar-common.png" alt="Hangar Common" fill className="object-cover opacity-60" priority />
      <div className="relative z-10 text-center mt-32">
        <h1 className="text-3xl font-bold text-yellow-200 mb-4">Modo Común</h1>
        <p className="text-yellow-300">Escenario de ejemplo para Común.</p>
      </div>
    </div>
  )
}