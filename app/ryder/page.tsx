'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  HeartPulse,
  LockKeyhole,
  Pencil,
  Save,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { getPanelSession } from '@/components/PanelAccessModal'
import { avatars } from '@/lib/models/avatar'

interface PerfilRider {
  nombre: string
  email: string
  telefono: string
  cedula: string
  fechaNacimiento: string
  genero: string
  direccion: string
  ciudad: string
  numeroIess: string
  bancoNombre: string
  bancoTipoCuenta: string
  bancoNumeroCuenta: string
  peso: string
  altura: string
  tipoSanguineo: string
  condicionMedica: string
  contactoEmergencia: string
  rating: number
}

type Seccion = 'personal' | 'seguridad' | 'medica'

const perfilInicial: PerfilRider = {
  nombre: 'Rider',
  email: '',
  telefono: '',
  cedula: '',
  fechaNacimiento: '',
  genero: '',
  direccion: '',
  ciudad: '',
  numeroIess: '',
  bancoNombre: '',
  bancoTipoCuenta: '',
  bancoNumeroCuenta: '',
  peso: '',
  altura: '',
  tipoSanguineo: '',
  condicionMedica: '',
  contactoEmergencia: '',
  rating: 0,
}

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60'

const labelClass = 'block text-xs font-semibold tracking-wide text-muted-foreground'

