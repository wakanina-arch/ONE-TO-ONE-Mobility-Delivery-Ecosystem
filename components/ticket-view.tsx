'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { type Order, COMERCIO_DEMO } from '@/lib/store'
import { Share2, Download, Home, MessageCircle } from 'lucide-react'

interface TicketViewProps {
  order: Order
  onBackHome: () => void
}

// Frases inspiracionales
const FRASES = [
  { texto: "La llama que te consume también puede iluminar tu camino.", icono: "🔥" },
  { texto: "Como el agua, encuentra tu camino entre las piedras.", icono: "💧" },
  { texto: "El viento no retiene, solo lleva. Suelta lo que no es tuyo.", icono: "🌬️" },
  { texto: "El barro espera paciente a que lo moldees.", icono: "⛰️" },
  { texto: "El héroe no nace, se forja en su propio fuego.", icono: "✨" }
]

export function TicketView({ order, onBackHome }: TicketViewProps) {
  const frase = FRASES[Math.floor(Math.random() * FRASES.length)]
  const orderNumber = order.id.slice(-6).toUpperCase()
  
  const handleShare = async () => {
    const mensaje = `*Pedido #${orderNumber}*\n` +
      `------------------------\n` +
      order.items.map(i => `${i.cantidad}x ${i.nombre}`).join('\n') +
      `\n------------------------\n` +
      `*Total: $${order.total.toFixed(2)}*\n\n` +
      `_"${frase.texto}"_`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido #${orderNumber}`,
          text: mensaje
        })
        return
      } catch {
        // fallback
      }
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleWhatsApp = () => {
    const mensaje = `Hola, mi pedido es el *#${orderNumber}*\n` +
      `Total: $${order.total.toFixed(2)}\n` +
      `Método de pago: ${order.metodoPago}`
    
    const whatsappUrl = `https://wa.me/${COMERCIO_DEMO.telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <Card className="w-full max-w-sm bg-card border-border overflow-hidden rounded-xl">
        {/* Header con QR - reducido */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 flex flex-col items-center">
          <div className="bg-card p-2 rounded-xl shadow-lg mb-2">
            <QRCodeSVG
              value={order.id}
              size={80}
              bgColor="transparent"
              fgColor="currentColor"
              className="text-foreground"
            />
          </div>
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Nro de Pedido</p>
          <h2 className="text-lg font-bold text-primary tracking-wider">#{orderNumber}</h2>
        </div>

        {/* Info del comercio - compacto */}
        <div className="px-3 py-2 text-center border-b border-border">
          <h3 className="font-bold text-foreground text-sm">{COMERCIO_DEMO.nombreLegal}</h3>
          <p className="text-[10px] text-muted-foreground">RUC: {COMERCIO_DEMO.ruc}</p>
          <p className="text-[10px] text-muted-foreground">
            {new Date(order.fechaCreacion).toLocaleString('es-EC')}
          </p>
        </div>

        {/* Resumen de items - compacto */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <span>📋</span>
            Resumen
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
            <span className="text-base font-bold text-primary">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Estado del pedido - compacto */}
        <div className="px-3 pb-2">
          <div className="bg-accent/10 rounded-lg p-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-muted-foreground">Estado</p>
              <p className="font-semibold text-accent capitalize text-xs">{order.estado}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground">Método de pago</p>
              <p className="font-semibold text-foreground capitalize text-xs">{order.metodoPago}</p>
            </div>
          </div>
        </div>

        {/* Tridente y frase - compacto */}
        <div className="px-3 pb-2 text-center">
          <div className="text-2xl mb-1 animate-pulse">🔱</div>
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg p-2 border border-primary/20">
            <span className="text-lg mb-0.5 block">{frase.icono}</span>
            <p className="text-[10px] text-primary/80 italic">{`"${frase.texto}"`}</p>
          </div>
        </div>

        {/* Acciones - compacto */}
        <div className="p-3 pt-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              size="sm"
              className="h-7 text-xs border-border"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Compartir
            </Button>
            
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              size="sm"
              className="h-7 text-xs border-border"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
          </div>
          
          <Button
            onClick={onBackHome}
            size="sm"
            className="w-full h-7 text-xs bg-primary text-primary-foreground"
          >
            <Home className="h-3 w-3 mr-1" />
            Volver al Inicio
          </Button>
        </div>

        {/* Footer - compacto */}
        <div className="px-3 pb-2 text-center">
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
