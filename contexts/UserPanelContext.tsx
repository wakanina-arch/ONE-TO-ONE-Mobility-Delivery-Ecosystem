'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  delivery_address: string | null
}

interface UserPanelContextValue {
  isOpen: boolean
  profile: UserProfile | null
  loading: boolean
  open: () => void
  close: () => void
  reload: () => Promise<void>
}

const UserPanelContext = createContext<UserPanelContextValue | null>(null)

export function UserPanelProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const didCheckOpenPanel = useRef(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, name, phone, email, delivery_address')
      .eq('id', user.id)
      .single()

    setProfile(data || { id: user.id, name: null, phone: null, email: null, delivery_address: null })
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (pathname !== '/') {
      didCheckOpenPanel.current = false
      return
    }
    if (didCheckOpenPanel.current) return
    didCheckOpenPanel.current = true

    if (sessionStorage.getItem('openUserPanel') === 'true') {
      sessionStorage.removeItem('openUserPanel')
      setIsOpen(true)
    }
  }, [pathname])

  return (
    <UserPanelContext.Provider
      value={{
        isOpen,
        profile,
        loading,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        reload,
      }}
    >
      {children}
    </UserPanelContext.Provider>
  )
}

export function useUserPanel() {
  const ctx = useContext(UserPanelContext)
  if (!ctx) throw new Error('useUserPanel must be used within UserPanelProvider')
  return ctx
}