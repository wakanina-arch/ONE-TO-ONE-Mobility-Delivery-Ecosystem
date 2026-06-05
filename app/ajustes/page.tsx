'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type TemaColor = 'default' | 'rojo' | 'verde' | 'azul' | 'morado'

// Datos curiosos de Wikipedia sobre Quito
const datosWikipedia = [
  'Quito fue la primera ciudad en ser declarada Patrimonio de la Humanidad por la UNESCO en 1978.',
  'El Centro Histórico de Quito es uno de los más grandes y mejor conservados de América Latina.',
  'El teleférico de Quito sube hasta los 4,050 metros sobre el nivel del mar.',
  'La Virgen del Panecillo está hecha de 7,000 piezas de aluminio.',
  'Quito tiene el volcán activo más alto del mundo: El Cotopaxi (5,897 m).',
  'La mitad del mundo está en Quito, donde se puede parar con un pie en cada hemisferio.',
  'El parque La Carolina tiene 67 hectáreas, más grande que 100 campos de fútbol.',
  'Quito fue fundada en 1534 sobre una antigua ciudad inca.',
  'Las mejores empanadas de viento están en el Centro Histórico de Quito.',
]

export default function AjustesPage() {
  const router = useRouter()
  const [tema, setTema] = useState<TemaColor>('default')
  const [sonidos, setSonidos] = useState(true)
  const [efectos, setEfectos] = useState(true)
  const [nombreNave, setNombreNave] = useState('Halcón ONE')
  const [clima, setClima] = useState<any>(null)
  const [cargandoClima, setCargandoClima] = useState(true)
  const [mostrarMetro, setMostrarMetro] = useState(false)
  const [mostrarWikipedia, setMostrarWikipedia] = useState(false)
  const [busquedaWikipedia, setBusquedaWikipedia] = useState('')
  const [resultadoWikipedia, setResultadoWikipedia] = useState<string | null>(null)
  const [cargandoWikipedia, setCargandoWikipedia] = useState(false)
  const [noMolestar, setNoMolestar] = useState(false)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false)

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedTema = localStorage.getItem('rider-tema') as TemaColor
    if (savedTema) setTema(savedTema)
    const savedSonidos = localStorage.getItem('rider-sonidos')
    if (savedSonidos) setSonidos(savedSonidos === 'true')
    const savedEfectos = localStorage.getItem('rider-efectos')
    if (savedEfectos) setEfectos(savedEfectos === 'true')
    const savedNombre = localStorage.getItem('rider-nombre-nave')
    if (savedNombre) setNombreNave(savedNombre)
    const savedNoMolestar = localStorage.getItem('rider-no-molestar')
    if (savedNoMolestar) setNoMolestar(savedNoMolestar === 'true')
    
    // Cargar clima de Quito
    fetchClima()
  }, [])

  const fetchClima = async () => {
    setCargandoClima(true)
    try {
      // Usando API gratuita de Open-Meteo para Quito
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-0.22985&longitude=-78.52495&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability&timezone=America/Guayaquil')
      const data = await response.json()
      setClima(data.current_weather)
    } catch (error) {
      console.error('Error cargando clima:', error)
    } finally {
      setCargandoClima(false)
    }
  }

  const getWeatherIcon = (weathercode: number) => {
    // Códigos de Open-Meteo: 0=despejado, 1-3=parcialmente nublado, 45-48=niebla, 51-67=lluvia, 71-77=nieve
    if (weathercode === 0) return '☀️'
    if (weathercode <= 3) return '⛅'
    if (weathercode <= 48) return '🌫️'
    if (weathercode <= 67) return '🌧️'
    if (weathercode <= 77) return '❄️'
    return '🌤️'
  }

  const getWeatherName = (weathercode: number) => {
    if (weathercode === 0) return 'Despejado'
    if (weathercode <= 3) return 'Parcialmente nublado'
    if (weathercode <= 48) return 'Niebla'
    if (weathercode <= 67) return 'Lluvia'
    if (weathercode <= 77) return 'Nieve'
    return 'Variable'
  }

  const guardarTema = (nuevoTema: TemaColor) => {
    setTema(nuevoTema)
    localStorage.setItem('rider-tema', nuevoTema)
    document.documentElement.style.setProperty('--theme-color', getColorValue(nuevoTema))
  }

  const getColorValue = (t: TemaColor): string => {
    switch (t) {
      case 'rojo': return '#ef4444'
      case 'verde': return '#22c55e'
      case 'azul': return '#3b82f6'
      case 'morado': return '#a855f7'
      default: return '#f59e0b'
    }
  }

  const toggleNoMolestar = () => {
    const nuevo = !noMolestar
    setNoMolestar(nuevo)
    localStorage.setItem('rider-no-molestar', nuevo.toString())
  }

  const buscarWikipedia = async () => {
    if (!busquedaWikipedia.trim()) return
    setCargandoWikipedia(true)
    try {
      const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(busquedaWikipedia)}`)
      const data = await res.json()
      if (data.extract) {
        setResultadoWikipedia(data.extract)
      } else {
        setResultadoWikipedia('No se encontró ningún artículo con ese nombre.')
      }
    } catch (error) {
      setResultadoWikipedia('Error al consultar Wikipedia.')
    }
    setCargandoWikipedia(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 pb-20 overflow-y-auto">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-black/80 backdrop-blur-sm py-3 -mx-4 px-4 z-10">
          <button 
            onClick={() => router.back()}
            className="text-white/60 hover:text-white text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-amber-500 font-mono">⚙️ AJUSTES</h1>
        </div>

        {/* ===== SECCIÓN 1: MI NAVE ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">🚀 Mi nave</h2>
          <input
            type="text"
            value={nombreNave}
            onChange={(e) => {
              setNombreNave(e.target.value)
              localStorage.setItem('rider-nombre-nave', e.target.value)
            }}
            maxLength={30}
            className="w-full bg-gray-700 text-white p-3 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Nombre de tu nave"
          />
          <p className="text-white/40 text-xs">Aparecerá en el mapa sobre tu marcador</p>
        </div>

        {/* ===== SECCIÓN 2: CLIMA EN VIVO ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">🌤️ Clima en Quito</h2>
          {cargandoClima ? (
            <div className="flex items-center gap-2 text-white/50">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Cargando...</span>
            </div>
          ) : clima ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getWeatherIcon(clima.weathercode)}</span>
                <div>
                  <p className="text-white font-bold">{getWeatherName(clima.weathercode)}</p>
                  <p className="text-white/60 text-sm">Actualizado ahora</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{Math.round(clima.temperature)}°C</p>
                <p className="text-white/40 text-xs">Sensación térmica</p>
              </div>
            </div>
          ) : (
            <p className="text-white/50">No se pudo cargar el clima</p>
          )}
          <button 
            onClick={fetchClima}
            className="mt-3 text-amber-400 text-sm hover:text-amber-300 transition"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* ===== SECCIÓN 3: TEMA VISUAL ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">🎨 Tema de la app</h2>
          <div className="flex gap-3 flex-wrap">
            {(['default', 'rojo', 'verde', 'azul', 'morado'] as TemaColor[]).map((color) => (
              <button
                key={color}
                onClick={() => guardarTema(color)}
                className={`w-10 h-10 rounded-full transition-all ${
                  tema === color ? 'ring-2 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: getColorValue(color) }}
              />
            ))}
          </div>
        </div>

        {/* ===== SECCIÓN 4: MAPA DEL METRO DE QUITO ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <button 
            onClick={() => setMostrarMetro(!mostrarMetro)}
            className="w-full flex justify-between items-center text-white font-bold"
          >
            <span className="flex items-center gap-2">🚇 Mapa del Metro</span>
            <span className="text-amber-400">{mostrarMetro ? '▼' : '▶'}</span>
          </button>
          
          {mostrarMetro && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-white">Línea 1 (Quitumbe - El Labrador)</span>
                  </div>
                  <div className="ml-6 space-y-1 text-white/60 text-xs">
                    <p>🚉 Quitumbe</p>
                    <p>🚉 La Magdalena</p>
                    <p>🚉 San Francisco</p>
                    <p>🚉 La Carolina</p>
                    <p>🚉 El Labrador</p>
                  </div>
                  <p className="text-white/40 text-xs mt-2">Horario: 05:30 - 23:00 | 15 estaciones</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== SECCIÓN 5: WIKIPEDIA BUSCADOR ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">📖 Wikipedia</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={busquedaWikipedia}
              onChange={(e) => setBusquedaWikipedia(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarWikipedia()}
              placeholder="Buscar... (ej. Quito)"
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={buscarWikipedia}
              className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg font-bold transition text-white"
            >
              🔍
            </button>
          </div>
          {cargandoWikipedia && <p className="text-white/50 text-sm">Buscando...</p>}
          {resultadoWikipedia && (
            <div className="bg-gray-900 p-3 rounded-lg mt-2 border border-amber-500/30">
              <p className="text-white/80 text-sm leading-relaxed">{resultadoWikipedia}</p>
            </div>
          )}
        </div>

        {/* ===== SECCIÓN 6: SONIDOS Y EFECTOS ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">🔊 Sonidos y efectos</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/80">Efectos de nave</span>
              <button
                onClick={() => {
                  setSonidos(!sonidos)
                  localStorage.setItem('rider-sonidos', (!sonidos).toString())
                }}
                className={`px-4 py-1 rounded-full transition-colors ${sonidos ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                {sonidos ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/80">Animaciones</span>
              <button
                onClick={() => {
                  setEfectos(!efectos)
                  localStorage.setItem('rider-efectos', (!efectos).toString())
                }}
                className={`px-4 py-1 rounded-full transition-colors ${efectos ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                {efectos ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* ===== SECCIÓN 7: NO MOLESTAR (SUGERENCIA EXTRA) ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-purple-500/30 bg-gradient-to-r from-gray-800/50 to-purple-900/20">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🔕</span> Modo No Molestar
          </h2>
          <p className="text-white/70 text-xs mb-3">
            Desactiva notificaciones durante un tiempo (ideal para descansos)
          </p>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Activar modo</span>
            <button
              onClick={toggleNoMolestar}
              className={`px-4 py-1 rounded-full transition-colors ${noMolestar ? 'bg-purple-600' : 'bg-gray-600'}`}
            >
              {noMolestar ? 'ACTIVO' : 'INACTIVO'}
            </button>
          </div>
        </div>

        {/* ===== SECCIÓN 8: ESTADÍSTICAS (SUGERENCIA EXTRA) ===== */}
        <div className="bg-gray-800/50 rounded-xl p-5 mb-4 border border-gray-700">
          <button 
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            className="w-full flex justify-between items-center text-white font-bold"
          >
            <span className="flex items-center gap-2">📊 Mi sesión</span>
            <span className="text-amber-400">{mostrarEstadisticas ? '▼' : '▶'}</span>
          </button>
          
          {mostrarEstadisticas && (
            <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Versión:</span>
                <span className="text-white font-semibold">0.1.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Sector:</span>
                <span className="text-white font-semibold">
                  {typeof localStorage !== 'undefined' ? localStorage.getItem('rider-sector-name') || 'Ninguno' : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tema activo:</span>
                <span className="text-white font-semibold capitalize">{tema}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Modo no molestar:</span>
                <span className={`font-semibold ${noMolestar ? 'text-purple-400' : 'text-white/60'}`}>
                  {noMolestar ? 'ACTIVO' : 'Inactivo'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botón guardar */}
        <button
          onClick={() => router.back()}
          className="w-full mt-4 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition shadow-lg"
        >
          ✓ Guardar y volver
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Todos los cambios se guardan automáticamente
        </p>
      </div>
    </div>
  )
}
