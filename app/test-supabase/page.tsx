'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [status, setStatus] = useState('Conectando...')

  useEffect(() => {
    const testConnection = async () => {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
      
      if (error) {
        setStatus(`❌ Error: ${error.message}`)
      } else {
        setStatus(`✅ Conectado a Supabase correctamente`)
      }
    }
    
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-bold text-amber-500">🔱 ONE TO ONE</h1>
      <p className="text-white mt-4">Estado de Supabase:</p>
      <p className="text-white mt-2">{status}</p>
    </div>
  )
}
