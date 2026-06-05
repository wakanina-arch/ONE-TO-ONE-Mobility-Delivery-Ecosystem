'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { avatars } from '@/lib/models/avatar'
import { saveProfile, RiderType, Gender } from '@/lib/models/rider-profile'

export default function SelectAvatar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const riderType = searchParams.get('type') as RiderType | null
  
  const [step, setStep] = useState<'gender' | 'avatar'>('gender')
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (riderType === 'common') {
      setStep('avatar') // Los Comunes no eligen género
    }
  }, [riderType])

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
    setStep('avatar')
  }

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    const avatar = avatars.find(a => a.id === avatarId)
    
    if (avatar && riderType) {
      saveProfile({
        riderType,
        avatar,
        gender: selectedGender,
        hasCompletedOnboarding: true
      })
      router.push('/delivery')
    }
  }

  if (!riderType) {
    router.push('/onboarding/select-identity')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-500 text-center mb-2 font-mono">
          {riderType === 'common' ? '🔱 ELIGE TU AVATAR' : '🌿 ELIGE TU IDENTIDAD SACHA'}
        </h1>
        <p className="text-white/50 text-center mb-8 text-sm">
          {riderType === 'common' 
            ? 'Selecciona el casco que te representará' 
            : 'Primero define tu género, luego elige tu avatar'}
        </p>

        {/* Paso 1: Selección de género (solo Sacha) */}
        {step === 'gender' && riderType === 'sacha' && (
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => handleGenderSelect('runa')}
              className="flex-1 max-w-[150px] bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-4 text-center hover:scale-105 transition"
            >
              <div className="text-4xl mb-2">⚔️</div>
              <p className="text-white font-bold">Runa</p>
              <p className="text-white/50 text-xs">Hombre</p>
            </button>
            <button
              onClick={() => handleGenderSelect('warmy')}
              className="flex-1 max-w-[150px] bg-gradient-to-br from-pink-900 to-pink-950 rounded-xl p-4 text-center hover:scale-105 transition"
            >
              <div className="text-4xl mb-2">🌸</div>
              <p className="text-white font-bold">Warmy</p>
              <p className="text-white/50 text-xs">Mujer</p>
            </button>
          </div>
        )}

        {/* Paso 2: Grid de avatares */}
        {step === 'avatar' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`bg-gray-800/50 rounded-xl p-3 hover:bg-gray-700/70 transition-all hover:scale-105 ${
                  selectedAvatar === avatar.id ? 'ring-4 ring-amber-500' : ''
                }`}
              >
                <div className="relative w-full aspect-square mb-2">
                  <Image
                    src={avatar.imagePath}
                    alt={avatar.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-white text-xs text-center font-mono">{avatar.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
