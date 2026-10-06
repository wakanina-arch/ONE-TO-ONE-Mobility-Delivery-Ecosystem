import { createClient } from './client'

export interface Product {
  id: string
  merchant_id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  available: boolean
  created_at: string
}

// Obtener todos los productos de un comercio
export async function getProductsByMerchant(merchantId: string): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('available', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data || []
}

// Obtener un producto por ID
export async function getProductById(productId: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return data
}

// Crear un nuevo producto (para comercios)
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()
  
  if (error) throw error
  return data
}
