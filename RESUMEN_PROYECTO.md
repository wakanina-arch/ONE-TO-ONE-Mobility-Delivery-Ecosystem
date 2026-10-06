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

| Archivo                                    | Función                     |
| ------------------------------------------ | --------------------------- |
| `app/page.tsx`                             | Home, lista de comercios    |
| `app/comercio/page.tsx`                    | Panel administrativo        |
| `components/menu-view.tsx`                 | Menú de productos           |
| `components/cart-view.tsx`                 | Carrito de compras          |
| `components/branding.tsx`                  | Identidad visual ONE TO ONE |
| `components/drawers/comercio-editor.tsx`   | Editor de menú              |
| `components/registro/RegistroComercio.tsx` | Registro de nuevo comercio  |
| `lib/store.ts`                             | Zustand store (carrito)     |
| `lib/menus-comercios.ts`                   | Menús por comercio          |

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

# ONE TO ONE — Delivery App

---

# 📘 TEMPORADA 1 — Estado original (13 mayo 2026)

## Estado en ese momento

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

## Componentes Principales (Temporada 1)

| Archivo                                    | Función                     |
| ------------------------------------------ | --------------------------- |
| `app/page.tsx`                             | Home, lista de comercios    |
| `app/comercio/page.tsx`                    | Panel administrativo        |
| `components/menu-view.tsx`                 | Menú de productos           |
| `components/cart-view.tsx`                 | Carrito de compras          |
| `components/branding.tsx`                  | Identidad visual ONE TO ONE |
| `components/drawers/comercio-editor.tsx`   | Editor de menú              |
| `components/registro/RegistroComercio.tsx` | Registro de nuevo comercio  |
| `lib/store.ts`                             | Zustand store (carrito)     |
| `lib/menus-comercios.ts`                   | Menús por comercio          |

## Paleta de Colores (globals.css)

- Primary: oklch(0.75 0.18 85) - Dorado/ámbar
- Background: oklch(0.08 0.01 30)
- Muted-foreground: oklch(0.65 0 0)

## Branding

- Logo: 🔱
- Eslogan: "» rapi 🏄🏽‍♂️ deli 🏄🏽‍♂️ delivery «"

## Próximas Tareas Pendientes (Temporada 1)

1. Sonido de campana funcional
2. Mapa y descripción del comercio en homepage
3. Integración de subida de imágenes en editor de menú
4. Módulo de delivery
5. Módulo financiero

---

# 📗 TEMPORADA 2 — Reconstrucción y rumbo (21 septiembre 2026)

> Después de 4 meses pausado (mayo → septiembre 2026), se retoma el proyecto
> con una revisión completa de seguridad y una redefinición estratégica.

---

## 🎯 Manifiesto — Naturaleza del proyecto

> **"Es un círculo de logística simple, pero necesita que funcione sincréticamente."**
> — Edgar Jara, fundador

### Nombre técnico vs. función real

- **Nombre técnico:** App / Aplicación / Plataforma
- **Función real:** Sistema de logística sincrética

### Los 4 nodos del círculo

CLIENTE → COMERCIO → RIDER → CLIENTE
↑ │
└────────────────────────────────────┘
(con ADMIN al centro)

| Nodo            | Rol                                                                        |
| --------------- | -------------------------------------------------------------------------- |
| 🟢 **CLIENTE**  | Punto de demanda. Persona que por A o B no puede acercarse al restaurante. |
| 🔵 **COMERCIO** | Proveedor. Centro de producción. Cocina y sirve.                           |
| 🔴 **RIDER**    | Vínculo cliente ↔ comercio. Última milla.                                  |
| 🟡 **ADMIN**    | Torre de control. Observa, arbitra, garantiza el sincretismo.              |

### Principio rector

> **La app no gestiona. La app sincroniza.**

### Su único trabajo real

Garantizar que cada nodo sepa lo que necesita saber, en el momento en que lo necesita saber, sin fricción, sin silencios, sin desincronización.

---

## 🎯 Cambio de paradigma (decisión clave)

### ❌ Antes (descartado)

La app intentaba **gestionar la operación del comercio**: comandas, pantallas de cocina, estados de preparación, flujo interno del restaurante.

### ✅ Ahora (estrategia asumida)

La app es un **canalizador de pedidos**. Su alcance termina cuando:

1. El **cliente** da OK en caja.
2. La app **envía la comanda** a la impresora del comercio.
3. A partir de ahí, el comercio **gestiona su operación** a su manera.
4. La app actúa como **observador y notificador** del flujo.

### Impacto

- El comercio **NO** está obligado a usar un panel operativo.
- El comercio **NO** tiene que marcar estados del pedido.
- El comercio **solo cocina** y sirve.
- La app **canaliza, notifica y archiva**.

---

## 🔄 Flujo del pedido (modelo final)