export default function PerfilRiderPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<PerfilRider>(perfilInicial)
  const [perfilOriginal, setPerfilOriginal] = useState<PerfilRider>(perfilInicial)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [secciones, setSecciones] = useState<Record<Seccion, boolean>>({
    personal: true,
    seguridad: false,
    medica: false,
  })
  const [avatarActual, setAvatarActual] = useState<string | null>(null)
  const [mostrarModalAvatar, setMostrarModalAvatar] = useState(false)
  const [guardandoAvatar, setGuardandoAvatar] = useState(false)

  const avatarData = useMemo(
    () => avatars.find((avatar) => avatar.id === avatarActual),
    [avatarActual],
  )

  useEffect(() => {
    let activo = true

    const cargarRider = async () => {
      setCargando(true)
      setError('')

      try {
        const sesion = getPanelSession('rider')
        if (!sesion?.id) {
          throw new Error('No se encontró una sesión de rider activa. Vuelve a iniciar sesión.')
        }

        if (sesion.avatar && activo) setAvatarActual(sesion.avatar)

        const supabase = createClient()
        const { data: rider, error: consultaError } = await supabase
          .from('riders')
          .select('*')
          .eq('id', sesion.id)
          .maybeSingle()

        if (consultaError) throw consultaError
        if (!rider) throw new Error('No se encontró el perfil de este rider.')

        const datos: PerfilRider = {
          nombre: rider.username || sesion.name || 'Rider',
          email: rider.email || '',
          telefono: rider.telefono || rider.phone || '',
          cedula: rider.cedula || '',
          fechaNacimiento: rider.fecha_nacimiento || '',
          genero: rider.genero || '',
          direccion: rider.direccion || '',
          ciudad: rider.ciudad || '',
          numeroIess: rider.numero_iess || '',
          bancoNombre: rider.banco_nombre || '',
          bancoTipoCuenta: rider.banco_tipo_cuenta || '',
          bancoNumeroCuenta: rider.banco_numero_cuenta || '',
          peso: rider.peso == null ? '' : String(rider.peso),
          altura: rider.altura == null ? '' : String(rider.altura),
          tipoSanguineo: rider.tipo_sanguineo || rider.blood_type || '',
          condicionMedica: rider.condicion_medica || '',
          contactoEmergencia: rider.contacto_emergencia || '',
          rating: Number(rider.rating) || 0,
        }

        if (!activo) return
        setPerfil(datos)
        setPerfilOriginal(datos)
        if (rider.avatar) setAvatarActual(rider.avatar)
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el perfil. Inténtalo de nuevo.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarRider()
    return () => {
      activo = false
    }
  }, [])

  const cambiarCampo = (campo: keyof PerfilRider, valor: string) => {
    setPerfil((actual) => ({ ...actual, [campo]: valor }))
    setMensaje('')
    setError('')
  }

  const alternarSeccion = (seccion: Seccion) => {
    setSecciones((actual) => ({ ...actual, [seccion]: !actual[seccion] }))
  }

  const cancelarEdicion = () => {
    setPerfil(perfilOriginal)
    setEditando(false)
    setError('')
    setMensaje('')
  }

  const guardarCambios = async () => {
    const sesion = getPanelSession('rider')
    if (!sesion?.id) {
      setError('Tu sesión ha caducado. Vuelve a iniciar sesión.')
      return
    }

    if (!perfil.nombre.trim()) {
      setError('El nombre completo es obligatorio.')
      setSecciones((actual) => ({ ...actual, personal: true }))
      return
    }

    const peso = perfil.peso.trim() ? Number(perfil.peso) : null
    const altura = perfil.altura.trim() ? Number(perfil.altura) : null

    if ((peso !== null && (!Number.isFinite(peso) || peso <= 0)) ||
        (altura !== null && (!Number.isFinite(altura) || altura <= 0))) {
      setError('Introduce un peso y una altura válidos, mayores que cero.')
      setSecciones((actual) => ({ ...actual, medica: true }))
      return
    }

    setGuardando(true)
    setError('')
    setMensaje('')

    try {
      const supabase = createClient()
      const payload = {
        username: perfil.nombre.trim(),
        telefono: perfil.telefono.trim() || null,
        phone: perfil.telefono.trim() || null,
        cedula: perfil.cedula.trim() || null,
        fecha_nacimiento: perfil.fechaNacimiento || null,
        genero: perfil.genero || null,
        direccion: perfil.direccion.trim() || null,
        ciudad: perfil.ciudad.trim() || null,
        numero_iess: perfil.numeroIess.trim() || null,
        banco_nombre: perfil.bancoNombre.trim() || null,
        banco_tipo_cuenta: perfil.bancoTipoCuenta || null,
        banco_numero_cuenta: perfil.bancoNumeroCuenta.trim() || null,
        peso,
        altura,
        tipo_sanguineo: perfil.tipoSanguineo || null,
        blood_type: perfil.tipoSanguineo || null,
        condicion_medica: perfil.condicionMedica.trim() || null,
        contacto_emergencia: perfil.contactoEmergencia.trim() || null,
      }

      const { error: updateError } = await supabase
        .from('riders')
        .update(payload)
        .eq('id', sesion.id)

      if (updateError) throw updateError

      setPerfilOriginal(perfil)
      setEditando(false)
      setMensaje('Perfil actualizado correctamente.')
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudieron guardar los cambios: ${err.message}`
          : 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const cambiarAvatar = async (avatarId: string) => {
    const sesion = getPanelSession('rider')
    if (!sesion?.id) {
      setError('Tu sesión ha caducado. Vuelve a iniciar sesión.')
      return
    }

    setGuardandoAvatar(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('riders')
        .update({ avatar: avatarId })
        .eq('id', sesion.id)

      if (updateError) throw updateError

      setAvatarActual(avatarId)
      setMostrarModalAvatar(false)
      setMensaje('Imagen de perfil actualizada.')
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo actualizar el avatar: ${err.message}`
          : 'No se pudo actualizar el avatar.',
      )
    } finally {
      setGuardandoAvatar(false)
    }
  }

  const campo = (
    titulo: string,
    llave: keyof PerfilRider,
    tipo = 'text',
    opciones?: { placeholder?: string; soloLectura?: boolean },
  ) => {
    const valor = perfil[llave]
    const valorTexto = String(valor ?? '')

    return (
      <label className={labelClass}>
        {titulo}
        {editando && !opciones?.soloLectura ? (
          <input
            type={tipo}
            value={valorTexto}
            onChange={(event) => cambiarCampo(llave, event.target.value)}
            className={inputClass}
            placeholder={opciones?.placeholder || `Escribe ${titulo.toLowerCase()}`}
            disabled={guardando}
          />
        ) : (
          <p className="mt-1.5 min-h-6 break-words text-sm font-medium text-foreground">
            {valorTexto || 'No registrado'}
          </p>
        )}
      </label>
    )
  }

  const encabezadoSeccion = (
    titulo: string,
    descripcion: string,
    icono: React.ReactNode,
    abierta: boolean,
    accion: () => void,
  ) => (
    <button
      type="button"
      onClick={accion}
      aria-expanded={abierta}
      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-muted/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icono}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{titulo}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{descripcion}</span>
        </span>
      </span>
      {abierta ? (
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </button>
  )

  const cuentaEnmascarada = (numero: string) =>
    numero.length > 4 ? `•••• •••• •••• ${numero.slice(-4)}` : numero || 'No registrada'

  return (
    <div className="min-h-screen bg-background pb-24">
     <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex w-24 shrink-0 items-center justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="min-w-0 flex-1 truncate px-2 text-center font-serif text-lg font-bold text-foreground">
            Área personal
          </h1>

          <div className="flex w-24 shrink-0 justify-end">
            <Button
              variant={editando ? 'default' : 'ghost'}
              size="sm"
              onClick={() => (editando ? guardarCambios() : setEditando(true))}
              className="gap-1.5 text-xs font-semibold"
            >
              {editando ? (
                <>
                  <Check className="h-4 w-4" />
                  Guardar
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 text-primary" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

            <main className="mx-auto max-w-lg space-y-3 px-4 py-4">
        {cargando ? (
          <div className="space-y-3" aria-live="polite">
            <div className="mx-auto h-36 w-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : (
          <>
            {/* CABECERA DE PERFIL FLOTANTE (Sin Card para pantallas pequeñas) */}
            <div className="flex flex-col items-center py-2 text-center">
              <button
                type="button"
                onClick={() => setMostrarModalAvatar(true)}
                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-card/60 transition hover:border-primary/50"
                title="Cambiar casco"
                aria-label="Cambiar casco"
              >
                <span className="absolute inset-3 rounded-full bg-primary/20 blur-lg" />
                {avatarData ? (
                  <img
                    src={avatarData.imagePath}
                    alt={avatarData.name}
                    className="relative h-full w-full scale-[2.8] object-contain"
                  />
                ) : (
                  <span className="relative text-4xl">🪖</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMostrarModalAvatar(true)}
                className="mt-1.5 text-xs font-medium text-primary hover:underline"
              >
                Cambiar casco
              </button>

              <h2 className="mt-1.5 font-serif text-lg font-bold text-foreground">
                {perfil.nombre || 'Mi perfil'}
              </h2>

              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  ID RIDER
                </span>
                <span className="text-muted-foreground/40">·</span>
                <div
                  className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5"
                  aria-label={`Calificación ${perfil.rating} de 5`}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400">
                    {perfil.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}
            {mensaje && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
              >
                {mensaje}
              </div>
            )}


            {editando && (
              <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Pencil className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Modo de edición</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    Actualiza tus datos y guarda los cambios. Si sales sin guardar, puedes descartar la edición con «Cancelar».
                  </p>
                </div>
              </div>
            )}

            <section className="space-y-3">
              <div className="px-1">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Información de cuenta
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mantén tus datos personales y operativos al día.
                </p>
              </div>

              <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                {encabezadoSeccion(
                  'Datos personales',
                  'Identidad, contacto y domicilio',
                  <UserRound className="h-5 w-5" />,
                  secciones.personal,
                  () => alternarSeccion('personal'),
                )}
                {secciones.personal && (
                  <div className="grid gap-x-5 gap-y-5 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
                    {campo('Nombre completo', 'nombre', 'text', { placeholder: 'Tu nombre y apellidos' })}
                    {campo('Correo electrónico', 'email', 'email', { soloLectura: true })}
                    {campo('Cédula', 'cedula', 'text', { placeholder: 'Número de identificación' })}
                    {campo('Teléfono', 'telefono', 'tel', { placeholder: 'Tu número de contacto' })}
                    <label className={labelClass}>
                      Género
                      {editando ? (
                        <select
                          value={perfil.genero}
                          onChange={(event) => cambiarCampo('genero', event.target.value)}
                          className={inputClass}
                          disabled={guardando}
                        >
                          <option value="">Seleccionar</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      ) : (
                        <p className="mt-1.5 text-sm font-medium text-foreground">
                          {perfil.genero === 'M' ? 'Masculino' : perfil.genero === 'F' ? 'Femenino' : perfil.genero || 'No registrado'}
                        </p>
                      )}
                    </label>
                    {campo('Fecha de nacimiento', 'fechaNacimiento', 'date')}
                    <div className="sm:col-span-2">
                      {campo('Dirección', 'direccion', 'text', { placeholder: 'Calle, número y referencia' })}
                    </div>
                    {campo('Ciudad', 'ciudad')}
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
  {encabezadoSeccion(
    'Seguridad y pagos',
    'Afiliación IESS y cuenta bancaria',
    <ShieldCheck className="h-5 w-5" />,
    secciones.seguridad,
    () => alternarSeccion('seguridad'),
  )}
  {secciones.seguridad && (
    <div className="space-y-4 border-t border-border p-4 sm:p-5">
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        {campo('Número de afiliación IESS', 'numeroIess', 'text', { placeholder: 'Número de afiliación' })}
        {campo('Banco', 'bancoNombre', 'text', { placeholder: 'Nombre de la entidad bancaria' })}
        <label className={labelClass}>
          Tipo de cuenta
          {editando ? (
            <select
              value={perfil.bancoTipoCuenta}
              onChange={(event) => cambiarCampo('bancoTipoCuenta', event.target.value)}
              className={inputClass}
              disabled={guardando}
            >
              <option value="">Seleccionar</option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
          ) : (
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {perfil.bancoTipoCuenta || 'No registrado'}
            </p>
          )}
        </label>
        <label className={labelClass}>
          Número de cuenta bancaria
          {editando ? (
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={perfil.bancoNumeroCuenta}
              onChange={(event) => cambiarCampo('bancoNumeroCuenta', event.target.value)}
              className={inputClass}
              placeholder="Número de cuenta"
              disabled={guardando}
            />
          ) : (
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {cuentaEnmascarada(perfil.bancoNumeroCuenta)}
            </p>
          )}
        </label>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5 shrink-0 text-primary" />
        Verifica que tu cuenta sea correcta para recibir tus pagos sin demoras.
      </p>
    </div>
  )}
</Card>


              <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
  {encabezadoSeccion(
    'Información médica',
    'Datos relevantes para atención de emergencia',
    <HeartPulse className="h-5 w-5" />,
    secciones.medica,
    () => alternarSeccion('medica'),
  )}
  {secciones.medica && (
    <div className="grid gap-x-5 gap-y-4 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
      {campo('Peso (kg)', 'peso', 'number', { placeholder: 'Ej. 72' })}
      {campo('Altura (cm)', 'altura', 'number', { placeholder: 'Ej. 175' })}
      <label className={labelClass}>
        Tipo sanguíneo
        {editando ? (
          <select
            value={perfil.tipoSanguineo}
            onChange={(event) => cambiarCampo('tipoSanguineo', event.target.value)}
            className={inputClass}
            disabled={guardando}
          >
            <option value="">Seleccionar</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        ) : (
          <p className="mt-1.5 text-sm font-medium text-foreground">
            {perfil.tipoSanguineo || 'No registrado'}
          </p>
        )}
      </label>
      {campo('Contacto de emergencia', 'contactoEmergencia', 'tel', { placeholder: 'Nombre y teléfono' })}
      <div className="sm:col-span-2">
        {campo('Condición médica o alergias', 'condicionMedica', 'text', { placeholder: 'Indica condiciones relevantes o escribe «Ninguna»' })}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
        <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
        Información confidencial usada únicamente en caso de emergencia.
      </p>
    </div>
  )}
</Card>

            </section>

            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Revisa tus datos periódicamente para mantener tu perfil actualizado.
            </div>
          </>
        )}
      </main>

      {mostrarModalAvatar && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardandoAvatar) {
              setMostrarModalAvatar(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-dialog-title"
            className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Personalización
                </p>
                <h2 id="avatar-dialog-title" className="mt-1 font-serif text-xl font-bold text-foreground">
                  Elige tu casco
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMostrarModalAvatar(false)}
                disabled={guardandoAvatar}
                aria-label="Cerrar ventana"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto pr-1">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  disabled={guardandoAvatar}
                  onClick={() => void cambiarAvatar(avatar.id)}
                  className={`rounded-2xl border p-3 text-center transition hover:border-primary hover:bg-primary/5 disabled:opacity-50 ${
                    avatarActual === avatar.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-background'
                  }`}
                >
                  <img
                    src={avatar.imagePath}
                    alt={avatar.name}
                    className="mx-auto h-20 w-full object-contain"
                  />
                  <span className="mt-2 block truncate text-xs font-medium text-foreground">
                    {avatar.name}
                  </span>
                  {avatarActual === avatar.id && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                      <Check className="h-3 w-3" />
                      Seleccionado
                    </span>
                  )}
                </button>
              ))}
            </div>

            {guardandoAvatar && (
              <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
                Guardando tu selección…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
