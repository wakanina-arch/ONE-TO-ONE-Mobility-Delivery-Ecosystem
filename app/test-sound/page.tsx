'use client';

import { playBellSound } from '@/lib/sound-service';
import { Button } from '@/components/ui/button';

export default function TestSoundPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Prueba de Sonido</h1>
      <Button onClick={playBellSound}>
        🔔 Probar Sonido de Campana
      </Button>
      <p className="mt-4 text-sm text-gray-500">
        El sonido se genera programáticamente, no necesita archivos MP3.
        Asegúrate de que el volumen del sistema esté activado.
      </p>
    </div>
  );
}
