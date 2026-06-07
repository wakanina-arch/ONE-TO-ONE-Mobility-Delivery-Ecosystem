'use client'

import { Suspense } from 'react'

function ComercioContent() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-500 mb-4">ONE TO ONE</h1>
        <p className="text-white">Panel de Comercio - Demo</p>
      </div>
    </div>
  )
}

export default function ComercioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <ComercioContent />
    </Suspense>
  )
}
