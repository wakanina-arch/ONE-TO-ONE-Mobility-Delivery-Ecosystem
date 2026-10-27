'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Order, COMERCIO_DEMO } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import {
  Share2,
  Home,
  MessageCircle,
  ShoppingBag,
  ClipboardList,
  ChefHat,
  Bike,
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
  { key: 'Preparando', label: 'Preparando', icon: ChefHat },
  { key: 'En camino', label: 'En camino', icon: Bike },
  { key: 'Entregado', label: 'Entregado', icon: PartyPopper },
]

const STATUS_STAGE: Record<string, string> = {
  pendiente: 'Recibido',
  recibido: 'Recibido',
  created: 'Recibido',
  accepted: 'Recibido',
  preparando: 'Preparando',
  preparacion: 'Preparando',
  preparing: 'Preparando',
  ready: 'Preparando',
  picked_up: 'Preparando',
  listo: 'Preparando',
  delivering: 'En camino',
  delivered: 'Entregado',
  entregado: 'Entregado',
  cancelled: 'Recibido',
}

// Porcentajes de 2 en 2 (16 barras / 8 pasos = 2 barras por paso)
const STATUS_PROGRESS: Record<string, number> = {
  created: 12.5,      // paso 1: 2 barras
  accepted: 25,       // legacy
  preparing: 25,      // paso 2: 4 barras (con o sin rider, no avanza)
  ready: 50,          // paso 3: 8 barras (Listo)
  picked_up: 50,      // legacy
  delivering: 62.5,   // paso 4: 10 barras (En camino)
  delivered: 100,     // paso 5: 16 barras (Entregado)
  cancelled: 12.5,
}

// Progreso para el paso 3 (preparing + rider_id)
const PROGRESS_WITH_RIDER = 37.5 // paso 3: 6 barras

const getStatusMessage = (status: string, merchantName: string) => {
  const merchant = merchantName || 'El comercio'

    switch (status.toLowerCase()) {
    case 'created':
    case 'pendiente':
    case 'recibido':
      return `${merchant} ha recibido tu pedido.`

    case 'preparing':
    case 'preparando':
    case 'preparacion':
      return `${merchant} ha aceptado tu pedido.`

    case 'ready':
    case 'listo':
      return 'Tu pedido está listo para que el Ryder lo recoja.'

    case 'picked_up':
      return 'Tu pedido está listo para que el Ryder lo recoja.'

    case 'delivering':
      return 'El Ryder lleva tu pedido. Tiempo estimado: 30–45 minutos.'

    case 'delivered':
    case 'entregado':
      return 'Disfruta de tu pedido.'

    case 'cancelled':
      return 'El pedido fue cancelado. Si necesitas ayuda, contacta al comercio.'

    default:
      return `Estamos actualizando el estado de tu pedido con ${merchant}.`
  }
}

const getProgressPercent = (status: string) => {
  const normalizedStatus = status.toLowerCase()

  if (STATUS_PROGRESS[normalizedStatus] !== undefined) {
    return STATUS_PROGRESS[normalizedStatus]
  }
  // ...

  const legacyProgress: Record<string, number> = {
    pendiente: 12.5,
    recibido: 12.5,
    preparando: 25,
    preparacion: 25,
    listo: 50,
    entregado: 100,
  }

  return legacyProgress[normalizedStatus] ?? 12.5
}

// Frases inspiracionales (se mantienen)
export function TicketView({ order, onBackHome }: TicketViewProps) {
  // 🔧 FIX: fallback por si FRASES queda vacío(evita "undefined" en el render)
  const frase =
    FRASES.length > 0
      ? FRASES[Math.floor(Math.random() * FRASES.length)]
      : { texto: 'Gracias por tu pedido.' }

  const orderNumber = order.id.slice(-6).toUpperCase()

  // 🔵 Estado real del pedido (sincronizado con Supabase)
  const [realStatus, setRealStatus] = useState<string>(order.estado || 'created')
    
    // 🔵 Nombre del comercio
  const [merchantName, setMerchantName] = useState<string>('')

  // 🔵 Consultar el comercio
  useEffect(() => {
    const cargarComercio = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('merchants')
        .select('name')
        .eq('id', order.comercioId)
        .single()

      if (data?.name) setMerchantName(data.name)
    }
    cargarComercio()
  }, [order.comercioId])

  // 🔵 Polling cada 10s para traer el status real
  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const cargarStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .eq('id', order.id)
        .single()

      if (!error && data && isMounted) {
        setRealStatus(data.status)
      }
    }

    cargarStatus()
    const interval = setInterval(cargarStatus, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [order.id])

  // --- Lógica de la barra de progreso ---
  const currentStatus = STATUS_STAGE[realStatus.toLowerCase()] || 'Recibido'

  // --- Lógica de la barra de progreso ---
  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((step) => step.key === currentStatus),
  )
  const progressPercent = getProgressPercent(realStatus)
  const isCancelled = realStatus.toLowerCase() === 'cancelled'

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

                                {/* --- BARRA DE PROGRESO --- */}
        <div className="px-4 py-3 border-b border-border">
          {/* Mensaje dinámico según el estado */}
          <p className={`text-sm text-center font-semibold mb-3 ${
            realStatus.toLowerCase() === 'cancelled' ? 'text-destructive' : 'text-primary'
          }`}>
            {getStatusMessage(realStatus, merchantName)}
          </p>

          {/* Barra de progreso */}
            <div
              className="relative w-full bg-muted rounded-full h-1.5 mb-2"
              role="progressbar"
              aria-label="Progreso del pedido"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div
                className={`${isCancelled ? 'bg-destructive' : 'bg-primary'} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Iconos de los pasos */}
          <div className="flex justify-between text-[10px] text-muted-foreground">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon
              const active = idx <= currentStepIndex
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
                    {(() => {
            const subtotal = order.pricingBreakdown?.subtotal
              ?? (order.total - (order.tip_amount ?? 0) - (order.app_fee ?? 0) + (order.recycling_discount ?? 0))
            const ryderFee = order.pricingBreakdown?.ryderFee
              ?? (order.total - subtotal - (order.tip_amount ?? 0) - (order.app_fee ?? 0) + (order.recycling_discount ?? 0))
            const tipAmount = order.pricingBreakdown?.tipAmount ?? order.tip_amount ?? 0
            const tipPercent = order.pricingBreakdown?.tipPercent ?? 0
            const appFee = order.pricingBreakdown?.appFee ?? order.app_fee ?? 0
            const recyclingDiscount = order.pricingBreakdown?.recyclingDiscount ?? order.recycling_discount ?? 0
            const hasBreakdown = subtotal > 0 || tipAmount > 0 || appFee > 0 || recyclingDiscount > 0
            if (!hasBreakdown) return null
            return (
              <div className="space-y-1 mt-3 pt-2 border-t border-border text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coste del servicio de entrega</span>
                  <span>${ryderFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Propina para el Ryder ({tipPercent}%)
                  </span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa de servicio</span>
                  <span>${appFee.toFixed(2)}</span>
                </div>
                {recyclingDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento por reciclaje</span>
                    <span>−${recyclingDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )
          })()}
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