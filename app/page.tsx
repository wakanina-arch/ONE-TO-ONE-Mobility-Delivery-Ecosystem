'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Order } from '@/lib/store'
import { useCartStore } from '@/lib/store'
import { MenuView } from '@/components/menu-view'
import { CartView } from '@/components/cart-view'
import { TicketView } from '@/components/ticket-view'
import Link from 'next/link'
import { Branding } from '@/components/branding'
import { RegistroComercio } from '@/components/registro/RegistroComercio'
import { OpcionesUnion } from '@/components/registro/OpcionesUnion'
import { ChevronRight, Bike } from 'lucide-react'

// Comercios disponibles con imágenes reales
const COMERCIOS = [
  { id: 1, nombre: "ONE TO ONE", imagen: "/casas/en_su_punto.JPG", horario: "08:00 - 24:00", activo: true },
  { id: 2, nombre: "Sabores del Origen", imagen: "/casas/Ceremoniales.JPG", horario: "09:00 - 21:00", activo: true },
  { id: 3, nombre: "Sierra y Fuego", imagen: "/casas/Como_en_casa.JPG", horario: "10:00 - 22:00", activo: true },
  { id: 4, nombre: "Manglar y Mar", imagen: "/casas/Casa_Caramba.JPG", horario: "11:00 - 23:00", activo: true },
  { id: 5, nombre: "Candela Obscura", imagen: "/casas/IMG_4555.JPG", horario: "", activo: false },
  { id: 6, nombre: "Kattapa", imagen: "/casas/Kattapa.JPG", horario: "", activo: false },
  { id: 7, nombre: "Llap Grill", imagen: "/casas/Llap_Grill.JPG", horario: "", activo: false },
  { id: 8, nombre: "Pollo a la leña", imagen: "/casas/Pollo_a_la_leña.JPG", horario: "", activo: false },
]

// Frases del oráculo
const FRASE_FIJA = { 
  texto: "La llama que te consume también puede iluminar tu camino.", 
  icono: "🔥"
}

type ViewState = 'welcome' | 'menu' | 'cart' | 'ticket'

