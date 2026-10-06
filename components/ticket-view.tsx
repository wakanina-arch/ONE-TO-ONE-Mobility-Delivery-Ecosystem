'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Order, COMERCIO_DEMO } from '@/lib/store'
import {
  Share2,
  Home,            // TODO: revisar si se reactiva el botón "Volver al inicio"
  MessageCircle,
  ShoppingBag,
  ClipboardList,
  ChefHat,
  Bike,            // TODO: valorar cambiar a PackageCheck (Bike = en reparto, no "listo")
  PartyPopper,
} from 'lucide-react'
import Link from 'next/link'
import { FRASES } from '@/lib/frases'

interface TicketViewProps {
  order: Order
  onBackHome: () => void
}

// --- Mapeo de estados para la barra (con iconos de Lucide-React) ---
const STATUS_STEPS = [
  { key: 'Recibido', label: 'Recibido', icon: ClipboardList },
  { key: 'Preparación', label: 'Preparación', icon: ChefHat },
  { key: 'Listo', label: 'Listo', icon: Bike },
  { key: 'Entregado', label: 'Entregado', icon: PartyPopper },
]

// 🔧 FIX: normaliza estados heredados (ej: 'pendiente') a las keys de STATUS_STEPS.
// Antes, si order.estado era 'pendiente' u otro valor no listado, findIndex devolvía -1
// y la barra de progreso quedaba en 0% con todos los iconos grises.
// TODO: cuando confirmes los estados reales del store, ajusta este mapa o elimínalo.
const normalizeStatus = (status?: string): string => {
  if (!status) return 'Recibido'
  const map: Record<string, string> = {
    pendiente: 'Recibido',
    recibido: 'Recibido',
    preparando: 'Preparación',
    preparacion: 'Preparación',
    listo: 'Listo',
    entregado: 'Entregado',
  }
  return map[status.toLowerCase()] ?? 'Recibido'
}

