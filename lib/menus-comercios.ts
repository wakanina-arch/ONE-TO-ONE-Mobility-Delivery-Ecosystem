// lib/menus-comercios.ts
import { MenuItem } from './store'

// ========== MENÚ ONE TO ONE (INTERNACIONAL) ==========
export const MENU_ONE_TO_ONE: MenuItem[] = [
  // Desayunos (4)
  {
    id: 'oto-1',
    nombre: 'Tigrillo',
    descripcion: 'Plátano verde machacado con queso y huevo, acompañado de café',
    precio: 5.50,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Tigrillo.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'oto-2',
    nombre: 'Mote Pillo',
    descripcion: 'Mote con huevo, cebolla y especias, acompañado de café',
    precio: 4.50,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Mote Pillo.JPG',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'oto-3',
    nombre: 'Bolón de Verde',
    descripcion: 'Bolón de verde relleno de queso, acompañado de café',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Bolon de Verde.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'oto-4',
    nombre: 'Locro de Papa',
    descripcion: 'Crema de papa con queso, aguacate y acompañado de arroz',
    precio: 6.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },

  // Almuerzos (4)
  {
    id: 'oto-5',
    nombre: 'Cuy Asado',
    descripcion: 'Cuy asado al estilo tradicional, acompañado de papas y ensalada',
    precio: 18.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Cuy Asado.JPG',
    disponible: true,
    tiempoPreparacion: 25
  },
  {
    id: 'oto-6',
    nombre: 'Encocado de Pescado',
    descripcion: 'Pescado fresco en salsa de coco, acompañado de arroz y patacones',
    precio: 14.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Encocado de Pescado.JPG',
    disponible: true,
    tiempoPreparacion: 20
  },
  {
    id: 'oto-7',
    nombre: 'Estofado de Pollo',
    descripcion: 'Pollo estofado con verduras, servido con arroz y papas',
    precio: 12.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Estofado de Pollo.JPG',
    disponible: true,
    tiempoPreparacion: 20
  },
  {
    id: 'oto-8',
    nombre: 'Bistec Convinado',
    descripcion: 'Bistec de res a la plancha, acompañado de papas y ensalada',
    precio: 13.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Bistec convinado.png',
    disponible: true,
    tiempoPreparacion: 20
  },

  // Especiales (4)
  {
    id: 'oto-9',
    nombre: 'Ensalada César',
    descripcion: 'Lechuga romana, pollo, crutones, queso parmesano y aderezo César',
    precio: 8.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada César.jpg',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'oto-10',
    nombre: 'Ensalada Caprese',
    descripcion: 'Tomate, mozzarella fresca, albahaca y aceite de oliva',
    precio: 9.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada Caprese.jpg',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'oto-11',
    nombre: 'Ensalada Griega',
    descripcion: 'Tomate, pepino, cebolla, aceitunas, queso feta y orégano',
    precio: 8.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada Griega.jpg',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'oto-12',
    nombre: 'Chupé de Mariscos',
    descripcion: 'Crema de mariscos con leche y especias, servido con arroz',
    precio: 13.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Chupé de Mariscos.png',
    disponible: true,
    tiempoPreparacion: 18
  },

  // Postres (2)
  {
    id: 'oto-13',
    nombre: 'Helado de Paila',
    descripcion: 'Helado artesanal de paila',
    precio: 5.00,
    categoria: 'Postres',
    imagen: '/img/postres/Helado de Paila.JPG',
    disponible: true,
    tiempoPreparacion: 5
  },
  {
    id: 'oto-14',
    nombre: 'Dulce de Tomate',
    descripcion: 'Dulce artesanal de tomate',
    precio: 4.50,
    categoria: 'Postres',
    imagen: '/img/postres/Dulce de Tomate.JPG',
    disponible: true,
    tiempoPreparacion: 5
  },

  // Bebidas (4)
  {
    id: 'oto-15',
    nombre: 'Coca Cola',
    descripcion: 'Gaseosa Coca Cola 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CocaCola.jpg',
    disponible: true
  },
  {
    id: 'oto-16',
    nombre: 'Pepsi',
    descripcion: 'Gaseosa Pepsi 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/Pepsi.jpg',
    disponible: true
  },
  {
    id: 'oto-17',
    nombre: 'Cerveza Guinness',
    descripcion: 'Cerveza Guinness irlandesa bien fría',
    precio: 6.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaGuinness.jpg',
    disponible: true
  },
  {
    id: 'oto-18',
    nombre: 'Cerveza Heineken',
    descripcion: 'Cerveza Heineken holandesa bien fría',
    precio: 5.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaHeineken.jpg',
    disponible: true
  }
]