CLIENTE paga
└─► Estado: Recibido
└─► Comercio: campana + tablet vibra
└─► Cliente: barra al 15%
RECEPCIONISTA acepta (≤2 min)
├─ Acepta → Estado: En preparación
│ Comercio: comanda impresa
│ Cliente: barra al 40%
└─ No acepta → Estado: Cancelado
Cliente: reembolso
RECEPCIONISTA marca "listo"
└─► Estado: Listo para recoger
└─► Rider: notificación de servicio disponible
└─► Cliente: barra al 60%
RIDER acepta el servicio
└─► Estado: En camino
└─► Cliente: barra al 80%
└─► Cliente ve: nombre + avatar del rider
RIDER recoge y confirma
└─► Estado: Recogido (interno)
RIDER entrega y confirma
└─► Estado: Entregado
└─► Cliente: barra al 100%
└─► Cliente: puede calificar
SISTEMA liquida
└─► Comisión plataforma
└─► Pago al comercio
└─► Pago al rider
text

### El comercio solo tiene 2 acciones:

- **Botón "Imprimir"** (aceptación tácita del pedido)
- **Botón "Listo"** (aviso al rider)

**Nada más.** Cero panel operativo.

---

## 🏪 Panel del comercio (reconvertido)

### Filosofía

**Información, no operación.**

### Tabs del panel (reconvertidos)

| Antes      | Ahora                     |
| ---------- | ------------------------- |
| Recepción  | 📊 Dashboard (resumen)    |
| Producción | 📈 Crecimiento (gráficas) |
| Entrega    | 👥 Clientes (memoria)     |
| Historial  | 🍽️ Menú (editor)          |

### Lo que el comercio PUEDE hacer

- ✅ Aceptar/rechazar pedidos (≤2 min)
- ✅ Marcar "listo para recoger"
- ✅ Ver historial de pedidos
- ✅ Ver estadísticas de crecimiento
- ✅ Ver memoria de clientes asiduos
- ✅ Editar su menú (tipo Word)
- ✅ Ajustes básicos

### Lo que el comercio NO puede hacer

- ❌ Marcar "en preparación"
- ❌ Marcar "en camino"
- ❌ Marcar "entregado"
- ❌ Ver pedidos de otros comercios

### 🔘 Interruptor Kanban (importante)

- **NO** es un modo global.
- Es un **flag por comercio**: activar/desactivar el sistema Kanban.
- **Solo afecta al panel operativo** (tabs de gestión de flujo).
- **Todo lo demás funciona siempre** (estadísticas, menú, clientes, ajustes).
- Default: **OFF** (solo impresora).
- El comercio puede activarlo cuando quiera.

---

## 🎨 Editor de menú tipo Word (diseño aprobado)

### Filosofía

**Debe sentirse como Word / Pages / Google Docs.**
Familiar para cualquier persona no técnica. **Cero curva de aprendizaje.**

### Estructura visual

┌─────────────────────────────────────────────────┐
│ [Fondo translúcido con imagen del comercio] │
│ │
│ Archivo Edición Seleccionar Ventanas │
│ ───────────────────────────────────────────── │
│ │
│ Al hacer clic en "Archivo": │
│ ┌───────────────────────────────┐ │
│ │ → Actualización del menú │ │
│ │ → Mis ventas │ │
│ │ → Comentarios de clientes │ │
│ │ → Mi inventario │ │
│ └───────────────────────────────┘ │
│ │
│ Formulario "Actualización del menú": │
│ ┌───────────────────────────────────────┐ │
│ │ Nombre del plato: [] │ │
│ │ Precio: [] │ │
│ │ Promoción: [] │ │
│ │ Comentario: [] │ │
│ │ Subir imagen: [📸 Seleccionar] │ │
│ │ │ │
│ │ [ Aceptar ] │ │
│ └───────────────────────────────────────┘ │
│ │
│ Al pulsar "Aceptar": │
│ → Se sube la imagen a Supabase Storage │
│ → Se inserta en products │
│ → Aparece al instante en la app pública │
└─────────────────────────────────────────────────┘

text

### Flujo del comerciante

1. Abre su panel (por la noche, planificando el día siguiente).
2. Va a "Archivo" → "Actualización del menú".
3. Rellena: nombre del plato, precio, promoción, comentario.
4. Sube una foto (o reutiliza una del banco de imágenes).
5. Pulsa "Aceptar".
6. **El plato aparece al instante en la app pública.**

**Tiempo total: 30 segundos.**

### Reglas

- ❌ Sin formularios de 35 campos.
- ❌ Sin "borrador", "vista previa" ni "aprobar".
- ❌ Sin categorías anidadas.
- ✅ Foto + nombre + precio + guardar. **Nada más.**

---

## 🚴 Modelo del rider (diferenciador clave)

### Contrato + IESS (Seguridad Social Ecuatoriana)

**Esto es el diferencial competitivo de OneToOne en Ecuador.**

| Aspecto          | Glovo / Uber Eats        | OneToOne                           |
| ---------------- | ------------------------ | ---------------------------------- |
| Contrato         | Independiente            | **Formal + IESS**                  |
| Horario          | Libre pero sin garantías | **Libre con mínimo garantizado**   |
| Seguridad Social | No                       | **Sí, cubierta por la plataforma** |
| Estabilidad      | Ninguna                  | **Mínimo mensual asegurado**       |