export default function HomePage() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [view, setView] = useState<ViewState>('welcome')
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const [frase, setFrase] = useState(FRASE_FIJA)
  const [modalComercio, setModalComercio] = useState<typeof COMERCIOS[0] | null>(null)
  const [showRegistro, setShowRegistro] = useState(false)
  const [showOpcionesUnion, setShowOpcionesUnion] = useState(false)
  const [showRegistroDelivery, setShowRegistroDelivery] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const handleOrderComplete = (order: Order) => {
    setCompletedOrder(order)
    setView('ticket')
  }

  // Pantalla de bienvenida: 2.5 segundos y se desvanece
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setMostrarBienvenida(false)
      }, 800)
    }, 2500)
    
    return () => clearTimeout(timer)
  }, [])

  // Función para determinar si el comercio está abierto según horario
  const estaAbierto = (horario: string) => {
    if (!horario) return false
    const ahora = new Date()
    const horaActual = ahora.getHours()
    const minutosActual = ahora.getMinutes()
    
    const [inicio, fin] = horario.split(' - ')
    if (!inicio || !fin) return false
    
    const [horaInicio, minInicio] = inicio.split(':').map(Number)
    const [horaFin, minFin] = fin.split(':').map(Number)
    
    const inicioMinutos = horaInicio * 60 + minInicio
    const finMinutos = horaFin * 60 + minFin
    const ahoraMinutos = horaActual * 60 + minutosActual
    
    return ahoraMinutos >= inicioMinutos && ahoraMinutos <= finMinutos
  }

  useEffect(() => {
    const FRASES = [
      { texto: "La llama que te consume también puede iluminar tu camino.", icono: "🔥" },
      { texto: "Como el agua, encuentra tu camino entre las piedras.", icono: "💧" },
      { texto: "El viento no retiene, solo lleva. Suelta lo que no es tuyo.", icono: "🌬️" },
      { texto: "El barro espera paciente a que lo moldees.", icono: "⛰️" },
      { texto: "El héroe no nace, se forja en su propio fuego.", icono: "✨" }
    ]
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)])
  }, [])

  const handleComercioClick = (comercio: typeof COMERCIOS[0]) => {
    if (comercio.activo && estaAbierto(comercio.horario)) {
      useCartStore.getState().setComercioId(String(comercio.id))
      localStorage.setItem('comercio_seleccionado', JSON.stringify({
        id: comercio.id,
        nombre: comercio.nombre,
        imagen: comercio.imagen,
        horario: comercio.horario
      }))
      setView('menu')
    } else {
      setModalComercio(comercio)
    }
  }

  // Pantalla de bienvenida
  if (mostrarBienvenida) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background ${fadeOut ? 'animate-fade-out' : ''}`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center pt-20 md:pt-32">
          <Branding variant="splash" showSubtitle={false} />
          <div className="mt-20">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-3" />
            <div className="px-4">
              <p className="text-gray-300 text-xs italic font-light tracking-wide leading-relaxed max-w-xs mx-auto">
                "{frase.texto}"
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-6 h-px bg-primary/20" />
                <span className="text-primary/60 text-xs tracking-wider">{frase.icono}</span>
                <div className="w-6 h-px bg-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'ticket' && completedOrder) {
    return (
      <TicketView 
        order={completedOrder} 
        onBackHome={() => {
          setCompletedOrder(null)
          setView('welcome')
        }} 
      />
    )
  }

  if (view === 'cart') {
    return (
      <CartView 
        onBack={() => setView('menu')} 
        onOrderComplete={handleOrderComplete}
      />
    )
  }

  if (view === 'menu') {
    return (
      <MenuView 
        onBack={() => setView('welcome')} 
        onOpenCart={() => setView('cart')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/50">
      {/* Hero Header */}
      <header className="sticky top-0 z-50 bg-card/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex flex-col items-center py-4 px-4">
          {/* Branding con tridente clickable */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/comercio'}>
            <span className="text-2xl text-muted-foreground">🔱</span>
            <Branding variant="header" showIcon={false} />
          </div>
          
          {/* Eslogan - palabras turquesa fijas, flechas y moto animadas */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] text-teal-400">Rapi</span>
            <span className="text-[10px] text-teal-400 inline-block animate-slide-right">»</span>
            <span className="text-[10px] text-teal-400">Servi</span>
            <span className="text-[10px] text-teal-400 inline-block animate-slide-right" style={{ animationDelay: '0.3s' }}>»</span>
            <span className="text-[10px] text-teal-400">Delivery</span>
            <Bike className="h-3 w-3 text-teal-400 ml-0.5 animate-slide-right" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>
      </header>

      {/* Lista de Comercios */}
      <main className="p-4 pb-8 space-y-3">
        {COMERCIOS.map((comercio) => {
          const abierto = estaAbierto(comercio.horario)
          
          return (
            <Card 
              key={comercio.id}
              onClick={() => handleComercioClick(comercio)}
              className="relative overflow-hidden cursor-pointer group border-border hover:border-primary/50 transition-all h-40 rounded-xl"
            >
              <img 
                src={comercio.imagen} 
                alt={comercio.nombre}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-1.5">
                    {abierto ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-white font-medium">Abierto ahora</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-xs text-white/80">Cerrado ahora</span>
                      </>
                    )}
                  </div>
                  {comercio.horario && (
                    <p className="text-[10px] text-white/60 mt-0.5">{comercio.horario}</p>
                  )}
                </div>
                
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 bg-black/30 backdrop-blur-sm">
                  <img 
                    src={comercio.imagen} 
                    alt={comercio.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          )
        })}

        {/* Botón Únete al Equipo */}
        <div className="pt-4 flex justify-center">
          <Button 
            variant="outline" 
            className="border-primary/30 text-primary hover:bg-primary/10 rounded-full"
            onClick={() => setShowOpcionesUnion(true)}  
          >
            💎 Únete al Equipo
          </Button>
        </div>
      </main>

      {/* Modal OpcionesUnion */}
      {showOpcionesUnion && (
        <OpcionesUnion
          onSelectComercio={() => {
            setShowOpcionesUnion(false)
            setShowRegistro(true)
          }}
          onSelectDelivery={() => {
            setShowOpcionesUnion(false)
            setShowRegistroDelivery(true)
          }}
          onBack={() => setShowOpcionesUnion(false)}
        />
      )}

      {/* Modal Registro Comercio */}
      {showRegistro && (
        <RegistroComercio
          onBack={() => setShowRegistro(false)}
          onIrAlPanel={(id) => {
            console.log('Ir al panel del comercio:', id)
            setShowRegistro(false)
            window.location.href = '/comercio?openEditor=true'
          }}
        />
      )}

      {/* Modal Registro Delivery (placeholder) */}
      {showRegistroDelivery && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 text-center">
            <Bike className="h-12 w-12 text-olive-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Próximamente</h2>
            <p className="text-gray-400 text-sm mb-4">Registro para Riders disponible pronto</p>
            <Button onClick={() => setShowRegistroDelivery(false)} className="bg-olive-600">Volver</Button>
          </div>
        </div>
      )}

      {/* Modal comercio no disponible */}
      {modalComercio && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          onClick={() => setModalComercio(null)}
        >
          <Card 
            className="max-w-sm w-full p-6 bg-card border-border text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🔱</div>
            <h3 className="text-xl font-bold text-primary mb-2">{modalComercio.nombre}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Próximamente disponible en ONE TO ONE.
            </p>
            <Button 
              onClick={() => setModalComercio(null)}
              variant="outline"
              className="w-full border-primary/30 text-primary"
            >
              Volver al inicio
            </Button>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-right {
          0% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(3px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.7; }
        }
        .animate-slide-right {
          animation: slide-right 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}