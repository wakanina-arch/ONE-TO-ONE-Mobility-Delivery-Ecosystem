# ONE TO ONE - Delivery App

## Estado Actual (13 Mayo 2026)

### 🏠 PÚBLICO (Cliente) - 90%
- [x] Pantalla de bienvenida con carta giratoria
- [x] Lista de comercios con horarios
- [x] Menú de productos con categorías
- [x] Carrito autónomo por comercio
- [x] Ticket de confirmación

### 🏪 ADMINISTRATIVO (Comercio) - 80%
- [x] Panel con tabs: Recepción, Producción, Entrega, Historial
- [x] Notificaciones visuales (campana)
- [x] Sonido programático (Web Audio API)
- [x] Impresión de comanda
- [x] Editor de menú (comercio-editor.tsx)
- [x] Registro de comercio (RegistroComercio.tsx)
- [ ] Sonido de campana pendiente

### 🚚 DELIVERY (Repartidor) - 0%
- [ ] Pendiente implementar

### 💰 FINANCIERO (Backoffice) - 0%
- [ ] Pendiente implementar

## Componentes Principales

| Archivo | Función |
|---------|---------|
| `app/page.tsx` | Home, lista de comercios |
| `app/comercio/page.tsx` | Panel administrativo |
| `components/menu-view.tsx` | Menú de productos |
| `components/cart-view.tsx` | Carrito de compras |
| `components/branding.tsx` | Identidad visual ONE TO ONE |
| `components/drawers/comercio-editor.tsx` | Editor de menú |
| `components/registro/RegistroComercio.tsx` | Registro de nuevo comercio |
| `lib/store.ts` | Zustand store (carrito) |
| `lib/menus-comercios.ts` | Menús por comercio |

## Paleta de Colores (globals.css)
- Primary: oklch(0.75 0.18 85) - Dorado/ámbar
- Background: oklch(0.08 0.01 30)
- Muted-foreground: oklch(0.65 0 0)

## Branding
- Logo: 🔱
- Eslogan: "» rapi 🏄🏽‍♂️ deli 🏄🏽‍♂️ delivery «"

## Próximas Tareas Pendientes
1. Sonido de campana funcional
2. Mapa y descripción del comercio en homepage
3. Integración de subida de imágenes en editor de menú
4. Módulo de delivery
5. Módulo financiero
