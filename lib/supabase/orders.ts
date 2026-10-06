import { createClient } from './client'

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

export interface CreateOrderInput {
  customer_id: string
  merchant_id: string
  items: OrderItem[]
  total: number
  delivery_address?: string
  payment_method?: string
  notes?: string
}

// Crear un nuevo pedido
export async function createOrder(orderData: CreateOrderInput) {
  const supabase = createClient()
  
  // 1. Insertar el pedido principal
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customer_id,
      merchant_id: orderData.merchant_id,
      total: orderData.total,
      delivery_address: orderData.delivery_address,
      payment_method: orderData.payment_method,
      notes: orderData.notes,
      status: 'created'
    })
    .select()
    .single()
  
       if (orderError) {
    console.error('❌ Error creating order:')
    console.error('  code:', orderError.code)
    console.error('  message:', orderError.message)
    console.error('  details:', orderError.details)
    console.error('  hint:', orderError.hint)
    console.error('  full:', JSON.stringify(orderError, null, 2))
    throw orderError
  }
  
  // 2. Insertar los items del pedido
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    throw itemsError
  }
  
  return order
}

// Obtener un pedido con sus items
export async function getOrderWithItems(orderId: string) {
  const supabase = createClient()
  
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  
  if (orderError) throw orderError
  
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
  
  if (itemsError) throw itemsError
  
  return { ...order, items }
}

// Actualizar estado del pedido
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
  
  if (error) throw error
}
// Garantiza que hay un usuario logueado (anónimo si es necesario)
export async function ensureUser(): Promise<string> {
  const supabase = createClient()

  // 1. Ver si ya hay usuario
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.id) {
    return user.id
  }

  // 2. Si no hay, crear usuario anónimo
  const { data: authData, error } = await supabase.auth.signInAnonymously()

  if (error || !authData.user?.id) {
    console.error('Error creating anonymous user:', error)
    throw new Error('No se pudo iniciar sesión')
  }

  return authData.user.id
}