'use client'

import { cn } from '@/lib/utils'

interface BrandingProps {
  variant?: 'splash' | 'header' | 'menu' | 'cart'
  className?: string
  showIcon?: boolean
  showSubtitle?: boolean
}

export function Branding({ 
  variant = 'header', 
  className,
  showIcon = true,
  showSubtitle = true
}: BrandingProps) {
  const variants = {
    // Pantalla de bienvenida - más grande
    splash: {
  container: "flex flex-col items-center justify-center",
  icon: "text-8xl mb-6 animate-bounce-gentle drop-shadow-2xl",
  title: "text-3xl md:text-6xl font-bold tracking-wide",  // ← reducido
  subtitle: "text-xl md:text-2xl text-purple-200 mt-2",
  font: "font-pacifico"
},
    // Header de comercios - mediano
    header: {
      container: "flex items-center gap-2",
      icon: "text-2xl",
      title: "text-lg font-bold tracking-wide",
      subtitle: "hidden",
      font: "font-amaranth"
    },
    // Header del menú - pequeño
    menu: {
      container: "flex flex-col items-center",
      icon: "text-xl",
      title: "text-base font-bold tracking-wide",
      subtitle: "text-[10px] text-purple-400 mt-0.5",
      font: "font-courgette"
    },
    // Header del carrito - similar a menú
    cart: {
      container: "flex flex-col items-center",
      icon: "text-xl",
      title: "text-base font-bold tracking-wide",
      subtitle: "text-[10px] text-purple-400 mt-0.5",
      font: "font-courgette"
    }
  }

  const style = variants[variant]
  
  // Gradiente UNIFORME - tonos morados/violetas
  const gradientClass = "bg-gradient-to-r from-purple-500 via-purple-400 to-violet-500 bg-clip-text text-transparent"

  return (
    <div className={cn(style.container, className)}>
      {showIcon && <div className={cn(style.icon, "filter drop-shadow-lg")}>🔱</div>}
      <h1 className={cn(style.title, gradientClass, style.font)}>
        ONE TO ONE
      </h1>
      {showSubtitle && variant !== 'header' && (
        <p className={cn(style.subtitle, "italic")}> rapi » deli » delivery » 🏄🏽‍♂️</p>
      )}
    </div>
  )
}