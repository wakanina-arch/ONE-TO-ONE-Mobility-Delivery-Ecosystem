'use client'

interface ComercioHeroProps {
  logo?: string
  nombre?: string
  horario?: string | { apertura: string; cierre: string }
}

export function ComercioHero({ 
  logo,
  nombre,
  horario = "08:00 - 24:00"
}: ComercioHeroProps) {
  // Convertir horario a string si es objeto
  const horarioTexto = typeof horario === 'object' 
    ? `${horario.apertura} - ${horario.cierre}`
    : horario || "08:00 - 24:00"

  return (
    <div className="flex justify-center items-center py-8 px-4">
      <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg overflow-hidden">
        {logo ? (
          <img 
            src={logo} 
            alt={nombre || 'Comercio'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">🔱</span>
        )}
      </div>
    </div>
  )
}