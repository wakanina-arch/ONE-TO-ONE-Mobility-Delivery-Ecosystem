'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ManualUsuario } from './ManualUsuario'
import { 
  X, Camera, Store, User, FileText, Phone, Mail, MapPin, Clock, 
  CreditCard, Shield, CheckCircle, AlertCircle, ArrowRight, 
  Building2, Briefcase, ChevronRight, ChevronLeft, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIAS_COCINA = [
  'Ecuatoriana', 'Mexicana', 'Italiana', 'Japonesa', 'Peruana',
  'Española', 'Mediterránea', 'Comida rápida', 'Fusión', 'Otra'
]

const PLANES = [
  { id: 'basico', nombre: 'Básico', comision: '30%', desc: 'Ideal para empezar', icon: <Shield className="h-4 w-4" /> },
  { id: 'plus', nombre: 'Plus', comision: '25%', desc: 'Menor comisión por pedido', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'premium', nombre: 'Premium', comision: '15%', desc: 'Comisión mínima + marketing', icon: <Star className="h-4 w-4" /> }
]

interface RegistroComercioProps {
  onBack: () => void
  onIrAlPanel?: (id: number) => void
}

export function RegistroComercio({ onBack, onIrAlPanel }: RegistroComercioProps) {
  const [step, setStep] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [mostrarContrato, setMostrarContrato] = useState(false)
  const [contratoLeido, setContratoLeido] = useState(false)
  const [mostrarManual, setMostrarManual] = useState(false)
  const [formData, setFormData] = useState({
    nombreComercio: '',
    propietario: '',
    ruc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    categoriaCocina: '',
    descripcion: '',
    horarioApertura: '08:00',
    horarioCierre: '22:00',
    plan: '',
    logo: '',
    confirmaLicencias: false,
    confirmaPreciosReales: false,
    aceptaTerminos: false,
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  const validarStep1 = () => {
    const err: Record<string, string> = {}
    if (!formData.nombreComercio.trim()) err.nombreComercio = 'Nombre del comercio requerido'
    if (!formData.propietario.trim()) err.propietario = 'Nombre del propietario requerido'
    if (!formData.ruc.trim()) err.ruc = 'RUC requerido (13 dígitos)'
    else if (!/^\d{13}$/.test(formData.ruc)) err.ruc = 'RUC debe tener 13 dígitos numéricos'
    if (!formData.email.trim()) err.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = 'Email no válido'
    if (!formData.telefono.trim()) err.telefono = 'Teléfono requerido'
    else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ''))) err.telefono = 'Teléfono debe tener 10 dígitos'
    if (!formData.logo) err.logo = 'Sube el logo de tu negocio'
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const validarStep2 = () => {
    const err: Record<string, string> = {}
    if (!formData.direccion.trim()) err.direccion = 'Dirección requerida'
    if (!formData.ciudad.trim()) err.ciudad = 'Ciudad requerida'
    if (!formData.categoriaCocina) err.categoriaCocina = 'Selecciona una categoría'
    if (!formData.plan) err.plan = 'Selecciona un plan'
    if (!formData.confirmaLicencias) err.confirmaLicencias = 'Debes confirmar las licencias'
    if (!formData.confirmaPreciosReales) err.confirmaPreciosReales = 'Debes confirmar la correspondencia de precios'
    if (!contratoLeido) err.aceptaTerminos = 'Debes leer el contrato antes de aceptar'
    else if (!formData.aceptaTerminos) err.aceptaTerminos = 'Debes aceptar los términos'
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleNext = () => validarStep1() && setStep(2)

  const comprimirImagen = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 280
          canvas.height = 196
          const ctx = canvas.getContext('2d')!
          const targetRatio = 280 / 196
          const imgRatio = img.width / img.height
          let sx = 0, sy = 0, sw = img.width, sh = img.height
          if (imgRatio > targetRatio) {
            sh = img.height
            sw = img.height * targetRatio
            sx = (img.width - sw) / 2
          } else {
            sw = img.width
            sh = img.width / targetRatio
            sy = (img.height - sh) / 2
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 280, 196)
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.src = ev.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrores(prev => ({ ...prev, logo: 'Solo se permiten imágenes' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrores(prev => ({ ...prev, logo: 'Máximo 5MB' }))
      return
    }
    try {
      const base64 = await comprimirImagen(file)
      setFormData(prev => ({ ...prev, logo: base64 }))
      setLogoPreview(base64)
      setErrores(prev => ({ ...prev, logo: '' }))
    } catch {
      setErrores(prev => ({ ...prev, logo: 'Error al procesar la imagen' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarStep2()) return
    setEnviando(true)
    try {
      const registros = JSON.parse(localStorage.getItem('registros_comercios') || '[]')
      const nuevoRegistro = { ...formData, id: Date.now(), estado: 'pendiente', fechaRegistro: new Date().toISOString() }
      registros.push(nuevoRegistro)
      localStorage.setItem('registros_comercios', JSON.stringify(registros))
      setExito(true)
      setMostrarManual(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setEnviando(false)
    }
  }

  if (mostrarManual) {
    return (
      <ManualUsuario 
        onClose={() => setMostrarManual(false)}
        onAcceder={() => {
          setMostrarManual(false)
          if (onIrAlPanel) {
            onIrAlPanel(Date.now())
          }
        }}
      />
    )
  }

  if (exito) {
    const registros = JSON.parse(localStorage.getItem('registros_comercios') || '[]')
    const ultimoRegistro = registros[registros.length - 1]
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 text-center animate-fade-in shadow-2xl border border-olive-500/30">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-olive-500/20 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-olive-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">¡Registro exitoso!</h2>
          <p className="text-gray-400 text-sm mb-4">Tu comercio está listo para configurar</p>
          <Button onClick={() => onIrAlPanel?.(ultimoRegistro?.id)} className="w-full bg-olive-600 hover:bg-olive-700 text-white text-sm h-9">
            🚀 Configurar mi negocio
          </Button>
          <Button variant="ghost" onClick={onBack} className="mt-2 w-full text-gray-400 text-xs">Hacerlo después</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="h-4 w-4 text-olive-400" /> Registro de Comercio
            </h2>
            <p className="text-[10px] text-gray-400">Únete a ONE TO ONE</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-700 bg-gray-800/30">
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === 1 ? "bg-olive-600 text-white" : "bg-gray-700 text-gray-400")}>1</div>
          <div className={cn("w-12 h-0.5", step >= 2 ? "bg-olive-600" : "bg-gray-700")} />
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === 2 ? "bg-olive-600 text-white" : "bg-gray-700 text-gray-400")}>2</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {step === 1 ? (
              <>
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Store className="h-3 w-3" /> Nombre del comercio *</label>
                  <Input name="nombreComercio" value={formData.nombreComercio} onChange={handleChange} placeholder="Ej: Restaurante El Sabor" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.nombreComercio && <p className="text-[9px] text-red-400 mt-0.5">{errores.nombreComercio}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><User className="h-3 w-3" /> Propietario *</label>
                  <Input name="propietario" value={formData.propietario} onChange={handleChange} placeholder="Nombre completo" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.propietario && <p className="text-[9px] text-red-400 mt-0.5">{errores.propietario}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><FileText className="h-3 w-3" /> RUC *</label>
                  <Input name="ruc" value={formData.ruc} onChange={handleChange} placeholder="13 dígitos" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.ruc && <p className="text-[9px] text-red-400 mt-0.5">{errores.ruc}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Mail className="h-3 w-3" /> Email *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.email && <p className="text-[9px] text-red-400 mt-0.5">{errores.email}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono *</label>
                  <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="0999999999" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.telefono && <p className="text-[9px] text-red-400 mt-0.5">{errores.telefono}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400">Logo del negocio *</label>
                  {logoPreview ? (
                    <div className="relative w-16 h-16 mt-1 mx-auto">
                      <img src={logoPreview} className="w-full h-full object-cover rounded-xl border-2 border-olive-500" />
                      <button type="button" onClick={() => { setLogoPreview(null); setFormData(prev => ({ ...prev, logo: '' })) }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-2 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer mt-1 hover:border-olive-500 bg-gray-800/30 transition-colors">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Camera className="h-5 w-5 mb-0.5 text-gray-400" />
                      <span className="text-[10px] text-gray-400">Subir logo</span>
                      <span className="text-[8px] text-gray-500">JPG, PNG · Máx 2MB</span>
                    </label>
                  )}
                  {errores.logo && <p className="text-[9px] text-red-400 mt-0.5">{errores.logo}</p>}
                </div>
                
                <Button type="button" onClick={handleNext} className="w-full bg-olive-600 hover:bg-olive-700 text-white text-xs h-8">
                  Siguiente <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección *</label>
                  <Input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, número" className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.direccion && <p className="text-[9px] text-red-400 mt-0.5">{errores.direccion}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Building2 className="h-3 w-3" /> Ciudad *</label>
                  <Input name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Quito, Guayaquil..." className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  {errores.ciudad && <p className="text-[9px] text-red-400 mt-0.5">{errores.ciudad}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400">Tipo de cocina *</label>
                  <select name="categoriaCocina" value={formData.categoriaCocina} onChange={handleChange} className="w-full p-1.5 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-xs mt-0.5">
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS_COCINA.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                  {errores.categoriaCocina && <p className="text-[9px] text-red-400 mt-0.5">{errores.categoriaCocina}</p>}
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400">Descripción</label>
                  <Textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} placeholder="Describe tu negocio..." className="mt-0.5 bg-gray-800/50 border-gray-700 text-white text-xs resize-none" />
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Apertura</label>
                    <Input name="horarioApertura" type="time" value={formData.horarioApertura} onChange={handleChange} className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Cierre</label>
                    <Input name="horarioCierre" type="time" value={formData.horarioCierre} onChange={handleChange} className="mt-0.5 h-8 text-xs bg-gray-800/50 border-gray-700 text-white" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-400 mb-1 block">Plan de suscripción *</label>
                  <div className="flex gap-1">
                    {PLANES.map(p => (
                      <button key={p.id} type="button" onClick={() => setFormData(prev => ({ ...prev, plan: p.id }))} className={cn("flex-1 p-2 rounded-lg border text-center transition-all", formData.plan === p.id ? "bg-olive-600/20 border-olive-500" : "bg-gray-800/30 border-gray-700 hover:border-gray-500")}>
                        <div className="flex items-center justify-center gap-1 text-olive-400 mb-0.5">{p.icon}</div>
                        <div className="font-bold text-white text-[10px]">{p.nombre}</div>
                        <div className="text-xs font-bold text-olive-400">{p.comision}</div>
                        <div className="text-[8px] text-gray-500">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                  {errores.plan && <p className="text-[9px] text-red-400 mt-0.5">{errores.plan}</p>}
                </div>
                
                <label className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <input type="checkbox" name="confirmaLicencias" checked={formData.confirmaLicencias} onChange={handleChange} className="accent-olive-500 w-3 h-3" />
                  Confirmo que el restaurante cumple con todas las licencias de apertura
                </label>
                {errores.confirmaLicencias && <p className="text-[9px] text-red-400">{errores.confirmaLicencias}</p>}
                
                <label className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <input type="checkbox" name="confirmaPreciosReales" checked={formData.confirmaPreciosReales} onChange={handleChange} className="accent-olive-500 w-3 h-3" />
                  Confirmo que los precios de la app corresponden con los del local
                </label>
                {errores.confirmaPreciosReales && <p className="text-[9px] text-red-400">{errores.confirmaPreciosReales}</p>}
                
                <label className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <input type="checkbox" name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} disabled={!contratoLeido} className="accent-olive-500 w-3 h-3" />
                  Aceptar los <button type="button" onClick={() => setMostrarContrato(true)} className="text-orange-500 underline">términos y condiciones</button>
                </label>
                {errores.aceptaTerminos && <p className="text-[9px] text-red-400">{errores.aceptaTerminos}</p>}
                
                <Button type="submit" disabled={enviando} className="w-full bg-olive-600 hover:bg-olive-700 text-white text-xs h-8">
                  {enviando ? 'Registrando...' : '🚀 Registrar comercio'}
                </Button>
                
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-[10px] text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <ChevronLeft className="h-3 w-3" /> Paso anterior
                </button>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-700">
          <button onClick={onBack} className="w-full text-center text-[9px] text-gray-500 hover:text-gray-400 transition-colors">
            Ya tengo cuenta · Iniciar sesión
          </button>
        </div>
      </div>

       {/* Modal de contrato */}
      {mostrarContrato && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col border border-gray-700">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="font-bold text-white text-sm flex items-center gap-1"><FileText className="h-4 w-4 text-olive-400" /> Contrato</h3>
              <div className="flex gap-1">
                <button onClick={() => window.print()} className="text-gray-400 hover:text-white text-xs">🖨️</button>
                <button onClick={() => setMostrarContrato(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
      
      {/* Contenido del contrato */}
      <div className="flex-1 overflow-y-auto p-4 text-xs text-gray-300 space-y-2" onScroll={(e) => {
              const target = e.target as HTMLDivElement
              if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) setContratoLeido(true)
            }}>
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🔱</span>
                  <h2 className="text-base font-bold text-white">ONE TO ONE</h2>
                </div>
                <p className="text-[9px] text-gray-500">— Desplaza hasta el final para aceptar —</p>
              </div>
              <div className="border-t border-gray-700 my-2" />
              <p className="text-left font-bold text-olive-400 text-[10px]">CLÁUSULAS DE SUSCRIPCIÓN:</p>
              <div className="space-y-2">
          <p><strong>1. Definición del Servicio y Objeto del Contrato</strong></p>
          <p>La plataforma One To One actúa como intermediario tecnológico que conecta tu restaurante con nuevos clientes en Ecuador. A través de la aplicación, los usuarios pueden descubrir tu negocio, realizar pedidos para recogida en local o entrega a domicilio, y realizar pagos de forma segura.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Nuestro papel:</strong> Te ofrecemos la infraestructura digital (app, pasarela de pago, sistema de gestión de pedidos) y el acceso a una base de clientes activos.</li>
            <li><strong>Tu papel:</strong> Sigues siendo el propietario absoluto de tu negocio. Eres el único responsable de la preparación de los alimentos, su calidad, el cumplimiento de las normativas sanitarias de la ARCSA, y la experiencia del cliente en el punto de venta.</li>
          </ul>
          
          <p><strong>2. Modelo Económico: Comisiones y Transparencia</strong></p>
          <p>El modelo de ingresos se basa en una comisión sobre el valor de cada pedido completado con éxito, que varía entre el 15% y el 30% según el plan elegido.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La comisión cubre: marketing, procesamiento de pagos, soporte técnico 24/7 y logística de coordinación.</li>
            <li>Si utilizas el servicio de reparto, puede aplicarse una tarifa adicional por entrega.</li>
            <li>No se aplican costes ocultos. Todo gasto será comunicado y aceptado previamente.</li>
          </ul>
          
          <p><strong>3. Responsabilidades sobre Repartidores</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Si contratas nuestro servicio de reparto, gestionamos la relación con los repartidores mediante contratos de servicios según el Código de Comercio ecuatoriano.</li>
            <li>Si realizas envíos con personal propio, tú serás responsable de cumplir con las obligaciones laborales y de seguridad social.</li>
          </ul>
          <p className="text-xs text-orange-500">⚠ Algunos municipios regulan la actividad de reparto mediante ordenanzas municipales. Revisa la normativa local de tu ciudad.</p>
          
          <p><strong>4. Propiedad Intelectual: Tus Recetas y Tu Marca</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Las fotografías, descripciones creativas y el diseño de tu carta digital son propiedad tuya, protegidos por la Ley de Propiedad Intelectual de Ecuador.</li>
            <li>Al asociarte, nos concedes una licencia limitada y no exclusiva para mostrar tu negocio dentro de la app y promocionarlo en canales oficiales.</li>
            <li>Nos comprometemos a no divulgar ni utilizar tus procesos internos para beneficio propio.</li>
          </ul>
          
          <p><strong>5. Protección de Datos y Privacidad (LOPDP)</strong></p>
          <p>Cumplir con la Ley Orgánica de Protección de Datos Personales es prioridad:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La plataforma trata los datos de clientes (nombre, dirección, historial de pedidos) exclusivamente para gestionar pedidos, cumpliendo la LOPDP.</li>
            <li>Implementamos medidas de seguridad técnicas para garantizar confidencialidad, integridad y disponibilidad de los datos.</li>
          </ul>
          
          <p><strong>6. Duración, Renovación y Rescisión</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Duración inicial de 12 meses con renovación automática anual.</li>
            <li>No renovación: comunicar con al menos 30 días de antelación.</li>
            <li>Sin penalizaciones por rescisión anticipada.</li>
          </ul>
          
          <p><strong>7. Legislación Aplicable y Resolución de Conflictos</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Legislación aplicable: República del Ecuador.</li>
            <li>Resolución: mediación previa obligatoria.</li>
          </ul>
        </div>
        
        <p className="text-center text-gray-500 text-[9px] pt-2">— Documento para comercios — Ecuador —</p>
      </div>
      
      {/* Footer con botón */}
      <div className="p-3 border-t border-gray-700">
              <button onClick={() => { setMostrarContrato(false); setMostrarManual(true) }} className="w-full py-1.5 bg-olive-600 hover:bg-olive-700 text-white rounded-lg font-bold text-xs transition-colors">
                {contratoLeido ? 'Aceptar' : 'Cerrar'}
              </button>
            </div>
    </div>
  </div>
)}
      
      

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}