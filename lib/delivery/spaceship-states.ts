// lib/delivery/spaceship-states.ts

export type SpaceshipState = 
  | 'welcome'
  | 'standby'
  | 'alert'
  | 'pre_accept'
  | 'accept'
  | 'speed_1'
  | 'speed_2'
  | 'approach'
  | 'return'
  | 'idle'
  | 'orbit'
  | 'hyperspace'

export const spaceshipImages: Record<SpaceshipState, string> = {
  welcome: '/images/rider/01-welcome.png',
  standby: '/images/rider/02-standby.png',
  alert: '/images/rider/03-alert.png',
  pre_accept: '/images/rider/04-pre-accept.png',
  accept: '/images/rider/05-accept.png',
  speed_1: '/images/rider/06-speed-1.png',
  speed_2: '/images/rider/07-speed-2.png',
  approach: '/images/rider/08-approach.png',
  return: '/images/rider/09-return.png',
  idle: '/images/rider/10-idle.png',
  orbit: '/images/rider/11-orbit.png',
  hyperspace: '/images/rider/12-hyperspace.png'
}

// Transiciones automáticas según evento
export function getNextState(
  currentState: SpaceshipState, 
  event: 'pedido_recibido' | 'aceptado' | 'recogido' | 'entregado' | 'liberado'
): SpaceshipState {
  const transitions: Record<SpaceshipState, Partial<Record<typeof event, SpaceshipState>>> = {
    welcome: { pedido_recibido: 'alert' },
    standby: { pedido_recibido: 'alert' },
    alert: { aceptado: 'pre_accept' },
    pre_accept: { aceptado: 'accept' },
    accept: { aceptado: 'speed_1' },
    speed_1: { aceptado: 'speed_2' },
    speed_2: { aceptado: 'approach' },
    approach: { entregado: 'return' },
    return: { entregado: 'idle' },
    idle: { pedido_recibido: 'alert' },
    orbit: { pedido_recibido: 'alert' },
    hyperspace: { entregado: 'return' }
  }
  return transitions[currentState]?.[event] || currentState
}