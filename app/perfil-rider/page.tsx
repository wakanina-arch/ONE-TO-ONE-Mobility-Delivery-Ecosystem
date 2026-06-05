'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface PerfilRider {
  nombre: string
  email: string
  telefono: string
  cedula: string
  fechaNacimiento: string
  genero: string
  direccion: string
  ciudad: string
  
  password: string
  pin: string
  
  peso: string
  altura: string
  tipoSanguineo: string
  condicionMedica: string
  contactoEmergencia: string
  
  totalEntregas: number
  totalKilometros: number
  tiempoActivo: number
  rating: number
}

const perfilInicial: PerfilRider = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  telefono: '0987654321',
  cedula: '1234567890',
  fechaNacimiento: '1995-06-15',
  genero: 'M',
  direccion: 'Calle Principal 123',
  ciudad: 'Quito',
  
  password: '••••••••',
  pin: '••••',
  
  peso: '75',
  altura: '180',
  tipoSanguineo: 'O+',
  condicionMedica: 'Ninguna',
  contactoEmergencia: '+593987654321',
  
  totalEntregas: 124,
  totalKilometros: 378,
  tiempoActivo: 3420,
  rating: 4.8
}

export default function PerfilRiderPage() {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [perfil, setPerfil] = useState<PerfilRider>(perfilInicial)
  const [expandido, setExpandido] = useState({
    personal: true,
    seguridad: false,
    medica: false,
    productividad: false
  })

  useEffect(() => {
    // Only load from localStorage on mount
    const saved = localStorage.getItem('rider-perfil')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Validate structure
        if (parsed.nombre && typeof parsed === 'object') {
          // Use a separate effect to update state
          const updatePerfil = () => setPerfil(parsed)
          updatePerfil()
        }
      } catch (e) {
        console.error('Error cargando perfil guardado:', e)
      }
    }
  }, [])

  const guardarCambios = () => {
    localStorage.setItem('rider-perfil', JSON.stringify(perfil))
    setEditando(false)
  }

  const handleInputChange = (field: keyof PerfilRider, value: string | number) => {
    setPerfil((prev) => ({ ...prev, [field]: value }))
  }

  const toggleExpandido = (seccion: keyof typeof expandido) => {
    setExpandido((prev) => ({ ...prev, [seccion]: !prev[seccion] }))
  }

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 backdrop-blur-sm py-3 -mx-4 px-4 z-10">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white text-2xl">←</button>
          <h1 className="text-2xl font-bold text-amber-500 font-mono">👤 PERFIL</h1>
          <button 
            onClick={() => editando ? guardarCambios() : setEditando(true)}
            className="text-amber-500 hover:text-amber-400 font-bold text-sm"
          >
            {editando ? '✓ Guardar' : '✎ Editar'}
          </button>
        </div>

        {/* Foto de perfil */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-4xl mb-3 shadow-lg">
            🚴
          </div>
          <h2 className="text-white text-2xl font-bold">{perfil.nombre}</h2>
          <p className="text-amber-400 font-mono">ID RIDER</p>
          <div className="flex items-center gap-2 justify-center mt-1">
            {Array(5).fill(0).map((_, i) => (
              <span key={i} className={i < Math.floor(perfil.rating) ? '⭐' : '☆'} />
            ))}
            <span className="text-white/60 text-sm ml-2">({perfil.rating})</span>
          </div>
        </div>

        {/* ===== SECCIÓN 1: DATOS PERSONALES ===== */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 mb-4">
          <button 
            onClick={() => toggleExpandido('personal')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30 transition"
          >
            <h3 className="text-white font-bold flex items-center gap-2">📋 Datos Personales</h3>
            <span className="text-amber-400">{expandido.personal ? '▼' : '▶'}</span>
          </button>

          {expandido.personal && (
            <div className="p-4 border-t border-gray-700 space-y-3">
              <div>
                <label className="text-white/60 text-xs">Nombre completo</label>
                {editando ? (
                  <input 
                    type="text" 
                    value={perfil.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.nombre}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs">Cédula</label>
                  {editando ? (
                    <input 
                      type="text" 
                      value={perfil.cedula}
                      onChange={(e) => handleInputChange('cedula', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-white font-semibold text-sm">{perfil.cedula}</p>
                  )}
                </div>
                <div>
                  <label className="text-white/60 text-xs">Género</label>
                  {editando ? (
                    <select 
                      value={perfil.genero}
                      onChange={(e) => handleInputChange('genero', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>M</option>
                      <option>F</option>
                      <option>Otro</option>
                    </select>
                  ) : (
                    <p className="text-white font-semibold text-sm">{perfil.genero === 'M' ? 'Masculino' : perfil.genero === 'F' ? 'Femenino' : 'Otro'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs">Fecha de nacimiento</label>
                {editando ? (
                  <input 
                    type="date" 
                    value={perfil.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.fechaNacimiento}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Email</label>
                {editando ? (
                  <input 
                    type="email" 
                    value={perfil.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold text-sm">{perfil.email}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Teléfono</label>
                {editando ? (
                  <input 
                    type="tel" 
                    value={perfil.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.telefono}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Dirección</label>
                {editando ? (
                  <input 
                    type="text" 
                    value={perfil.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold text-sm">{perfil.direccion}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Ciudad</label>
                {editando ? (
                  <input 
                    type="text" 
                    value={perfil.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.ciudad}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECCIÓN 2: SEGURIDAD Y FINANZAS ===== */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 mb-4">
          <button 
            onClick={() => toggleExpandido('seguridad')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30 transition"
          >
            <h3 className="text-white font-bold flex items-center gap-2">🔐 Seguridad y Finanzas</h3>
            <span className="text-amber-400">{expandido.seguridad ? '▼' : '▶'}</span>
          </button>

          {expandido.seguridad && (
            <div className="p-4 border-t border-gray-700 space-y-3">
              <div>
                <label className="text-white/60 text-xs">Contraseña</label>
                {editando ? (
                  <input 
                    type="password" 
                    value={perfil.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.password}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">PIN de seguridad</label>
                {editando ? (
                  <input 
                    type="password" 
                    value={perfil.pin}
                    onChange={(e) => handleInputChange('pin', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={4}
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.pin}</p>
                )}
              </div>

              <div className="bg-amber-600/10 p-3 rounded border border-amber-500/20">
                <p className="text-amber-400 text-xs font-bold">⚠️ Información sensible</p>
                <p className="text-white/60 text-xs mt-1">Estos datos son críticos para tu seguridad. Cámbia solo si es necesario.</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECCIÓN 3: INFORMACIÓN MÉDICA ===== */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 mb-4">
          <button 
            onClick={() => toggleExpandido('medica')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30 transition"
          >
            <h3 className="text-white font-bold flex items-center gap-2">🏥 Información Médica</h3>
            <span className="text-amber-400">{expandido.medica ? '▼' : '▶'}</span>
          </button>

          {expandido.medica && (
            <div className="p-4 border-t border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs">Peso (kg)</label>
                  {editando ? (
                    <input 
                      type="number" 
                      value={perfil.peso}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-white font-semibold">{perfil.peso} kg</p>
                  )}
                </div>
                <div>
                  <label className="text-white/60 text-xs">Altura (cm)</label>
                  {editando ? (
                    <input 
                      type="number" 
                      value={perfil.altura}
                      onChange={(e) => handleInputChange('altura', e.target.value)}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-white font-semibold">{perfil.altura} cm</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs">Tipo de sangre</label>
                {editando ? (
                  <select 
                    value={perfil.tipoSanguineo}
                    onChange={(e) => handleInputChange('tipoSanguineo', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                ) : (
                  <p className="text-white font-semibold">{perfil.tipoSanguineo}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Condición médica relevante</label>
                {editando ? (
                  <textarea 
                    value={perfil.condicionMedica}
                    onChange={(e) => handleInputChange('condicionMedica', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    rows={2}
                  />
                ) : (
                  <p className="text-white font-semibold text-sm">{perfil.condicionMedica}</p>
                )}
              </div>

              <div>
                <label className="text-white/60 text-xs">Contacto de emergencia</label>
                {editando ? (
                  <input 
                    type="tel" 
                    value={perfil.contactoEmergencia}
                    onChange={(e) => handleInputChange('contactoEmergencia', e.target.value)}
                    className="w-full bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-white font-semibold">{perfil.contactoEmergencia}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECCIÓN 4: PRODUCTIVIDAD ===== */}
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 mb-4">
          <button 
            onClick={() => toggleExpandido('productividad')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-700/30 transition"
          >
            <h3 className="text-white font-bold flex items-center gap-2">📊 Productividad</h3>
            <span className="text-amber-400">{expandido.productividad ? '▼' : '▶'}</span>
          </button>

          {expandido.productividad && (
            <div className="p-4 border-t border-gray-700 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 p-3 rounded-lg text-center">
                  <p className="text-white/60 text-xs">Entregas</p>
                  <p className="text-2xl font-bold text-green-400">{perfil.totalEntregas}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg text-center">
                  <p className="text-white/60 text-xs">Km recorridos</p>
                  <p className="text-2xl font-bold text-blue-400">{perfil.totalKilometros}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 p-3 rounded-lg text-center">
                  <p className="text-white/60 text-xs">Tiempo activo</p>
                  <p className="text-lg font-bold text-amber-400">{formatearTiempo(perfil.tiempoActivo)}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg text-center">
                  <p className="text-white/60 text-xs">Calificación</p>
                  <p className="text-2xl font-bold text-yellow-400">★{perfil.rating}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/10 to-blue-600/10 p-3 rounded border border-green-500/20">
                <p className="text-green-400 font-bold text-sm">✓ Buen desempeño</p>
                <p className="text-white/60 text-xs mt-1">Mantén la calidad en tus entregas para mejorar tu rating.</p>
              </div>
            </div>
          )}
        </div>

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="w-full mt-4 bg-gray-700 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition shadow-lg"
        >
          ← Volver
        </button>

        {editando && (
          <div className="mt-3 p-3 bg-amber-600/10 rounded-lg border border-amber-500/30 text-center">
            <p className="text-amber-400 text-xs font-bold">💾 Cambios pendientes</p>
            <p className="text-white/60 text-xs">Haz clic en &quot;Guardar&quot; para aplicar los cambios.</p>
          </div>
        )}
      </div>
    </div>
  )
}