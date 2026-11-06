import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Falta configurar Supabase para el registro de comercios')
      return NextResponse.json(
        { error: 'El servicio de registro no está configurado' },
        { status: 500 }
      )
    }

    // Cliente con service_role (SOLO en servidor, nunca en cliente)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const body = await req.json()
    const {
      email,
      password,
      nombreComercio,
      propietario,
      telefono,
      direccion,
      ciudad,
      descripcion,
      logo,
    } = body

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: nombreComercio, role: 'merchant' },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Crear perfil en profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: propietario || nombreComercio,
        email,
        phone: telefono,
        role: 'merchant',
      })

    if (profileError) {
      // Si falla el perfil, borramos el usuario de Auth para no dejarlo huérfano
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // 3. Crear comercio en merchants para que aparezca inmediatamente en la app
    const { data: merchant, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .insert({
        user_id: userId,
        name: nombreComercio,
        address: direccion,
        sector: ciudad, // o el sector real
        phone: telefono,
        description: descripcion,
        logo_url: logo, // base64 o URL
        active: true,
        always_open: false,
        kanban_enabled: true,
      })
      .select('id')
      .single()

    if (merchantError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: merchantError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId, merchantId: merchant.id })
  } catch (err) {
    console.error('Error en registro:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}