'use client'

import { useRouter } from 'next/navigation'

export default function SelectIdentity() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-amber-500 text-center mb-2 font-mono">
        🔱 ELIGE TU IDENTIDAD
      </h1>
      <p className="text-white/50 text-center mb-12 text-sm">
        ¿Cómo quieres ser conocido en la Alianza?
      </p>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <button
          onClick={() => router.push('/onboarding/select-avatar?type=common')}
          className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-center hover:scale-105 transition-transform border border-amber-500/30"
        >
          <div className="text-6xl mb-3">🛡️</div>
          <h2 className="text-xl font-bold text-white">Común</h2>
          <p className="text-white/50 text-sm mt-2">Elige un avatar entre 12 diseños</p>
        </button>

        <button
          onClick={() => router.push('/onboarding/select-avatar?type=sacha')}
          className="flex-1 bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-6 text-center hover:scale-105 transition-transform border border-purple-500/30"
        >
          <div className="text-6xl mb-3">🌿</div>
          <h2 className="text-xl font-bold text-white">Sacha</h2>
          <p className="text-white/50 text-sm mt-2">Define tu género y elige un avatar</p>
        </button>
      </div>
    </div>
  )
}
