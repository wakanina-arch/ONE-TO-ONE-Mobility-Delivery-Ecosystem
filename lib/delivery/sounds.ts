// lib/delivery/sounds.ts

// URLs de sonidos gratuitos (descargables)
// O puedes poner tus propios archivos en public/sounds/

export const SOUNDS = {
  // Alarma tipo "despacho militar" (similar a Star Wars)
  dispatch: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
  
  // Motor encendido
  engineStart: 'https://www.soundjay.com/mechanical/sounds/electric-motor-start-01.mp3',
  
  // Aceptación de misión
  missionAccept: 'https://www.soundjay.com/interface/sounds/beep-07.mp3',
  
  // Llegada a destino
  arrival: 'https://www.soundjay.com/interface/sounds/beep-09.mp3'
}

// Función para reproducir sonidos con uso seguro
export const playSound = (url: string) => {
  if (typeof window === 'undefined') return
  const audio = new Audio(url)
  audio.volume = 0.5
  audio.play().catch(e => console.log('Error reproduciendo sonido:', e))
}