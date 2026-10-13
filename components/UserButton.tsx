'use client'

import { User } from 'lucide-react'
import { useUserPanel } from '@/contexts/UserPanelContext'

export function UserButton() {
  const { open } = useUserPanel()

  return (
    <button
      onClick={open}
      className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
      title="Mi cuenta"
    >
      <User className="h-4 w-4" />
    </button>
  )
}