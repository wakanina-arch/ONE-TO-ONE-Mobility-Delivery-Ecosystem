import { createClient } from '@/lib/supabase/client'

export interface QueueEntry {
  id: string
  sector: string
  rider_id: string
  joined_at: string
  status: 'waiting' | 'working' | 'paused'
}

// 1. Entrar a la cola de un sector
export async function entrarACola(riderId: string, sector: string) {
  const supabase = createClient()
  
  // Primero, verificar si ya está en la cola
  const { data: existing } = await supabase
    .from('sector_queues')
    .select('id')
    .eq('rider_id', riderId)
    .maybeSingle()

  if (existing) return { error: 'Ya estás en una cola' }

  const { error } = await supabase
    .from('sector_queues')
    .insert({
      sector,
      rider_id: riderId,
      status: 'waiting',
      joined_at: new Date().toISOString()
    })

  return { error: error?.message || null }
}

// 2. Salir de la cola
export async function salirDeCola(riderId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('sector_queues')
    .delete()
    .eq('rider_id', riderId)

  return { error: error?.message || null }
}

// 3. Obtener la posición en la cola (1 = primero)
export async function obtenerMiPosicion(riderId: string, sector: string) {
  const supabase = createClient()
  
  // Obtener todos los ryders en espera de ese sector, ordenados por hora de entrada
  const { data, error } = await supabase
    .from('sector_queues')
    .select('rider_id')
    .eq('sector', sector)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })

  if (error) return { posicion: null, total: 0, error: error.message }

  const index = data.findIndex(item => item.rider_id === riderId)
  
  return {
    posicion: index !== -1 ? index + 1 : null,
    total: data.length,
    error: null
  }
}

// 4. Mover al final de la cola (Regla: Back)
export async function moverAlFinal(riderId: string) {
  const supabase = createClient()
  
  // Actualizamos la hora de entrada a "ahora", lo que lo pone al final
  const { error } = await supabase
    .from('sector_queues')
    .update({ joined_at: new Date().toISOString() })
    .eq('rider_id', riderId)

  return { error: error?.message || null }
}

// 5. Pausar/Reanudar (cuando está en un servicio)
export async function actualizarEstadoCola(riderId: string, status: 'waiting' | 'working' | 'paused') {
  const supabase = createClient()
  const { error } = await supabase
    .from('sector_queues')
    .update({ status })
    .eq('rider_id', riderId)

  return { error: error?.message || null }
}