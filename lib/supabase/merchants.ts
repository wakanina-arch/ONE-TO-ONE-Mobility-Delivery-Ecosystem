// lib/supabase/merchants.ts
import { createClient } from './client'

// ============ TIPOS ============

export interface Merchant {
  id: string
  user_id: string | null
  name: string
  address: string | null
  sector: string | null
  phone: string | null
  description: string | null
  logo_url: string | null
  active: boolean
  always_open: boolean
  created_at: string
}

export interface MerchantSchedule {
  id: string
  merchant_id: string
  day_of_week: number  // 0=domingo, 1=lunes, ..., 6=sábado
  opening_time: string
  closing_time: string
  created_at: string
  updated_at: string
}

// ============ MERCHANTS ============

/**
 * Obtener todos los comercios activos.
 */
export async function getActiveMerchants(): Promise<Merchant[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) {
    console.error('Error fetching merchants:', error)
    return []
  }

  return data || []
}

/**
 * Obtener un comercio por ID.
 */
export async function getMerchantById(merchantId: string): Promise<Merchant | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchantId)
    .single()

  if (error) {
    console.error('Error fetching merchant:', error)
    return null
  }

  return data
}

// ============ SCHEDULES ============

/**
 * Obtener los horarios de un comercio.
 */
export async function getMerchantSchedules(merchantId: string): Promise<MerchantSchedule[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('merchant_schedules')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('day_of_week')
    .order('opening_time')

  if (error) {
    console.error('Error fetching schedules:', error)
    return []
  }

  return data || []
}

/**
 * Obtener los horarios de TODOS los comercios activos de una vez.
 * Mucho más eficiente que hacer 10 queries.
 */
export async function getAllSchedulesForActiveMerchants(): Promise<Record<string, MerchantSchedule[]>> {
  const supabase = createClient()

  // Primero obtenemos los IDs de los comercios activos
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id')
    .eq('active', true)

  if (!merchants || merchants.length === 0) return {}

  const merchantIds = merchants.map(m => m.id)

  // Luego obtenemos todos los schedules de esos comercios
  const { data: schedules, error } = await supabase
    .from('merchant_schedules')
    .select('*')
    .in('merchant_id', merchantIds)
    .order('day_of_week')
    .order('opening_time')

  if (error) {
    console.error('Error fetching all schedules:', error)
    return {}
  }

  // Agrupar por merchant_id
  const grouped: Record<string, MerchantSchedule[]> = {}
  for (const s of schedules || []) {
    if (!grouped[s.merchant_id]) grouped[s.merchant_id] = []
    grouped[s.merchant_id].push(s)
  }

  return grouped
}

// ============ LÓGICA DE HORARIOS ============

/**
 * ¿El comercio está abierto ahora?
 *
 * @param merchant - El comercio
 * @param schedules - Todos los horarios del comercio
 * @returns true si está abierto, false si está cerrado
 */
export function isOpenNow(
  merchant: Merchant,
  schedules: MerchantSchedule[]
): boolean {
  // 1. Si es always_open, siempre abierto
  if (merchant.always_open) return true

  // 2. Día de hoy (0=domingo, ..., 6=sábado)
  const today = new Date().getDay()

  // 3. Filtrar turnos de hoy
  const todaySchedules = schedules.filter(s => s.day_of_week === today)

  // 4. Sin turnos = cerrado
  if (todaySchedules.length === 0) return false

  // 5. Hora actual en minutos desde medianoche
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // 6. Ver si está dentro de ALGÚN turno
  return todaySchedules.some(schedule => {
    const [openH, openM] = schedule.opening_time.split(':').map(Number)
    const [closeH, closeM] = schedule.closing_time.split(':').map(Number)
    const openMin = openH * 60 + openM
    const closeMin = closeH * 60 + closeM

    // Cruce de medianoche (ej: 22:00 - 02:00)
    if (closeMin < openMin) {
      return currentMinutes >= openMin || currentMinutes <= closeMin
    }

    return currentMinutes >= openMin && currentMinutes <= closeMin
  })
}

/**
 * Devuelve el próximo turno de hoy (o null si no hay más turnos).
 */
export function getTodayScheduleSummary(schedules: MerchantSchedule[]): string {
  const today = new Date().getDay()
  const todaySchedules = schedules.filter(s => s.day_of_week === today)

  if (todaySchedules.length === 0) return 'Cerrado hoy'

  // Formatear "08:00-14:00 | 18:00-22:00"
  return todaySchedules
    .map(s => `${s.opening_time.slice(0, 5)} - ${s.closing_time.slice(0, 5)}`)
    .join(' | ')
}
// ============ PRODUCTS ============

export interface Product {
  id: string
  merchant_id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  available: boolean
  created_at: string
}

/**
 * Obtener los productos disponibles de un comercio.
 */
export async function getProductsByMerchant(merchantId: string): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('available', true)
    .order('category')
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

/**
 * Obtener un comercio con sus horarios y su estado actual.
 */
export async function getMerchantWithStatus(merchantId: string) {
  const merchant = await getMerchantById(merchantId)
  if (!merchant) return null

  const schedules = await getMerchantSchedules(merchantId)
  const abierto = isOpenNow(merchant, schedules)
  const horarioHoy = getTodayScheduleSummary(schedules)

  return { merchant, schedules, abierto, horarioHoy }
}