// lib/sound-service.ts
export const playBellSound = () => {
  try {
    // Crear contexto de audio
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Crear oscilador para sonido de campana
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Configurar sonido tipo campana
    oscillator.type = 'sine';
    oscillator.frequency.value = 880; // Nota La5
    
    gainNode.gain.value = 0.3;
    
    // Envolvente para sonido de campana
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    oscillator.start();
    oscillator.stop(now + 1.5);
    
    // Pequeño silencio y segundo tono (efecto campana)
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.value = 660; // Nota Mi5
      gain2.gain.value = 0.2;
      const now2 = audioCtx.currentTime;
      gain2.gain.setValueAtTime(0.2, now2);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now2 + 1);
      osc2.start();
      osc2.stop(now2 + 1);
    }, 200);
    
  } catch (error) {
    console.log('Error reproduciendo sonido:', error);
    // Fallback: usar beep de consola
    console.log('\x07'); // ASCII bell character
  }
};

// También puedes usar un simple beep como fallback universal
export const playSimpleBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.2;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (error) {
    console.log('\x07'); // Beep de terminal
  }
};