// ========== MENÚ SABORES DEL ORIGEN (TRADICIONAL ECUATORIANO) ==========
export const MENU_SABORES_ORIGEN: MenuItem[] = [
  // Desayunos (4)
  {
    id: 'sor-1',
    nombre: 'Caldo de Bolas de Pescado',
    descripcion: 'Caldo tradicional con bolas de pescado, yuca y especias',
    precio: 6.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Caldo de Bolas de Pescado.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sor-2',
    nombre: 'Puchero',
    descripcion: 'Caldo de carnes con verduras, garbanzos y acompañado de arroz',
    precio: 7.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Puchero.png',
    disponible: true,
    tiempoPreparacion: 20
  },
  {
    id: 'sor-3',
    nombre: 'Sopa de Bolas de Verde',
    descripcion: 'Sopa tradicional con bolas de verde rellenas de queso',
    precio: 5.50,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Sopa de Bolas de Verde Rellenas.png',
    disponible: true,
    tiempoPreparacion: 12
  },
  {
    id: 'sor-4',
    nombre: 'Tigrillo',
    descripcion: 'Plátano verde machacado con queso y huevo',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Tigrillo.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },

  // Almuerzos (4)
  {
    id: 'sor-5',
    nombre: 'Encebollado',
    descripcion: 'Caldo de albacora con yuca, cebolla encurtida y chifles',
    precio: 5.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Encebollado.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sor-6',
    nombre: 'Pollo Broster',
    descripcion: 'Pollo broster crujiente, acompañado de papas fritas y ensalada',
    precio: 9.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Pollo broster.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sor-7',
    nombre: 'Tabla Flamenca',
    descripcion: 'Selección de embutidos y quesos españoles',
    precio: 15.00,
    categoria: 'Almuerzos',
    imagen: '/img/almuerzos/Tabla flamenca.png',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sor-8',
    nombre: 'Sancocho de Pescado',
    descripcion: 'Sancocho de pescado con yuca y verduras',
    precio: 8.00,
    categoria: 'Almuerzos',
    imagen: '/img/especiales/Sancocho de Pescado.png',
    disponible: true,
    tiempoPreparacion: 20
  },

  // Especiales (4)
  {
    id: 'sor-9',
    nombre: 'Ceviche de Sardina',
    descripcion: 'Sardinas frescas en jugo de limón con cebolla morada',
    precio: 7.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Cevice de serdina.png',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sor-10',
    nombre: 'Sopa de Cangrejo',
    descripcion: 'Sopa cremosa de cangrejo con vegetales',
    precio: 11.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Sopa de Cangrejo.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sor-11',
    nombre: 'Sopa de Camarón',
    descripcion: 'Sopa cremosa de camarón con especias',
    precio: 11.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Sopa de Camarón.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sor-12',
    nombre: 'Pipián de Pescado',
    descripcion: 'Pescado en salsa de maní, acompañado de arroz',
    precio: 10.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Pipián de Pescado.png',
    disponible: true,
    tiempoPreparacion: 18
  },

  // Postres (2)
  {
    id: 'sor-13',
    nombre: 'Zumo de Frutas',
    descripcion: 'Selección de frutas frescas',
    precio: 4.50,
    categoria: 'Postres',
    imagen: '/img/postres/ZumoDeFrutas.jpg',
    disponible: true,
    tiempoPreparacion: 5
  },
  {
    id: 'sor-14',
    nombre: 'Zumos Verdes',
    descripcion: 'Mezcla de vegetales verdes',
    precio: 5.00,
    categoria: 'Postres',
    imagen: '/img/postres/ZumosVerdes.jpg',
    disponible: true,
    tiempoPreparacion: 5
  },

  // Bebidas (4)
  {
    id: 'sor-15',
    nombre: 'Coca Cola',
    descripcion: 'Gaseosa Coca Cola 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CocaCola.jpg',
    disponible: true
  },
  {
    id: 'sor-16',
    nombre: 'Pepsi',
    descripcion: 'Gaseosa Pepsi 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/Pepsi.jpg',
    disponible: true
  },
  {
    id: 'sor-17',
    nombre: 'Cerveza Club',
    descripcion: 'Cerveza Club Ecuador bien fría',
    precio: 3.50,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaClub.jpg',
    disponible: true
  },
  {
    id: 'sor-18',
    nombre: 'Fanta',
    descripcion: 'Gaseosa Fanta 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/Fanta.jpg',
    disponible: true
  }
]

