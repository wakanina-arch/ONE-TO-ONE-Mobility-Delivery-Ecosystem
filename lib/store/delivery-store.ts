import { create } from 'zustand'
import { RiderProfile, loadProfile } from '@/lib/models/rider-profile'
import { HelmetType } from '@/lib/models/helmet'

interface DeliveryStore {
  profile: RiderProfile | null
  serviceMode: boolean
  currentHelmet: HelmetType
  loadProfile: () => void
  startService: () => void
  endService: () => void
}

export const useDeliveryStore = create<DeliveryStore>((set) => ({
  profile: null,
  serviceMode: false,
  currentHelmet: 'common',

  loadProfile: () => {
    const profile = loadProfile()
    if (profile) {
      set({ 
        profile, 
        currentHelmet: profile.riderType === 'common' ? 'common' : 'sacha'
      })
    }
  },

  startService: () => {
    set({ serviceMode: true, currentHelmet: 'awkak' })
  },

  endService: () => {
    const profile = loadProfile()
    if (profile) {
      set({ 
        serviceMode: false, 
        currentHelmet: profile.riderType === 'common' ? 'common' : 'sacha'
      })
    }
  }
}))
