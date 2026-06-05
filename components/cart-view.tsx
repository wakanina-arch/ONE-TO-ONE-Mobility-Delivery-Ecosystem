'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore, COMERCIO_DEMO, type Order } from '@/lib/store'
import { useOrderStore } from '@/lib/store/order-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowLeft, Minus, Plus, Trash2, CreditCard, Smartphone, Bike, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'

const generateOrderId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ORD-${crypto.randomUUID().slice(-8).toUpperCase()}`
  }

  return `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
}

interface CartViewProps {
  onBack: () => void
  onOrderComplete: (order: Order) => void
}

export function CartView({ onBack, onOrderComplete }: CartViewProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore()
  const { createOrder } = useOrderStore()
  
  const [step, setStep] = useState<'cart' | 'checkout' | 'processing'>('cart')
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    metodoPago: 'deuna' as Order['metodoPago'],
    tipoEntrega: 'local' as Order['tipoEntrega'],
    direccion: '',
    notas: ''
  })

  const total = getTotal()
  const isEmpty = items.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEmpty) return
    
    setStep('processing')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newOrder: Order = {
      id: generateOrderId(),
      cliente: {
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email
      },
      items: items.map(item => ({
        ...item,
        notas: form.notas
      })),
      total,
      estado: 'pendiente',
      metodoPago: form.metodoPago,
      tipoEntrega: form.tipoEntrega,
      direccion: form.tipoEntrega === 'domicilio' ? form.direccion : undefined,
      notas: form.notas,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      comercioId: COMERCIO_DEMO.id
    }

    createOrder({
      comercioId: COMERCIO_DEMO.id,
      comercioName: COMERCIO_DEMO.nombre,
      clienteName: form.nombre,
      clienteAddress: form.tipoEntrega === 'domicilio' ? form.direccion || COMERCIO_DEMO.direccion : COMERCIO_DEMO.direccion,
      clienteLat: form.tipoEntrega === 'domicilio' ? -0.1810 : -0.1807,
      clienteLng: form.tipoEntrega === 'domicilio' ? -78.4800 : -78.4803,
      items: items.map(item => ({
        name: item.nombre,
        quantity: item.cantidad,
        price: item.precio
      })),
      total
    })

    clearCart()
    onOrderComplete(newOrder)
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 bg-card border-border text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🔥</span>
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">Procesando pedido...</h2>
          <p className="text-xs text-muted-foreground">Por favor espera un momento</p>
        </Card>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Button variant="ghost" size="icon" onClick={() => setStep('cart')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold text-foreground">Finalizar Pedido</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-3 space-y-4 pb-28">
          {/* Datos personales - versión compacta */}
<Card className="p-2 bg-card border-border space-y-2">
  <h2 className="text-xs font-semibold text-foreground flex items-center gap-1">
    <span>👤</span> Datos de Contacto
  </h2>
  <div className="space-y-1.5">
    <Input
      placeholder="Nombre completo"
      value={form.nombre}
      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
      required
      className="h-7 text-xs px-2 bg-input border-border"
    />
    <Input
      type="tel"
      placeholder="Teléfono"
      value={form.telefono}
      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
      required
      className="h-7 text-xs px-2 bg-input border-border"
    />
    <Input
      type="email"
      placeholder="Email (opcional)"
      value={form.email}
      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
      className="h-7 text-xs px-2 bg-input border-border"
    />
  </div>
</Card>

{/* Tipo de entrega - versión compacta */}
<Card className="p-2 bg-card border-border space-y-2">
  <h2 className="text-xs font-semibold text-foreground flex items-center gap-1">
    <span>📍</span> Tipo de Entrega
  </h2>
  <RadioGroup 
    value={form.tipoEntrega} 
    onValueChange={(v) => setForm(f => ({ ...f, tipoEntrega: v as Order['tipoEntrega'] }))}
    className="space-y-1.5"
  >
    <label className={cn(
      "flex items-center gap-2 p-1.5 rounded-md border cursor-pointer",
      form.tipoEntrega === 'local' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="local" className="h-3 w-3" />
      <div>
        <p className="text-[11px] font-medium">Recoger en local</p>
        <p className="text-[9px] text-muted-foreground">Pasa a retirar tu pedido</p>
      </div>
    </label>
    <label className={cn(
      "flex items-center gap-2 p-1.5 rounded-md border cursor-pointer",
      form.tipoEntrega === 'domicilio' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="domicilio" className="h-3 w-3" />
      <div>
        <p className="text-[11px] font-medium">Delivery</p>
        <p className="text-[9px] text-muted-foreground">Te lo llevamos a casa</p>
      </div>
    </label>
  </RadioGroup>
  
  {form.tipoEntrega === 'domicilio' && (
    <div className="mt-1.5 pt-1.5 border-t border-border">
      <Input
        placeholder="Dirección de entrega"
        value={form.direccion}
        onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
        required
        className="h-7 text-xs px-2 bg-input border-border"
      />
    </div>
  )}
</Card>

 {/* Método de pago con expansión condicional */}
<Card className="p-2 bg-card border-border space-y-2">
  <h2 className="text-xs font-semibold text-foreground flex items-center gap-1">
    <span>💳</span> Método de Pago
  </h2>
  <RadioGroup 
    value={form.metodoPago} 
    onValueChange={(v) => setForm(f => ({ ...f, metodoPago: v as Order['metodoPago'] }))}
    className="grid grid-cols-4 gap-0.5"
  >
    {/* DEUNA */}
    <label className={cn(
      "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md border cursor-pointer",
      form.metodoPago === 'deuna' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="deuna" className="sr-only" />
      <QrCode className={cn("h-3.5 w-3.5", form.metodoPago === 'deuna' ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[9px]", form.metodoPago === 'deuna' ? "text-primary" : "text-muted-foreground")}>Deuna</span>
    </label>
    
    {/* Transferencia */}
    <label className={cn(
      "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md border cursor-pointer",
      form.metodoPago === 'transferencia' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="transferencia" className="sr-only" />
      <Smartphone className={cn("h-3.5 w-3.5", form.metodoPago === 'transferencia' ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[9px]", form.metodoPago === 'transferencia' ? "text-primary" : "text-muted-foreground")}>Transferencia</span>
    </label>
    
    {/* PayPhone */}
    <label className={cn(
      "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md border cursor-pointer",
      form.metodoPago === 'payphone' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="payphone" className="sr-only" />
      <Smartphone className={cn("h-3.5 w-3.5", form.metodoPago === 'payphone' ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[9px]", form.metodoPago === 'payphone' ? "text-primary" : "text-muted-foreground")}>PayPhone</span>
    </label>
    
    {/* Tarjeta */}
    <label className={cn(
      "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-md border cursor-pointer",
      form.metodoPago === 'tarjeta' ? "border-primary bg-primary/5" : "border-border"
    )}>
      <RadioGroupItem value="tarjeta" className="sr-only" />
      <CreditCard className={cn("h-3.5 w-3.5", form.metodoPago === 'tarjeta' ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-[9px]", form.metodoPago === 'tarjeta' ? "text-primary" : "text-muted-foreground")}>Tarjeta</span>
    </label>
  </RadioGroup>

  {/* ========== CAMPOS EXPANDIBLES SEGÚN MÉTODO DE PAGO ========== */}
  
  {/* DEUNA - Campos para pago con QR */}
  {form.metodoPago === 'deuna' && (
    <div className="mt-3 p-2 bg-muted/30 rounded-lg border border-primary/20 animate-fade-in">
      <p className="text-[10px] font-medium text-primary mb-2">📱 Pago con Deuna</p>
      <div className="flex flex-col items-center justify-center py-2">
        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
          <QrCode className="h-16 w-16 text-gray-800" />
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          Escanea el código QR desde la app de Deuna<br />
          o tu banca móvil
        </p>
        <p className="text-[9px] text-primary/70 text-center mt-1">
          Pago seguro sin efectivo
        </p>
      </div>
    </div>
  )}

  {/* TRANSFERENCIA - Campos para datos bancarios */}
  {form.metodoPago === 'transferencia' && (
    <div className="mt-3 p-2 bg-muted/30 rounded-lg border border-primary/20 animate-fade-in">
      <p className="text-[10px] font-medium text-primary mb-2">🏦 Datos para Transferencia</p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">Banco:</span>
          <span className="font-mono text-foreground">Banco Pichincha</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">Tipo de cuenta:</span>
          <span className="font-mono text-foreground">Corriente</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">N° de cuenta:</span>
          <span className="font-mono text-foreground">1234567890</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">Beneficiario:</span>
          <span className="font-mono text-foreground">ONE TO ONE DELIVERY S.A.</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground">RUC:</span>
          <span className="font-mono text-foreground">0992123456001</span>
        </div>
        <p className="text-[8px] text-center text-muted-foreground mt-2">
          Enviar comprobante al WhatsApp +593 99 999 9999
        </p>
      </div>
    </div>
  )}

  {/* PAYPHONE - Campos para pago con PayPhone */}
  {form.metodoPago === 'payphone' && (
    <div className="mt-3 p-2 bg-muted/30 rounded-lg border border-primary/20 animate-fade-in">
      <p className="text-[10px] font-medium text-primary mb-2">📲 Pago con PayPhone</p>
      <div className="flex flex-col items-center justify-center py-2">
        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
          <Smartphone className="h-12 w-12 text-gray-800" />
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-2">
          Abre la app de PayPhone y escanea el código QR
        </p>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Número de celular asociado"
            className="flex-1 h-7 text-[9px] px-2 rounded-lg bg-background border border-border"
          />
        </div>
        <p className="text-[8px] text-primary/70 text-center mt-2">
          Recibirás un código de confirmación
        </p>
      </div>
    </div>
  )}

  {/* TARJETA - Campos para datos de tarjeta */}
  {form.metodoPago === 'tarjeta' && (
    <div className="mt-3 p-2 bg-muted/30 rounded-lg border border-primary/20 animate-fade-in">
      <p className="text-[10px] font-medium text-primary mb-2">💳 Datos de la Tarjeta</p>
      <div className="space-y-1.5">
        <input
          type="text"
          placeholder="Número de tarjeta"
          className="w-full h-7 text-[9px] px-2 rounded-lg bg-background border border-border"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="MM/YY"
            className="flex-1 h-7 text-[9px] px-2 rounded-lg bg-background border border-border"
          />
          <input
            type="text"
            placeholder="CVV"
            className="flex-1 h-7 text-[9px] px-2 rounded-lg bg-background border border-border"
          />
        </div>
        <input
          type="text"
          placeholder="Nombre del titular"
          className="w-full h-7 text-[9px] px-2 rounded-lg bg-background border border-border"
        />
        <p className="text-[8px] text-center text-muted-foreground mt-1">
          🔒 Pago seguro con encriptación SSL
        </p>
      </div>
    </div>
  )}
</Card>

          {/* Notas */}
          <Card className="p-3 bg-card border-border space-y-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>📝</span> Notas adicionales
            </h2>
            <textarea
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              placeholder="Instrucciones especiales, alergias, etc."
              rows={2}
              className="w-full p-2 rounded-lg bg-input border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Card>

          {/* Resumen */}
          <Card className="p-3 bg-card border-border">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {form.tipoEntrega === 'domicilio' && (
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Delivery</span>
                <span>$1.50</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold text-sm">Total</span>
              <span className="text-sm font-bold text-primary">
                ${(total + (form.tipoEntrega === 'domicilio' ? 1.50 : 0)).toFixed(2)}
              </span>
            </div>
          </Card>
        </form>

        {/* Botón de confirmar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-card/80 backdrop-blur-xl border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={!form.nombre || !form.telefono}
            className="w-full h-9 bg-primary text-primary-foreground rounded-xl text-sm"
          >
            Confirmar Pedido - ${(total + (form.tipoEntrega === 'domicilio' ? 1.50 : 0)).toFixed(2)}
          </Button>
        </div>
      </div>
    )
  }

  // Vista del carrito
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-bold text-foreground">Mi Carrito</h1>
          </div>
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

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-6 text-center h-[60vh]">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
            <span className="text-3xl">🛒</span>
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">Carrito vacío</h2>
          <p className="text-xs text-muted-foreground mb-4">Agrega productos para comenzar</p>
          <Button onClick={onBack} variant="outline" size="sm" className="text-xs">
            Ver menú
          </Button>
        </div>
      ) : (
        <>
          <main className="p-2 space-y-1.5 pb-28">
            {items.map(item => (
              <Card key={item.id} className="p-2 bg-card border-border">
                <div className="flex gap-2">
                  <div className="relative w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.nombre} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-foreground text-xs line-clamp-1">{item.nombre}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-primary font-bold text-[11px]">${item.precio.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="h-5 w-5 rounded-full"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="w-4 text-center text-[10px] font-semibold">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="h-5 w-5 rounded-full"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      <span className="font-bold text-xs text-foreground">
                        ${(item.cantidad * item.precio).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </main>

          {/* Footer con total y botón de pago */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-card/80 backdrop-blur-xl border-t border-border">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-bold text-primary">${total.toFixed(2)}</span>
            </div>
            <Button
              onClick={() => setStep('checkout')}
              className="w-full h-8 bg-primary text-primary-foreground rounded-xl text-sm"
            >
              Continuar al Pago
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
