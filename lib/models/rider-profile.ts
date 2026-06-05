import { Avatar } from './avatar'

export type Gender = 'runa' | 'warmy'
export type RiderType = 'common' | 'sacha'

export interface RiderProfile {
  riderType: RiderType | null
  avatar: Avatar | null
  gender: Gender | null
  hasCompletedOnboarding: boolean
}

// Guardar en localStorage
export const saveProfile = (profile: RiderProfile) => {
  localStorage.setItem('rider-profile', JSON.stringify(profile))
}

export const loadProfile = (): RiderProfile | null => {
  const saved = localStorage.getItem('rider-profile')
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export const clearProfile = () => {
  localStorage.removeItem('rider-profile')
}