// ========== MENÚ SIERRA Y FUEGO (PARRILLA/ANDINA) ==========
export const MENU_SIERRA_FUEGO: MenuItem[] = [
  // Desayunos (4)
  {
    id: 'sif-1',
    nombre: 'Mote Pillo',
    descripcion: 'Mote con huevo, cebolla y especias',
    precio: 4.50,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Mote Pillo.JPG',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'sif-2',
    nombre: 'Tigrillo',
    descripcion: 'Plátano verde machacado con queso y huevo',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Tigrillo.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sif-3',
    nombre: 'Bolón de Verde',
    descripcion: 'Bolón de verde relleno de queso',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Bolon de Verde.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sif-4',
    nombre: 'Locro de Papa',
    descripcion: 'Crema de papa con queso y aguacate',
    precio: 6.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },

  // Almuerzos (4)
  {
    id: 'sif-5',
    nombre: 'Aserrín de Pescado',
    descripcion: 'Pescado desmenuzado con arroz, acompañado de patacones',
    precio: 9.00,
    categoria: 'Almuerzos',
    imagen: '/img/especiales/Aserrin de Pescado.png',
    disponible: true,
    tiempoPreparacion: 18
  },
  {
    id: 'sif-6',
    nombre: 'Consomé de Pinchagüa',
    descripcion: 'Consomé de pescado pinchagüa con yuca',
    precio: 7.00,
    categoria: 'Almuerzos',
    imagen: '/img/especiales/Consomé de Pinchagüa.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sif-7',
    nombre: 'Cernido de Pinchagüa',
    descripcion: 'Pescado pinchagüa cernido con arroz',
    precio: 8.00,
    categoria: 'Almuerzos',
    imagen: '/img/especiales/Cernido de Pinchagüa.png',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'sif-8',
    nombre: 'Caldo de Albóndigas de Albacora',
    descripcion: 'Caldo con albóndigas de albacora, yuca y verduras',
    precio: 7.50,
    categoria: 'Almuerzos',
    imagen: '/img/especiales/Caldo de Albóndigas de Albacora.png',
    disponible: true,
    tiempoPreparacion: 20
  },

  // Especiales (4)
  {
    id: 'sif-9',
    nombre: 'Ensalada Waldorf',
    descripcion: 'Manzana, apio, nueces y mayonesa',
    precio: 6.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada Waldorf.jpg',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'sif-10',
    nombre: 'Ensalada Coleslaw',
    descripcion: 'Repollo y zanahoria con aderezo cremoso',
    precio: 5.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada Coleslaw.jpg',
    disponible: true,
    tiempoPreparacion: 8
  },
  {
    id: 'sif-11',
    nombre: 'Ensalada Nizarda',
    descripcion: 'Atún, huevo, tomate, aceitunas y papas',
    precio: 8.00,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensalada Nizarda.jpg',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'sif-12',
    nombre: 'Ensaladilla Rusa',
    descripcion: 'Ensalada de papas, zanahoria, guisantes y mayonesa',
    precio: 5.50,
    categoria: 'Especiales',
    imagen: '/img/especiales/Ensaladilla Rusa.jpg',
    disponible: true,
    tiempoPreparacion: 10
  },

  // Postres (2)
  {
    id: 'sif-13',
    nombre: 'Helado de Paila',
    descripcion: 'Helado artesanal de paila',
    precio: 5.00,
    categoria: 'Postres',
    imagen: '/img/postres/Helado de Paila.JPG',
    disponible: true,
    tiempoPreparacion: 5
  },
  {
    id: 'sif-14',
    nombre: 'Dulce de Tomate',
    descripcion: 'Dulce artesanal de tomate',
    precio: 4.50,
    categoria: 'Postres',
    imagen: '/img/postres/Dulce de Tomate.JPG',
    disponible: true,
    tiempoPreparacion: 5
  },

  // Bebidas (4)
  {
    id: 'sif-15',
    nombre: 'Cerveza Club',
    descripcion: 'Cerveza Club Ecuador bien fría',
    precio: 3.50,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaClub.jpg',
    disponible: true
  },
  {
    id: 'sif-16',
    nombre: 'Cerveza Heineken',
    descripcion: 'Cerveza Heineken holandesa bien fría',
    precio: 5.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CervezaHeineken.jpg',
    disponible: true
  },
  {
    id: 'sif-17',
    nombre: 'Agua Mineral',
    descripcion: 'Agua mineral sin gas 500ml',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/AguaMineral.jpg',
    disponible: true
  },
  {
    id: 'sif-18',
    nombre: 'Guarana',
    descripcion: 'Gaseosa Guarana 400ml bien fría',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/Guarana.jpg',
    disponible: true
  }
]

// Menú genérico para otros comercios
export const MENU_GENERICO: MenuItem[] = [
  {
    id: 'gen-1',
    nombre: 'Tigrillo',
    descripcion: 'Plátano verde machacado con queso y huevo',
    precio: 5.00,
    categoria: 'Desayunos',
    imagen: '/img/desayunos/Tigrillo.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'gen-2',
    nombre: 'Locro de Papa',
    descripcion: 'Crema de papa con queso y aguacate',
    precio: 5.50,
    categoria: 'Almuerzos',
    imagen: '/img/desayunos/Locro de Papa.JPG',
    disponible: true,
    tiempoPreparacion: 15
  },
  {
    id: 'gen-3',
    nombre: 'Ceviche de Camarón',
    descripcion: 'Camarones frescos en jugo de limón',
    precio: 8.00,
    categoria: 'Especiales',
    imagen: '/img/desayunos/Ceviche de Camaron.JPG',
    disponible: true,
    tiempoPreparacion: 10
  },
  {
    id: 'gen-4',
    nombre: 'Helado de Paila',
    descripcion: 'Helado artesanal de paila',
    precio: 4.50,
    categoria: 'Postres',
    imagen: '/img/postres/Helado de Paila.JPG',
    disponible: true,
    tiempoPreparacion: 5
  },
  {
    id: 'gen-5',
    nombre: 'Coca Cola',
    descripcion: 'Gaseosa Coca Cola 400ml',
    precio: 2.00,
    categoria: 'Bebidas',
    imagen: '/img/bebidas/CocaCola.jpg',
    disponible: true
  }
]