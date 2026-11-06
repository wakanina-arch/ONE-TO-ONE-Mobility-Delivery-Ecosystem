import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente con service_role (SOLO en servidor, nunca en cliente)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      email,
      password,
      nombreComercio,
      propietario,
      ruc,
      telefono,
      direccion,
      ciudad,
      categoriaCocina,
      descripcion,
      horarioApertura,
      horarioCierre,
      plan,
      logo,
      aceptaTerminos,
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

    // 3. Crear comercio en merchants (pendiente de aprobación)
    const { error: merchantError } = await supabaseAdmin
      .from('merchants')
      .insert({
        user_id: userId,
        name: nombreComercio,
        address: direccion,
        sector: ciudad, // o el sector real
        phone: telefono,
        description: descripcion,
        logo_url: logo, // base64 o URL
        active: false, // pendiente de aprobación
        always_open: false,
        kanban_enabled: true,
      })

    if (merchantError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: merchantError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (err) {
    console.error('Error en registro:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}