// Frases inspiracionales (se mantienen)
export function TicketView({ order, onBackHome }: TicketViewProps) {
  // 🔧 FIX: fallback por si FRASES queda vacío (evita "undefined" en el render)
  const frase =
    FRASES.length > 0
      ? FRASES[Math.floor(Math.random() * FRASES.length)]
      : { texto: 'Gracias por tu pedido.' }

  const orderNumber = order.id.slice(-6).toUpperCase()

  // --- Lógica de la barra de progreso ---
  const currentStatus = normalizeStatus(order.estado)
  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((step) => step.key === currentStatus),
  )
  const progressPercent =
    ((currentStepIndex + 1) / STATUS_STEPS.length) * 100

  // 🔧 FIX: validar fecha para no mostrar "Invalid Date"
  // TODO: confirmar si fechaCreacion siempre viene como ISO string
  const fecha = new Date(order.fechaCreacion)
  const fechaTexto = isNaN(fecha.getTime())
    ? '—'
    : fecha.toLocaleString('es-EC')

  // --- Funciones de compartir ---
  const handleShare = async () => {
    const mensaje =
      `*Pedido #${orderNumber}*\n` +
      `------------------------\n` +
      order.items.map((i) => `${i.cantidad}x ${i.nombre}`).join('\n') +
      `\n------------------------\n` +
      `*Total: $${order.total.toFixed(2)}*\n\n` +
      `_"${frase.texto}"_`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${orderNumber}`,
          text: mensaje,
        })
        return
      } catch {
        /* fallback */
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
      '_blank',
    )
  }

  const handleWhatsApp = () => {
    const mensaje =
      `Hola, mi pedido es el *#${orderNumber}*\n` +
      `Total: $${order.total.toFixed(2)}\n` +
      `Método de pago: ${order.metodoPago}`
    window.open(
      `https://wa.me/${COMERCIO_DEMO.telefono}?text=${encodeURIComponent(mensaje)}`,
      '_blank',
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <Card className="w-full max-w-sm bg-card border-border overflow-hidden rounded-xl shadow-2xl">
        {/* --- HEADER: QR (Minimalista) --- */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 flex flex-col items-center border-b border-border">
          <div className="bg-transparent p-1 rounded-xl mb-2">
            <QRCodeSVG
              value={order.id}
              size={80}
              bgColor="transparent"
              fgColor="currentColor"
              className="text-foreground"
              // 🔧 AÑADIDO: title para accesibilidad (no rompe nada)
              title={`Código QR del pedido #${orderNumber}`}
            />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Nro de Pedido
          </p>
          <h2 className="text-xl font-bold text-primary tracking-wider">
            #{orderNumber}
          </h2>
        </div>

        {/* --- INFO COMERCIO (Estructura recuperada: RUC + Nombre) --- */}
        <div className="px-4 py-2 text-center border-b border-border bg-card/50">
          <h3 className="font-bold text-foreground text-sm">
            {COMERCIO_DEMO.nombreLegal}
          </h3>
          <p className="text-[10px] text-muted-foreground">
            RUC: {COMERCIO_DEMO.ruc}
          </p>
          {/* 🔧 FIX: usamos fechaTexto validado arriba */}
          <p className="text-[10px] text-muted-foreground">{fechaTexto}</p>
        </div>

        {/* --- BARRA DE PROGRESO (Título enlace, iconos nuevos) --- */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex justify-between items-center mb-1">
            <Link
              href="/delivery-map"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Avance de pedido
            </Link>
            <span className="text-xs font-medium text-primary">
              {/* 🔧 FIX: 'pendiente' ya se normaliza a 'Recibido' arriba,
                  así que basta con chequear 'Recibido'.
                  TODO: si quieres mostrar "Compilando" como texto propio,
                  cambia el label por lo que realmente quieras ver. */}
              {currentStatus === 'Recibido' ? 'Compilando' : currentStatus}
            </span>
          </div>
          <div className="relative w-full bg-muted rounded-full h-1.5 mb-2">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon
              const active = idx <= currentStepIndex // 🔧 pequeña mejora: variable legible
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-[8px] ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* --- RESUMEN DE ITEMS (Compacto y legible) --- */}
        <div className="px-4 py-3">
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            📋 Resumen
          </h4>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="text-foreground font-medium">
                  ${(item.cantidad * item.precio).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <span className="font-bold text-foreground text-sm">Total</span>
            <span className="text-base font-bold text-primary">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* --- MÉTODO DE PAGO MEJORADO --- */}
        <div className="px-4 pb-2">
          <div className="bg-accent/10 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">
                Método de pago
              </p>
              <p className="font-semibold text-foreground capitalize text-xs flex items-center gap-1">
                <span>💳</span> Pagado con {order.metodoPago}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground">Comprobante</p>
              <p className="font-semibold text-foreground text-xs">Digital</p>
            </div>
          </div>
        </div>

        {/* --- TRIDENTE Y FRASE --- */}
        <div className="px-6 py-3 text-center space-y-6">
          <div className="text-3xl animate-pulse">🔱</div>
          <p className="text-[11px] text-teal-400 italic leading-relaxed">
            "{frase.texto}"
          </p>
        </div>

        {/* --- ACCIONES (Botones renovados) --- */}
        <div className="p-4 pt-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              size="sm"
              className="h-8 text-xs border-border"
            >
              <Share2 className="h-3 w-3 mr-1" /> Compartir
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              size="sm"
              className="h-8 text-xs border-border"
            >
              <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
            </Button>
          </div>

          {/* NUEVO BOTÓN PRINCIPAL: Seguir Comprando */}
          <Button
            onClick={onBackHome}
            size="sm"
            className="w-full h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Seguir Comprando
          </Button>

          {/* Botón secundario (Volver al inicio)
          TODO: dejado comentado intencionalmente. Si quieres reactivarlo,
          descomenta estas líneas y ya tienes `Home` importado arriba.
          <Button onClick={onBackHome} variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground hover:text-foreground">
            <Home className="h-3 w-3 mr-1" /> Volver al inicio
          </Button>*/}
        </div>

        {/* --- FOOTER --- */}
        <div className="px-4 pb-3 text-center">
          <a
            href="https://onetoone.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-muted-foreground/50 hover:text-primary transition-colors"
          >
            🔱 OneToOne.app
          </a>
        </div>
      </Card>
    </div>
  )
} 