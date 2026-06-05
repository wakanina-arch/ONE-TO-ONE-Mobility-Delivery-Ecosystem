// lib/order-notification-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playBellSound } from './sound-service';

export interface ComandaPedido {
  id: string;
  ordenId: string;
  comercioId: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    observaciones?: string;
  }>;
  total: number;
  timestamp: Date;
  estado: 'pendiente' | 'en_produccion' | 'listo' | 'entregado';
  tipo: 'delivery' | 'recoger';
  cliente?: string;
  telefono?: string;
}

interface OrderNotificationStore {
  pedidosPendientes: ComandaPedido[];
  pedidosHistorial: ComandaPedido[];
  ultimoPedido: ComandaPedido | null;
  agregarPedido: (pedido: ComandaPedido) => void;
  actualizarEstado: (id: string, estado: ComandaPedido['estado']) => void;
  marcarComoVisto: (id: string) => void;
  limpiarNotificaciones: () => void;
}

export const useOrderNotificationStore = create<OrderNotificationStore>()(
  persist(
    (set) => ({
      pedidosPendientes: [],
      pedidosHistorial: [],
      ultimoPedido: null,

      agregarPedido: (pedido) => {
        // Reproducir sonido de campana
        playBellSound();
        
        // Mostrar notificación del sistema
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 ¡Nuevo pedido!', {
            body: `Pedido #${pedido.ordenId}\nTotal: $${pedido.total}\n${pedido.items.length} productos`,
            icon: '/favicon.ico',
            tag: pedido.id,
          } as NotificationOptions);
        }
        
        // Si no hay permiso, pedirlo
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

        set((state) => ({
          pedidosPendientes: [pedido, ...state.pedidosPendientes],
          ultimoPedido: pedido,
          pedidosHistorial: [pedido, ...state.pedidosHistorial]
        }));
      },

      actualizarEstado: (id, estado) => {
        set((state) => ({
          pedidosPendientes: state.pedidosPendientes.map(p => 
            p.id === id ? { ...p, estado } : p
          ),
          pedidosHistorial: state.pedidosHistorial.map(p =>
            p.id === id ? { ...p, estado } : p
          )
        }));
      },

      marcarComoVisto: (id) => {
        set((state) => ({
          pedidosPendientes: state.pedidosPendientes.filter(p => p.id !== id)
        }));
      },

      limpiarNotificaciones: () => {
        set({ pedidosPendientes: [] });
      }
    }),
    {
      name: 'order-notifications-storage'
    }
  )
);
