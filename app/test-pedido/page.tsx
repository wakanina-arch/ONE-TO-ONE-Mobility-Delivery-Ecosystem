'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPedido() {
  const [status, setStatus] = useState('Esperando...')
  const [pedidoId, setPedidoId] = useState('')

  const crearPedido = async () => {
    setStatus('Creando pedido...')
    const supabase = createClient()
    
    console.log('🔵 Cliente creado')
    console.log('🔵 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_id: '83289488-6383-416b-b7a6-fc159550e7cc',
        merchant_id: '11111111-1111-1111-1111-111111111111',
        total: 15.00,
        status: 'created'
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error:', error)
      setStatus(`Error: ${error.message}`)
    } else {
      console.log('✅ Pedido creado:', data)
      setStatus(`✅ Pedido creado: ${data.id}`)
      setPedidoId(data.id)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-amber-500 mb-4">Prueba de Pedido</h1>
      <button 
        onClick={crearPedido}
        className="bg-amber-600 text-white px-4 py-2 rounded-lg"
      >
        Crear Pedido de Prueba
      </button>
      <p className="text-white mt-4">{status}</p>
      {pedidoId && <p className="text-green-400 mt-2">ID: {pedidoId}</p>}
    </div>
  )
}