### Modelo financiero del rider

Cliente paga $1.50 por el servicio
├── $0.75 → Fondo común (Seguridad Social + reservas)
└── $0.75 → Ganancia de la plataforma

Rider tiene mínimo garantizado: $100-200/mes
├── Si llega al mínimo → su pago es su trabajo
└── Si NO llega → la plataforma cubre la SS con su parte

text

### Libertad del rider

- No tiene turnos fijos.
- Se conecta cuando quiere.
- Recibe servicios de su sector.
- Ve historial personal de servicios.

### Panel del rider (a construir)

- Ver servicios disponibles en su sector
- Aceptar/rechazar servicios
- Ver ruta en mapa (Google Maps)
- Marcar recogida y entrega
- Ver historial de servicios
- Ver ganancias acumuladas
- Ver datos de IESS y contrato

---

## 👑 Panel Admin / Torre de control (fase futura)

### Filosofía

**Control total, intervención mínima.**

### Casos de uso urgentes

1. **Comercio estafador** → reembolsar + compensar rider + suspender comercio.
2. **Rider accidentado** → avisar cliente + reasignar + suspender temporal.
3. **Fallo del sistema** → ver pedidos activos + intervenir manualmente.

### Acceso

- **NO se conecta desde el cliente.**
- **Usa `service_role` desde el backend.**
- **Cero RLS para admin** (el backend valida).
- **Auditoría de todas las acciones admin.**

### MVP (mínimo viable)

Dashboard (contadores)
Pedidos activos
Suspender comercios
Suspender riders
Registrar incidentes
Ver finanzas básicas
text

**No construir todo de una vez. Crecer según uso real.**

---

## 🔐 Modelo de seguridad (RLS) — ESTADO ACTUAL

### ✅ COMPLETADO el 21 septiembre 2026

| Tabla         | RLS   | Políticas             |
| ------------- | ----- | --------------------- |
| `profiles`    | ✅ ON | 3 políticas           |
| `merchants`   | ✅ ON | 4 políticas           |
| `products`    | ✅ ON | 5 políticas           |
| `orders`      | ✅ ON | 3 políticas           |
| `order_items` | ✅ ON | 1 política + herencia |

### Tablas con RLS activo (sin políticas, bloqueadas por defecto)

- `feedback_customers`, `feedback_merchants`, `feedback_riders`
- `notifications`
- `rider_locations`
- `riders`

### Reglas aplicadas

1. **Cada tabla tiene UNA responsabilidad clara.**
2. **Los datos compartidos entre roles viajan copiados en `orders`.**
3. **El admin NO usa RLS** — usa `service_role` desde backend.
4. **Los estados de `orders` los mueve el sistema**, no los usuarios.
5. **Nadie escribe desde el cliente en `orders` ni `order_items`.**

### Convenciones del proyecto

- `merchants.user_id` = `profiles.id` = `auth.uid()`
- `riders.user_id` = `profiles.id` = `auth.uid()`
- `products.merchant_id` = `merchants.id`
- `orders.merchant_id` = `merchants.id`
- `orders.rider_id` = `riders.id`
- `orders.customer_id` = `profiles.id`

---

## 🐛 Bug activo: `Failed to fetch`

### Estado: DIAGNOSTICADO (pendiente aplicar fix)

**Síntomas:**

- La home muestra "modo demo" en lugar de comercios reales.
- Consola: `Error fetching merchants: {}` / `Failed to fetch`.

**Diagnóstico completado:**

- ✅ La URL es válida: `https://lyqezkrajdywxjbqscqc.supabase.co`
- ✅ La clave `sb_publishable_...` es válida.
- ✅ `@supabase/ssr@0.10.3` es compatible.
- ✅ RLS permite lectura pública de productos.
- ✅ El fetch manual en consola devuelve 200 + 12 productos.
- ❌ **El problema es el cliente Supabase dentro de la app.**

**Causa raíz:**

- `createClient()` se llama **múltiples veces**, causando conflictos de cookies.
- `createBrowserClient` de `@supabase/ssr` debe usarse como **singleton**.

**Solución diseñada:**

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  return client;
};
```

## ESTÁNDAR DE IMÁGENES — ONE TO ONE

### 1. LOGO DEL COMERCIO (home)

- Proporción: 1:1 (cuadrado)
- Tamaño mínimo: 400×400
- Tamaño recomendado: 800×800
- Peso máximo: 500 KB

### 2. FOTO DEL PLATO (menú)

- Proporción: 1:1 (cuadrado)
- Tamaño mínimo: 300×300
- Tamaño recomendado: 600×600
- Peso máximo: 300 KB

### 3. HERO DEL COMERCIO (banner)

- Proporción: 16:9 (horizontal)
- Tamaño mínimo: 800×450
- Tamaño recomendado: 1200×675
- Peso máximo: 500 KB

### FORMATO

- Tipo: JPG o PNG
- Color: RGB
- Compresión: optimizada para web

### APLICACIÓN

Estos formatos se exigirán a los comercios cuando se registren.
El editor de imágenes validará dimensiones y peso.
