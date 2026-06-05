export type HelmetType = 'awkak' | 'artisan' | 'common' | 'sacha'

export interface Helmet {
  id: HelmetType
  name: string
  description: string
  selectable: boolean
  imagePath: string
}

export const helmets: Helmet[] = [
  {
    id: 'awkak',
    name: 'Awkak (Guerrero)',
    description: 'Casco de servicio. Se activa automáticamente en cada misión.',
    selectable: false,
    imagePath: '/images/naves-cascos/awkak.png'
  },
  {
    id: 'artisan',
    name: 'Artisan (Artesano)',
    description: 'Distinción de la Alianza.',
    selectable: false,
    imagePath: '/images/naves-cascos/artisan.png'
  },
  {
    id: 'common',
    name: 'Común',
    description: 'Tu avatar personal. Elige entre 12 diseños.',
    selectable: true,
    imagePath: '/images/naves-cascos/avatar/'
  },
  {
    id: 'sacha',
    name: 'Sacha',
    description: 'Tu identidad. Runa (hombre) o Warmy (mujer).',
    selectable: true,
    imagePath: '/images/naves-cascos/avatar/'
  }
]
