import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ComercioConfig {
  id: string
  nombre: string
  especialidad: string
  horario: string
  descripcion: string
  imagen: string
  telefono: string
  direccion: string
}

interface ComercioStore {
  comercios: ComercioConfig[]
  updateComercio: (id: string, data: Partial<ComercioConfig>) => void
  getComercio: (id: string) => ComercioConfig | undefined
}

export const useComercioStore = create<ComercioStore>()(
  persist(
    (set, get) => ({
      comercios: [
        { id: "1", nombre: "ONE TO ONE", especialidad: "🍽️ Cocina fusión internacional", horario: "08:00 - 23:00", descripcion: "Sabores únicos que conectan contigo", imagen: "/casas/en_su_punto.JPG", telefono: "0991234567", direccion: "Av. Principal 123" },
        { id: "2", nombre: "Sabores del Origen", especialidad: "🌿 Cocina ancestral ecuatoriana", horario: "09:00 - 21:00", descripcion: "Recetas tradicionales con productos locales", imagen: "/casas/Ceremoniales.JPG", telefono: "0991234568", direccion: "Calle de los Sabores 456" },
        { id: "3", nombre: "Sierra y Fuego", especialidad: "🔥 Parrilladas y carnes a la leña", horario: "10:00 - 22:00", descripcion: "El sabor de la montaña en tu mesa", imagen: "/casas/Como_en_casa.JPG", telefono: "0991234569", direccion: "Av. de los Volcanes 789" },
        { id: "4", nombre: "Manglar y Mar", especialidad: "🦐 Mariscos frescos del Pacífico", horario: "11:00 - 23:00", descripcion: "El mejor ceviche y encocados de la costa", imagen: "/casas/Casa_Caramba.JPG", telefono: "0991234570", direccion: "Malecón 100" },
      ],
      updateComercio: (id, data) => {
        set({
          comercios: get().comercios.map(c => 
            c.id === id ? { ...c, ...data } : c
          )
        })
      },
      getComercio: (id) => get().comercios.find(c => c.id === id),
    }),
    { name: 'comercio-config' }
  )
)